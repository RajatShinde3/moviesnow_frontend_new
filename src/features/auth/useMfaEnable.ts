// features/auth/useMfaEnable.ts
"use client";

/**
 * =============================================================================
 * Auth › Enable MFA (TOTP) — idempotent, step-up aware, drift-tolerant
 * =============================================================================
 * @endpoint POST /api/v1/auth/mfa/enable
 * @body     {} or { method, issuer, account_label }
 *
 * Semantics
 * - Validates input (optional method/issuer/account_label, no client junk).
 * - Sends Idempotency-Key for safe replay on transient retries.
 * - If provided, sends X-Reauth header (server may require step-up).
 * - Uses `fetchJsonWithMeta` (auth/refresh/step-up aware, 204 tolerant).
 * - Normalizes diverse backend shapes into a single result.
 * - On success, invalidates ["auth","mfa"].
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchJsonWithMeta,
  REAUTH_HEADER_NAME,
  type AppError,
} from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { env } from "@/lib/env";
import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization (legacy alias supported)
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_MFA_ENABLE_PATH =
  env().NEXT_PUBLIC_MFA_ENABLE_PATH ??
  "api/v1/auth/mfa/enable";
export const MFA_ENABLE_PATH = RAW_MFA_ENABLE_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Schema: client input (reauth in header, not in body)
   ──────────────────────────────────────────────────────────────────────────── */

const MfaEnableClientInputSchema = z
  .object({
    /** Future-proof: allow explicit method, default totp, but don't force send. */
    method: z.enum(["totp"]).optional(),
    /** Optional `X-Reauth` header for step-up; not sent in JSON body. */
    reauth_token: z.string().min(1).optional(),
    /** Optional issuer/account label if backend supports branding. */
    issuer: z.string().min(1).optional(),
    account_label: z.string().min(1).optional(),
  })
  .strict();

