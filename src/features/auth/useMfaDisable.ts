// features/auth/useMfaDisable.ts
"use client";

/**
 * =============================================================================
 * Auth › Disable MFA (password-confirmed, idempotent, 204-tolerant)
 * =============================================================================
 * @endpoint POST /api/v1/auth/mfa/disable
 * @body     { password }
 *
 * Semantics
 * - Validates input with Zod (trimmed, non-empty password).
 * - Sends Idempotency-Key to protect against double-submits/retries.
 * - If provided, sends `X-Reauth: <reauth_token>` header for step-up.
 * - Uses unified client (auth/refresh/step-up aware, 204 tolerant).
 * - Returns `{ ok: true, requestId? }` on success.
 * - On success, invalidates ["auth","mfa"] so UI reflects the new state.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchJsonWithMeta,
  REAUTH_HEADER_NAME,
  type AppError,
} from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { env } from "@/lib/env";
import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization (legacy alias supported)
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_MFA_DISABLE_PATH =
  env().NEXT_PUBLIC_MFA_DISABLE_PATH ??
  "api/v1/auth/mfa/disable";
export const MFA_DISABLE_PATH = RAW_MFA_DISABLE_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Schema & types (backend expects password; reauth header is optional)
   ──────────────────────────────────────────────────────────────────────────── */

const MfaDisableClientInputSchema = z
  .object({
    /** Current password (backend validates timing-safe). */
    password: z.string().trim().min(1, "Password is required"),
    /** Optional step-up token to be sent as X-Reauth header. */
    reauth_token: z.string().min(1).optional(),
  })
  .strict();

export type MfaDisableInput = z.infer<typeof MfaDisableClientInputSchema>;
export type MfaDisableResult = { ok: true; requestId?: string | null };

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

export function useMfaDisable() {
  const qc = useQueryClient();

  return useMutation<MfaDisableResult, AppError, MfaDisableInput>({
    mutationKey: ["auth", "mfa", "disable"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      const { password, reauth_token } = MfaDisableClientInputSchema.parse(variables);

      // Compose headers: Idempotency always; X-Reauth if provided
      const headers: Record<string, string> = { "Idempotency-Key": newIdemKey() };
      if (reauth_token) headers[REAUTH_HEADER_NAME] = reauth_token;

      // Backend expects only { password } in the JSON body
      const { requestId } = await fetchJsonWithMeta<void>(MFA_DISABLE_PATH, {
        method: "POST",
        json: { password },
        headers,
        cache: "no-store",
      });

      return { ok: true, requestId } as const;
    },
    onSuccess: async () => {
      // MFA state changed — refresh related caches
      await qc.invalidateQueries({ queryKey: ["auth", "mfa"] });
      // (optional) If you display recovery codes status, also invalidate them
      // await qc.invalidateQueries({ queryKey: ["auth", "recovery-codes"] });
    },
  });
}
