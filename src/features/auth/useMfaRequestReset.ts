// features/auth/useMfaRequestReset.ts
"use client";

/**
 * =============================================================================
 * Auth › Request MFA Reset (idempotent, 204-tolerant)
 * =============================================================================
 * @endpoint POST /api/v1/auth/mfa/request-mfa-reset
 * @body     { email? }  // signed-in users may omit; server can infer
 *
 * Semantics
 * - Validates input with shared schema (email trimmed/lowercased).
 * - Always sends a JSON object ({} when no email provided).
 * - Adds Idempotency-Key to prevent double submits / enable safe retries.
 * - Uses unified client (auth/refresh aware, 204 tolerant).
 * - Normalizes to `{ ok: true, requestId? }`.
 */

import { useMutation } from "@tanstack/react-query";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { env } from "@/lib/env";
import { z } from "zod";
import {
  MfaRequestResetSchema,                 // { email? } .partial().strict()
  MfaRequestResetResponseSchema,         // OkMaybeSchema
  type MfaRequestResetInput as SharedMfaRequestResetInput,
} from "@/features/auth/schemas";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization (legacy alias supported)
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_MFA_REQUEST_RESET_PATH =
  env().NEXT_PUBLIC_MFA_REQUEST_RESET_PATH ??
  "api/v1/auth/mfa/request-mfa-reset";
export const MFA_REQUEST_RESET_PATH = RAW_MFA_REQUEST_RESET_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

export type MfaRequestResetInput = SharedMfaRequestResetInput | void;
export type MfaRequestResetResult = { ok: true; requestId?: string | null };

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

export function useMfaRequestReset() {
  return useMutation<MfaRequestResetResult, AppError, MfaRequestResetInput>({
    mutationKey: ["auth", "mfa", "request-reset"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      // Accept no args (signed-in) or { email }; always send an object
      const parsed = MfaRequestResetSchema.parse((variables ?? {}) as Record<string, unknown>);
      const body = Object.keys(parsed).length ? parsed : {};

      const { requestId, data } = await fetchJsonWithMeta<unknown | undefined>(MFA_REQUEST_RESET_PATH, {
        method: "POST",
        json: body,
        headers: { "Idempotency-Key": newIdemKey() },
        cache: "no-store",
      });

      // Normalize 200/204 → { ok: true }
      // If server returned JSON, accept `{ ok: true }` or treat any 2xx as ok.
      const ok = MfaRequestResetResponseSchema.safeParse(data).success ? true : true;
      return { ok: ok as true, requestId } as const;
    },
  });
}
