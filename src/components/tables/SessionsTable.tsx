"use client";

/**
 * SessionsTable
 * =============================================================================
 * Accessible, production-grade table for listing and managing the user's
 * active authentication sessions.
 *
 * UX & A11y
 * - Non-blocking toasts for success/error; assertive inline error banner on load failure.
 * - Proper table semantics, caption, aria-live stats, aria-busy while fetching.
 * - Skeleton rows while loading; per-row pending state for targeted feedback.
 *
 * Security & Flow
 * - Step-up reauth: when the server requires reauth, we prompt (via `useReauthPrompt`)
 *   and **retry once** using `withReauth`.
 * - Prevents surprises: clearly labels “current” session; confirm dialogs for destructive ops.
 *
 * Extensibility
 * - Optional toolbar; custom confirm handler via `onConfirm`.
 * - Emits `onChanged()` after successful mutations (one/others/all).
 */

import * as React from "react";
import { useMemo, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";

import { useReauthPrompt, type ReauthPromptOptions } from "@/components/ReauthDialog";
import { isReauthRequired } from "@/lib/reauth";
import { useToast } from "@/components/feedback/Toasts";
import formatError from "@/lib/formatError";

import { useAuthSessions } from "@/features/auth/useAuthSessions";
import { useAuthSessionRevoke } from "@/features/auth/useAuthSessionRevoke";
import { useAuthSessionsRevokeOthers } from "@/features/auth/useAuthSessionsRevokeOthers";
import { useAuthSessionsRevokeAll } from "@/features/auth/useAuthSessionsRevokeAll";
import type { EnrichedHTTPError } from "@/lib/api";

export type SessionsTableProps = {
  /** Hide the toolbar (Refresh / Revoke others / Revoke all). */
  hideToolbar?: boolean;
  /** Called after any successful revoke action (one/others/all). */
  onChanged?: () => void;
  /** Extra class for the outer section wrapper. */
  className?: string;
  /** Optional confirm override (return true to proceed). */
  onConfirm?: (message: string) => boolean | Promise<boolean>;
};

type SessionRow = {
  jti?: string; // JWT ID / session id
  id?: string; // tolerate alternate key names
  ip?: string | null;
  user_agent?: string | null;
  created_at?: string | number | null;
  last_seen_at?: string | number | null;
  current?: boolean;
  is_current?: boolean;
};

function isHttpError(e: unknown): e is EnrichedHTTPError {
  return !!e && typeof e === "object" && "response" in e;
}

/** The provider rejects with this error on user-cancelled reauth. */
function isReauthCancelled(e: unknown): boolean {
  return e instanceof Error && e.message === "reauth-cancelled";
}

/** Format a date/time (returns '—' when unknown). */
function fmtDate(input?: string | number | null): string {
  if (input == null) return "—";
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
 * Normalize backend payload → `SessionRow[]`.
 * Accepts:
 * - `SessionRow[]`
 * - `{ sessions: SessionRow[] }`
 * - Minor field name variations (camelCase / snake_case).
 */
function normalizeSessions(data: unknown): SessionRow[] {
  const list: unknown =
    Array.isArray(data) ? data : (data && typeof data === "object" && (data as any).sessions) || [];

  if (!Array.isArray(list)) return [];

  return (list as any[]).map((it) => {
    const jti = it?.jti ?? it?.id ?? it?.session_id ?? it?.sessionId ?? undefined;
    const ip = it?.ip ?? it?.ip_address ?? it?.ipAddress ?? null;
    const ua = it?.user_agent ?? it?.userAgent ?? null;

    const created = it?.created_at ?? it?.createdAt ?? it?.issued_at ?? it?.issuedAt ?? null;
    const lastSeen = it?.last_seen_at ?? it?.lastSeenAt ?? it?.lastSeen ?? null;

    const current = it?.current ?? it?.is_current ?? it?.isCurrent ?? false;

    return {
      jti,
      id: it?.id,
      ip,
      user_agent: ua,
      created_at: created,
      last_seen_at: lastSeen,
      current: !!current,
      is_current: !!(it?.is_current ?? it?.isCurrent ?? current),
    } as SessionRow;
  });
}

/**
 * Retry an action after reauth if the server signals “step-up required”.
 * - Pass a `prompt` that may receive optional `ReauthPromptOptions` hints.
 * - If the user cancels, we rethrow `reauth-cancelled` so callers can bail.
 */
async function withReauth<T>(
  attempt: () => Promise<T>,
  prompt: (opts?: ReauthPromptOptions) => Promise<void> | void
): Promise<T> {
  try {
    return await attempt();
  } catch (e) {
    if (!isReauthRequired(e)) throw e;
    try {
      await Promise.resolve(prompt(undefined));
    } catch (err) {
      if (isReauthCancelled(err)) throw err; // user cancelled
      throw err;
    }
    // Retry once after successful reauth
    return await attempt();
  }
}

/** Safe clipboard copy with toast fallback. */
async function copyText(text: string, notify: (msg: string) => void, onError: (msg: string) => void) {
  try {
    await navigator.clipboard.writeText(text);
    notify("Session ID copied");
  } catch {
    onError("Could not copy session ID");
  }
}

export default function SessionsTable({
  hideToolbar = false,
  onChanged,
  className,
  onConfirm,
}: SessionsTableProps) {
  const qc = useQueryClient();
  const promptReauth = useReauthPrompt();
  const toast = useToast();

  // Queries & mutations
  const sessionsQ = useAuthSessions();
  const revokeOne = useAuthSessionRevoke();
  const revokeOthers = useAuthSessionsRevokeOthers();
  const revokeAll = useAuthSessionsRevokeAll();

  const sessions: SessionRow[] = useMemo(() => normalizeSessions(sessionsQ.data), [sessionsQ.data]);
  const currentIdx = useMemo(() => sessions.findIndex((s) => s.current || s.is_current), [sessions]);

  const [revokingJti, setRevokingJti] = useState<string | null>(null);

  const confirmAsync = useCallback(
    async (message: string) => {
      if (onConfirm) return !!(await onConfirm(message));
      return window.confirm(message);
    },
    [onConfirm]
  );

  const afterChange = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ["auth", "sessions"] });
    onChanged?.();
  }, [onChanged, qc]);

  const handleRevoke = useCallback(
    async (jti: string) => {
      if (!jti) return;
      const ok = await confirmAsync("Revoke this session? The device will be signed out.");
      if (!ok) return;

      setRevokingJti(jti);
      try {
        await withReauth(
          () => revokeOne.mutateAsync({ jti }),
          (opts?: ReauthPromptOptions) =>
            promptReauth({
              reason: "To revoke a session, please confirm it’s you.",
              methods: opts?.methods,
            })
        );
        await afterChange();
        toast.success({ title: "Session revoked" });
      } catch (err) {
        if (isReauthCancelled(err)) return;
        toast.error({ title: "Could not revoke session", description: formatError(err) });
      } finally {
        setRevokingJti((x) => (x === jti ? null : x));
      }
    },
    [afterChange, confirmAsync, promptReauth, revokeOne, toast]
  );

  const handleRevokeOthers = useCallback(
    async () => {
      if (sessions.length <= 1) return;
      const ok = await confirmAsync("Revoke all OTHER sessions? You will remain signed in here.");
      if (!ok) return;

      try {
        await withReauth(
          () => revokeOthers.mutateAsync(),
          () =>
            promptReauth({
              reason: "To revoke other sessions, please confirm it’s you.",
            })
        );
        await afterChange();
        toast.success({ title: "Other sessions revoked" });
      } catch (err) {
        if (isReauthCancelled(err)) return;
        toast.error({ title: "Could not revoke other sessions", description: formatError(err) });
      }
    },
    [afterChange, confirmAsync, promptReauth, revokeOthers, sessions.length, toast]
  );

  const handleRevokeAll = useCallback(
    async () => {
      if (sessions.length === 0) return;
      const ok = await confirmAsync(
        "Revoke ALL sessions including this one? You will be signed out here as well."
      );
      if (!ok) return;

      try {
        await withReauth(
          () => revokeAll.mutateAsync(),
          () =>
            promptReauth({
              reason: "To revoke all sessions, please confirm it’s you.",
            })
        );
        await afterChange();
        toast.success({ title: "All sessions revoked" });
      } catch (err) {
        if (isReauthCancelled(err)) return;
        toast.error({ title: "Could not revoke all sessions", description: formatError(err) });
      }
    },
    [afterChange, confirmAsync, promptReauth, revokeAll, sessions.length, toast]
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
    <section
      className={cn("rounded border", className)}
      aria-busy={sessionsQ.isFetching || undefined}
    >
      {!hideToolbar && (
        <div className="flex flex-wrap items-end justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">Active sessions</h2>
            <p className="text-xs text-muted-foreground">Manage where your account is signed in.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => sessionsQ.refetch()}
              disabled={sessionsQ.isFetching}
              className={cn(
                "rounded border px-3 py-1.5 text-sm",
                sessionsQ.isFetching ? "cursor-not-allowed opacity-60" : "hover:bg-gray-50"
              )}
              aria-label="Refresh sessions list"
            >
              {sessionsQ.isFetching ? "Refreshing…" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={handleRevokeOthers}
              disabled={revokeOthers.isPending || sessions.length <= 1}
              className={cn(
                "rounded px-3 py-1.5 text-sm text-white",
                revokeOthers.isPending || sessions.length <= 1
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-amber-600 hover:opacity-90"
              )}
              aria-label="Revoke other sessions"
            >
              {revokeOthers.isPending ? "Revoking…" : "Revoke others"}
            </button>
            <button
              type="button"
              onClick={handleRevokeAll}
              disabled={revokeAll.isPending || sessions.length === 0}
              className={cn(
                "rounded px-3 py-1.5 text-sm text-white",
                revokeAll.isPending || sessions.length === 0
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-red-600 hover:opacity-90"
              )}
              aria-label="Revoke all sessions"
            >
              {revokeAll.isPending ? "Revoking…" : "Revoke all"}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 pt-3 text-xs text-muted-foreground" aria-live="polite">
        {sessions.length} session{sessions.length === 1 ? "" : "s"} total
        {currentIdx >= 0 ? " · current session highlighted" : ""}
      </div>

      {/* Table */}
      <div className="mt-2 overflow-x-auto px-2 pb-3">
        <table className="min-w-full border-collapse text-sm">
          <caption className="sr-only">List of active sessions</caption>
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-3 py-2 font-medium">Session</th>
              <th className="px-3 py-2 font-medium">Last seen</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">IP</th>
              <th className="px-3 py-2 font-medium">Agent</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {sessionsQ.isLoading && loadingSkeletonRows}

            {!sessionsQ.isLoading && sessions.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={6}>
                  No active sessions found.
                </td>
              </tr>
            )}

            {sessions.map((s, i) => {
              const jti = s.jti || s.id || "";
              const isCurrent = s.current || s.is_current;
              const rowKey = jti || `row-${i}`;
              const isThisRowRevoking = revokingJti === jti && revokeOne.isPending;

              return (
                <tr key={rowKey} className="border-b last:border-0">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {isCurrent ? "This device" : "Signed-in device"}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          current
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      JTI: <code className="font-mono">{jti || "unknown"}</code>{" "}
                      {jti && (
                        <button
                          type="button"
                          className="ml-2 text-[11px] underline"
                          onClick={() =>
                            copyText(
                              String(jti),
                              (m) => toast.info({ title: m }),
                              (m) => toast.error({ title: m })
                            )
                          }
                          aria-label={`Copy session ID ${jti || ""}`}
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-3">{fmtDate(s.last_seen_at)}</td>
                  <td className="px-3 py-3">{fmtDate(s.created_at)}</td>
                  <td className="px-3 py-3">{s.ip || "—"}</td>
                  <td className="px-3 py-3">
                    <div className="line-clamp-2 max-w-[24rem] break-all text-xs">
                      {s.user_agent || "—"}
                    </div>
                  </td>

                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => jti && handleRevoke(String(jti))}
                      disabled={revokeOne.isPending || !jti}
                      className={cn(
                        "rounded px-3 py-1.5 text-xs text-white",
                        revokeOne.isPending || !jti
                          ? "cursor-not-allowed bg-gray-400"
                          : "bg-red-600 hover:opacity-90"
                      )}
                      aria-label={`Revoke session ${jti || ""}`}
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
        {sessionsQ.isError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formatError(sessionsQ.error)}
          </div>
        )}
      </div>
    </section>
  );
}
