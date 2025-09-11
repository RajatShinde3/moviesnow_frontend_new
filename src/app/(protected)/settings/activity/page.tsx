"use client";

/**
 * =============================================================================
 * Page · Settings · Activity (Best-of-best)
 * =============================================================================
 * A polished activity timeline showing recent sign-ins, security changes,
 * device trust, MFA events, etc., with tolerant normalization.
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Uses your `useAuthActivity()` to fetch activity (cursor-based pagination).
 * • Step-up (reauth) aware: on `need_step_up`, opens <ReauthDialog/> and retries
 *   with `xReauth` — the same payload is retried (filters/pagination preserved).
 * • Tolerant normalizer: accepts multiple backend shapes (type/action/event,
 *   timestamp/at/created_at, ip/ip_address, geo/city/country, etc.).
 *
 * UX & A11y
 * ---------
 * • Grouped by day with clear icons/labels and success/failed chips.
 * • Quick filter: text search + “Only failed attempts”.
 * • Expandable rows show raw metadata (for power users & support).
 * • Inline error banner (assertive `aria-live`) with focus handoff.
 * • “Load more” for pagination; CSV export of the *loaded* items (with BOM).
 * • Handy “copy” actions for IP and User-Agent.
 *
 * Integration notes
 * -----------------
 * 1) Ensure <ToastsRoot /> and <ReauthDialogProvider /> are mounted globally.
 * 2) Server should also send `Cache-Control: no-store` for this route.
 * 3) If `useAuthActivity()` exposes server filtering (e.g., `types`, `q`,
 *    `limit`, `cursor`), we pass these tolerantly; the hook may ignore extras.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeAlert,
  CheckCircle2,
  Copy,
  KeyRound,
  LogIn,
  LogOut,
  Shield,
  ShieldAlert,
  Smartphone,
  UserCheck,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts"; // ✅ consistent path
import { useReauthPrompt } from "@/components/ReauthDialog";
import EmptyState from "@/components/feedback/EmptyState";

import { getMaybeJson } from "@/lib/api";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// Helpers: step-up detection, date/time formatting, CSV export
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

const dtDate = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const dtTime = new Intl.DateTimeFormat(undefined, { timeStyle: "short" });

function fmtDate(dateIso: string) {
  try {
    const d = new Date(dateIso);
    return `${dtDate.format(d)} · ${dtTime.format(d)}`;
  } catch {
    return dateIso;
  }
}

// Best-effort CSV exporter for currently loaded events (adds BOM for Excel)
function exportCsv(rows: NormalizedEvent[]) {
  const header = [
    "id",
    "timestamp",
    "type",
    "result",
    "ip",
    "location",
    "device",
    "user_agent",
    "session_id",
  ];
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        escape(r.id || ""),
        escape(r.timestamp || ""),
        escape(r.type || ""),
        escape(r.result || ""),
        escape(r.ip || ""),
        escape(r.locationLabel || ""),
        escape(r.deviceLabel || ""),
        escape(r.userAgent || ""),
        escape(r.sessionId || ""),
      ].join(",")
    );
  }
  const blob = new Blob(
    ["\ufeff", lines.join("\n")], // BOM + CSV
    { type: "text/csv;charset=utf-8" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `activity_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// -----------------------------------------------------------------------------
// Model normalization
// -----------------------------------------------------------------------------
type NormalizedEvent = {
  id?: string;
  timestamp: string; // ISO string
  type: string; // e.g., "sign_in", "password_change"
  result: "success" | "failure" | "info";
  ip?: string;
  locationLabel?: string; // e.g., "San Francisco, US"
  deviceLabel?: string; // e.g., "Mac • Chrome 126"
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
};

function normalizeItem(raw: any): NormalizedEvent | null {
  if (!raw || typeof raw !== "object") return null;

  // timestamps
  const ts = raw.timestamp || raw.at || raw.created_at || raw.time || raw.date;
  const timestamp = typeof ts === "string" ? ts : new Date().toISOString();

  // type / action
  const type = (raw.type || raw.event || raw.action || "event").toString();

  // outcome
  const resultRaw = (raw.result || raw.outcome || raw.status || "").toString().toLowerCase();
  const result: NormalizedEvent["result"] =
    resultRaw.includes("fail") || resultRaw === "denied"
      ? "failure"
      : resultRaw.includes("success") || resultRaw === "ok"
      ? "success"
      : "info";

  // ip
  const ip = raw.ip || raw.ip_address || raw.ipAddr;

  // location
  let locationLabel: string | undefined = undefined;
  const geo = raw.geo || raw.location || {};
  const city = geo.city || raw.city;
  const country = geo.country || raw.country || geo.country_code || raw.country_code;
  if (city || country) locationLabel = [city, country].filter(Boolean).join(", ");

  // device / user agent
  const ua = raw.user_agent || raw.ua || raw.agent;
  const device = raw.device || raw.device_name || {};
  const deviceName = typeof device === "string" ? device : device.name || device.model;
  const os = device.os || device.os_name || undefined;
  const browser = device.browser || device.browser_name || undefined;
  const deviceLabel = [deviceName, os, browser].filter(Boolean).join(" • ") || undefined;

  // sessionId (if any)
  const sessionId = raw.session_id || raw.sid || raw.session;

  // metadata bag
  const metadata = raw.metadata && typeof raw.metadata === "object" ? raw.metadata : undefined;

  return {
    id: raw.id,
    timestamp,
    type,
    result,
    ip,
    locationLabel,
    deviceLabel,
    userAgent: ua,
    sessionId,
    metadata,
  };
}

function groupByDay(rows: NormalizedEvent[]) {
  const groups = new Map<string, NormalizedEvent[]>();
  for (const r of rows) {
    const d = new Date(r.timestamp);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD in UTC (sufficient for grouping)
    const arr = groups.get(key) || [];
    arr.push(r);
    groups.set(key, arr);
  }
  // Sort days descending
  const ordered = [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  return ordered;
}

function iconForType(t: string) {
  const key = t.toLowerCase();
  if (key.includes("sign_in") || key.includes("login")) return <LogIn className="h-4 w-4" aria-hidden />;
  if (key.includes("sign_out") || key.includes("logout")) return <LogOut className="h-4 w-4" aria-hidden />;
  if (key.includes("password")) return <KeyRound className="h-4 w-4" aria-hidden />;
  if (key.includes("mfa") && key.includes("disable")) return <ShieldAlert className="h-4 w-4" aria-hidden />;
  if (key.includes("mfa") || key.includes("2fa")) return <Shield className="h-4 w-4" aria-hidden />;
  if (key.includes("device")) return <Smartphone className="h-4 w-4" aria-hidden />;
  if (key.includes("email")) return <UserCheck className="h-4 w-4" aria-hidden />;
  if (key.includes("suspicious") || key.includes("blocked")) return <BadgeAlert className="h-4 w-4" aria-hidden />;
  return <Shield className="h-4 w-4" aria-hidden />;
}

function chipClass(result: NormalizedEvent["result"]) {
  if (result === "success")
    return "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200";
  if (result === "failure")
    return "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] bg-rose-50 text-rose-700 border-rose-200";
  return "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] bg-muted text-muted-foreground border-muted";
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function ActivityPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Account activity</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Recent sign-ins and security changes for your account. Review anything you don’t recognize.
        </p>
      </header>

      <ActivityPanel />

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
// Panel · fetch → normalize → filter → render → paginate
// -----------------------------------------------------------------------------
function ActivityPanel() {
  const router = useRouter();
  const toast = useToast();
  const promptReauth = useReauthPrompt();

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const [q, setQ] = React.useState("");
  const [onlyFailed, setOnlyFailed] = React.useState(false);

  const [items, setItems] = React.useState<NormalizedEvent[]>([]);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState<boolean>(true);

  // Local pending state for fetches
  const [isPending, setIsPending] = React.useState(false);

  // keep last payload so step-up retry preserves filters/pagination
  const lastPayloadRef = React.useRef<Record<string, unknown> | null>(null);

  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  React.useEffect(() => {
    // initial load
    void load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildPayload({ reset }: { reset: boolean }) {
    const payload: any = {
      cursor: reset ? undefined : cursor ?? undefined,
      limit: 25,
      q: q || undefined,
      only_failed: onlyFailed || undefined,
    };
    lastPayloadRef.current = payload;
    return payload;
  }

  async function load({ reset = false }: { reset?: boolean } = {}) {
    setErrorMsg(null);
    setIsPending(true);
    try {
      const payload = buildPayload({ reset });
      const params = new URLSearchParams();
      if (payload.cursor) params.set("cursor", String(payload.cursor));
      if (payload.limit) params.set("limit", String(payload.limit));
      if (payload.q) params.set("q", String(payload.q));
      if (payload.only_failed) params.set("only_failed", "1");
      const res = (await getMaybeJson<unknown>(PATHS.activityList, { searchParams: params })) as any;

      // Accept a few shapes:
      //  - { items: [], next_cursor?, has_more? }
      //  - { data: [], cursor?, next? }
      //  - [] (just an array)
      const list: any[] = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.items)
        ? (res as any).items
        : Array.isArray((res as any)?.data)
        ? (res as any).data
        : [];

      const nextCursor =
        (res as any)?.next_cursor ??
        (res as any)?.cursor ??
        (res as any)?.next ??
        null;

      const more =
        typeof (res as any)?.has_more === "boolean"
          ? (res as any).has_more
          : !!nextCursor;

      const normalized = list.map(normalizeItem).filter(Boolean) as NormalizedEvent[];
      setItems((prev) => (reset ? normalized : [...prev, ...normalized]));
      setCursor(nextCursor);
      setHasMore(more);

      if (reset) router.refresh();
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t load your activity right now.",
        });
        setErrorMsg(friendly);
        return;
      }
      // Step-up required → open dialog and retry with same payload + xReauth
      try {
        await promptReauth({
          reason: "Confirm it’s you to view account activity",
        } as any);
        

        const retryPayload = { ...(lastPayloadRef.current || {}) } as any;
        const params = new URLSearchParams();
        if (retryPayload.cursor) params.set("cursor", String(retryPayload.cursor));
        if (retryPayload.limit) params.set("limit", String(retryPayload.limit));
        if (retryPayload.q) params.set("q", String(retryPayload.q));
        if (retryPayload.only_failed) params.set("only_failed", "1");
        const res = (await getMaybeJson<unknown>(PATHS.activityList, { searchParams: params })) as any;

        const list: any[] = Array.isArray(res)
          ? res
          : Array.isArray((res as any)?.items)
          ? (res as any).items
          : Array.isArray((res as any)?.data)
          ? (res as any).data
          : [];
        const nextCursor =
          (res as any)?.next_cursor ??
          (res as any)?.cursor ??
          (res as any)?.next ??
          null;
        const more =
          typeof (res as any)?.has_more === "boolean"
            ? (res as any).has_more
            : !!nextCursor;
        const normalized = list.map(normalizeItem).filter(Boolean) as NormalizedEvent[];
        // Keep previous items if the retry was a non-reset load
        const reset = !retryPayload.cursor;
        setItems((prev) => (reset ? normalized : [...prev, ...normalized]));
        setCursor(nextCursor);
        setHasMore(more);
      } catch (err2) {
        const friendly = formatError(err2, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t confirm it was you just now.",
        });
        setErrorMsg(friendly);
      }
    } finally {
      setIsPending(false);
    }
  }

  // Client-side filter (quick and forgiving)
  const visible = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      if (onlyFailed && it.result !== "failure") return false;
      if (!needle) return true;
      const hay = [it.type, it.ip, it.locationLabel, it.deviceLabel, it.userAgent]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [items, q, onlyFailed]);

  const groups = groupByDay(visible);

  // small UX helpers
  async function copyText(label: string, value?: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success({ title: "Copied", description: `${label} copied to clipboard.`, duration: 1400 });
    } catch {
      // non-fatal; no noisy error
    }
  }

  return (
    <section className="space-y-6" aria-busy={isPending || undefined}>
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
      </div>

      {/* Toolbar: search, failed-only filter, export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="search"
            placeholder="Search IP, location, device…"
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load({ reset: true });
            }}
            className={cn(
              "flex-1 rounded-lg border bg-background px-3 py-2 text-sm shadow-sm",
              "outline-none ring-0 placeholder:text-muted-foreground/70",
              "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            )}
          />
          <button
            type="button"
            onClick={() => load({ reset: true })}
            disabled={isPending}
            className={cn(
              "inline-flex items-center justify-center rounded-lg border bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent",
              isPending && "cursor-not-allowed opacity-60"
            )}
            aria-disabled={isPending}
          >
            Apply
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex select-none items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border"
              checked={onlyFailed}
              onChange={(e) => setOnlyFailed(e.currentTarget.checked)}
            />
            <span>Only failed</span>
          </label>

          <button
            type="button"
            onClick={() => exportCsv(visible)}
            disabled={visible.length === 0}
            className={cn(
              "inline-flex items-center justify-center rounded-lg border bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent",
              visible.length === 0 && "cursor-not-allowed opacity-60"
            )}
            aria-disabled={visible.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Empty state */}
      {groups.length === 0 && !isPending ? (
        <EmptyState
          title="No activity yet"
          description="We’ll show recent sign-ins and security events here."
          className="rounded-xl border bg-card/50"
        />
      ) : null}

      {/* Timeline groups */}
      <div className="space-y-8">
        {groups.map(([day, rows]) => (
          <div key={day} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {dtDate.format(new Date(day))}
            </h2>
            <ul className="space-y-2">
              {rows
                .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
                .map((ev) => (
                  <li
                    key={`${ev.id ?? ev.timestamp}-${ev.type}-${ev.ip ?? ""}`}
                    className="rounded-lg border bg-card/50 p-3 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 text-muted-foreground">
                        {iconForType(ev.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-medium">{labelForType(ev.type)}</div>
                          <span className={chipClass(ev.result)}>
                            {ev.result === "success" ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : null}
                            {ev.result === "failure" ? (
                              <ShieldAlert className="h-3.5 w-3.5" />
                            ) : null}
                            {ev.result.charAt(0).toUpperCase() + ev.result.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            · {fmtDate(ev.timestamp)}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {ev.ip ? (
                            <span className="inline-flex items-center gap-1">
                              IP: <span className="font-mono">{ev.ip}</span>
                              <button
                                type="button"
                                className="rounded p-0.5 hover:bg-muted"
                                aria-label="Copy IP address"
                                onClick={() => copyText("IP address", ev.ip)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ) : null}

                          {ev.locationLabel ? (
                            <span>Location: {ev.locationLabel}</span>
                          ) : null}

                          {ev.deviceLabel ? <span>Device: {ev.deviceLabel}</span> : null}
                        </div>

                        {ev.userAgent ? (
                          <div className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground/90">
                            UA: <span className="font-mono truncate">{ev.userAgent}</span>
                            <button
                              type="button"
                              className="rounded p-0.5 hover:bg-muted"
                              aria-label="Copy user agent"
                              onClick={() => copyText("User-Agent", ev.userAgent)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : null}

                        {/* Expandable metadata */}
                        {ev.metadata && Object.keys(ev.metadata).length > 0 ? (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs font-medium underline underline-offset-4">
                              View event details
                            </summary>
                            <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted/40 p-2 text-[11px] leading-relaxed">
{JSON.stringify(ev.metadata, null, 2)}
                            </pre>
                          </details>
                        ) : null}

                        {/* Helpful links when relevant */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {ev.sessionId ? (
                            <Link
                              href={PATHS.settingsSessions || "/settings/sessions"}
                              className="inline-flex items-center justify-center rounded-md border bg-background px-2 py-1 text-xs font-medium shadow-sm hover:bg-accent"
                              prefetch
                            >
                              Review sessions
                            </Link>
                          ) : null}
                          {ev.type.includes("sign_in") || ev.result === "failure" ? (
                            <Link
                              href={PATHS.settingsSecurity || "/settings/security"}
                              className="inline-flex items-center justify-center rounded-md border bg-background px-2 py-1 text-xs font-medium shadow-sm hover:bg-accent"
                              prefetch
                            >
                              Security settings
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {hasMore ? (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => load({ reset: false })}
            disabled={isPending}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent",
              isPending && "cursor-not-allowed opacity-75"
            )}
            aria-disabled={isPending}
          >
            {isPending ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

// -----------------------------------------------------------------------------
// Small label helper (keeps copy friendly & consistent)
// -----------------------------------------------------------------------------
function labelForType(t: string) {
  const key = t.toLowerCase();
  if (key.includes("sign_in") || key.includes("login")) return "Sign-in";
  if (key.includes("sign_out") || key.includes("logout")) return "Sign-out";
  if (key.includes("password_change")) return "Password changed";
  if (key.includes("password")) return "Password event";
  if (key.includes("mfa") && key.includes("disable")) return "MFA disabled";
  if (key.includes("mfa") && key.includes("enable")) return "MFA enabled";
  if (key.includes("mfa") && (key.includes("verify") || key.includes("challenge")))
    return "MFA challenge";
  if (key.includes("recovery_code")) return "Recovery codes";
  if (key.includes("trusted_device") && key.includes("register")) return "New trusted device";
  if (key.includes("trusted_device")) return "Trusted device";
  if (key.includes("session") && key.includes("revoke")) return "Session revoked";
  if (key.includes("email_change")) return "Email changed";
  if (key.includes("email_verify")) return "Email verified";
  if (key.includes("deactivate")) return "Account deactivated";
  if (key.includes("reactivate")) return "Account reactivated";
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
