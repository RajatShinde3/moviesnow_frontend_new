"use client";

/**
 * DevicesTable
 * =============================================================================
 * Accessible, production-grade table for **Trusted Devices** management.
 *
 * What it does
 * - Fetch devices via `useTrustedDevices()` and render them responsively.
 * - Register the **current device** (optional label).
 * - Revoke a single device, or **revoke all** devices.
 * - Highlights the current device and provides copy-ID helpers.
 * - Handles step-up reauth: if the server signals reauth is required, we show
 *   the dialog (via `useReauthPrompt`) and **retry once** automatically.
 *
 * UX & A11y
 * - Non-blocking toasts for success/error; assertive inline error banner on list load failure.
 * - Proper table semantics, caption, aria-live, aria-busy.
 * - Skeleton rows while loading; fine-grained disabled states while mutating.
 *
 * Extensibility
 * - Hide the toolbar and/or register form via props.
 * - Emits `onChanged` after successful mutations (register/revoke/revoke-all).
 * - Optional confirm overrides via props.
 */

import * as React from "react";
import { useMemo, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { useReauthPrompt } from "@/components/ReauthDialog";
import { isReauthRequired } from "@/lib/reauth";
import { useToast } from "@/components/feedback/Toasts";
import formatError from "@/lib/formatError";

import { useTrustedDevices } from "@/features/auth/useTrustedDevices";
import { useTrustedDeviceRegister } from "@/features/auth/useTrustedDeviceRegister";
import { useTrustedDeviceRevoke } from "@/features/auth/useTrustedDeviceRevoke";
import { useTrustedDevicesRevokeAll } from "@/features/auth/useTrustedDevicesRevokeAll";
import type { EnrichedHTTPError } from "@/lib/api";

export type DevicesTableProps = {
  /** Hide Refresh/Revoke-all/Registration toolbar. */
  hideToolbar?: boolean;
  /** Hide the “Trust this device” register form. */
  hideRegister?: boolean;
  /** Called after register/revoke/revoke-all succeed. */
  onChanged?: () => void;
  /** Extra class for the outer section wrapper. */
  className?: string;
  /** Optional confirm override (return true to proceed). */
  onConfirm?: (message: string) => boolean | Promise<boolean>;
};

type DeviceRow = {
  id?: string;
  device_id?: string;
  label?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  created_at?: string | number | null;
  last_used_at?: string | number | null;
  current?: boolean;
  is_current?: boolean;
};

function isHttpError(e: unknown): e is EnrichedHTTPError {
  return !!e && typeof e === "object" && "response" in e;
}

/** Internal convention thrown by <ReauthProvider/> on cancel. */
function isReauthCancelled(e: unknown): boolean {
  return e instanceof Error && e.message === "reauth-cancelled";
}

/** Format a date/time (returns '—' when unknown). */
function fmtDate(input?: string | number | null): string {
  if (!input && input !== 0) return "—";
  try {
    const d = typeof input === "number" ? new Date(input) : new Date(String(input));
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "—";
  }
}

/**
 * Normalize any backend shape into a `DeviceRow[]`.
 * Accepts:
 * - `DeviceRow[]`
 * - `{ devices: DeviceRow[] }`
 * - Slightly different field names (e.g., `device_label`, `is_current`, camelCase).
 */
function normalizeDevices(data: unknown): DeviceRow[] {
  const list: unknown =
    Array.isArray(data) ? data : (data && typeof data === "object" && (data as any).devices) || [];

  if (!Array.isArray(list)) return [];

  return (list as any[]).map((it) => {
    const id = it?.device_id ?? it?.id ?? it?.deviceId ?? it?.uid ?? undefined;
    const label = it?.label ?? it?.device_label ?? it?.deviceLabel ?? it?.name ?? null;
    const ip = it?.ip ?? it?.ip_address ?? it?.ipAddress ?? null;
    const ua = it?.user_agent ?? it?.userAgent ?? null;

    const created = it?.created_at ?? it?.createdAt ?? it?.created ?? null;
    const lastUsed = it?.last_used_at ?? it?.lastUsedAt ?? it?.lastUsed ?? null;

    const current = it?.current ?? it?.is_current ?? it?.isCurrent ?? false;

    return {
      id,
      device_id: it?.device_id ?? it?.id ?? it?.deviceId ?? undefined,
      label,
      ip,
      user_agent: ua,
      created_at: created,
      last_used_at: lastUsed,
      current: !!current,
      is_current: !!(it?.is_current ?? it?.isCurrent ?? current),
    } as DeviceRow;
  });
}

/** Safe clipboard copy with toast fallback. */
async function copyText(text: string, notify?: (msg: string) => void) {
  try {
    await navigator.clipboard.writeText(text);
    notify?.("Device ID copied");
  } catch {
    // minimal fallback
    window.prompt?.("Copy Device ID:", text);
  }
}

/**
 * withReauth
 * -----------------------------------------------------------------------------
 * Retry an action after reauth if the server signals “step-up required”.
 * - If user **cancels** reauth, we rethrow `reauth-cancelled` so callers can stop.
 * - Any other error is rethrown unchanged.
 */
async function withReauth<T>(
  attempt: () => Promise<T>,
  prompt: () => Promise<void> | void
): Promise<T> {
  try {
    return await attempt();
  } catch (e) {
    if (!isReauthRequired(e)) throw e;
    try {
      await Promise.resolve(prompt());
    } catch (err) {
      if (isReauthCancelled(err)) throw err; // user cancelled
      throw err;
    }
    // Retry once after successful reauth
    return await attempt();
  }
}

const REG_LABEL_MAX = 120;

export default function DevicesTable({
  hideToolbar = false,
  hideRegister = false,
  onChanged,
  className,
  onConfirm,
}: DevicesTableProps) {
  const qc = useQueryClient();
  const promptReauth = useReauthPrompt();
  const toast = useToast();

  // Queries & mutations
  const list = useTrustedDevices();
  const register = useTrustedDeviceRegister();
  const revoke = useTrustedDeviceRevoke();
  const revokeAll = useTrustedDevicesRevokeAll();

  const devices: DeviceRow[] = useMemo(() => normalizeDevices(list.data), [list.data]);

  const currentCount = useMemo(
    () => devices.filter((d) => d.current || d.is_current).length,
    [devices]
  );

  // Registration label
  const [label, setLabel] = useState("");
  // Fine-grained row state for revoke button text/disable
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const confirmAsync = useCallback(
    async (message: string) => {
      if (onConfirm) return !!(await onConfirm(message));
      return window.confirm(message);
    },
    [onConfirm]
  );

  const afterChange = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ["auth", "mfa", "trusted-devices"] });
    onChanged?.();
  }, [onChanged, qc]);

  const onRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const name = label.trim();
      try {
        await withReauth(
          // API expects `device_label`, not `label`
          () => register.mutateAsync(name ? { device_label: name } : undefined),
          () =>
            promptReauth({
              reason: "To trust this device, please confirm it’s you.",
            })
        );
        setLabel("");
        await afterChange();
        toast.success({ title: "Device trusted", description: "This device has been added." });
      } catch (err) {
        if (isReauthCancelled(err)) return; // user cancelled
        toast.error({ title: "Could not register device", description: formatError(err) });
      }
    },
    [afterChange, label, promptReauth, register, toast]
  );

  const onRevoke = useCallback(
    async (id: string) => {
      if (!id) return;
      const ok = await confirmAsync(
        "Revoke this trusted device? The device may require MFA the next time it signs in."
      );
      if (!ok) return;

      setRevokingId(id);
      try {
        await withReauth(
          () => revoke.mutateAsync({ device_id: id }),
          () =>
            promptReauth({
              reason: "To revoke a trusted device, please confirm it’s you.",
            })
        );
        await afterChange();
        toast.success({ title: "Device revoked" });
      } catch (err) {
        if (isReauthCancelled(err)) return;
        toast.error({ title: "Could not revoke device", description: formatError(err) });
      } finally {
        setRevokingId((x) => (x === id ? null : x));
      }
    },
    [afterChange, confirmAsync, promptReauth, revoke, toast]
  );

  const onRevokeAll = useCallback(
    async () => {
      if (devices.length === 0) return;
      const ok = await confirmAsync(
        "Revoke ALL trusted devices? You may be prompted for MFA next sign-in."
      );
      if (!ok) return;

      try {
        await withReauth(
          () => revokeAll.mutateAsync(),
          () =>
            promptReauth({
              reason: "To revoke all trusted devices, please confirm it’s you.",
            })
        );
        await afterChange();
        toast.success({ title: "All trusted devices revoked" });
      } catch (err) {
        if (isReauthCancelled(err)) return;
        toast.error({ title: "Could not revoke devices", description: formatError(err) });
      }
    },
    [afterChange, confirmAsync, devices.length, promptReauth, revokeAll, toast]
  );

  const loadingSkeletonRows = Array.from({ length: 3 }).map((_, i) => (
    <tr key={`sk-${i}`} className="border-b last:border-0">
      <td className="px-3 py-3">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-1 h-3 w-64 animate-pulse rounded bg-gray-100" />
      </td>
      <td className="px-3 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-3 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-3 py-3"><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-3 py-3"><div className="h-4 w-48 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-3 py-3" />
    </tr>
  ));

  return (
    <section className={cn("rounded border", className)} aria-busy={list.isFetching || undefined}>
      {!hideToolbar && (
        <div className="flex flex-wrap items-end justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">Trusted devices</h2>
            <p className="text-xs text-muted-foreground">
              Devices marked as trusted can sign in with fewer prompts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => list.refetch()}
              disabled={list.isFetching}
              className={cn(
                "rounded border px-3 py-1.5 text-sm",
                list.isFetching ? "cursor-not-allowed opacity-60" : "hover:bg-gray-50"
              )}
              aria-label="Refresh devices list"
            >
              {list.isFetching ? "Refreshing…" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={onRevokeAll}
              disabled={revokeAll.isPending || devices.length === 0}
              className={cn(
                "rounded px-3 py-1.5 text-sm text-white",
                revokeAll.isPending || devices.length === 0
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-red-600 hover:opacity-90"
              )}
              aria-label="Revoke all trusted devices"
            >
              {revokeAll.isPending ? "Revoking…" : "Revoke all"}
            </button>
          </div>
        </div>
      )}

      {/* Optional register form */}
      {!hideRegister && (
        <form onSubmit={onRegister} className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row">
          <label htmlFor="dev-label" className="sr-only">
            Device label (optional)
          </label>
          <input
            id="dev-label"
            type="text"
            placeholder="Add a label for this device (optional)"
            className={cn("w-full rounded border px-3 py-2 outline-none", "focus:ring-2 focus:ring-black/10")}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={REG_LABEL_MAX}
            aria-describedby="dev-label-help"
          />
          <div id="dev-label-help" className="sr-only">
            Optional label to help you recognize this device later.
          </div>
          <button
            type="submit"
            disabled={register.isPending}
            className={cn(
              "rounded px-3 py-2 text-white sm:w-56",
              register.isPending ? "cursor-not-allowed bg-gray-400" : "bg-black hover:opacity-90"
            )}
            aria-label="Trust this device"
          >
            {register.isPending ? "Registering…" : "Trust this device"}
          </button>
        </form>
      )}

      {/* Stats */}
      <div className="px-4 pt-3 text-xs text-muted-foreground" aria-live="polite">
        {devices.length} device{devices.length === 1 ? "" : "s"} total · {currentCount} current
      </div>

      {/* Table */}
      <div className="mt-2 overflow-x-auto px-2 pb-3">
        <table className="min-w-full border-collapse text-sm">
          <caption className="sr-only">List of trusted devices</caption>
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-3 py-2 font-medium">Device</th>
              <th className="px-3 py-2 font-medium">Last used</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">IP</th>
              <th className="px-3 py-2 font-medium">Agent</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {list.isLoading && loadingSkeletonRows}

            {!list.isLoading && devices.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={6}>
                  No trusted devices yet. Trust this device to get started.
                </td>
              </tr>
            )}

            {devices.map((d, i) => {
              const id = d.device_id || d.id || "";
              const isCurrent = !!(d.current || d.is_current);
              const name = (d.label ?? "").toString().trim() || "Unnamed device";
              const rowKey = id || `row-${i}`;

              const isThisRowRevoking = revokingId === id && revoke.isPending;

              return (
                <tr key={rowKey} className="border-b last:border-0">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{name}</span>
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          current
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      ID: <code className="font-mono">{id || "unknown"}</code>{" "}
                      {id && (
                        <button
                          type="button"
                          className="ml-2 text-[11px] underline"
                          onClick={() => copyText(String(id), (msg) => toast.info({ title: msg }))}
                          aria-label={`Copy Device ID for ${name}`}
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-3">{fmtDate(d.last_used_at)}</td>
                  <td className="px-3 py-3">{fmtDate(d.created_at)}</td>
                  <td className="px-3 py-3">{d.ip || "—"}</td>
                  <td className="px-3 py-3">
                    <div className="line-clamp-2 max-w-[24rem] break-all text-xs">
                      {d.user_agent || "—"}
                    </div>
                  </td>

                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => id && onRevoke(String(id))}
                      disabled={revoke.isPending || !id}
                      className={cn(
                        "rounded px-3 py-1.5 text-xs text-white",
                        revoke.isPending || !id
                          ? "cursor-not-allowed bg-gray-400"
                          : "bg-red-600 hover:opacity-90"
                      )}
                      aria-label={`Revoke device ${name}`}
                    >
                      {isThisRowRevoking ? "Revoking…" : "Revoke"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Error banner */}
        {list.isError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formatError(list.error)}
          </div>
        )}
      </div>
    </section>
  );
}
