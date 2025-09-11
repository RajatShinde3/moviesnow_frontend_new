// lib/useMe.ts
"use client";

/**
 * =============================================================================
 *  useMe() — Production-grade session hook (backend aligned)
 * =============================================================================
 *
 *  Contract
 *  --------
 *  • GET `${API_BASE}/${PATHS.me}` via our auth-aware client.
 *  • Returns `Me | null`:
 *      - 200 JSON → parsed to `Me`
 *      - 204/empty → `null`
 *      - 401/403   → **treated as logged out** → `null` (no toast/throw)
 *
 *  Why this implementation?
 *  ------------------------
 *  • Uses `fetchJson` (timeouts, refresh-once, step-up aware, bounded retries).
 *  • Zod-validated parsing (future-proof, allows extra fields via `.passthrough()`).
 *  • React Query:
 *      - aborts on unmount via `signal`
 *      - gentle caching (stale 60s, GC 5m)
 *      - structural sharing for tiny objects
 *      - no extra retries here (client already handles transients)
 *  • Revalidates automatically on access-token changes (cross-tab safe).
 */

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { fetchJson, type AppError } from "@/lib/api/client";
import { PATHS } from "@/lib/env";
import { subscribe } from "@/lib/auth_store";

/* ────────────────────────────────────────────────────────────────────────────
 * Schema — tolerant app shape
 *  - `id` coerced to string
 *  - `email` validated
 *  - `name` optional/nullable (backend may omit)
 *  - passthrough allows backend to add fields without breaking the UI
 * ────────────────────────────────────────────────────────────────────────── */

export const MeSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    email: z.string().email().optional(), // some backends enrich profile with email
    name: z.string().nullable().optional(),
    email_verified: z.boolean().optional(),
  })
  .passthrough();

export type Me = z.infer<typeof MeSchema>;

/** React Query cache key for the current user. */
export const ME_QUERY_KEY = ["user", "me"] as const;

/* ────────────────────────────────────────────────────────────────────────────
 * Tiny guards/helpers
 * ────────────────────────────────────────────────────────────────────────── */

function isAppError(e: unknown): e is AppError {
  return !!e && typeof e === "object" && (e as any).name === "AppError";
}

type UseMeOptions = {
  /** Enable/disable the query (default: true). */
  enabled?: boolean;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Hook
 * ────────────────────────────────────────────────────────────────────────── */

export function useMe(options?: UseMeOptions) {
  const q = useQuery<Me | null, AppError>({
    queryKey: ME_QUERY_KEY,
    // v5 queryFn receives an AbortSignal
    queryFn: async ({ signal }) => {
      try {
        // `fetchJson` returns `undefined` for 204/empty → treat as `null`
        const data = await fetchJson<unknown>(PATHS.me, { method: "GET", signal });
        if (data == null) return null;
        return MeSchema.parse(data);
      } catch (err) {
        // Auth denials are "not signed in", not failures
        if (isAppError(err)) {
          const s = err.status ?? 0;
          if (s === 401 || s === 403) return null;
        }
        throw err as AppError;
      }
    },

    // Cache behavior tuned for session lookups
    staleTime: 60_000,          // 60s fresh window
    gcTime: 5 * 60_000,         // 5m cache retention
    retry: false,               // client handles transient retries already
    refetchOnWindowFocus: false, // avoid flapping on focus; token events handle revalidation
    enabled: options?.enabled ?? true,

    // Shallow-ish merge for tiny identity objects
    structuralSharing: (oldData, newData) =>
      oldData && newData ? { ...oldData, ...newData } : newData,
  });

  // Revalidate on access-token changes (login/logout/refresh), cross-tab safe.
  useEffect(() => {
    // subscribe() fires on every token change; we re-fetch best-effort.
    return subscribe(() => {
      // Avoid spurious network calls if query is disabled
      if (options?.enabled ?? true) {
        void q.refetch();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.refetch, options?.enabled]);

  return q;
}
