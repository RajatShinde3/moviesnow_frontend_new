"use client";

/**
 * =============================================================================
 * Page · Settings · Sessions (Best-of-best)
 * =============================================================================
 * Production-grade page for managing **active authentication sessions**.
 *
 * What this page does
 * -------------------
 * • Provides consistent layout, copy, and no-store hints.
 * • Hosts your ready-made <SessionsTable /> which:
 *    - Lists sessions (current highlighted), normalizes fields.
 *    - Supports “Revoke” (single), “Revoke others”, and “Revoke all”.
 *    - Handles **step-up (reauth)** via <ReauthDialog/> and automatic retry.
 *    - Ships A11y-first design, skeleton states, and assertive inline errors.
 * • Adds a safe client-only **Refresh** that remounts the table (no server roundtrip).
 *
 * Integration notes
 * -----------------
 * 1) Ensure <ToastsRoot /> and <ReauthDialogProvider /> are mounted globally.
 * 2) Server route should send `Cache-Control: no-store`; we hint client-side too.
 * 3) If you want to hide the table’s built-in toolbar, pass `hideToolbar` to <SessionsTable />.
 */

import * as React from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { PATHS } from "@/lib/env";
// Your component already imports the necessary hooks and handles reauth/toasts.
import SessionsTable from "@/components/tables/SessionsTable";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function SessionsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Active sessions</h1>
            <p id="sessions-desc" className="mt-2 text-sm text-muted-foreground">
              Review where your account is signed in. Revoke any session you don’t recognize, or sign out everywhere.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
            aria-label="Refresh sessions"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </header>

      {/* Table (handles list/revoke/reauth internally) */}
      <section
        aria-labelledby="sessions-heading"
        aria-describedby="sessions-desc"
        className="rounded-xl border bg-card/50 shadow-sm"
      >
        <h2 id="sessions-heading" className="sr-only">
          Session list
        </h2>
        {/* Remount on refreshKey to force a clean reload without coupling to table internals */}
        <SessionsTable key={refreshKey} className="bg-transparent" />
        {/* If your table supports props like `hideToolbar` or `pageSize`, pass them here. */}
      </section>

      {/* Footer nav */}
      <footer className="mt-8 text-sm text-muted-foreground">
        <Link
          href={PATHS.settingsSecurity || "/settings/security"}
          className="font-medium underline underline-offset-4 hover:text-foreground"
          prefetch
        >
          Back to Security
        </Link>
      </footer>

      {/* Helpful tip */}
      <aside className="mt-6 rounded-lg border bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
          Tip: If you lost a device, revoke unknown sessions here and then{" "}
          <Link
            href={PATHS.settingsPassword || "/settings/security/password"}
            prefetch
            className="underline underline-offset-4 hover:text-foreground"
          >
            change your password
          </Link>
          .
        </p>
      </aside>
    </main>
  );
}
