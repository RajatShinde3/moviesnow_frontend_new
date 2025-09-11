// app/(public)/layout.tsx
/**
 * =============================================================================
 * Layout · (public)
 * =============================================================================
 * Minimal shell for unauthenticated pages (Login, Signup, Verify Email, Reset).
 * - Accessible: skip-to-content, semantic <main>, focus handoff.
 * - Resilient: dynamic/no-store hints, suspense fallback.
 * - SEO safety: noindex for auth flows.
 */

import * as React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const revalidate = 0;
export const dynamic = "force-dynamic";
// Prefer no-store across this segment; pairs with your route headers.
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  robots: { index: false, follow: false }, // keep auth pages out of search
};

function SkipToContent() {
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
    >
      Skip to main content
    </a>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh] bg-background">
      <SkipToContent />
      <Header />
      <main
        id="content"
        role="main"
        tabIndex={-1} // target for skip link focus
        className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <React.Suspense
          fallback={
            <div
              className="h-24 animate-pulse rounded-lg bg-muted"
              aria-hidden
            />
          }
        >
          {children}
        </React.Suspense>
      </main>
    </div>
  );
}
