// features/auth/useAuthSessionsRevokeAll.ts
"use client";

/**
 * =============================================================================
 * Sessions › Revoke ALL sessions (backend-aligned)
 * =============================================================================
 * @endpoint DELETE /api/v1/auth/sessions
 *
 * Semantics:
 * - 200/204 → success.
 * - Idempotent: 401/403/404 are considered success (already logged out / gone),
 *   EXCEPT when the server signals step-up (code === "need_step_up") — that
 *   error is propagated so the UI can trigger the Reauth flow.
 * - Sends Idempotency-Key for safe replay across retries/retries.
 * - On success, proactively clears local auth via `logout()` and invalidates
 *   the sessions list cache.
 */

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { logout } from "@/lib/auth_store";

/* ────────────────────────────────────────────────────────────────────────────
   Path + Query Keys
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_SESSIONS_BASE_PATH =
  process.env.NEXT_PUBLIC_AUTH_SESSIONS_BASE_PATH ?? "api/v1/auth/sessions";
/** Strip leading slashes so API_BASE applies. */
export const SESSIONS_BASE_PATH = RAW_SESSIONS_BASE_PATH.replace(/^\/+/, "");
/** Canonical key shared with the list hook. */
export const SESSIONS_QK = ["auth", "sessions"] as const;

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

export type AuthSessionsRevokeAllResult = {
  ok: true;
  /** Server correlation id, if provided. */
  requestId?: string | null;
};

/* ────────────────────────────────────────────────────────────────────────────
   Retry policy (error-shape agnostic)
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
  return false;                              // do not retry other 4xx
}

/* ────────────────────────────────────────────────────────────────────────────
   Low-level call (idempotent by design)
   ──────────────────────────────────────────────────────────────────────────── */

export async function revokeAllSessions(): Promise<AuthSessionsRevokeAllResult> {
  const idem = newIdemKey();
  try {
    const { requestId } = await fetchJsonWithMeta<void>(SESSIONS_BASE_PATH, {
      method: "DELETE",
      headers: { "Idempotency-Key": idem },
      cache: "no-store",
    });
    return { ok: true, requestId } as const;
  } catch (err) {
    const status = getHttpStatus(err);
    const code = (err as AppError)?.code;

    // If the server requires reauth (step-up), bubble it up so UI can handle.
    if ((status === 401 || status === 403) && code === "need_step_up") {
      throw err;
    }

    // Idempotent delete semantics: already logged out / resource gone → success.
    if (status === 401 || status === 403 || status === 404) {
      return { ok: true, requestId: (err as AppError)?.requestId ?? null } as const;
    }

    throw err;
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Revoke (delete) **all** authentication sessions for the current user.
 *
 * Behavior:
 *   - 204/200 tolerant.
 *   - Idempotent: 401/403/404 → success (unless step-up required).
 *   - Clears local auth state and invalidates session caches on settle.
 */
export function useAuthSessionsRevokeAll() {
  const qc = useQueryClient();

  return useMutation<AuthSessionsRevokeAllResult, AppError, void>({
    mutationKey: [...SESSIONS_QK, "revoke-all"],
    retry: shouldRetry,

    mutationFn: async () => {
      const res = await revokeAllSessions();
      // Current session is revoked too—clear local auth immediately.
      logout();
      return res;
    },

    onSettled: async () => {
      // Ensure any session list or related views refresh.
      await qc.invalidateQueries({ queryKey: SESSIONS_QK });
      // If you cache "me", you can also invalidate it here:
      // await qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

/* ────────────────────────────────────────────────────────────────────────────
   (Optional) Programmatic helper for external callers
   ──────────────────────────────────────────────────────────────────────────── */

export async function invalidateAuthSessions(qc: QueryClient) {
  await qc.invalidateQueries({ queryKey: SESSIONS_QK });
}
