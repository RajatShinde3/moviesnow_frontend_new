// features/auth/useRecoveryCodesGenerate.ts
"use client";

/**
 * =============================================================================
 * Auth › Recovery Codes › Generate (production grade)
 * =============================================================================
 * Generate a fresh set of MFA recovery codes.
 *
 * Server shapes handled
 * - { codes: string[], replaced?, replaced_count?, rotated?, expires_at? }
 * - { recovery_codes: string[], ... }
 * - { data: { codes: [...], ... } }
 * - [ "CODE1", "CODE2", ... ]
 *
 * Behavior
 * - Sends Idempotency-Key (double-click / refresh safe).
 * - 204/empty → explicit error (since there’d be nothing to display).
 * - Normalizes & de-duplicates codes; trims whitespace.
 * - Conservative retry: network/5xx only (never retry 429/other 4xx).
 */

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { PATHS } from "@/lib/env";

/* ────────────────────────────────────────────────────────────────────────────
   Input (optional)
   Some backends allow asking for N codes or forcing rotation.
   These keys are OPTIONAL and safely ignored by servers that don’t support them.
   ──────────────────────────────────────────────────────────────────────────── */
export const RecoveryCodesGenerateInputSchema = z
  .object({
    count: z.number().int().min(1).max(50).optional(),
    rotate: z.boolean().optional(), // force invalidation of old codes if supported
  })
  .strict();

export type RecoveryCodesGenerateInput = z.infer<
  typeof RecoveryCodesGenerateInputSchema
>;

/* ────────────────────────────────────────────────────────────────────────────
   Response shapes (raw + normalized)
   ──────────────────────────────────────────────────────────────────────────── */

export type RecoveryCodes = {
  codes: string[];
  replaced?: number;
  rotated?: boolean;
  expires_at?: string; // ISO timestamp
};

const CodesArraySchema = z.array(z.string().min(1));

const RecoveryCodesRawSchema = z.union([
  // 1) { codes: [...] , replaced?, rotated?, expires_at? }
  z
    .object({
      codes: CodesArraySchema,
      replaced: z.number().int().nonnegative().optional(),
      replaced_count: z.number().int().nonnegative().optional(),
      rotated: z.boolean().optional(),
      expires_at: z.string().datetime().optional(),
    })
    .passthrough(),

  // 2) { recovery_codes: [...] , ... }
  z
    .object({
      recovery_codes: CodesArraySchema,
      replaced: z.number().int().nonnegative().optional(),
      replaced_count: z.number().int().nonnegative().optional(),
      rotated: z.boolean().optional(),
      expires_at: z.string().datetime().optional(),
    })
    .passthrough(),

  // 3) { data: { codes: [...] } , ... }
  z
    .object({
      data: z
        .object({
          codes: CodesArraySchema,
          replaced: z.number().int().nonnegative().optional(),
          replaced_count: z.number().int().nonnegative().optional(),
          rotated: z.boolean().optional(),
          expires_at: z.string().datetime().optional(),
        })
        .passthrough(),
    })
    .passthrough(),

  // 4) Bare array: [ "CODE1", "CODE2", ... ]
  CodesArraySchema,
]);

function normalizeRecoveryCodes(resp: unknown): RecoveryCodes {
  // fetchJsonWithMeta returns { data } where data can be undefined on 204
  if (resp == null) {
    throw new Error("The server returned no recovery codes. Please try again.");
  }

  const parsed = RecoveryCodesRawSchema.parse(resp);

  let codes: string[] = [];
  let replaced: number | undefined;
  let rotated: boolean | undefined;
  let expires_at: string | undefined;

  if (Array.isArray(parsed)) {
    codes = parsed;
  } else if ("codes" in parsed) {
    const p = parsed as any;
    codes = p.codes;
    replaced = p.replaced ?? p.replaced_count;
    rotated = p.rotated;
    expires_at = p.expires_at;
  } else if ("recovery_codes" in parsed) {
    const p = parsed as any;
    codes = p.recovery_codes;
    replaced = p.replaced ?? p.replaced_count;
    rotated = p.rotated;
    expires_at = p.expires_at;
  } else if ("data" in parsed) {
    const d = (parsed as any).data ?? {};
    codes = d.codes ?? [];
    replaced = d.replaced ?? d.replaced_count;
    rotated = d.rotated;
    expires_at = d.expires_at;
  }

  // Trim, dedupe, drop empties
  const clean = Array.from(new Set(codes.map((c) => c.trim()).filter(Boolean)));
  if (clean.length === 0) {
    throw new Error("No recovery codes returned by the server.");
  }

  return { codes: clean, replaced, rotated, expires_at };
}

/* ────────────────────────────────────────────────────────────────────────────
   Retry posture — transient only
   ──────────────────────────────────────────────────────────────────────────── */
function shouldRetry(_count: number, err: unknown) {
  const e = err as AppError | undefined;
  const s = e?.status;
  if (s == null) return true;            // network/CORS/etc.
  if (s === 429) return false;           // respect rate-limit
  if (s >= 500 && s < 600) return true;  // transient server errors
  return false;                           // don’t retry validation/other 4xx
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useRecoveryCodesGenerate() {
  return useMutation<RecoveryCodes, AppError, RecoveryCodesGenerateInput | void>({
    mutationKey: ["auth", "mfa", "recovery-codes", "generate"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      const body = variables
        ? RecoveryCodesGenerateInputSchema.parse(variables)
        : {};

      // Explicit Idempotency-Key avoids the type friction of spreading RequestInit.
      const { data } = await fetchJsonWithMeta<unknown | undefined>(
        PATHS.recoveryCodesGenerate,
        {
          method: "POST",
          json: body,
          headers: { "Idempotency-Key": newIdemKey() },
          cache: "no-store",
        }
      );

      return normalizeRecoveryCodes(data);
    },
  });
}
