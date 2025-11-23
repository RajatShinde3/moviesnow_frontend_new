"use client";

/**
 * AuthGate
 * =============================================================================
 * Client-side gate for protecting routes in the App Router.
 *
 * What it does
 * -----------------------------------------------------------------------------
 * • Reads the current user via `useMe()`:
 *    - If authenticated (and optional predicates pass) → render children.
 *    - If unauthenticated → redirect to login with a sanitized `redirect` back.
 *    - While loading → show a fallback (with optional min display to avoid flash).
 *    - On *non-auth* errors (e.g., 5xx/network) → show retry + go-to-login.
 *
 * Why client-side?
 * -----------------------------------------------------------------------------
 * • Keeps SSR simple. For hard SSR gating, pair with `middleware.ts`.
 *
 * Security / UX
 * -----------------------------------------------------------------------------
 * • Sanitizes the redirect target (site-absolute paths only).
 * • Preserves current query string and hash (smooth return).
 * • StrictMode/dev-safe: avoids duplicate redirects.
 * • Optional policy checks: `requireVerifiedEmail`, `requireRoles`.
 * • Configurable login URL builder (works with custom auth routes).
 */

import * as React from "react";
import type { ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import formatError from "@/lib/formatError";
import { useMe } from "@/lib/useMe"; // expected: { data, isLoading, isError, error, refetch }

/* -----------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------------*/

type BuildLoginUrl = (intended: string) => string;

type Props = {
  /** Protected UI to render when authenticated. */
  children: ReactNode;
  /** Optional loading UI while we determine auth state. */
  fallback?: ReactNode;
  /** Route to send unauthenticated users to (used if `buildLoginUrl` not provided). */
  loginPath?: string;
  /**
   * Custom login URL builder. Receives sanitized `intended` path (site-absolute).
   * Default: `${loginPath}?redirect=${encodeURIComponent(intended)}`
   */
  buildLoginUrl?: BuildLoginUrl;
  /**
   * Avoid loading “flash”: keep the fallback visible at least this many ms.
   * Set to 0 to disable (default: 250ms).
   */
  minLoadingMs?: number;
  /**
   * Optional policy checks:
   * - If `requireVerifiedEmail`, we consider unauth if me.email_verified (or
   *   synonyms) is not truthy and we’ll redirect to login.
   * - If `requireRoles` is set, we require user role(s) to include any of them.
   */
  requireVerifiedEmail?: boolean;
  requireRoles?: string[]; // matches me.role or me.roles[]
};

/* -----------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------------*/

/** Allow only site-absolute targets like "/settings"; block full URLs. */
function sanitizeRedirect(input: string, fallback = "/"): string {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//")) return fallback; // no scheme-relative
  // Collapse duplicate slashes (except query/hash), cap length for safety
  const [pathAndQuery, hash = ""] = input.split("#");
  const path = pathAndQuery.replace(/\/{2,}/g, "/");
  const out = hash ? `${path}#${hash}` : path;
  return out.slice(0, 2048);
}

/** Collect current path + query + hash and sanitize it for safe redirect. */
function useIntendedPath(): string {
  const pathname = usePathname() || "/";
  const search = useSearchParams();
  const [hash, setHash] = React.useState("");
  React.useEffect(() => {
    const h = typeof window !== "undefined" ? window.location.hash : "";
    setHash(h && h !== "#" ? h : "");
  }, []);
  const qs = search?.toString();
  const withQuery = qs ? `${pathname}?${qs}` : pathname;
  const full = hash ? `${withQuery}${hash}` : withQuery;
  return React.useMemo(() => sanitizeRedirect(full, "/"), [full]);
}

/** True if a user object passes optional policy checks. */
function passesPolicy(me: any, opts: { requireVerifiedEmail?: boolean; requireRoles?: string[] }) {
  if (!me) return false;

  if (opts.requireVerifiedEmail) {
    const verified =
      me.email_verified ?? me.is_email_verified ?? me.emailVerified ?? me.isEmailVerified;
    if (!verified) return false;
  }

  if (opts.requireRoles && opts.requireRoles.length > 0) {
    const roles: string[] =
      Array.isArray(me?.roles) ? me.roles :
      me?.role ? [String(me.role)] : [];
    if (!roles.some((r) => opts.requireRoles!.includes(String(r)))) return false;
  }

  return true;
}

/* -----------------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------------------*/

export default function AuthGate({
  children,
  fallback,
  loginPath = "/login",
  buildLoginUrl,
  minLoadingMs = 250,
  requireVerifiedEmail,
  requireRoles,
}: Props) {
  const router = useRouter();
  const intended = useIntendedPath();
  const { data: me, isLoading, isError, error, refetch } = useMe();

  // Prevent duplicate redirects (StrictMode, re-renders, refetch churn)
  const redirectedRef = React.useRef(false);

  // Minimum loading duration to avoid flicker
  const [loadedAt] = React.useState(() => Date.now());
  const stillWithinMin =
    isLoading && minLoadingMs > 0 && Date.now() - loadedAt < minLoadingMs;

  // Build login URL (support custom function)
  const buildUrl: BuildLoginUrl = React.useMemo(
    () => buildLoginUrl ?? ((intd) => `${loginPath}?redirect=${encodeURIComponent(intd)}`),
    [buildLoginUrl, loginPath]
  );

  // Skip adding redirect loop if we're already on the login route
  const onLoginRoute =
    typeof window !== "undefined" &&
    window.location.pathname.replace(/\/+$/, "") === loginPath.replace(/\/+$/, "");

  // Redirect unauthenticated (or policy-failing) users
  React.useEffect(() => {
    if (isLoading || redirectedRef.current) return;

    const authedAndValid = passesPolicy(me, { requireVerifiedEmail, requireRoles });

    if (!authedAndValid) {
      // Don’t loop if we’re already on login; allow the login page to handle itself.
      if (onLoginRoute) return;
      redirectedRef.current = true;
      router.replace(buildUrl(intended));
    }
  }, [isLoading, me, intended, router, buildUrl, onLoginRoute, requireVerifiedEmail, requireRoles]);

  // 1) Loading → fallback or minimal skeleton (respect minLoadingMs)
  if (isLoading || stillWithinMin) {
    return (
      <>
        {fallback ?? (
          <div className="flex min-h-[40vh] items-center justify-center p-6">
            <div
              aria-label="Checking session"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gray-400" />
              <span>Checking your session…</span>
            </div>
          </div>
        )}
      </>
    );
  }

  // 2) Error (non-auth): offer a retry and a path to login.
  //    If it was a 401, the redirect effect above already triggered.
  if (isError && !me) {
    return (
      <div className="mx-auto max-w-md p-6">
        <div
          role="alert"
          aria-live="assertive"
          className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {formatError(error)}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className={cn("rounded border px-3 py-2 text-sm hover:bg-gray-50")}
          >
            Try again
          </button>
          {!onLoginRoute && (
            <button
              type="button"
              onClick={() => router.replace(buildUrl(intended))}
              className={cn("rounded bg-black px-3 py-2 text-sm text-white hover:opacity-90")}
            >
              Go to sign in
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3) Authenticated and passes policy → render protected UI.
  if (passesPolicy(me, { requireVerifiedEmail, requireRoles })) {
    return <>{children}</>;
  }

  // 4) Redirect is in-flight (or we’re on the login page) → tiny placeholder.
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6">
      <div className="text-sm text-muted-foreground">
        {onLoginRoute ? "Please sign in to continue." : "Redirecting to sign in…"}
      </div>
    </div>
  );
}
