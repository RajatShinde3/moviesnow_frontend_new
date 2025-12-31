// app/(protected)/settings/layout.tsx
"use client";

/**
 * =============================================================================
 * Layout · (protected)/settings
 * =============================================================================
 * Shared scaffold for all Settings pages.
 *
 * What it does
 * ------------
 * • Renders the <SettingsTab /> with the correct active tab based on the first
 *   URL segment under /settings.
 * • Gracefully maps deep security routes (mfa, recovery-codes, password) back
 *   to the "security" tab so the highlight remains consistent.
 * • Adds small A11y niceties: a "Skip to content" link and a <main> landmark.
 *
 * Notes
 * -----
 * • This is a client component because it uses `useSelectedLayoutSegments()`.
 * • If you add new tabs, extend the `TABS` list and `ALIASES` map below.
 */

import * as React from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { EnhancedSettingsNav } from "@/components/EnhancedSettingsNav";

// Canonical tab keys shown in <SettingsTab />
const TABS = ["security", "sessions", "devices", "alerts", "activity", "account", "subscription"] as const;
type TabKey = (typeof TABS)[number];

// Aliases that should highlight an existing tab (e.g., deep security pages)
const ALIASES: Record<string, TabKey> = {
  // security subroutes
  mfa: "security",
  "recovery-codes": "security",
  password: "security",
};

function resolveActive(segments: string[]): TabKey {
  const head = (segments?.[0] || "").toLowerCase();
  if ((TABS as readonly string[]).includes(head)) return head as TabKey;
  if (head in ALIASES) return ALIASES[head as keyof typeof ALIASES];
  // Unknown or bare /settings ⇒ default to "security"
  return "security";
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments(); // e.g., ["security","mfa"]
  const active = resolveActive(segments);

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#0F0F0F] to-[#1A1A1A]">
      {/* Skip link for keyboard + SR users */}
      <a
        href="#settings-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-md focus:bg-background focus:px-3 focus:py-1.5 focus:shadow"
      >
        Skip to content
      </a>

      <EnhancedSettingsNav />

      {/* Main landmark keeps pages consistent and helps SR users */}
      <main id="settings-content" className="mt-6">
        {children}
      </main>
    </div>
  );
}
