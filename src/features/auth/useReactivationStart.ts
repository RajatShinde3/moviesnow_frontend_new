// features/auth/useReactivationStart.ts
"use client";

/**
 * =============================================================================
 * Auth › Reactivation: request OTP (idempotent, 204-tolerant)
 * =============================================================================
 * @endpoint POST PATHS.reactivationStart  → /api/v1/auth/request-reactivation
 *
 * Semantics
 * - Accepts optional principal and delivery hints:
 *     { email?, channel?, redirect_url?, locale?, captcha_token? }
 * - Sends Idempotency-Key to dedupe double-submits/retries.
 * - Uses unified client (auth/refresh aware, 204 tolerant).
 * - Treats any 2xx as success, normalizes tiny ACKs → { ok: true, ...hints }.
 */

import { useMutation } from "@tanstack/react-query";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { PATHS } from "@/lib/env";
import { EmailSchema } from "@/features/auth/schemas";
import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────────
   Input (strict, normalized)
   ──────────────────────────────────────────────────────────────────────────── */

export const ReactivationStartInputSchema = z
  .object({
    email: EmailSchema.optional(),                // trim + lowercase when present
    channel: z.enum(["email", "sms"]).optional(), // server may ignore
    redirect_url: z.string().url().optional(),    // deep link after confirm
    locale: z.string().min(2).max(35).optional(), // i18n hint
    captcha_token: z.string().min(1).optional(),  // if backend requires CAPTCHA
  })
  .strict();

export type ReactivationStartInput = z.infer<typeof ReactivationStartInputSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Response (tolerant)
   ──────────────────────────────────────────────────────────────────────────── */

const AckSchema = z.union([
  z
    .object({
      ok: z.literal(true).optional(),
      next_allowed_at: z.string().datetime().optional(),
      retry_after: z.preprocess(
        (v) => (typeof v === "string" ? Number.parseInt(v, 10) : v),
        z.number().int().nonnegative()
      ).optional(),
      sent_via: z.enum(["email", "sms"]).optional(),
      masked_to: z.string().optional(),
    })
    .passthrough(),
  z.null(),
  z.undefined(),
]);

export type ReactivationStartResult = {
  ok: true;
  next_allowed_at?: string;
  retry_after?: number;
  sent_via?: "email" | "sms";
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
  if (s == null) return true;            // network/CORS/etc.
  if (s === 429) return false;           // respect rate limiting
  if (s >= 500 && s < 600) return true;  // transient server errors
  return false;                           // no retry for other 4xx
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useReactivationStart() {
  return useMutation<ReactivationStartResult, AppError, ReactivationStartInput | void>({
    mutationKey: ["auth", "account", "reactivation", "start"],
    retry: shouldRetry,
    mutationFn: async (vars) => {
      // Accept being called with no args (servers may infer email from session)
      const body = ReactivationStartInputSchema.parse(vars ?? {});
      const { data } = await fetchJsonWithMeta<unknown | undefined>(PATHS.reactivateStart, {
        method: "POST",
        json: body,                                // always send an object
        headers: { "Idempotency-Key": newIdemKey() },
        cache: "no-store",
      });

      // Normalize tolerant responses
      const parsed = AckSchema.safeParse(data);
      if (!parsed.success || !parsed.data || typeof parsed.data !== "object") {
        return { ok: true } as const;
      }

      const d: any = parsed.data;
      const res: ReactivationStartResult = { ok: true };
      if (typeof d.next_allowed_at === "string") res.next_allowed_at = d.next_allowed_at;
      if (typeof d.retry_after === "number") res.retry_after = d.retry_after;
      if (d.sent_via === "email" || d.sent_via === "sms") res.sent_via = d.sent_via;
      if (typeof d.masked_to === "string") res.masked_to = d.masked_to;
      return res;
    },
  });
}
