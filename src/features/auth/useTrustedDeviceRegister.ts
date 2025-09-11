// features/auth/useTrustedDeviceRegister.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchJson,
  withIdempotency,
  withReauth,
  type AppError,
} from "@/lib/api/client";
import { PATHS } from "@/lib/env";
import { z } from "zod";
import {
  OkSchema,
  TrustedDeviceSchema,
  type TrustedDevice,
} from "@/features/auth/schemas";

/**
 * =============================================================================
 * Auth › Trusted Device › Register (idempotent, 204-tolerant)
 * =============================================================================
 * Endpoint
 *   POST `${PATHS.tdRegister}`  →  `/api/v1/auth/trusted-devices/register`
 *
 * Behavior
 * - Sends `Idempotency-Key` to dedupe double-submits/retries.
 * - If caller provides a `reauthToken`, attaches it via `X-Reauth`.
 * - Tolerates `204 No Content` and small ACKs; also accepts device object or
 *   `{ device: {...} }` and normalizes to `{ ok: true, device? }`.
 *
 * Caching / UX
 * - On success, invalidates the trusted-devices list and a generic MFA status key.
 * - Emits a cross-tab storage nudge (`auth:trusted-device:updated`) for listeners.
 */

// ---- Input -----------------------------------------------------------------

const RawInput = z
  .object({
    device_label: z
      .string()
      .trim()
      .min(1, "Label cannot be empty")
      .max(128, "Label is too long")
      .optional(),
    fingerprint: z.string().min(1).optional(),
    reauthToken: z.string().min(1).optional(),
    reauth_token: z.string().min(1).optional(), // legacy alias
  })
  .strict();

export type TrustedDeviceRegisterInput = z.infer<typeof RawInput>;

// ---- Response tolerance -----------------------------------------------------

const ServerShape = z.union([
  OkSchema, // { ok: true } or { ok: true, ... }
  TrustedDeviceSchema, // bare device object
  z.object({ device: TrustedDeviceSchema }).passthrough(), // { device: {...} }
]);

export type TrustedDeviceRegisterResult = { ok: true; device?: TrustedDevice };

// ---- Local utils ------------------------------------------------------------

/** Convert HeadersInit → Record<string,string> for fetchJson’s options. */
function headersToRecord(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h as Array<[string, string]>);
  return h as Record<string, string>;
}

/** Retry only transient issues (network/5xx). Never retry 4xx/429. */
function shouldRetry(_count: number, error: AppError) {
  const s = error?.status;
  if (s == null) return true;           // network/CORS/etc.
  if (s === 429) return false;          // respect rate limit
  if (s >= 500 && s < 600) return true; // transient server
  return false;
}

// ---- Hook -------------------------------------------------------------------

const LIST_QK = ["auth", "mfa", "trusted-devices"] as const;

export function useTrustedDeviceRegister() {
  const qc = useQueryClient();

  return useMutation<TrustedDeviceRegisterResult, AppError, TrustedDeviceRegisterInput | void>({
    mutationKey: ["auth", "mfa", "trusted-devices", "register"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      const input = RawInput.parse(variables ?? {});
      const { device_label, fingerprint } = input;

      // Compose headers: Idempotency always; X-Reauth iff provided.
      const reauth = input.reauthToken ?? input.reauth_token ?? undefined;
      const headerInit = reauth
        ? withReauth(reauth, withIdempotency()).headers
        : withIdempotency().headers;
      const headers = headersToRecord(headerInit);

      // Strict body (only known fields)
      const body: Record<string, unknown> = {};
      if (device_label) body.device_label = device_label;
      if (fingerprint) body.fingerprint = fingerprint;

      const raw = await fetchJson<unknown | undefined>(PATHS.tdRegister, {
        method: "POST",
        json: body,
        headers,
        cache: "no-store",
      });

      if (raw === undefined) return { ok: true as const }; // 204

      // Normalize to { ok: true, device? }
      const parsed = ServerShape.safeParse(raw);
      if (!parsed.success) return { ok: true as const }; // tiny ACKs etc.

      const val = parsed.data as unknown;
      const asDevice = TrustedDeviceSchema.safeParse(val);
      if (asDevice.success) return { ok: true as const, device: asDevice.data };

      const asWrapped = z.object({ device: TrustedDeviceSchema }).safeParse(val);
      if (asWrapped.success) return { ok: true as const, device: asWrapped.data.device };

      return { ok: true as const };
    },
    onSuccess: () => {
      // Refresh lists/status that include trusted devices
      qc.invalidateQueries({ queryKey: LIST_QK });
      qc.invalidateQueries({ queryKey: ["auth", "mfa", "status"] });

      // Cross-tab hint (best-effort)
      try {
        localStorage.setItem("auth:trusted-device:updated", String(Date.now()));
        localStorage.removeItem("auth:trusted-device:updated");
      } catch {
        /* ignore */
      }
    },
  });
}
