// features/auth/useRecoveryCodesList.ts
"use client";

/**
 * =============================================================================
 * Auth › Recovery Codes › List (production grade)
 * =============================================================================
 * Fetch the user's MFA recovery codes.
 *
 * Backend tolerance
 * - Accepts multiple shapes:
 *     • { codes: string[], remaining?, masked?, expires_at? }
 *     • { recovery_codes: string[], ... }
 *     • { data: { codes: [...] } }
 *     • { items: [...] }
 *     • [ "CODE1", "CODE2", ... ]
 * - 200 JSON or 204 No Content (treated as empty list).
 * - Extra fields are ignored (forward-compatible).
 *
 * Client guarantees
 * - Normalizes to a stable shape:
 *     { codes: string[], remaining?, masked?, expires_at? }
 *   with codes trimmed & de-duplicated (order preserved).
 * - Conservative retry policy (network/5xx only; never retry 4xx).
 */

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJson, type AppError } from "@/lib/api/client";
import { PATHS } from "@/lib/env";

/* ----------------------- Normalized result for the UI ---------------------- */

export type RecoveryCodesList = {
  codes: string[];       // possibly masked depending on backend policy
  remaining?: number;
  masked?: boolean;
  expires_at?: string;   // ISO timestamp if provided
};

/* ------------------------- Liberal response schemas ------------------------ */

const CodesArraySchema = z.array(z.string().min(1));

const RecoveryCodesRawSchema = z.union([
  // 1) Canonical { codes: [...] }
  z
    .object({
      codes: CodesArraySchema,
      remaining: z.number().int().nonnegative().optional(),
      masked: z.boolean().optional(),
      expires_at: z.string().datetime().optional(),
    })
    .passthrough(),

  // 2) Alias { recovery_codes: [...] }
  z
    .object({
      recovery_codes: CodesArraySchema,
      remaining: z.number().int().nonnegative().optional(),
      masked: z.boolean().optional(),
      expires_at: z.string().datetime().optional(),
    })
    .passthrough(),

  // 3) Wrapped { data: { codes: [...] } }
  z
    .object({
      data: z
        .object({
          codes: CodesArraySchema,
          remaining: z.number().int().nonnegative().optional(),
          masked: z.boolean().optional(),
          expires_at: z.string().datetime().optional(),
        })
        .passthrough(),
    })
    .passthrough(),

  // 4) Alternative { items: [...] }
  z.object({ items: CodesArraySchema }).passthrough(),

  // 5) Bare array
  CodesArraySchema,
]);

function normalizeRecoveryList(resp: unknown): RecoveryCodesList {
  if (resp == null) {
    // e.g., 204 No Content → show empty state gracefully
    return Object.freeze({ codes: [] });
  }

  const parsed = RecoveryCodesRawSchema.parse(resp);

  let codes: string[] = [];
  let remaining: number | undefined;
  let masked: boolean | undefined;
  let expires_at: string | undefined;

  if (Array.isArray(parsed)) {
    codes = parsed;
  } else if ("codes" in parsed) {
    const p = parsed as any;
    codes = p.codes;
    remaining = p.remaining;
    masked = p.masked;
    expires_at = p.expires_at;
  } else if ("recovery_codes" in parsed) {
    const p = parsed as any;
    codes = p.recovery_codes;
    remaining = p.remaining;
    masked = p.masked;
    expires_at = p.expires_at;
  } else if ("data" in parsed) {
    const d = (parsed as any).data ?? {};
    codes = d.codes ?? [];
    remaining = d.remaining;
    masked = d.masked;
    expires_at = d.expires_at;
  } else if ("items" in parsed) {
    codes = (parsed as any).items ?? [];
  }

  // Trim, dedupe, drop empties (preserve original order)
  const clean = Array.from(new Set(codes.map((c) => c.trim()).filter(Boolean)));

  return Object.freeze({ codes: clean, remaining, masked, expires_at });
}

/* ------------------------------ Retry helper ------------------------------ */

function shouldRetry(failureCount: number, error: AppError) {
  const s = error?.status;
  const transient = !s || (s >= 500 && s < 600);
  return transient && failureCount < 2;
}

/* ----------------------------------- Hook ---------------------------------- */

export function useRecoveryCodesList(options?: { enabled?: boolean }) {
  return useQuery<RecoveryCodesList, AppError>({
    queryKey: ["auth", "mfa", "recovery-codes", "list"],
    queryFn: async () => {
      // Accept 200 JSON or 204 No Content (client returns `undefined` on 204)
      const data = await fetchJson<unknown | undefined>(PATHS.recoveryCodesList, {
        method: "GET",
      });
      return normalizeRecoveryList(data);
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    enabled: options?.enabled ?? true,
    retry: shouldRetry,
    // Stable empty shape to avoid list jitter while loading
    placeholderData: Object.freeze({ codes: [] }),
  });
}
