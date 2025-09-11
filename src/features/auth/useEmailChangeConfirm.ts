// features/auth/useEmailChangeConfirm.ts
"use client";

/**
 * =============================================================================
 * Auth › Confirm Email Change (idempotent, 204-tolerant)
 * =============================================================================
 * @endpoint POST /api/v1/auth/email/change/confirm
 * @body     { token }
 *
 * Semantics
 * - Validates input with shared Zod schema.
 * - Sends Idempotency-Key for safe replay on transient retries.
 * - Uses `fetchJsonWithMeta` (auth/refresh/step-up aware, 204 tolerant).
 * - Parses `{ ok: true, email? }` from 200/204 (empty body normalized).
 * - On success, invalidates ["auth","me"] so UI reflects the new email.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { PATHS } from "@/lib/env";
import { z } from "zod";
import {
  EmailChangeConfirmSchema as SharedEmailChangeConfirmSchema,
  EmailChangeConfirmResponseSchema,
  type EmailChangeConfirmInput as SharedEmailChangeConfirmInput,
} from "@/features/auth/schemas";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization
   ──────────────────────────────────────────────────────────────────────────── */

// Use centralized, validated path (relative to API base)
export const EMAIL_CHANGE_CONFIRM_PATH = PATHS.emailChangeConfirm;

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

export type EmailChangeConfirmInput = SharedEmailChangeConfirmInput;
export type EmailChangeConfirmResult = z.infer<typeof EmailChangeConfirmResponseSchema>;

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

export function useEmailChangeConfirm() {
  const qc = useQueryClient();

  return useMutation<EmailChangeConfirmResult, AppError, EmailChangeConfirmInput>({
    mutationKey: ["auth", "email", "change", "confirm"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      // 1) Validate strictly (reject extra client fields)
      const payload = SharedEmailChangeConfirmSchema.parse(variables);

      // 2) POST with Idempotency-Key; tolerate 204 No Content
      const { data } = await fetchJsonWithMeta<unknown>(EMAIL_CHANGE_CONFIRM_PATH, {
        method: "POST",
        json: payload,
        headers: { "Idempotency-Key": newIdemKey() },
        cache: "no-store",
      });

      // 3) Parse/normalize server response (or synthesize `{ ok: true }`)
      return EmailChangeConfirmResponseSchema.parse(data ?? { ok: true });
    },
    onSuccess: async () => {
      // Ensure profile reflects the new email
      await qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
