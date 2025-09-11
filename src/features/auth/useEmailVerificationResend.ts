// features/auth/useEmailVerificationResend.ts
"use client";

/**
 * =============================================================================
 * Auth › Resend Email Verification (idempotent, 204-tolerant)
 * =============================================================================
 * @endpoint POST PATHS.resendVerification  → /api/v1/auth/resend-verification
 *
 * Semantics
 * - Accepts either a raw `string` email or a richer object:
 *     { email, channel?, redirect_url?, locale?, captcha_token? }
 * - Sends Idempotency-Key to dedupe double-clicks/retries.
 * - Uses unified client (auth/refresh aware, 204 tolerant).
 * - Parses tiny ACKs; defaults to `{ ok: true }` on empty body.
 * - Does NOT retry on 429 (respect rate limiting).
 */

import { useMutation } from "@tanstack/react-query";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { PATHS } from "@/lib/env";
import { ResendVerificationSchema } from "@/features/auth/schemas";
import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────────
   Input
   ──────────────────────────────────────────────────────────────────────────── */

const ResendVerificationInputSchema = ResendVerificationSchema.extend({
  channel: z.enum(["email"]).optional(),
  redirect_url: z.string().url().optional(),
  locale: z.string().min(2).max(35).optional(),
  captcha_token: z.string().min(1).optional(),
}).strict();

export type ResendVerificationInput = z.infer<typeof ResendVerificationInputSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Response
   ──────────────────────────────────────────────────────────────────────────── */

const AckSchema = z.union([
  z
    .object({
      ok: z.literal(true).optional(),
      next_allowed_at: z.string().datetime().optional(),
      retry_after: z
        .preprocess((v) => (typeof v === "string" ? Number.parseInt(v, 10) : v), z.number().int().nonnegative())
        .optional(),
      sent_via: z.enum(["email"]).optional(),
      masked_to: z.string().optional(),
    })
    .passthrough(),
  z.null(),
  z.undefined(),
]);

export type ResendVerificationResult = {
  ok: true;
  next_allowed_at?: string;
  retry_after?: number;
  sent_via?: "email";
  masked_to?: string;
};

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
  if (s == null) return true;               // network/CORS/etc.
  if (s === 429) return false;              // respect rate limiting
  if (s >= 500 && s < 600) return true;     // transient server errors
  return false;                              // no retry for other 4xx
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useEmailVerificationResend() {
  return useMutation<ResendVerificationResult, AppError, string | ResendVerificationInput>({
    mutationKey: ["auth", "email", "resend-verification"],
    retry: shouldRetry,
    mutationFn: async (vars) => {
      // Accept a raw string or object; normalize/validate strictly
      const body = ResendVerificationInputSchema.parse(
        typeof vars === "string" ? { email: vars } : (vars ?? {})
      );

      const { data } = await fetchJsonWithMeta<unknown | undefined>(PATHS.resendVerification, {
        method: "POST",
        json: body,
        headers: { "Idempotency-Key": newIdemKey() },  // ✅ correct header type
        cache: "no-store",
      });

      const parsed = AckSchema.safeParse(data);
      if (!parsed.success || !parsed.data || typeof parsed.data !== "object") {
        return { ok: true } as const;
      }

      const d: any = parsed.data;
      const res: ResendVerificationResult = { ok: true };
      if (typeof d.next_allowed_at === "string") res.next_allowed_at = d.next_allowed_at;
      if (typeof d.retry_after === "number") res.retry_after = d.retry_after;
      if (d.sent_via === "email") res.sent_via = "email";
      if (typeof d.masked_to === "string") res.masked_to = d.masked_to;
      return res;
    },
  });
}
