// features/auth/useDeleteUser.ts
"use client";

/**
 * =============================================================================
 * Auth › Delete account (OTP, step-up aware, 204-tolerant)
 * =============================================================================
 * @endpoint DELETE /api/v1/auth/delete-user
 * @body     { otp, reauth_token? }
 *
 * Semantics
 * - Validates input with Zod (central OTP policy).
 * - Sends Idempotency-Key for safe replay of transient retries.
 * - Uses `fetchJsonWithMeta` (auth/refresh/step-up aware, 204 tolerant).
 * - On success, clears local auth via `logout()` (broadcasts cross-tab).
 * - If server requires step-up, throws `AppError` with `code: "need_step_up"`;
 *   caller should run reauth and retry with a `reauth_token`.
 *
 * Note
 * - If your backend disallows DELETE bodies, point the path to an alt endpoint
 *   (e.g., POST /api/v1/auth/delete-user) via env.
 */

import { useMutation } from "@tanstack/react-query";
import {
  fetchJsonWithMeta,
  REAUTH_HEADER_NAME,
  type AppError,
} from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { logout } from "@/lib/auth_store";
import { env } from "@/lib/env";
import { z } from "zod";
import { GenericOtpSchema } from "@/features/auth/schemas";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_DELETE_USER_PATH =
  env().NEXT_PUBLIC_DELETE_USER_PATH ?? "api/v1/auth/delete-user";
export const DELETE_USER_PATH = RAW_DELETE_USER_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Schemas & Types
   ──────────────────────────────────────────────────────────────────────────── */

export const DeleteUserInputSchema = z
  .object({
    otp: GenericOtpSchema, // centralized OTP policy
    /** Optional step-up token (also sent as X-Reauth header if provided). */
    reauth_token: z.string().min(1).optional(),
  })
  .strict();

export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

export type DeleteUserResult = {
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

export function useDeleteUser() {
  return useMutation<DeleteUserResult, AppError, DeleteUserInput>({
    mutationKey: ["auth", "account", "delete"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      const payload = DeleteUserInputSchema.parse(variables);

      // Compose headers: Idempotency always, X-Reauth when provided
      const headers: Record<string, string> = {
        "Idempotency-Key": newIdemKey(),
      };
      if (payload.reauth_token) {
        headers[REAUTH_HEADER_NAME] = payload.reauth_token;
      }

      // DELETE (204 tolerant). Body included to match backend contract.
      const { requestId } = await fetchJsonWithMeta<void>(DELETE_USER_PATH, {
        method: "DELETE",
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
