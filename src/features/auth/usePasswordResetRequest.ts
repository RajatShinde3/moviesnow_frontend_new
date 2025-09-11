// features/auth/usePasswordResetRequest.ts
"use client";

/**
 * =============================================================================
 * Auth › Request Password Reset (merged, best-of-best)
 * =============================================================================
 * POST `${PATHS.requestReset}`
 *
 * • Strict, typed input (Zod) with forward-compatible options:
 *   channel? ("email" | "sms"), redirect_url?, locale?
 * • Always idempotent (adds Idempotency-Key via withIdempotency()).
 * • 204-tolerant; normalizes tiny JSON ACKs.
 * • Conservative retry policy: retry once on network/5xx, never on 4xx/429.
 * • Surfaces `requestId` for support correlation (via fetchJsonWithMeta).
 */

import { useMutation } from "@tanstack/react-query";
import {
  fetchJsonWithMeta,         // returns { data, requestId }
  withIdempotency,           // returns { headers: Headers | Record<string,string> }
  type AppError,
} from "@/lib/api/client";
import { PATHS } from "@/lib/env";
import { RequestPasswordResetSchema } from "./schemas";
import { z } from "zod";

/* ---------------------------------- Input ---------------------------------- */

const InputSchema = RequestPasswordResetSchema.extend({
  channel: z.enum(["email", "sms"]).optional(),
  redirect_url: z.string().url().optional(),
  locale: z.string().min(2).max(35).optional(),
}).strict();

export type PasswordResetRequestInput = z.infer<typeof InputSchema>;

/* -------------------------------- Response --------------------------------- */

const AckSchema = z.union([
  z.object({
    ok: z.literal(true).optional(),
    next_allowed_at: z.string().datetime().optional(),
    retry_after: z.preprocess(
      (v) => (typeof v === "string" ? Number.parseInt(v, 10) : v),
      z.number().int().nonnegative()
    ).optional(),
    sent_via: z.enum(["email", "sms"]).optional(),
    masked_to: z.string().optional(),
  }).passthrough(),
  z.null(),
  z.undefined(),
]);

export type PasswordResetRequestResult = {
  ok: true;
  next_allowed_at?: string;
  retry_after?: number;
  sent_via?: "email" | "sms";
  masked_to?: string;
  requestId?: string | null;   // surfaced from fetchJsonWithMeta
};

/* --------------------------------- Helpers --------------------------------- */

function headersToRecord(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h as Array<[string, string]>);
  return h as Record<string, string>;
}

/** Retry only once on network/5xx; never retry 4xx/429. */
function shouldRetry(count: number, err: AppError) {
  const s = err?.status;
  if (!s) return count < 1;                  // network/CORS/etc.
  if (s >= 500 && s < 600) return count < 1; // transient server
  return false;
}

/* ----------------------------------- Hook ---------------------------------- */

export function usePasswordResetRequest() {
  return useMutation<PasswordResetRequestResult, AppError, PasswordResetRequestInput>({
    mutationKey: ["auth", "password-reset", "request"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      const body = InputSchema.parse(variables);

      // Compose idempotent headers from shared helper
      const idemHeaders = headersToRecord(withIdempotency().headers);

      // POST (tolerate 204); also get requestId for support
      const { data: raw, requestId } = await fetchJsonWithMeta<unknown | undefined>(PATHS.requestReset, {
        method: "POST",
        json: body,
        headers: idemHeaders,
        cache: "no-store",
      });

      // Normalize success shapes
      const parsed = AckSchema.safeParse(raw);
      if (!parsed.success || !parsed.data || typeof parsed.data !== "object") {
        return { ok: true, requestId } as const;
      }

      const d = parsed.data as any;
      const res: PasswordResetRequestResult = { ok: true, requestId };
      if (typeof d.next_allowed_at === "string") res.next_allowed_at = d.next_allowed_at;
      if (typeof d.retry_after === "number") res.retry_after = d.retry_after;
      if (d.sent_via === "email" || d.sent_via === "sms") res.sent_via = d.sent_via;
      if (typeof d.masked_to === "string") res.masked_to = d.masked_to;
      return res;
    },
  });
}
