// app/not-found.tsx
/**
 * =============================================================================
 * 404 · Not Found (Best-of-best)
 * =============================================================================
 * Friendly, accessible “not found” page with safe “Go back”, helpful links,
 * and consistent styling with the rest of the app.
 */

import Link from "next/link";
import { headers } from "next/headers";
import { PATHS } from "@/lib/env";
import { Home, LogIn, ArrowLeft, CircleHelp, UserPlus } from "lucide-react";

function getSafeBackHref(): string | null {
  // Safely derive a same-origin back link from the Referer header
  const h = headers();
  const referer = h.get("referer");
  const host = h.get("host");
  if (!referer || !host) return null;

  try {
    const u = new URL(referer);
    // Only allow same-origin paths to avoid open redirects
    if (u.host === host && u.pathname) {
      return `${u.pathname}${u.search}${u.hash}`;
    }
  } catch {
    /* ignore malformed referer */
  }
  return null;
}

export default function NotFound() {
  const backHref = getSafeBackHref();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6 lg:px-8 text-center">
      <div className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border bg-card/50 shadow-sm">
        <span className="text-lg font-semibold">404</span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you’re looking for doesn’t exist or may have moved.
      </p>

      {/* Primary actions */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {backHref ? (
          <Link
            href={backHref}
            prefetch
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Link>
        ) : null}

        <Link
          href={PATHS.home || "/"}
          prefetch
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>

        <Link
          href={PATHS.login || "/login"}
          prefetch
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
        >
          <LogIn className="h-4 w-4" />
          Sign in
        </Link>

        <Link
          href={PATHS.signup || "/signup"}
          prefetch
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
        >
          <UserPlus className="h-4 w-4" />
          Create account
        </Link>

        <Link
          href={PATHS.helpCenter || "/help"}
          prefetch
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
        >
          <CircleHelp className="h-4 w-4" />
          Help
        </Link>
      </div>

      {/* Suggestions (optional) */}
      <div className="mx-auto mt-8 max-w-lg rounded-xl border bg-card/50 p-4 text-left text-sm shadow-sm">
        <div className="font-medium">Here are a few places to try:</div>
        <ul className="mt-2 list-inside list-disc text-muted-foreground">
          <li>
            Security settings:{" "}
            <Link
              href={PATHS.settingsSecurity || "/settings/security"}
              className="font-medium underline underline-offset-4 hover:text-foreground"
              prefetch
            >
              /settings/security
            </Link>
          </li>
          <li>
            Account activity:{" "}
            <Link
              href={PATHS.settingsActivity || "/settings/activity"}
              className="font-medium underline underline-offset-4 hover:text-foreground"
              prefetch
            >
              /settings/activity
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
