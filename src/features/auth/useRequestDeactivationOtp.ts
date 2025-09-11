// features/auth/useRequestDeactivationOtp.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import {
  fetchJson,
  withIdempotency,
  withReauth,
  type AppError,
} from "@/lib/api/client";
import { PATHS } from "@/lib/env";
import { z } from "zod";

/**
 * =============================================================================
 * Auth › Request Deactivation OTP (production-grade, backend-aligned)
 * =============================================================================
 *
 * Endpoint
 *   POST `${PATHS.requestDeactivationOtp}``  → e.g. `/api/v1/auth/request-deactivation-otp`
 *
 * Behavior
 * - Strict input validation (only intended fields are sent).
 * - Idempotent POST (always includes `Idempotency-Key`).
 * - Optional **step-up** header: when a `reauthToken` (or legacy `reauth_token`)
 *   is provided, it’s sent as `X-Reauth` (not in the JSON body).
 * - Tolerates `204 No Content`; normalizes small ACK payloads.
 * - Conservative retry posture (network/5xx only; never retry 4xx/429).
 */

const RawInput = z
  .object({
    /** If provided, sent as `X-Reauth` header (not in body). */
    reauthToken: z.string().min(1).optional(),
    /** Legacy alias for reauth token (accepted and normalized). */
    reauth_token: z.string().min(1).optional(),
    /** Delivery hint (many backends support only "email"). */
    channel: z.enum(["email", "sms"]).optional(),
    /** For signed-out flows; many servers infer from session and ignore this. */
    email: z.string().email().optional(),
    /** i18n hint, e.g., "en" or "en-US". */
    locale: z.string().min(2).max(35).optional(),
  })
  .strict();

export type RequestDeactivationOtpInput = z.infer<typeof RawInput>;

const AckSchema = z.union([
  z
    .object({
      ok: z.literal(true).optional(),
      next_allowed_at: z.string().datetime().optional(),
      retry_after: z
        .preprocess((v) => (typeof v === "string" ? Number.parseInt(v, 10) : v), z.number().int().nonnegative())
        .optional(),
      sent_via: z.enum(["email", "sms"]).optional(),
    })
    .passthrough(),
  z.null(),
  z.undefined(),
]);

export type RequestDeactivationOtpResult = {
  ok: true;
  next_allowed_at?: string;
  retry_after?: number;
  sent_via?: "email" | "sms";
};

/* ———————————————————————————————————————————————————————————————— */
/* Helpers                                                                     */
/* ———————————————————————————————————————————————————————————————— */

/** Coerce any `HeadersInit` into a plain record for `fetchJson` options. */
function toHeaderRecord(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h as Array<[string, string]>);
  return h as Record<string, string>;
}

/** Retry only on network/5xx, and only once. Never retry 4xx/429. */
function shouldRetry(count: number, err: AppError) {
  const s = err?.status;
  if (!s) return count < 1;            // network/CORS/etc.
  if (s >= 500 && s < 600) return count < 1;
  return false;
}

/* ———————————————————————————————————————————————————————————————— */
/* Hook                                                                        */
/* ———————————————————————————————————————————————————————————————— */

export function useRequestDeactivationOtp() {
  return useMutation<RequestDeactivationOtpResult, AppError, RequestDeactivationOtpInput | void>({
    mutationKey: ["auth", "account", "deactivation", "request-otp"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      const input = RawInput.parse(variables ?? {});
      const reauth = input.reauthToken ?? input.reauth_token ?? undefined;

      // Compose headers: Idempotency always; add X-Reauth when provided.
      const idemInit = withIdempotency();
      const withReauthInit = reauth ? withReauth(reauth, idemInit) : idemInit;
      const headers = toHeaderRecord(withReauthInit.headers);

      // Exclude header-only fields from JSON body.
      const { reauthToken, reauth_token, ...body } = input;

      // POST; accept 200 JSON or 204 No Content (client returns `undefined` on 204)
      const raw = await fetchJson<unknown | undefined>(PATHS.requestDeactivationOtp, {
        method: "POST",
        json: body,
        headers,
        cache: "no-store",
      });

      const parsed = AckSchema.safeParse(raw);
      if (!parsed.success || !parsed.data || typeof parsed.data !== "object") {
        return { ok: true } as const;
      }

      const data = parsed.data as any;
      const res: RequestDeactivationOtpResult = { ok: true };
      if (typeof data.next_allowed_at === "string") res.next_allowed_at = data.next_allowed_at;
      if (typeof data.retry_after === "number") res.retry_after = data.retry_after;
      if (data.sent_via === "email" || data.sent_via === "sms") res.sent_via = data.sent_via;
      return res;
    },
  });
}
