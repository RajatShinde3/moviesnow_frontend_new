// features/auth/useConfirmPasswordReset.ts
"use client";

/**
 * =============================================================================
 * Auth › Confirm Password Reset (idempotent, 204-tolerant)
 * =============================================================================
 * @endpoint POST /api/v1/auth/confirm-reset
 * @body     { token, new_password }
 *
 * Semantics
 * - Validates UI input with `ConfirmPasswordResetSchema`.
 * - Transforms to strict payload via `toConfirmPasswordResetPayload` (drops confirm_password).
 * - Sends Idempotency-Key for safe replay on transient retries.
 * - Uses `fetchJsonWithMeta` (auth/refresh/step-up aware, 204 tolerant).
 * - Parses `{ ok: true }` from 200/204 (empty body normalized).
 * - If server requires step-up, `AppError.code === "need_step_up"` is thrown (propagate to reauth UI).
 */

import { useMutation } from "@tanstack/react-query";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { env } from "@/lib/env";
import {
  ConfirmPasswordResetSchema,
  ConfirmPasswordResetResponseSchema,
  toConfirmPasswordResetPayload,
  type ConfirmPasswordResetInput,
} from "@/features/auth/schemas";
import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_CONFIRM_RESET_PATH =
  env().NEXT_PUBLIC_CONFIRM_RESET_PATH ?? "api/v1/auth/confirm-reset";
export const CONFIRM_RESET_PATH = RAW_CONFIRM_RESET_PATH.replace(/^\/+/, "");

/** Normalized success result (many servers reply 204 No Content). */
export type ConfirmPasswordResetResult = z.infer<
  typeof ConfirmPasswordResetResponseSchema
>;

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

export function useConfirmPasswordReset() {
  return useMutation<ConfirmPasswordResetResult, AppError, ConfirmPasswordResetInput>({
    mutationKey: ["auth", "password", "confirm-reset"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      // 1) Validate full client input (incl. confirm_password for UX)
      const validated = ConfirmPasswordResetSchema.parse(variables);

      // 2) Transform → strict server payload (drop confirm_password)
      const payload = toConfirmPasswordResetPayload(validated);

      // 3) POST with Idempotency-Key; tolerate 204 No Content
      const { data } = await fetchJsonWithMeta<unknown>(CONFIRM_RESET_PATH, {
        method: "POST",
        json: payload,
        headers: { "Idempotency-Key": newIdemKey() }, 
        cache: "no-store",
      });

      // 4) Parse/normalize server response (or synthesize `{ ok: true }`)
      return ConfirmPasswordResetResponseSchema.parse(data ?? { ok: true });
    },
  });
}

/** Back-compat alias (keeps existing imports working). */
export const useConfirmReset = useConfirmPasswordReset;
