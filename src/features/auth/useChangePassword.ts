// features/auth/useChangePassword.ts
"use client";

/**
 * =============================================================================
 * Auth › Change Password (step-up aware, idempotent)
 * =============================================================================
 * @endpoint POST /api/v1/auth/password/change
 * @body     { current_password, new_password }
 *
 * Semantics
 * - Validates UI input with `ChangePasswordSchema`.
 * - Transforms to server payload via `ChangePasswordPayloadSchema` (drops confirm_password).
 * - Sends Idempotency-Key so transient retries are safe.
 * - Uses `fetchJsonWithMeta` (auth/refresh/step-up aware, 204 tolerant).
 * - Parses `{ ok: true }` from 200/204 (empty body normalized).
 * - If server signals step-up, an `AppError` with `code: "need_step_up"` is thrown.
 */

import { useMutation } from "@tanstack/react-query";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import {
  ChangePasswordSchema,
  ChangePasswordPayloadSchema,
  ChangePasswordResponseSchema,
  type ChangePasswordInput,
} from "@/features/auth/schemas";
import { z } from "zod";

/** Env-driven path; strip leading slash so API_BASE applies. */
const CHANGE_PASSWORD_PATH = (
  process.env.NEXT_PUBLIC_CHANGE_PASSWORD_PATH ?? "api/v1/auth/password/change"
).replace(/^\/+/, "");

/** Server ack (usually 204 No Content → normalized to `{ ok: true }`). */
export type ChangePasswordResult = z.infer<typeof ChangePasswordResponseSchema>;

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
  return false;                              // no retry for other 4xx (validation/auth)
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useChangePassword() {
  return useMutation<ChangePasswordResult, AppError, ChangePasswordInput>({
    mutationKey: ["auth", "password", "change"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      // 1) Validate full client input (incl. confirm_password for UX)
      const validated = ChangePasswordSchema.parse(variables);

      // 2) Transform → strict server payload (drop confirm_password)
      const payload = ChangePasswordPayloadSchema.parse(validated);

      // 3) POST with Idempotency-Key; tolerate 204 No Content
      const idem = newIdemKey();
      const { data } = await fetchJsonWithMeta<unknown>(CHANGE_PASSWORD_PATH, {
        method: "POST",
        json: payload,
        headers: { "Idempotency-Key": idem }, // ✅ plain Record<string,string>
        cache: "no-store",
      });

      // 4) Parse/normalize server response (or synthesize `{ ok: true }`)
      return ChangePasswordResponseSchema.parse(data ?? { ok: true });
    },
  });
}