export type MfaEnableInput = z.infer<typeof MfaEnableClientInputSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Flexible response schema (we'll normalize below)
   ──────────────────────────────────────────────────────────────────────────── */

const RawMfaEnableResponseSchema = z
  .object({
    secret: z.string().optional(),
    secret_base32: z.string().optional(),
    otpauth_url: z.string().optional(),       // allow non-URL formats; we won't validate here
    provisioning_uri: z.string().optional(),  // some backends use this
    qr_code_url: z.string().optional(),       // MoviesNow backend uses this
    qr_svg: z.string().optional(),
    qr_png: z.string().optional(),            // may be data: or https:
    algorithm: z.enum(["SHA1", "SHA256", "SHA512"]).optional(),
    // sometimes numbers arrive as strings — coerce safely
    digits: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    period: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    issuer: z.string().optional(),
    account_label: z.string().optional(),
    account: z.string().optional(),           // alt naming
    // some APIs include recovery codes at enable time
    recovery_codes: z.array(z.string()).optional(),
  })
  .passthrough();

export type RawMfaEnableResponse = z.infer<typeof RawMfaEnableResponseSchema>;

export type MfaEnableResult = {
  secret: string;
  otpauth_url?: string;
  qr_svg?: string;
  qr_png?: string;
  algorithm: "SHA1" | "SHA256" | "SHA512";
  digits: number;
  period: number;
  issuer?: string;
  account_label?: string;
  recovery_codes?: string[];
  raw: Record<string, unknown>;
};

/* ────────────────────────────────────────────────────────────────────────────
   Normalization helpers
   ──────────────────────────────────────────────────────────────────────────── */

function extractFromOtpauth(otpauth?: string) {
  if (!otpauth || typeof otpauth !== "string") return {};
  try {
    // Support both otpauth:// and plain provisioning URIs
    const url = new URL(otpauth, "http://local"); // base needed for relative parsing safety
    const qp = new URLSearchParams(
      // If it's a true otpauth://, rebuild search; else attempt to parse query part
      otpauth.startsWith("otpauth://") ? new URL(otpauth).search : url.search
    );
    const secret = qp.get("secret") ?? undefined;
    const issuer = qp.get("issuer") ?? undefined;
    const algorithm = (qp.get("algorithm")?.toUpperCase() as "SHA1" | "SHA256" | "SHA512") ?? undefined;
    const digits = qp.get("digits") ? Number(qp.get("digits")) : undefined;
    const period = qp.get("period") ? Number(qp.get("period")) : undefined;
    return { secret, issuer, algorithm, digits, period };
  } catch {
    return {};
  }
}

function normalizeEnablePayload(raw: RawMfaEnableResponse): MfaEnableResult {
  const otpauth_url = raw.otpauth_url ?? raw.provisioning_uri ?? raw.qr_code_url ?? undefined;
  const fromUri = extractFromOtpauth(otpauth_url);

  // Prefer explicit secret; else try to pull from otpauth:// URI.
  const secret = raw.secret_base32 ?? raw.secret ?? fromUri.secret ?? "";
  if (!secret) {
    throw new Error("Server did not return a TOTP secret.");
  }

  const algorithm: "SHA1" | "SHA256" | "SHA512" =
    raw.algorithm ?? (fromUri.algorithm as any) ?? "SHA1";

  const digits = typeof raw.digits === "number" ? raw.digits : fromUri.digits ?? 6;
  const period = typeof raw.period === "number" ? raw.period : fromUri.period ?? 30;

  const issuer = raw.issuer ?? fromUri.issuer ?? undefined;
  const account_label = raw.account_label ?? raw.account ?? undefined;

  return {
    secret,
    otpauth_url,
    qr_svg: raw.qr_svg,
    qr_png: raw.qr_png,
    algorithm,
    digits,
    period,
    issuer,
    account_label,
    recovery_codes: raw.recovery_codes,
    raw: raw as Record<string, unknown>,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   Retry policy — transient only (network/5xx). Never retry 429.
   ──────────────────────────────────────────────────────────────────────────── */

function getHttpStatus(err: unknown): number | undefined {
  const e: any = err;
  if (typeof e?.status === "number") return e.status;
  if (typeof e?.response?.status === "number") return e.response.status;
  if (typeof e?.cause?.status === "number") return e.cause.status;
  if (typeof e?.cause?.response?.status === "number") return e.cause.response.status;
  return undefined;
}

function shouldRetry(_count: number, err: unknown) {
  const s = getHttpStatus(err);
  if (s == null) return true;            // network/CORS/etc.
  if (s === 429) return false;           // respect rate limiting
  if (s >= 500 && s < 600) return true;  // transient server errors
  return false;                           // no retry for other 4xx
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useMfaEnable() {
  const qc = useQueryClient();

  return useMutation<MfaEnableResult, AppError, MfaEnableInput | void>({
    mutationKey: ["auth", "mfa", "enable"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      const input = MfaEnableClientInputSchema.parse(variables ?? {});

      // Compose headers: Idempotency always; X-Reauth if provided
      const headers: Record<string, string> = { "Idempotency-Key": newIdemKey() };
      if (input.reauth_token) headers[REAUTH_HEADER_NAME] = input.reauth_token;

      // Build body: exclude client-only reauth token; send method/issuer/account_label if present
      const json: Record<string, unknown> = {};
      if (input.method) json.method = input.method;
      if (input.issuer) json.issuer = input.issuer;
      if (input.account_label) json.account_label = input.account_label;

      const { data } = await fetchJsonWithMeta<unknown | undefined>(MFA_ENABLE_PATH, {
        method: "POST",
        json,
        headers,
        cache: "no-store",
      });

      // Some servers return 204; normalize via schema + transformer
      const parsed = RawMfaEnableResponseSchema.parse(data ?? {});
      return normalizeEnablePayload(parsed);
    },
    onSuccess: async () => {
      // Refresh any screens that depend on MFA status/provisioning
      await qc.invalidateQueries({ queryKey: ["auth", "mfa"] });
      await qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
