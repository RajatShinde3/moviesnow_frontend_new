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
    // eslint-disable-next-line no-console
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
      className="mx-auto w-full max-w-2xl px-4 py-16"
    >
      <div className="rounded-xl border bg-destructive/5 p-6 text-sm shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-destructive">
              Something went wrong
            </h1>
            <p className="mt-1 text-muted-foreground">
              An unexpected error occurred. You can try again or go back home.
            </p>
            {error?.digest ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Ref: <span className="font-mono">{error.digest}</span>
              </p>
            ) : null}
          </div>

          {/* Details toggle */}
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
            aria-expanded={showDetails}
            aria-controls="error-details"
          >
            {showDetails ? "Hide details" : "Show details"}
          </button>
        </div>

        {/* Collapsible technical details (safe, copyable) */}
        {showDetails && (
          <div id="error-details" className="mt-4">
            <pre className="max-h-72 overflow-auto rounded-md border bg-background p-3 font-mono text-xs leading-relaxed">
              {details}
            </pre>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyDetails}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
              >
                {copied ? "Copied" : "Copy details"}
              </button>
              <a
                href={`mailto:support@example.com?subject=App%20Error&body=${encodeURIComponent(details)}`}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
              >
                Email support
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
          >
            Reload page
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
