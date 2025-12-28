"use client";

/**
 * =============================================================================
 * Page · Settings · Security (Overview · Best-of-best)
 * =============================================================================
 * Production-grade security overview that summarizes the account’s protection
 * posture and links into detailed pages (MFA, Recovery Codes, Devices, Sessions,
 * Password, Alerts, Activity).
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Reads status using your hooks in parallel (Promise.allSettled):
 *    - MFA status (inferred from recovery codes availability/shape)
 *    - Recovery codes (remaining)
 *    - Trusted devices (count)
 *    - Sessions (count)
 *    - Alerts subscription (enabled/disabled)
 *    - Password last changed (newest "password" event)
 * • Step-up aware: on `need_step_up` opens <ReauthDialog/> and retries
 *   all reads with `xReauth` — no lost state.
 * • Neutral, support-friendly errors via `formatError()`; assertive a11y region.
 *
 * UX & A11y
 * ---------
 * • Clear cards with status chips, icons, and primary actions.
 * • Skeleton chips on first load; keyboard-first; focus handoff on errors.
 * • Alerts toggle is optimistic with rollback on failure.
 * • Optional “Refresh status” button.
 *
 * Integration Notes
 * -----------------
 * 1) Ensure <ToastsRoot/> and <ReauthDialogProvider/> are mounted at app level.
 * 2) Server should also send `Cache-Control: no-store` for this route.
 * 3) If any hook returns an unexpected shape, we normalize defensively to avoid
 *    breaking the UI (counts default to 0, booleans to false/unknown).
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  FileCode2,
  KeyRound,
  ListTree,
  LogIn,
  RefreshCw,
  Shield,
  ShieldAlert,
  Smartphone,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import { useReauthPrompt } from "@/components/ReauthDialog";
import EmptyState from "@/components/feedback/EmptyState";

// Hooks (read)
import { useTrustedDevices } from "@/features/auth/useTrustedDevices";
import { useAuthSessions } from "@/features/auth/useAuthSessions";
import { useRecoveryCodesList } from "@/features/auth/useRecoveryCodesList";
import { useAlertSubscription } from "@/features/auth/useAlertSubscription";
import { useAuthActivity } from "@/features/auth/useAuthActivity";

// Hooks (write)
import { useUpdateAlertSubscription } from "@/features/auth/useUpdateAlertSubscription";

// Cache is handled at the segment layout level for all protected routes.

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function isStepUpRequired(err: unknown): boolean {
  const e = err as any;
  return (
    (e && e.code === "need_step_up") ||
    (e &&
      e.headers &&
      (e.headers["x-reauth"] === "required" || e.headers["X-Reauth"] === "required"))
  );
}

const dt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const fmt = (iso?: string | null) => (iso ? dt.format(new Date(iso)) : "—");

// Defensive extractors for variable API shapes
function toArray(x: any): any[] {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.items)) return x.items;
  if (Array.isArray(x?.data)) return x.data;
  if (Array.isArray(x?.results)) return x.results;
  return [];
}
function toCount(x: any): number {
  if (typeof x === "number") return x;
  if (typeof x?.count === "number") return x.count;
  if (typeof x?.total === "number") return x.total;
  const arr = toArray(x);
  return arr.length;
}
function coerceBoolean(v: any): boolean {
  return v === true || v === "true" || v === 1 || v === "1";
}

type SecuritySummary = {
  mfaEnabled: boolean | "unknown";
  recoveryRemaining?: number;
  devicesCount: number;
  sessionsCount: number;
  alertsEnabled: boolean | "unknown";
  passwordLastChanged?: string | null; // ISO
};

export default function SecurityOverviewPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your account's protection and manage key controls.
          </p>
        </div>
        <RefreshButton />
      </header>

      <SecurityOverviewPanel />

      <footer className="mt-10 text-sm text-muted-foreground">
        <Link
          href={PATHS.settingsActivity || "/settings/activity"}
          prefetch
          className="inline-flex items-center gap-2 font-medium underline underline-offset-4 hover:text-foreground"
        >
          <ListTree className="h-4 w-4" />
          View full account activity
        </Link>
      </footer>
    </main>
  );
}

// Small “Refresh status” button (triggers a window-level event that panel listens for)
function RefreshButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("security:refresh"))}
      className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Refresh status
    </button>
  );
}

// -----------------------------------------------------------------------------
// Panel · fetch → normalize → render
// -----------------------------------------------------------------------------
function SecurityOverviewPanel() {
  const router = useRouter();
  const toast = useToast();
  const promptReauth = useReauthPrompt();

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);
  const alive = React.useRef(true);

  React.useEffect(() => {
    return () => {
      alive.current = false;
    };
  }, []);

  // Local status state
  const [data, setData] = React.useState<SecuritySummary>({
    mfaEnabled: "unknown",
    recoveryRemaining: undefined,
    devicesCount: 0,
    sessionsCount: 0,
    alertsEnabled: "unknown",
    passwordLastChanged: undefined,
  });
  const [loading, setLoading] = React.useState(true);
  const [updatingAlerts, setUpdatingAlerts] = React.useState(false);

  // Treat read hooks as "fetchers" to keep a consistent pattern with earlier pages
  const { data: devicesData, refetch: refetchDevices } = useTrustedDevices();
  const { data: sessionsData, refetch: refetchSessions } = useAuthSessions();
  const { data: recoveryData, refetch: refetchRecoveryCodes } = useRecoveryCodesList();
  const { data: alertsData, refetch: refetchAlerts } = useAlertSubscription();
  const { data: activityData, refetch: refetchActivity } = useAuthActivity();
  // Back-compat tiny shims to reuse existing logic below
  const fetchDevices = React.useCallback(async (..._args: any[]) => (await refetchDevices()).data ?? devicesData, [refetchDevices, devicesData]);
  const fetchSessions = React.useCallback(async (..._args: any[]) => (await refetchSessions()).data ?? sessionsData, [refetchSessions, sessionsData]);
  const fetchRecoveryCodes = React.useCallback(async (..._args: any[]) => (await refetchRecoveryCodes()).data ?? recoveryData, [refetchRecoveryCodes, recoveryData]);
  const fetchAlerts = React.useCallback(async (..._args: any[]) => (await refetchAlerts()).data ?? alertsData, [refetchAlerts, alertsData]);
  const fetchActivity = React.useCallback(async (..._args: any[]) => (await refetchActivity()).data ?? activityData, [refetchActivity, activityData]);
  const { mutateAsync: updateAlerts } = useUpdateAlertSubscription();

  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  React.useEffect(() => {
    void loadAll();
    const onRefresh = () => void loadAll();
    window.addEventListener("security:refresh", onRefresh);
    return () => window.removeEventListener("security:refresh", onRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll(nextToken?: string) {
    setErrorMsg(null);
    setLoading(true);

    try {
      const args = (nextToken ? { xReauth: nextToken } : {}) as any;

      const [devicesRes, sessionsRes, codesRes, alertsRes, activityRes] =
        await Promise.allSettled([
          fetchDevices(args),
          fetchSessions({ ...args, limit: 50 }),
          fetchRecoveryCodes(args),
          fetchAlerts(args),
          fetchActivity({ ...args, limit: 25, q: "password" }),
        ]);

      // Devices
      const devicesCount =
        devicesRes.status === "fulfilled" ? toCount(devicesRes.value) : 0;

      // Sessions
      const sessionsCount =
        sessionsRes.status === "fulfilled" ? toCount(sessionsRes.value) : 0;

      // Recovery codes (proxy for MFA enabled)
      let mfaEnabled: SecuritySummary["mfaEnabled"] = "unknown";
      let recoveryRemaining: number | undefined = undefined;
      if (codesRes.status === "fulfilled") {
        const val: any = codesRes.value;
        const list = toArray(val);
        const explicitRemaining =
          typeof val?.codes_remaining === "number"
            ? val.codes_remaining
            : typeof val?.remaining === "number"
            ? val.remaining
            : undefined;

        if (typeof explicitRemaining === "number") {
          recoveryRemaining = explicitRemaining;
          mfaEnabled = true;
        } else if (Array.isArray(list)) {
          recoveryRemaining = list.length;
          // Many backends expose recovery codes only when MFA is enabled
          mfaEnabled = true;
        } else if (val?.mfa_enabled !== undefined) {
          mfaEnabled = coerceBoolean(val.mfa_enabled);
        }
      } else {
        // Best-effort inference: 404/403 may imply no MFA
        const err: any = (codesRes as any).reason;
        if (err?.status === 404 || err?.status === 403) mfaEnabled = false;
      }

      // Alerts subscription
      let alertsEnabled: SecuritySummary["alertsEnabled"] = "unknown";
      if (alertsRes.status === "fulfilled") {
        const raw = alertsRes.value as any;
        // tolerate {enabled}, {subscribed}, {on}, or {channels:{email}}
        alertsEnabled = coerceBoolean(
          raw?.enabled ??
            raw?.subscribed ??
            raw?.on ??
            raw?.channels?.email ??
            raw?.email
        );
      }

      // Password last changed (from activity)
      let passwordLastChanged: string | null | undefined = undefined;
      if (activityRes.status === "fulfilled") {
        const rows = toArray(activityRes.value);
        const recentPasswordEvent = rows
          .filter((r) => {
            const t = (r?.type || r?.event || r?.action || "").toString().toLowerCase();
            return t.includes("password");
          })
          .sort((a, b) => {
            const at = new Date(a?.timestamp || a?.created_at || a?.at || 0).getTime();
            const bt = new Date(b?.timestamp || b?.created_at || b?.at || 0).getTime();
            return bt - at;
          })[0];
        passwordLastChanged =
          recentPasswordEvent
            ? (recentPasswordEvent.timestamp ||
               recentPasswordEvent.created_at ||
               recentPasswordEvent.at ||
               null)
            : null;
      }

      if (!alive.current) return;

      setData({
        mfaEnabled,
        recoveryRemaining,
        devicesCount,
        sessionsCount,
        alertsEnabled,
        passwordLastChanged,
      });

      setLoading(false);
      router.refresh(); // keep header/user data in sync if anything changed
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t load your security summary right now.",
        });
        if (!alive.current) return;
        setErrorMsg(friendly);
        setLoading(false);
        return;
      }
      // Step-up: prompt and retry once
      try {
        await promptReauth({ reason: "Confirm it’s you to view security settings" } as any);
        await loadAll();
      } catch (err2) {
        const friendly = formatError(err2, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t confirm it was you just now.",
        });
        if (!alive.current) return;
        setErrorMsg(friendly);
        setLoading(false);
      }
    }
  }

  // Toggle alerts with optimistic UI
  async function onToggleAlerts(next: boolean) {
    setUpdatingAlerts(true);
    setErrorMsg(null);
    const prev = data.alertsEnabled;
    setData((d) => ({ ...d, alertsEnabled: next }));

    try {
      await updateAlerts({ enabled: next } as any);
      toast({
        variant: "success",
        title: next ? "Security alerts enabled" : "Security alerts disabled",
        duration: 2000,
      });
    } catch (err) {
      if (!isStepUpRequired(err)) {
        setData((d) => ({ ...d, alertsEnabled: prev }));
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t update your alert preference. Please try again.",
        });
        setErrorMsg(friendly);
      } else {
        try {
          await promptReauth({ reason: "Confirm it’s you to change alert settings" } as any);
          await updateAlerts({ enabled: next } as any);
          toast({
            variant: "success",
            title: next ? "Security alerts enabled" : "Security alerts disabled",
            duration: 2000,
          });
        } catch (err2) {
          setData((d) => ({ ...d, alertsEnabled: prev }));
          const friendly = formatError(err2, {
            includeRequestId: true,
            maskServerErrors: true,
            fallback: "We couldn’t confirm it was you just now.",
          });
          setErrorMsg(friendly);
        }
      }
    } finally {
      setUpdatingAlerts(false);
    }
  }

  const { mfaEnabled, recoveryRemaining, sessionsCount, devicesCount, alertsEnabled, passwordLastChanged } = data;

  return (
    <section className="space-y-6" aria-busy={loading || undefined}>
      {/* Error banner (assertive live region) */}
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
        {errorMsg ? (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => loadAll()}
              className="inline-flex items-center justify-center rounded-md border bg-background px-2.5 py-1 text-xs font-medium shadow-sm hover:bg-accent"
            >
              Try again
            </button>
          </div>
        ) : null}
      </div>

      {/* Grid of security cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* MFA */}
        <SecurityCard
          title="Two-factor authentication"
          icon={<Shield className="h-4 w-4" aria-hidden />}
          status={
            loading ? (
              <SkeletonChip />
            ) : mfaEnabled === true ? (
              <Chip good>
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                On
              </Chip>
            ) : mfaEnabled === false ? (
              <Chip bad>
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
                Off
              </Chip>
            ) : (
              <Chip neutral>Unknown</Chip>
            )
          }
          meta={
            loading
              ? "Checking…"
              : mfaEnabled === true
              ? `Recovery codes: ${
                  typeof recoveryRemaining === "number" ? recoveryRemaining : "—"
                } remaining`
              : "Protect your account with an authenticator app"
          }
          primaryHref={PATHS.settingsMfa || "/settings/security/mfa"}
          primaryLabel={mfaEnabled === true ? "Manage MFA" : "Enable MFA"}
          secondaryHref={PATHS.settingsRecoveryCodes || "/settings/security/recovery-codes"}
          secondaryLabel="Recovery codes"
        />

        {/* Password */}
        <SecurityCard
          title="Password"
          icon={<KeyRound className="h-4 w-4" aria-hidden />}
          status={loading ? <SkeletonChip /> : <Chip neutral>Last changed</Chip>}
          meta={loading ? "Checking…" : fmt(passwordLastChanged ?? undefined)}
          primaryHref={PATHS.settingsPassword || "/settings/security/password"}
          primaryLabel="Change password"
          secondaryHref={PATHS.settingsActivity || "/settings/activity"}
          secondaryLabel="View activity"
        />

        {/* Trusted devices */}
        <SecurityCard
          title="Trusted devices"
          icon={<Smartphone className="h-4 w-4" aria-hidden />}
          status={
            loading ? (
              <SkeletonChip />
            ) : (
              <Chip neutral>
                {devicesCount} device{devicesCount === 1 ? "" : "s"}
              </Chip>
            )
          }
          meta={loading ? "Checking…" : "Devices remembered after MFA"}
          primaryHref={PATHS.settingsDevices || "/settings/security/devices"}
          primaryLabel="Manage devices"
        />

        {/* Active sessions */}
        <SecurityCard
          title="Active sessions"
          icon={<LogIn className="h-4 w-4" aria-hidden />}
          status={
            loading ? (
              <SkeletonChip />
            ) : (
              <Chip neutral>
                {sessionsCount} session{sessionsCount === 1 ? "" : "s"}
              </Chip>
            )
          }
          meta={loading ? "Checking…" : "Sign-ins on your account"}
          primaryHref={PATHS.settingsSessions || "/settings/sessions"}
          primaryLabel="Manage sessions"
        />

        {/* Security alerts */}
        <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">
              <Bell className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-medium">Security alerts</h2>
                {loading ? (
                  <SkeletonChip />
                ) : (
                  <button
                    type="button"
                    disabled={updatingAlerts || alertsEnabled === "unknown"}
                    onClick={() => onToggleAlerts(!(alertsEnabled === true))}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs shadow-sm transition",
                      alertsEnabled === true
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-muted text-muted-foreground hover:bg-accent",
                      (updatingAlerts || alertsEnabled === "unknown") && "cursor-not-allowed opacity-60"
                    )}
                    aria-pressed={alertsEnabled === true}
                  >
                    {alertsEnabled === true ? "On" : "Off"}
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Get notified about new sign-ins and important security changes.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={PATHS.settingsAlerts || "/settings/alerts"}
                  prefetch
                  className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
                >
                  Manage alerts
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions (optional helpful block) */}
        <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">
              <FileCode2 className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-medium">Quick actions</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Generate fresh recovery codes or review recent activity.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={PATHS.settingsRecoveryCodes || "/settings/security/recovery-codes"}
                  prefetch
                  className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
                >
                  Recovery codes
                </Link>
                <Link
                  href={PATHS.settingsActivity || "/settings/activity"}
                  prefetch
                  className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
                >
                  Activity timeline
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty fallback if everything loads but yields nothing meaningful */}
      {!loading &&
        data.mfaEnabled === "unknown" &&
        data.sessionsCount === 0 &&
        data.devicesCount === 0 && (
          <EmptyState
            className="rounded-xl border bg-card/50"
            title="No signals yet"
            description="As you sign in and change settings, your security overview will populate here."
          />
        )}
    </section>
  );
}

// -----------------------------------------------------------------------------
// Small presentational helpers
// -----------------------------------------------------------------------------
function SecurityCard(props: {
  title: string;
  icon: React.ReactNode;
  status: React.ReactNode;
  meta?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  const { title, icon, status, meta, primaryHref, primaryLabel, secondaryHref, secondaryLabel } = props;
  return (
    <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">{title}</h2>
            {status}
          </div>
          {meta ? <p className="mt-1 text-xs text-muted-foreground">{meta}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={primaryHref}
              prefetch
              className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
            >
              {primaryLabel}
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                prefetch
                className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({
  children,
  good,
  bad,
  neutral,
}: React.PropsWithChildren<{ good?: boolean; bad?: boolean; neutral?: boolean }>) {
  const cls = good
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : bad
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-muted text-muted-foreground border-muted";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]", cls)}>
      {children}
    </span>
  );
}

function SkeletonChip() {
  return <span className="inline-block h-5 w-16 animate-pulse rounded-full bg-muted" />;
}
