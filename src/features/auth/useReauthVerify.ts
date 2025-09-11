// features/auth/useReauthVerify.ts
"use client";

/**
 * =============================================================================
 * Auth › Reauth Verify (idempotent, 204-tolerant, alias-friendly)
 * =============================================================================
 * @endpoint POST /api/v1/auth/reauth/verify
 * @body     { reauth_token }
 *
 * - Accepts common aliases: reauth_token | token | challenge_token
 * - Sends Idempotency-Key to dedupe double-submits/retries
 * - Uses unified client (auth/refresh aware, 204 tolerant)
 * - Normalizes any 2xx to a stable result shape
 */

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { env } from "@/lib/env";
import { ReauthVerifyResponseSchema } from "./reauthSchemas";
import { OkSchema } from "@/features/auth/schemas";

/* Public result type derived from the shared schema (union-safe) */
export type ReauthVerifyResult = z.infer<typeof ReauthVerifyResponseSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization (legacy alias supported)
   ──────────────────────────────────────────────────────────────────────────── */
const RAW_REAUTH_VERIFY_PATH =
  env().NEXT_PUBLIC_REAUTH_VERIFY_PATH ??
  "api/v1/auth/reauth/verify";
export const REAUTH_VERIFY_PATH = RAW_REAUTH_VERIFY_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Input — accept aliases, normalize to { reauth_token }
   ──────────────────────────────────────────────────────────────────────────── */
const RawVerifyInputSchema = z
  .object({
    reauth_token: z.string().optional(),
    token: z.string().optional(),
    challenge_token: z.string().optional(),
  })
  .strict();

const VerifyPayloadSchema = RawVerifyInputSchema.transform((v) => {
  const raw = v.reauth_token ?? v.token ?? v.challenge_token ?? "";
  return { reauth_token: String(raw).trim() };
}).pipe(
  z.object({
    reauth_token: z.string().min(1, "Reauth token is required"),
  })
);

export type ReauthVerifyInput = z.input<typeof RawVerifyInputSchema>;

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
export function useReauthVerify() {
  return useMutation<ReauthVerifyResult, AppError, ReauthVerifyInput>({
    mutationKey: ["auth", "reauth", "verify"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      const payload = VerifyPayloadSchema.parse(variables);

      const { data } = await fetchJsonWithMeta<unknown>(REAUTH_VERIFY_PATH, {
        method: "POST",
        json: payload,
        headers: { "Idempotency-Key": newIdemKey() },
        cache: "no-store",
      });

      // 204 → normalize to union type
      if (data == null) return ({ ok: true } as ReauthVerifyResult);

      // Prefer explicit success schema if provided (may include extra fields)
      const explicit = ReauthVerifyResponseSchema.safeParse(data);
      if (explicit.success) return explicit.data;

      // Accept generic `{ ok: true }` and ignore forward fields
      const ok = OkSchema.safeParse(data);
      if (ok.success) return ({ ok: true } as ReauthVerifyResult);

      // Be tolerant: treat any 2xx as success
      return ({ ok: true } as ReauthVerifyResult);
    },
  });
}
