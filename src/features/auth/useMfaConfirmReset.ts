// features/auth/useMfaConfirmReset.ts
"use client";

/**
 * =============================================================================
 * Auth › Confirm MFA Reset (idempotent, 204-tolerant)
 * =============================================================================
 * @endpoint POST /api/v1/auth/mfa/confirm-mfa-reset
 * @body     { token }
 *
 * Semantics
 * - Validates input with shared `TokenSchema` (trimmed, non-empty).
 * - Sends Idempotency-Key to protect against double-submits/retries.
 * - Uses `fetchJsonWithMeta` (auth/refresh aware, 204 tolerant).
 * - Returns `{ ok: true, requestId? }` on success.
 * - On success, invalidates `["auth","mfa"]` so UI reflects the new state.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { env } from "@/lib/env";
import { z } from "zod";
import { TokenSchema } from "@/features/auth/schemas";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization (legacy var supported)
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_MFA_CONFIRM_RESET_PATH =
  env().NEXT_PUBLIC_MFA_CONFIRM_RESET_PATH ??
  "api/v1/auth/mfa/confirm-mfa-reset";
export const MFA_CONFIRM_RESET_PATH = RAW_MFA_CONFIRM_RESET_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Schema & types
   ──────────────────────────────────────────────────────────────────────────── */

export const MfaConfirmResetInputSchema = z
  .object({ token: TokenSchema }) // shared: trims & validates
  .strict();

export type MfaConfirmResetInput = z.infer<typeof MfaConfirmResetInputSchema>;
export type MfaConfirmResetResult = { ok: true; requestId?: string | null };

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

export function useMfaConfirmReset() {
  const qc = useQueryClient();

  return useMutation<MfaConfirmResetResult, AppError, MfaConfirmResetInput>({
    mutationKey: ["auth", "mfa", "confirm-reset"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      const payload = MfaConfirmResetInputSchema.parse(variables);

      const { requestId } = await fetchJsonWithMeta<void>(MFA_CONFIRM_RESET_PATH, {
        method: "POST",
        json: payload,
        headers: { "Idempotency-Key": newIdemKey() },
        cache: "no-store",
      });

      return { ok: true, requestId } as const;
    },
    onSuccess: async () => {
      // MFA state changed — refresh related caches
      await qc.invalidateQueries({ queryKey: ["auth", "mfa"] });
      // (optional) If you expose recovery codes post-reset, also:
      // await qc.invalidateQueries({ queryKey: ["auth", "recovery-codes"] });
    },
  });
}
