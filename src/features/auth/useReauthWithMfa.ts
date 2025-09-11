// features/auth/useReauthWithMfa.ts
"use client";

/**
 * =============================================================================
 * Auth › Reauth with MFA (idempotent, alias-friendly, 204-tolerant)
 * =============================================================================
 * @endpoint POST /api/v1/auth/reauth/mfa
 * @body     { code, method?, remember_device? }
 *
 * Semantics
 * - Input aliases: code | totp_code | otp (+ method?, remember_device?).
 * - Normalization: trims; strips non-digits for numeric codes; collapses spaces for others.
 * - Idempotent POST (dedupes double-submits/refreshes).
 * - Responses tolerated and normalized:
 *     • { reauth_token, expires_at? }
 *     • { token } | { challenge_token } | { reauth: { token } }
 *     • { ok: true }     (server finalized without verify)
 *     • 204 No Content   (treated as { ok: true })
 */

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { env } from "@/lib/env";
import { ReauthChallengeSchema } from "./reauthSchemas"; // schema is exported
import { OkSchema } from "@/features/auth/schemas";

/* ────────────────────────────────────────────────────────────────────────────
   Types derived from exported schema (avoid importing a missing type)
   ──────────────────────────────────────────────────────────────────────────── */
type ReauthChallenge = z.infer<typeof ReauthChallengeSchema>;
export type ReauthMfaResult = ReauthChallenge | { ok: true };

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe; supports legacy alias). Strip leading slash for base prefix.
   ──────────────────────────────────────────────────────────────────────────── */
const RAW_REAUTH_MFA_PATH =
  env().NEXT_PUBLIC_REAUTH_MFA_PATH ??
  "api/v1/auth/reauth/mfa";
export const REAUTH_MFA_PATH = RAW_REAUTH_MFA_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Input — accept aliases; normalize to { code, method?, remember_device? }
   ──────────────────────────────────────────────────────────────────────────── */
const RawMfaInputSchema = z
  .object({
    code: z.string().optional(),
    totp_code: z.string().optional(),
    otp: z.string().optional(),
    method: z.enum(["totp", "sms", "email"]).optional(),
    remember_device: z.boolean().optional(),
  })
  .strict();

type RawMfaInput = z.infer<typeof RawMfaInputSchema>;
export type ReauthMfaInput = RawMfaInput;

function normalizeMfaInput(v: RawMfaInput) {
  const raw = v.code ?? v.totp_code ?? v.otp ?? "";
  const trimmed = String(raw).trim();
  const looksNumeric = /^[\s\-_.\d]+$/.test(trimmed);
  const normalized = looksNumeric ? trimmed.replace(/[^\d]/g, "") : trimmed.replace(/\s+/g, " ");
  return {
    code: normalized,
    method: v.method,
    remember_device: v.remember_device,
  };
}

const NormalizedMfaInputSchema = z
  .object({
    code: z.string().min(1, "MFA code is required"),
    method: z.enum(["totp", "sms", "email"]).optional(),
    remember_device: z.boolean().optional(),
  })
  // Only require 6–8 digits when a numeric OTP method is specified
  .refine((v) => !v.method || /^\d{6,8}$/.test(v.code), {
    message: "Enter a 6–8 digit code.",
    path: ["code"],
  });

/* ────────────────────────────────────────────────────────────────────────────
   Response normalization — accept several forward-compatible shapes
   ──────────────────────────────────────────────────────────────────────────── */
function toOk(): ReauthMfaResult {
  return { ok: true };
}

function parseChallenge(resp: unknown): ReauthMfaResult {
  if (resp == null) return toOk(); // 204 → OK

  // 1) Canonical challenge
  const a = ReauthChallengeSchema.safeParse(resp);
  if (a.success) return a.data;

  // 2) token-like variants (plus optional expires_at)
  const tokenLike = z
    .object({
      token: z.string().min(1).optional(),
      challenge_token: z.string().min(1).optional(),
      reauth: z.object({ token: z.string().min(1) }).partial().optional(),
      expires_at: z.string().datetime().optional(),
    })
    .passthrough()
    .safeParse(resp);

  if (tokenLike.success) {
    const t =
      tokenLike.data.token ??
      tokenLike.data.challenge_token ??
      tokenLike.data.reauth?.token;
    if (t) return { reauth_token: t, expires_at: tokenLike.data.expires_at };
  }

  // 3) Simple OK envelope
  const ok = OkSchema.safeParse(resp);
  if (ok.success) return toOk();

  // 4) Fall back to strict parse (throws with field-level messages)
  return ReauthChallengeSchema.parse(resp);
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */
export function useReauthWithMfa() {
  return useMutation<ReauthMfaResult, AppError, ReauthMfaInput>({
    mutationKey: ["auth", "reauth", "mfa"],
    mutationFn: async (variables) => {
      // 1) Accept aliases, normalize, then strictly validate
      const normalized = normalizeMfaInput(RawMfaInputSchema.parse(variables));
      const payload = NormalizedMfaInputSchema.parse(normalized);

      // 2) POST with idempotency; tolerate 204
      const { data } = await fetchJsonWithMeta<unknown>(REAUTH_MFA_PATH, {
        method: "POST",
        json: payload,
        headers: { "Idempotency-Key": newIdemKey() },
        cache: "no-store",
      });

      // 3) Normalize the server response into our union
      return parseChallenge(data);
    },
  });
}
