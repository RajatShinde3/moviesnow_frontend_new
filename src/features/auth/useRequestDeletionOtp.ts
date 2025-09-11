// features/auth/useRequestDeletionOtp.ts
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
 * Auth › Request Deletion OTP (production-grade, backend-aligned)
 * =============================================================================
 *
 * Endpoint
 *   POST `${PATHS.requestDeletionOtp}`  → e.g. `/api/v1/auth/request-deletion-otp`
 *
 * Behavior
 * - Strict input validation (only intended fields are sent to the server).
 * - Always idempotent (adds `Idempotency-Key`).
 * - Optional **step-up** header: if a `reauthToken`/`reauth_token` is supplied,
 *   it is sent as `X-Reauth` (not in the JSON body).
 * - Tolerates `204 No Content`; normalizes tiny ACK payloads.
 * - Conservative retry posture (network/5xx only; never retry 4xx/429).
 */

const RawInput = z
  .object({
    /** If provided, will be sent as `X-Reauth` header (not in body). */
    reauthToken: z.string().min(1).optional(),
    /** Legacy alias accepted and normalized. */
    reauth_token: z.string().min(1).optional(),
    /** Delivery hint; many backends support only "email". */
    channel: z.enum(["email", "sms"]).optional(),
    /** Optional when backend can infer the principal from the session. */
    email: z.string().email().optional(),
    /** i18n hint (e.g., "en", "en-US"). */
    locale: z.string().min(2).max(35).optional(),
  })
  .strict();

export type RequestDeletionOtpInput = z.infer<typeof RawInput>;

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

export type RequestDeletionOtpResult = {
  ok: true;
  next_allowed_at?: string;
  retry_after?: number;
  sent_via?: "email" | "sms";
};

/* --------------------------------- Helpers -------------------------------- */

function toHeaderRecord(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h as Array<[string, string]>);
  return h as Record<string, string>;
}

/** Retry only once on network/5xx — never retry 4xx/429. */
function shouldRetry(count: number, err: AppError) {
  const s = err?.status;
  if (!s) return count < 1;                  // network/CORS/etc.
  if (s >= 500 && s < 600) return count < 1; // transient server
  return false;
}

/* ----------------------------------- Hook ---------------------------------- */

export function useRequestDeletionOtp() {
  return useMutation<RequestDeletionOtpResult, AppError, RequestDeletionOtpInput | void>({
    mutationKey: ["auth", "account", "deletion", "request-otp"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      const input = RawInput.parse(variables ?? {});
      const reauth = input.reauthToken ?? input.reauth_token ?? undefined;

      // Compose headers: Idempotency always; add X-Reauth when provided.
      const baseInit = withIdempotency();
      const mergedInit = reauth ? withReauth(reauth, baseInit) : baseInit;
      const headers = toHeaderRecord(mergedInit.headers);

      // Exclude header-only fields from JSON body.
      const { reauthToken, reauth_token, ...body } = input;

      // POST; accept 200 JSON or 204 No Content (client returns `undefined` on 204)
      const raw = await fetchJson<unknown | undefined>(PATHS.requestDeletionOtp, {
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
      const res: RequestDeletionOtpResult = { ok: true };
      if (typeof data.next_allowed_at === "string") res.next_allowed_at = data.next_allowed_at;
      if (typeof data.retry_after === "number") res.retry_after = data.retry_after;
      if (data.sent_via === "email" || data.sent_via === "sms") res.sent_via = data.sent_via;
      return res;
    },
  });
}
