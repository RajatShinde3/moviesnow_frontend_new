// features/auth/useLogout.ts
"use client";

/**
 * =============================================================================
 * Auth › Logout (idempotent, resilient, UX-friendly)
 * =============================================================================
 * @endpoint POST /api/v1/auth/logout
 *
 * Semantics
 * - 200/204 → success.
 * - 401/403 → also success (already logged out / expired).
 * - Always clears local auth in `finally` to prevent zombie state.
 * - Sends Idempotency-Key to dedupe double-clicks and safe transient retries.
 * - Drops auth-bound caches on settle to snap UI to a logged-out state.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { logout as clearLocalAuth } from "@/lib/auth_store";
import { env } from "@/lib/env";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_LOGOUT_PATH = env().NEXT_PUBLIC_LOGOUT_PATH ?? "api/v1/auth/logout";
export const LOGOUT_PATH = RAW_LOGOUT_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────────────────── */

type LogoutResult = { ok: true; requestId?: string | null };

function getHttpStatus(err: unknown): number | undefined {
  const e: any = err;
  if (typeof e?.status === "number") return e.status;
  if (typeof e?.response?.status === "number") return e.response.status;
  if (typeof e?.cause?.status === "number") return e.cause.status;
  if (typeof e?.cause?.response?.status === "number") return e.cause.response.status;
  return undefined;
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useLogout() {
  const qc = useQueryClient();

  return useMutation<LogoutResult, AppError, void>({
    mutationKey: ["auth", "logout"],

    // Cancel in-flight auth queries immediately to reduce UI flicker/races.
    onMutate: async () => {
      await Promise.all([
        qc.cancelQueries({ queryKey: ["auth"] }),
        qc.cancelQueries({ queryKey: ["user"] }),
      ]);
      // Snap common “me” view to logged-out state right away.
      qc.setQueryData(["auth", "me"], null);
    },

    mutationFn: async () => {
      const headers: Record<string, string> = { "Idempotency-Key": newIdemKey() };
      try {
        const { requestId } = await fetchJsonWithMeta<void>(LOGOUT_PATH, {
          method: "POST",
          headers,
          cache: "no-store",
        });
        return { ok: true, requestId } as const;
      } catch (err) {
        // Treat already-logged-out as success.
        const status = getHttpStatus(err);
        if (status === 401 || status === 403) {
          return { ok: true, requestId: (err as any)?.requestId ?? null } as const;
        }
        throw err;
      } finally {
        // Always clear local tokens and broadcast to other tabs.
        clearLocalAuth();
      }
    },

    // Whether success or failure, drop cached auth data so views reset.
    onSettled: () => {
      // Remove, don’t just invalidate—prevents stale flashes on next mount.
      qc.removeQueries({ queryKey: ["auth"], exact: false });
      qc.removeQueries({ queryKey: ["user"], exact: false });
      qc.removeQueries({ queryKey: ["auth", "sessions"], exact: false });
      qc.removeQueries({ queryKey: ["auth", "mfa"], exact: false });
    },
  });
}
