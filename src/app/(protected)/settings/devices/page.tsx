"use client";

/**
 * =============================================================================
 * Page · Settings · Security · Trusted Devices (Best-of-best)
 * =============================================================================
 * Manage devices that are "remembered" for MFA (trusted devices).
 *
 * What this page delivers
 * -----------------------
 * • Lists trusted devices with clear labels (platform, browser, last seen, IP).
 * • "Trust this device" CTA if the current device isn’t already trusted.
 * • Revoke a single device (step-up aware) or revoke all (step-up required).
 * • Best-in-class UX & a11y: neutral errors, assertive live region, guarded
 *   destructive actions, keyboard-first flows, table semantics improved.
 *
 * Security & resilience
 * ---------------------
 * • Uses your hooks:
 *      - `useTrustedDevices()`                → list devices
 *      - `useTrustedDeviceRegister()`         → trust current device
 *      - `useTrustedDeviceRevoke()`           → revoke one
 *      - `useTrustedDevicesRevokeAll()`       → revoke all
 * • Step-up (reauth) ready: if the API signals `need_step_up`, we open the
 *   `ReauthDialog`, collect a short-lived token, then retry with `xReauth`.
 * • Neutral, user-friendly errors via `formatError()`; subtle request-id.
 * • Client no-store hints; server should also send no-store.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import EmptyState from "@/components/feedback/EmptyState";
import { useReauthPrompt } from "@/components/ReauthDialog";

// Hooks you provided
import { useTrustedDevices } from "@/features/auth/useTrustedDevices";
import { useTrustedDeviceRegister } from "@/features/auth/useTrustedDeviceRegister";
import { useTrustedDeviceRevoke } from "@/features/auth/useTrustedDeviceRevoke";
import { useTrustedDevicesRevokeAll } from "@/features/auth/useTrustedDevicesRevokeAll";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// Types & helpers (tolerant to backend field names)
// -----------------------------------------------------------------------------
type TrustedDevice = {
  id: string;
  label?: string | null;
  current?: boolean;            // is this the device the user is on?
  created_at?: string | null;   // ISO
  last_seen_at?: string | null; // ISO
  ip?: string | null;
  user_agent?: string | null;
  platform?: string | null;     // macOS, iOS, Android, Windows, etc.
  browser?: string | null;      // Safari, Chrome, etc.
};

function isStepUpRequired(err: unknown): boolean {
  const e = err as any;
  return (
    (e && e.code === "need_step_up") ||
    (e &&
      e.headers &&
      (e.headers["x-reauth"] === "required" || e.headers["X-Reauth"] === "required"))
  );
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso!;
  }
}

function compactUA(platform?: string | null, browser?: string | null) {
  const a = platform?.trim();
  const b = browser?.trim();
  if (a && b) return `${a} · ${b}`;
  return a || b || "—";
}

function pickList(res: any): TrustedDevice[] {
  if (Array.isArray(res)) return res as TrustedDevice[];
  if (Array.isArray(res?.devices)) return res.devices as TrustedDevice[];
  if (Array.isArray(res?.data)) return res.data as TrustedDevice[];
  if (Array.isArray(res?.items)) return res.items as TrustedDevice[];
  return [];
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function TrustedDevicesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Trusted devices</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          These devices won’t be asked for an MFA code as often. Revoke any you don’t recognize.
        </p>
      </header>
      <DevicesPanel />
      <footer className="mt-8 text-sm text-muted-foreground">
        <Link
          href={PATHS.settingsSecurity || "/settings/security"}
          className="font-medium underline underline-offset-4 hover:text-foreground"
          prefetch
        >
          Back to Security
        </Link>
      </footer>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Panel · list, register current, revoke single/all (step-up aware)
// -----------------------------------------------------------------------------
function DevicesPanel() {
  const router = useRouter();
  const toast = useToast();
  const promptReauth = useReauthPrompt();

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const { data: devicesData, error: listError, isFetching: isListing, refetch: refetchDevices } = useTrustedDevices();
  const fetchDevices = React.useCallback(async (..._args: any[]) => {
    const { data } = await refetchDevices();
    return (data ?? devicesData) as any;
  }, [refetchDevices, devicesData]);
  const { mutateAsync: registerDevice, isPending: isRegistering } = useTrustedDeviceRegister();
  const { mutateAsync: revokeDevice, isPending: isRevokingOne } = useTrustedDeviceRevoke();
  const { mutateAsync: revokeAll, isPending: isRevokingAll } = useTrustedDevicesRevokeAll();

  const [devices, setDevices] = React.useState<TrustedDevice[] | null>(null);
  const [needsReauthToView, setNeedsReauthToView] = React.useState(false);

  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // initial load
  React.useEffect(() => {
    (async () => {
      setErrorMsg(null);
      try {
        const res = await fetchDevices({} as any);
        setDevices(pickList(res));
        setNeedsReauthToView(false);
      } catch (err) {
        if (isStepUpRequired(err)) {
          setNeedsReauthToView(true);
          setDevices(null);
          return;
        }
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t load your trusted devices right now.",
        });
        setErrorMsg(friendly);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentTrusted = (devices ?? []).some((d) => d.current);

  async function refreshWithOptionalToken(xReauth?: string) {
    const res = await fetchDevices({ xReauth } as any);
    setDevices(pickList(res));
    router.refresh();
  }

  async function handleReauthView() {
    setErrorMsg(null);
    try {
      await promptReauth({
        reason: "Confirm it’s you to view trusted devices",
      } as any);
      await refreshWithOptionalToken();
      setNeedsReauthToView(false);
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "We couldn’t confirm it was you just now.",
      });
      setErrorMsg(friendly);
    }
  }

  /**
   * Register (remember) the current device.
   * Some backends require step-up here → we handle it transparently.
   */
  async function handleRegister() {
    setErrorMsg(null);
    try {
      await registerDevice({} as any);
      toast.success({
        title: "Device remembered",
        description: "We’ll ask for MFA less often on this device.",
        duration: 2200,
      });
      await refreshWithOptionalToken();
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t remember this device right now. Please try again.",
        });
        setErrorMsg(friendly);
        return;
      }
      // Step-up path
      try {
        await promptReauth({
          reason: "Confirm it’s you to trust this device",
        } as any);
        await registerDevice({} as any);
        toast.success({
          title: "Device remembered",
          description: "We’ll ask for MFA less often on this device.",
          duration: 2200,
        });
        await refreshWithOptionalToken();
      } catch (err2) {
        const friendly = formatError(err2, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t confirm it was you just now. Please try again.",
        });
        setErrorMsg(friendly);
      }
    }
  }

  async function handleRevokeOne(id: string, isCurrent: boolean) {
    setErrorMsg(null);
    if (isCurrent) {
      const ok = window.confirm(
        "Revoke trust for this device?\n\nYou may be asked for MFA next time you sign in here."
      );
      if (!ok) return;
    }
    try {
      await revokeDevice({ id } as any);
      toast.success({
        title: "Trust revoked",
        description: "This device will no longer be remembered.",
        duration: 1800,
      });
      await refreshWithOptionalToken();
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t revoke this device right now. Please try again.",
        });
        setErrorMsg(friendly);
        return;
      }
      // step-up
      try {
        await promptReauth({
          reason: "Confirm it’s you to revoke a trusted device",
        } as any);
        await revokeDevice({ id } as any);
        toast.success({
          title: "Trust revoked",
          description: "This device will no longer be remembered.",
          duration: 1800,
        });
        await refreshWithOptionalToken();
      } catch (err2) {
        const friendly = formatError(err2, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback:
            "We couldn’t confirm it was you just now. Please try again or use a different method.",
        });
        setErrorMsg(friendly);
      }
    }
  }

  async function handleRevokeAll() {
    setErrorMsg(null);
    const ok = window.confirm(
      "Revoke trust for ALL devices?\n\nYou will be asked for MFA on every sign-in until a device is remembered again."
    );
    if (!ok) return;
    try {
      // Most servers require step-up for revoke-all; prompt proactively
      await promptReauth({
        reason: "Confirm it’s you to revoke all trusted devices",
      } as any);
      await revokeAll({} as any);
      toast.success({
        title: "All devices revoked",
        description: "No devices are remembered now.",
        duration: 2200,
      });
      await refreshWithOptionalToken();
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "We couldn’t revoke all devices right now. Please try again.",
      });
      setErrorMsg(friendly);
    }
  }

  const isBusy = isListing || isRegistering || isRevokingOne || isRevokingAll;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <section className="space-y-6" aria-busy={isBusy || undefined}>
      {/* Inline error (assertive live region; focuses on update) */}
      <div
        ref={errorRef}
        tabIndex={errorMsg ? -1 : undefined}
        aria-live="assertive"
        className={cn(
          "rounded-lg border px-4 py-3 text-sm shadow-sm",
          errorMsg ? "border-destructive/30 bg-destructive/10 text-destructive" : "hidden"
        )}
      >
        {errorMsg}
      </div>

      {/* Reauth gate for viewing (when list requires step-up) */}
      {needsReauthToView && (
        <div className="rounded-xl border bg-accent/30 p-5 text-sm shadow-sm">
          <div className="font-medium">Confirm it’s you</div>
          <p className="mt-1 text-muted-foreground">
            For your security, please confirm your identity to view trusted devices.
          </p>
          <div className="mt-3">
            <button
              onClick={handleReauthView}
              disabled={isListing}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition",
                isListing && "cursor-not-allowed opacity-75"
              )}
            >
              {isListing ? "Opening…" : "Confirm & view devices"}
            </button>
          </div>
        </div>
      )}

      {/* Loading skeletons for first view */}
      {devices === null && !needsReauthToView && (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-xl border bg-muted/40" />
          <div className="h-40 animate-pulse rounded-xl border bg-muted/40" />
          <div className="h-24 animate-pulse rounded-xl border bg-muted/40" />
        </div>
      )}

      {/* Empty state (no trusted devices yet) */}
      {!needsReauthToView && devices && devices.length === 0 && (
        <EmptyState
          title="No trusted devices yet"
          description="Remember this device to reduce MFA prompts when you sign in here."
          actionLabel={isRegistering ? "Remembering…" : "Remember this device"}
          onAction={isRegistering ? undefined : handleRegister}
        />
      )}

      {/* List + actions */}
      {!needsReauthToView && devices && devices.length > 0 && (
        <>
          {!currentTrusted && (
            <div className="rounded-xl border bg-card/50 p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium">This device isn’t remembered</div>
                  <p className="text-xs text-muted-foreground">
                    Remember this device to reduce MFA prompts when signing in here.
                  </p>
                </div>
                <button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className={cn(
                    "inline-flex items-center justify-center rounded-lg border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition",
                    isRegistering && "cursor-not-allowed opacity-75"
                  )}
                >
                  {isRegistering ? "Remembering…" : "Remember this device"}
                </button>
              </div>
            </div>
          )}

          {/* Devices table */}
          <div className="overflow-hidden rounded-xl border shadow-sm">
            <table className="min-w-full border-collapse text-sm">
              <caption className="sr-only">Trusted devices for your account</caption>
              <thead className="bg-muted/60">
                <tr className="text-left">
                  <th scope="col" className="px-3 py-2 font-medium">Device</th>
                  <th scope="col" className="px-3 py-2 font-medium">Last seen</th>
                  <th scope="col" className="px-3 py-2 font-medium">IP</th>
                  <th scope="col" className="px-3 py-2 font-medium">Added</th>
                  <th scope="col" className="px-3 py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => {
                  const ua = compactUA(d.platform, d.browser);
                  return (
                    <tr
                      key={d.id}
                      className="border-t transition hover:bg-accent/40"
                      aria-current={d.current || undefined}
                    >
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium">
                          {d.label?.trim() || ua || "Device"}
                          {d.current ? (
                            <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              Current
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">{ua}</div>
                      </td>
                      <td className="px-3 py-2 align-top">{fmtDate(d.last_seen_at)}</td>
                      <td className="px-3 py-2 align-top">{d.ip || "—"}</td>
                      <td className="px-3 py-2 align-top">{fmtDate(d.created_at)}</td>
                      <td className="px-3 py-2 align-top text-right">
                        <button
                          onClick={() => handleRevokeOne(d.id, !!d.current)}
                          disabled={isRevokingOne}
                          className={cn(
                            "inline-flex items-center justify-center rounded-md border bg-background px-3 py-1.5 font-medium shadow-sm transition hover:bg-accent",
                            isRevokingOne && "cursor-not-allowed opacity-75"
                          )}
                          aria-label={`Revoke trust for ${d.label || ua || "device"}`}
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Danger zone: revoke all */}
          <div className="rounded-xl border bg-destructive/5 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-destructive">Revoke all trusted devices</div>
                <p className="text-xs text-muted-foreground">
                  This will forget every remembered device. You’ll be asked for MFA on next sign-ins.
                </p>
              </div>
              <button
                onClick={handleRevokeAll}
                disabled={isRevokingAll}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:bg-destructive/90",
                  isRevokingAll && "cursor-not-allowed opacity-75"
                )}
              >
                {isRevokingAll ? "Revoking…" : "Revoke all"}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
