// features/auth/useDeactivateUser.ts
"use client";

/**
 * =============================================================================
 * Auth › Deactivate account (OTP, step-up aware, 204-tolerant)
 * =============================================================================
 * @endpoint PUT /api/v1/auth/deactivate-user
 * @body     { otp, reauth_token? }
 *
 * Semantics
 * - Validates input with Zod (reuses GenericOtpSchema if available).
 * - Sends Idempotency-Key for safe replay of transient retries.
 * - Uses `fetchJsonWithMeta` (auth/refresh/step-up aware, 204 tolerant).
 * - On success, clears local auth via `logout()` (broadcasts cross-tab).
 * - If server requires step-up, throws `AppError` with `code: "need_step_up"`;
 *   caller should run reauth and retry with a `reauth_token`.
 */

import { useMutation } from "@tanstack/react-query";
import {
  fetchJsonWithMeta,
  REAUTH_HEADER_NAME,
  type AppError,
} from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { logout } from "@/lib/auth_store";
import { PATHS } from "@/lib/env";
import { z } from "zod";
// Prefer shared OTP schema if you have it:
import { GenericOtpSchema } from "@/features/auth/schemas";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization
   ──────────────────────────────────────────────────────────────────────────── */

// Use centralized, validated path (relative to API base)
export const DEACTIVATE_USER_PATH = PATHS.accountDeactivate;

/* ────────────────────────────────────────────────────────────────────────────
   Schemas & Types
   ──────────────────────────────────────────────────────────────────────────── */

export const DeactivateUserInputSchema = z
  .object({
    otp: GenericOtpSchema ?? z.string().min(1, "OTP is required"),
    /** Optional step-up token (header also set if provided). */
    reauth_token: z.string().min(1).optional(),
  })
  .strict();

export type DeactivateUserInput = z.infer<typeof DeactivateUserInputSchema>;

export type DeactivateUserResult = {
  ok: true;
  /** Server correlation id, if provided. */
  requestId?: string | null;
};

/* ────────────────────────────────────────────────────────────────────────────
   Retry policy — transient only (network/429/5xx)
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
  if (s === 429) return true;               // rate limited → backoff
  if (s >= 500 && s < 600) return true;     // transient server errors
  return false;                              // no retry for other 4xx
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useDeactivateUser() {
  return useMutation<DeactivateUserResult, AppError, DeactivateUserInput>({
    mutationKey: ["auth", "account", "deactivate"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      const payload = DeactivateUserInputSchema.parse(variables);

      // Compose headers: Idempotency always, X-Reauth when provided
      const headers: Record<string, string> = {
        "Idempotency-Key": newIdemKey(),
      };
      if (payload.reauth_token) {
        headers[REAUTH_HEADER_NAME] = payload.reauth_token;
      }

      // PUT (204 tolerant). We keep `reauth_token` in JSON body to match backend contract.
      const { requestId } = await fetchJsonWithMeta<void>(DEACTIVATE_USER_PATH, {
        method: "PUT",
        json: payload,
        headers,
        cache: "no-store",
      });

      return { ok: true, requestId } as const;
    },
    onSuccess: () => {
      // Clear local auth & broadcast logout so UI is immediately consistent
      logout();
    },
  });
}
