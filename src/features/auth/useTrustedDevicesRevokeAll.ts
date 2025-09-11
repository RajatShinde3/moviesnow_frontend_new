// features/auth/useTrustedDevicesRevokeAll.ts
"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { fetchJson, withIdempotency, withReauth, type AppError } from "@/lib/api/client";
import { PATHS } from "@/lib/env";
import { z } from "zod";

/**
 * =============================================================================
 * Auth › Trusted Devices › Revoke All
 * =============================================================================
 * Revoke **all** trusted devices for the current user.
 *
 * Backend alignment
 * - DELETE `${PATHS.tdList}` → e.g. `/api/v1/auth/trusted-devices`
 *   (Some APIs expose `/mfa/trusted-devices`; configure PATHS accordingly.)
 *
 * Semantics & resilience
 * - Idempotent request: always sends `Idempotency-Key` (dedupes double-clicks/retries).
 * - Optional step-up: if you already have a `reauthToken`, it’s attached via `X-Reauth`.
 * - Response tolerant: many servers return 204; normalized to `{ ok: true }`.
 * - Conservative retry: network/5xx only (never retry 429/other 4xx).
 * - Treats 404 as success (already revoked / nothing to do).
 *
 * Cache behavior
 * - Optimistically sets `["auth","mfa","trusted-devices"]` to `{ devices: [] }`.
 * - Rollback on error; invalidate on success (and optionally a generic MFA status key).
 */

/* ────────────────────────────────────────────────────────────────────────────
   Input
   ──────────────────────────────────────────────────────────────────────────── */

const RawInput = z
  .object({ reauthToken: z.string().min(1).optional() })
  .or(z.object({ reauth_token: z.string().min(1).optional() }))
  .default({});

type TrustedDevicesRevokeAllInput = {
  /** Optional step-up token (sent as X-Reauth header). */
  reauthToken?: string;
};

const Input = RawInput.transform((v): TrustedDevicesRevokeAllInput => ({
  reauthToken: (v as any).reauthToken ?? (v as any).reauth_token ?? undefined,
}));

export type TrustedDevicesRevokeAllResult = { ok: true };

/* ────────────────────────────────────────────────────────────────────────────
   Query keys & local types
   ──────────────────────────────────────────────────────────────────────────── */

export const TRUSTED_DEVICES_QK = ["auth", "mfa", "trusted-devices"] as const;
type Ctx = { prev: unknown };

/* ────────────────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────────────────── */

/** Normalize HeadersInit → Record<string,string> for `fetchJson`’s options type. */
const toHeaderRecord = (h?: HeadersInit): Record<string, string> => {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h as Array<[string, string]>);
  return h as Record<string, string>;
};

function shouldRetry(_count: number, err: AppError) {
  const s = err?.status;
  if (s == null) return true;            // network/CORS/etc.
  if (s === 429) return false;           // respect rate limit
  if (s >= 500 && s < 600) return true;  // transient server errors
  return false;                          // no retry for other 4xx
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useTrustedDevicesRevokeAll() {
  const qc = useQueryClient();

  return useMutation<TrustedDevicesRevokeAllResult, AppError, TrustedDevicesRevokeAllInput | void, Ctx>({
    mutationKey: ["auth", "mfa", "trusted-devices", "revoke-all"],
    retry: shouldRetry,

    // Optimistic update: snap list to empty shape `{ devices: [] }`
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: TRUSTED_DEVICES_QK });
      const prev = qc.getQueryData(TRUSTED_DEVICES_QK);
      qc.setQueryData(TRUSTED_DEVICES_QK, { devices: [] });
      return { prev };
    },

    mutationFn: async (vars) => {
      const { reauthToken } = Input.parse(vars ?? {});

      // Build headers from helpers but pass a plain record (TS-friendly)
      const idem = withIdempotency();
      let headers: Record<string, string> = toHeaderRecord(idem.headers);

      if (reauthToken) {
        const reauth = withReauth(reauthToken);
        headers = { ...headers, ...toHeaderRecord(reauth.headers) };
      }

      try {
        await fetchJson<void>(PATHS.tdList, {
          method: "DELETE",
          headers,            // ✅ correct type for fetchJson
          cache: "no-store",
        });
        return { ok: true } as const;
      } catch (e) {
        const err = e as AppError;
        // Already revoked / nothing to do → treat as success
        if (err?.status === 404) return { ok: true } as const;
        throw err;
      }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(TRUSTED_DEVICES_QK, ctx.prev);
    },

    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: TRUSTED_DEVICES_QK });
      await qc.invalidateQueries({ queryKey: ["auth", "mfa", "status"] });

      // Optional cross-tab nudge for any listeners
      try {
        localStorage.setItem("auth:trusted-device:updated", String(Date.now()));
        localStorage.removeItem("auth:trusted-device:updated");
      } catch {
        /* ignore storage errors (private mode, etc.) */
      }
    },
  });
}

/* ────────────────────────────────────────────────────────────────────────────
   Utility (optional)
   ──────────────────────────────────────────────────────────────────────────── */

export async function invalidateTrustedDevices(qc: QueryClient) {
  await qc.invalidateQueries({ queryKey: TRUSTED_DEVICES_QK });
}
