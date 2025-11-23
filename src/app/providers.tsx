// app/providers.tsx
"use client";

/**
 * =============================================================================
 * Providers — Enterprise-Grade Provider Composition
 * =============================================================================
 * Mounts global client-side providers once for the whole app:
 *  • ReactQueryProvider (server state, caching, mutations)
 *  • ReauthDialogProvider (step-up authentication flows)
 *  • SubscriptionProvider (subscription state management)
 *  • ToastsRoot (portal for useToast notifications)
 *  • ErrorBoundary (graceful error recovery)
 *
 * Architecture Notes
 * ------------------
 * • Provider order matters: React Query → Auth → Subscription → UI
 * • <React.Suspense/> keeps lazy client components from throwing during
 *   transition boundaries without introducing layout shifts.
 * • Keep portals after children so they render at the end of <body>.
 * • Error boundaries catch and recover from component-level failures.
 *
 * Performance
 * -----------
 * • All providers are client-side only ("use client")
 * • Suspense boundaries prevent cascading loading states
 * • React Query handles request deduplication and caching
 */

import * as React from "react";
import ToastsRoot from "@/components/feedback/Toasts";
import { ReauthProvider } from "@/components/ReauthDialog";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

/**
 * Enterprise-grade Error Boundary for graceful failure recovery.
 * Prevents entire app crashes from component-level errors.
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error monitoring service (Sentry, etc.)
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
              <h2 className="mb-2 text-lg font-semibold text-destructive">
                Something went wrong
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                We encountered an unexpected error. Please refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ReactQueryProvider>
        <ReauthProvider>
          <SubscriptionProvider>
            {/* Wrap app children with the Toast provider so useToast() works anywhere */}
            <ToastsRoot>
              <React.Suspense fallback={null}>{children}</React.Suspense>
            </ToastsRoot>
          </SubscriptionProvider>
        </ReauthProvider>
      </ReactQueryProvider>
    </ErrorBoundary>
  );
}
