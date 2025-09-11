// features/auth/useAuthSessionRevoke.ts
"use client";

import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type QueryKey as RQQueryKey,
} from "@tanstack/react-query";
import {
  fetchJsonWithMeta,
  REQUEST_ID_HEADER_NAME,
  type AppError,
} from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { logout } from "@/lib/auth_store";
import { z } from "zod";

/**
 * ============================================================================
 * Sessions › Revoke One Session
 * ============================================================================
 * @summary Delete a single authentication session by its JTI.
 *
 * @endpoint DELETE /api/v1/auth/sessions/{jti}
 *
 * @headers
 * - Authorization: Bearer <access_token> (added by client)
 * - Idempotency-Key: Unique per attempt (prevents duplicate revocations)
 * - Cache-Control: no-store (recommended)
 *
 * @returns { ok: true, requestId?: string }
 * - 200/204 → success
 * - 404     → treated as success (already revoked)
 *
 * @side-effects
 * - Optimistic cache removal; rollback on error.
 * - Invalidates ["auth","sessions"] on settle.
 * - If revoking current session or server sends `x-logout: required`, calls `logout()`.
 */

const RAW_SESSIONS_BASE_PATH =
  process.env.NEXT_PUBLIC_AUTH_SESSIONS_BASE_PATH ?? "api/v1/auth/sessions";
export const SESSIONS_BASE_PATH = RAW_SESSIONS_BASE_PATH.replace(/^\/+/, "");
export const SESSIONS_QK = ["auth", "sessions"] as const;

const RevokeInputSchema = z.object({
  jti: z.string().min(1, "Session id is required"),
  is_current: z.boolean().optional(),
});
export type AuthSessionRevokeInput = z.infer<typeof RevokeInputSchema>;

export type AuthSessionRevokeResult = {
  ok: true;
  requestId?: string | null;
};

function removeSessionFromCache(snapshot: unknown, jti: string): unknown {
  if (!snapshot || typeof snapshot !== "object") return snapshot;
  const anySnap = snapshot as any;

  if (Array.isArray(anySnap)) {
    return anySnap.filter((s) => (s?.jti ?? s?.id) !== jti);
  }
  if (Array.isArray(anySnap.sessions)) {
    return { ...anySnap, sessions: anySnap.sessions.filter((s: any) => (s?.jti ?? s?.id) !== jti) };
  }
  if (Array.isArray(anySnap.pages)) {
    return {
      ...anySnap,
      pages: anySnap.pages.map((p: any) =>
        Array.isArray(p?.items)
          ? { ...p, items: p.items.filter((s: any) => (s?.jti ?? s?.id) !== jti) }
          : p
      ),
    };
  }
  return snapshot;
}

// Retry policy — works with AppError and other shapes
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
  if (s == null) return true;                // network/CORS/etc.
  if (s === 429) return true;                // rate limited → backoff
  if (s >= 500 && s < 600) return true;      // transient server errors
  return false;                               // no retry for other 4xx
}

/** Context shared across onMutate/onError/onSettled */
type MutationCtx = { prev: Array<[RQQueryKey, unknown]> };

export function useAuthSessionRevoke() {
  const qc = useQueryClient();

  return useMutation<AuthSessionRevokeResult, AppError, AuthSessionRevokeInput, MutationCtx>({
    mutationKey: [...SESSIONS_QK, "revoke"],
    retry: shouldRetry,

    onMutate: async (vars) => {
      const { jti } = RevokeInputSchema.parse(vars);
      await qc.cancelQueries({ queryKey: SESSIONS_QK });

      const prev = qc.getQueriesData({ queryKey: SESSIONS_QK });
      prev.forEach(([key]) => {
        qc.setQueryData(key, (old: unknown) => removeSessionFromCache(old, jti));
      });

      return { prev };
    },

    // v5: mutationFn receives (variables) only
    mutationFn: async (variables) => {
      const { jti, is_current } = RevokeInputSchema.parse(variables);
      const idem = newIdemKey();

      try {
        const { headers, requestId } = await fetchJsonWithMeta<void>(
          `${SESSIONS_BASE_PATH}/${encodeURIComponent(jti)}`,
          {
            method: "DELETE",
            headers: { "Idempotency-Key": idem },
            cache: "no-store",
          }
        );

        const mustLogout = is_current || headers["x-logout"] === "required";
        if (mustLogout) logout();

        return { ok: true, requestId } as const;
      } catch (err) {
        const status = getHttpStatus(err);
        // Idempotent delete: treat 404 as success (already revoked)
        if (status === 404) {
          if (is_current) logout();
          return {
            ok: true,
            requestId: (err as AppError)?.requestId ?? null,
          } as const;
        }
        throw err;
      }
    },

    onError: (_err, _vars, context) => {
      // rollback optimistic update
      context?.prev?.forEach?.(([key, data]) => {
        (qc as QueryClient).setQueryData(key, data);
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: SESSIONS_QK });
    },
  });
}
