// features/auth/useTrustedDeviceRevoke.ts
"use client";

/**
 * =============================================================================
 * Auth › Trusted Device › Revoke (idempotent, 204-tolerant)
 * =============================================================================
 * @endpoint  DELETE `${PATHS.tdRevoke(deviceId)}`
 * @headers   Authorization: Bearer <access_token> (injected by client)
 *            X-Reauth: <reauthToken>  (optional, if caller supplies one)
 *
 * Semantics
 * - DELETE is idempotent: repeating the call is safe; a 404 is treated as success.
 * - Tolerates 204/No Content and tiny JSON ACKs; normalized to `{ ok: true, device_id }`.
 * - Conservative retry policy: network/5xx only; never retry 4xx/429.
 *
 * Caching / UX
 * - Invalidates the trusted-devices list (and optional MFA status) on success.
 * - Emits a cross-tab storage nudge for listeners (best-effort).
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson, withReauth, type AppError } from "@/lib/api/client";
import { PATHS } from "@/lib/env";
import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────────
   Input (accept aliases) → normalize to { deviceId, reauthToken? }
   ──────────────────────────────────────────────────────────────────────────── */

const VariantDeviceId = z.object({
  device_id: z.string().min(1),
  reauth_token: z.string().min(1).optional(),
}).strict();

const VariantId = z.object({
  id: z.string().min(1),
  reauth_token: z.string().min(1).optional(),
}).strict();

const VariantCamel = z.object({
  deviceId: z.string().min(1),
  reauthToken: z.string().min(1).optional(),
}).strict();

const RawInput = z.union([VariantDeviceId, VariantId, VariantCamel]);

const Input = RawInput.transform((v) => ({
  deviceId: (v as any).deviceId ?? (v as any).device_id ?? (v as any).id,
  reauthToken: (v as any).reauthToken ?? (v as any).reauth_token ?? undefined,
}));

export type TrustedDeviceRevokeInput = z.input<typeof RawInput>;
export type TrustedDeviceRevokeResult = { ok: true; device_id: string };

/* ────────────────────────────────────────────────────────────────────────────
   Local helpers
   ──────────────────────────────────────────────────────────────────────────── */

/** Convert HeadersInit → Record<string,string> for `fetchJson` options. */
function headersToRecord(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h as Array<[string, string]>);
  return h as Record<string, string>;
}

/** Retry transient issues (network/5xx) only; never 4xx/429. */
function shouldRetry(_count: number, err: AppError) {
  const s = err?.status;
  if (s == null) return true;            // network/CORS/etc.
  if (s === 429) return false;           // respect rate-limit
  if (s >= 500 && s < 600) return true;  // transient server
  return false;                           // don’t retry validation/auth errors
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

const LIST_QK = ["auth", "mfa", "trusted-devices"] as const;

export function useTrustedDeviceRevoke() {
  const qc = useQueryClient();

  return useMutation<TrustedDeviceRevokeResult, AppError, TrustedDeviceRevokeInput>({
    mutationKey: ["auth", "mfa", "trusted-devices", "revoke"],
    retry: shouldRetry,
    mutationFn: async (vars) => {
      const { deviceId, reauthToken } = Input.parse(vars);

      // Compose headers: X-Reauth iff provided (Bearer is injected by client).
      const headers = reauthToken
        ? headersToRecord(withReauth(reauthToken).headers)
        : undefined;

      try {
        await fetchJson<void>(PATHS.tdRevoke(deviceId), {
          method: "DELETE",
          headers,
          cache: "no-store",
        });
      } catch (e) {
        const err = e as AppError;
        // DELETE is idempotent: if it’s already gone, treat as success.
        if (err?.status === 404) {
          return { ok: true as const, device_id: deviceId };
        }
        throw err;
      }

      return { ok: true as const, device_id: deviceId };
    },
    onSuccess: () => {
      // Refresh trusted devices list and any MFA status views.
      qc.invalidateQueries({ queryKey: LIST_QK });
      qc.invalidateQueries({ queryKey: ["auth", "mfa", "status"] });

      // Cross-tab hint (safe to ignore if unsupported).
      try {
        localStorage.setItem("auth:trusted-device:updated", String(Date.now()));
        localStorage.removeItem("auth:trusted-device:updated");
      } catch {
        /* ignore storage errors */
      }
    },
  });
}
