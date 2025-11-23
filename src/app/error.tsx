// app/error.tsx
"use client";

/**
 * =============================================================================
 * Segment Error Boundary (App Router)
 * =============================================================================
 * Catches render/async errors inside this route segment tree.
 * - A11y: assertive live region, focus handoff, keyboard-first controls.
 * - UX: Retry, Reload, Go Home. Optional details toggle with safe copy.
 * - DX: Logs to console; plug in your error reporter if desired.
 *
 * Note: For a *global* boundary that wraps the whole app, create
 * `app/global-error.tsx` (that one *does* include <html><body/>).
 */

import * as React from "react";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const isDev = process.env.NODE_ENV !== "production";

export default function SegmentError({ error, reset }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [showDetails, setShowDetails] = React.useState(isDev);
  const [copied, setCopied] = React.useState(false);

  // Focus the banner when the error boundary renders
  React.useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Minimal client-side reporting hook (replace with your own)
  React.useEffect(() => {
    // Your reporter could be Sentry, LogRocket, etc.
    // window.__reportError?.(error);
    // Always log to console in dev
    console.error(error);
  }, [error]);

  const details = [
    `Message: ${error?.message ?? "(none)"}`,
    error?.digest ? `Ref: ${error.digest}` : null,
    error?.stack ? `\nStack:\n${error.stack}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  async function copyDetails() {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      aria-live="assertive"
      className="flex min-h-screen items-center justify-center px-4"
    >
      <div className="mx-auto max-w-2xl text-center">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute h-32 w-32 animate-pulse rounded-full bg-red-500/20" />
            <svg
              className="h-24 w-24 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold sm:text-4xl">Something went wrong</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We encountered an unexpected error. Don&apos;t worry, it&apos;s not your fault.
        </p>

        {/* Error Reference */}
        {error?.digest && (
          <p className="mt-2 text-sm text-muted-foreground">
            Error Reference: <span className="font-mono">{error.digest}</span>
          </p>
        )}

        {/* Error Details Toggle */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
            aria-expanded={showDetails}
            aria-controls="error-details"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>

        {/* Collapsible technical details */}
        {showDetails && (
          <div id="error-details" className="mt-6 rounded-lg border bg-card p-4 text-left">
            <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">
              {details}
            </pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyDetails}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
              >
                {copied ? "Copied!" : "Copy Details"}
              </button>
              <a
                href={`mailto:support@moviesnow.com?subject=App%20Error&body=${encodeURIComponent(details)}`}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
              >
                Email Support
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-6 py-3 text-sm font-medium shadow-sm transition hover:bg-accent"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reload Page
          </button>
          <Link
            href="/home"
            className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-6 py-3 text-sm font-medium shadow-sm transition hover:bg-accent"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 rounded-lg border bg-card p-6 text-left">
          <h2 className="mb-4 font-semibold">What can you do?</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Try refreshing the page using the button above</li>
            <li>• Clear your browser cache and cookies</li>
            <li>• Check your internet connection</li>
            <li>• Try accessing the page later</li>
            <li>
              • If the problem persists, contact our support team with the error
              reference above
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
