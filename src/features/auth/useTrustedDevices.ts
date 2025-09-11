// features/auth/useTrustedDevices.ts
"use client";

/**
 * =============================================================================
 * Auth › Trusted Devices (tolerant, normalized, production-ready)
 * =============================================================================
 * Lists the current user's trusted devices with forward-compatible parsing.
 *
 * Backend alignment
 * - GET `${PATHS.tdList}` → e.g. `/api/v1/auth/trusted-devices`
 * - Bearer token is injected by the client automatically.
 *
 * Guarantees
 * - 200 JSON or 204/empty tolerated.
 * - Accepts multiple payload envelopes and normalizes to `{ devices: TrustedDevice[] }`.
 * - Aliases normalized (id/deviceId → device_id, label/name → device_label, etc.)
 * - Date-like values coerced to ISO (supports seconds + ms epochs, numeric-like strings).
 * - Stable query key: ["auth","mfa","trusted-devices"].
 */

import { useQuery, type QueryClient } from "@tanstack/react-query";
import { fetchJson, type AppError } from "@/lib/api/client";
import { PATHS } from "@/lib/env";
import { z } from "zod";

/* -------------------------------- Core schema ------------------------------ */
/** Public, normalized device shape (ISO datetime strings). */
export const TrustedDeviceSchema = z
  .object({
    device_id: z.string().min(1),
    device_label: z.string().optional(),
    created_at: z.string().datetime().optional(),
    last_used_at: z.string().datetime().optional(),
    user_agent: z.string().optional(),
    ip: z.string().optional(),
    current: z.boolean().optional(),
  })
  .passthrough();

export const TrustedDevicesListSchema = z.object({
  devices: z.array(TrustedDeviceSchema).default([]),
});

export type TrustedDevice = z.infer<typeof TrustedDeviceSchema>;
export type TrustedDevicesList = z.infer<typeof TrustedDevicesListSchema>;

/* ------------------------------ Normalization ------------------------------ */

function toIso(input: unknown): string | undefined {
  if (input == null) return undefined;

  // Number path: interpret 10-digit values as seconds, 13+ as ms.
  if (typeof input === "number") {
    const ms =
      input > 1e12 ? input : input >= 1e9 && input < 1e10 ? input * 1000 : input;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  // Numeric-like string path (e.g., "1700000000" or "1700000000000")
  if (typeof input === "string" && /^\d+$/.test(input.trim())) {
    const n = Number(input.trim());
    if (Number.isFinite(n)) return toIso(n);
  }

  // Date instance
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? undefined : input.toISOString();
  }

  // Anything else—let Date parse best-effort
  if (typeof input === "string") {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  return undefined;
}

/** Coerce common bool variants ({true|false}, "true"/"false", 1/0) */
function toBool(v: unknown): boolean | undefined {
  if (v == null) return undefined;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes") return true;
    if (s === "false" || s === "0" || s === "no") return false;
  }
  return undefined;
}

/** Map any backend row → canonical device shape (extras passthrough). */
function coerceDevice(row: any): TrustedDevice {
  const device_id =
    row?.device_id ?? row?.id ?? row?.deviceId ?? row?.uid ?? "";

  const device_label =
    row?.device_label ?? row?.label ?? row?.deviceLabel ?? row?.name ?? undefined;

  const ip = row?.ip ?? row?.ip_address ?? row?.ipAddress ?? undefined;

  const user_agent =
    row?.user_agent ?? row?.userAgent ?? row?.agent ?? row?.ua ?? undefined;

  const created_at = toIso(
    row?.created_at ?? row?.createdAt ?? row?.created ?? row?.issued_at ?? row?.issuedAt
  );

  const last_used_at = toIso(
    row?.last_used_at ??
      row?.lastUsedAt ??
      row?.last_used ??
      row?.lastSeenAt ??
      row?.last_seen_at
  );

  const current = toBool(row?.current ?? row?.is_current ?? row?.isCurrent);

  // Validate & keep extras via passthrough
  return TrustedDeviceSchema.parse({
    ...row,
    device_id,
    device_label,
    ip,
    user_agent,
    created_at,
    last_used_at,
    current,
  });
}

/** Accept diverse envelopes and normalize to `{ devices: [...] }`. */
const AnyDevicesEnvelope = z.union([
  z.array(z.unknown()),
  z.object({ devices: z.array(z.unknown()) }).passthrough(),
  z.object({ items: z.array(z.unknown()), total: z.number().optional() }).passthrough(),
  z.object({ data: z.array(z.unknown()), total: z.number().optional() }).passthrough(),
  z.object({ result: z.array(z.unknown()), total: z.number().optional() }).passthrough(), // extra tolerance
]);

function normalizePayload(payload: unknown): TrustedDevicesList {
  if (payload == null) return { devices: [] };

  const parsed = AnyDevicesEnvelope.safeParse(payload);
  const arr = parsed.success
    ? Array.isArray(parsed.data)
      ? parsed.data
      : "devices" in parsed.data
        ? (parsed.data as any).devices
        : "items" in parsed.data
          ? (parsed.data as any).items
          : "data" in parsed.data
            ? (parsed.data as any).data
            : (parsed.data as any).result
    : Array.isArray(payload)
      ? payload
      : (payload as any)?.devices ??
        (payload as any)?.items ??
        (payload as any)?.data ??
        (payload as any)?.result ??
        [];

  const devices = (Array.isArray(arr) ? arr : []).map(coerceDevice);

  // Nicer default order: most recently used first
  devices.sort((a, b) => (b.last_used_at ?? "").localeCompare(a.last_used_at ?? ""));

  return { devices };
}

/* ---------------------------------- Hook ----------------------------------- */

export const TRUSTED_DEVICES_QK = ["auth", "mfa", "trusted-devices"] as const;

export function useTrustedDevices(options?: { enabled?: boolean }) {
  return useQuery<TrustedDevicesList, AppError>({
    queryKey: TRUSTED_DEVICES_QK,
    queryFn: async () => {
      // `fetchJson` returns `undefined` for 204/empty; normalize handles it.
      const body = await fetchJson<unknown | undefined>(PATHS.tdList, { method: "GET" });
      return normalizePayload(body);
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,     // quieter UX
    refetchOnReconnect: "always",
    enabled: options?.enabled ?? true,
    placeholderData: { devices: [] },
  });
}

/* ----------------------------- Cache helpers ------------------------------- */

/** Warm the cache (e.g., right after login or in a layout). */
export async function prefetchTrustedDevices(qc: QueryClient) {
  await qc.prefetchQuery({
    queryKey: TRUSTED_DEVICES_QK,
    queryFn: async () =>
      normalizePayload(await fetchJson<unknown | undefined>(PATHS.tdList, { method: "GET" })),
    staleTime: 60_000,
  });
}

/** Invalidate the trusted-devices list (e.g., after register/revoke). */
export async function invalidateTrustedDevices(qc: QueryClient) {
  await qc.invalidateQueries({ queryKey: TRUSTED_DEVICES_QK });
}
