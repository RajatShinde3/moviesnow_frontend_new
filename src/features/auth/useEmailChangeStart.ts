// features/auth/useEmailChangeStart.ts
"use client";

/**
 * =============================================================================
 * Auth › Start Email Change (idempotent, step-up aware, 204-tolerant)
 * =============================================================================
 * @endpoint POST /api/v1/auth/email/change/start
 * @body     { new_email, reauth_token? }
 *
 * Semantics
 * - Validates input strictly with shared Zod schema (normalizes/lowers email).
 * - Sends Idempotency-Key for safe replay on transient retries.
 * - If provided, also sends X-Reauth header (server may require step-up).
 * - Uses `fetchJsonWithMeta` (auth/refresh/step-up aware, 204 tolerant).
 * - Parses `{ ok: true, pending_email? }` from 200/204.
 * - On success, invalidates ["auth","me"] so UI reflects pending email.
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
import {
  EmailChangeStartSchema,                // { new_email, reauth_token? }
  EmailChangeStartResponseSchema,        // { ok: true, pending_email? }
  type EmailChangeStartInput as SharedEmailChangeStartInput,
} from "@/features/auth/schemas";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_EMAIL_CHANGE_START_PATH =
  env().NEXT_PUBLIC_EMAIL_CHANGE_START_PATH ?? "api/v1/auth/email/change/start";
export const EMAIL_CHANGE_START_PATH = RAW_EMAIL_CHANGE_START_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

export type EmailChangeStartInput = SharedEmailChangeStartInput;
export type EmailChangeStartResult = z.infer<typeof EmailChangeStartResponseSchema>;

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

export function useEmailChangeStart() {
  const qc = useQueryClient();

  return useMutation<EmailChangeStartResult, AppError, EmailChangeStartInput>({
    mutationKey: ["auth", "email", "change", "start"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      // 1) Strict validation (reject unknown fields) + email normalization
      const payload = EmailChangeStartSchema.parse(variables);

      // 2) Compose headers: Idempotency always, X-Reauth when provided
      const headers: Record<string, string> = { "Idempotency-Key": newIdemKey() };
      if (payload.reauth_token) {
        headers[REAUTH_HEADER_NAME] = payload.reauth_token;
      }

      // 3) POST with unified client (204 tolerant)
      const { data } = await fetchJsonWithMeta<unknown>(EMAIL_CHANGE_START_PATH, {
        method: "POST",
        json: payload,
        headers,
        cache: "no-store",
      });

      // 4) Parse/normalize (default to `{ ok: true }` on 204)
      return EmailChangeStartResponseSchema.parse(data ?? { ok: true });
    },
    onSuccess: async () => {
      // Ensure the profile reflects any pending email
      await qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
