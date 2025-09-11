// features/auth/useAuthSessionsRevokeOthers.ts
"use client";

/**
 * =============================================================================
 * Sessions › Revoke all OTHER sessions (keep current)
 * =============================================================================
 * @endpoint DELETE /api/v1/auth/sessions/others
 *
 * Semantics:
 * - 200/204 → success.
 * - Idempotent: 401/403/404 are considered success (already logged out / none left),
 *   EXCEPT when the server signals step-up (AppError.code === "need_step_up") — that
 *   error is propagated so the caller can trigger reauth.
 * - Sends Idempotency-Key for safe replay across retries.
 * - Does NOT clear local auth (current session remains valid).
 * - On settle, invalidates the sessions list cache.
 */

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";

/* ────────────────────────────────────────────────────────────────────────────
   Path + Query Keys
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_REVOKE_OTHERS_PATH =
  process.env.NEXT_PUBLIC_AUTH_SESSIONS_REVOKE_OTHERS_PATH ?? "api/v1/auth/sessions/others";
/** Strip leading slashes so API_BASE from the client applies. */
export const SESSIONS_REVOKE_OTHERS_PATH = RAW_REVOKE_OTHERS_PATH.replace(/^\/+/, "");

/** Keep in sync with the list hook. */
export const SESSIONS_QK = ["auth", "sessions"] as const;

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

export type AuthSessionsRevokeOthersResult = {
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

export async function revokeOtherSessions(): Promise<AuthSessionsRevokeOthersResult> {
  const idem = newIdemKey();
  try {
    const { requestId } = await fetchJsonWithMeta<void>(SESSIONS_REVOKE_OTHERS_PATH, {
      method: "DELETE",
      headers: { "Idempotency-Key": idem },
      cache: "no-store",
    });
    return { ok: true, requestId } as const;
  } catch (err) {
    const status = getHttpStatus(err);
    const code = (err as AppError)?.code;

    // If step-up is required, bubble it up so the UI can launch reauth.
    if ((status === 401 || status === 403) && code === "need_step_up") {
      throw err;
    }

    // Idempotent semantics: already unauthorized/forbidden/not found → success
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
 * Revoke all sessions **except** the current one.
 *
 * Behavior:
 *   - 204/200 tolerant.
 *   - Idempotent: 401/403/404 → success (unless step-up required).
 *   - Does not clear local auth (current session remains).
 *   - Invalidates sessions cache on settle.
 */
export function useAuthSessionsRevokeOthers() {
  const qc = useQueryClient();

  return useMutation<AuthSessionsRevokeOthersResult, AppError, void>({
    mutationKey: [...SESSIONS_QK, "revoke-others"],
    retry: shouldRetry,

    mutationFn: async () => revokeOtherSessions(),

    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: SESSIONS_QK });
    },
  });
}

/* ────────────────────────────────────────────────────────────────────────────
   (Optional) Programmatic invalidation helper
   ──────────────────────────────────────────────────────────────────────────── */

export async function invalidateAuthSessions(qc: QueryClient) {
  await qc.invalidateQueries({ queryKey: SESSIONS_QK });
}
