// app/(protected)/layout.tsx
/**
 * =============================================================================
 * Layout · (protected)
 * =============================================================================
 * Shell for authenticated pages. Wraps all protected routes in <AuthGate/> to
 * enforce:
 *   • Signed-in status (tokens/session)
 *   • (Optionally) email verification gate inside AuthGate
 *
 * UX & A11y
 * ---------
 * • Provides a visible-on-focus “Skip to content” link.
 * • Uses a <main> landmark with a consistent content container.
 * • Streams children with a tasteful Suspense fallback skeleton.
 *
 * Caching / Streaming
 * -------------------
 * • force-dynamic + revalidate:0 ensures no caching of user-specific pages.
 * • Child routes can stream; we show a local skeleton for perceived performance.
 */

import * as React from "react";
import { ModernNavigation } from "@/components/ModernNavigation";
import AuthGate from "@/components/AuthGate";

export const revalidate = 0;
export const dynamic = "force-dynamic";
// Optional (Next 14+): uncomment if you want fetch() to default to no-store
// export const fetchCache = "force-no-store";

export default function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGate>
      {/* Skip link for keyboard + SR users */}
      <a
        href="#protected-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-md focus:bg-background focus:px-3 focus:py-1.5 focus:shadow"
      >
        Skip to content
      </a>

      {/* Global navigation */}
      <ModernNavigation />

      {/* Main content area - full width for OTT layout */}
      <main id="protected-content" className="w-full">
        <React.Suspense fallback={<ContentSkeleton />}>{children}</React.Suspense>
      </main>

      {/* Helpful noscript hint (non-blocking) */}
      <noscript>
        <div className="mx-auto mt-4 w-full max-w-6xl px-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
          JavaScript is required for secure pages. Please enable it to continue.
        </div>
      </noscript>
    </AuthGate>
  );
}

/**
 * A tiny, unobtrusive skeleton for page content while child routes stream.
 * Tailor this to your app’s common Settings page shape.
 */
function ContentSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-72 animate-pulse rounded-md bg-muted/70" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl border bg-card/50" />
        <div className="h-40 animate-pulse rounded-xl border bg-card/50" />
      </div>
      <div className="h-24 animate-pulse rounded-xl border bg-card/50" />
    </div>
  );
}
