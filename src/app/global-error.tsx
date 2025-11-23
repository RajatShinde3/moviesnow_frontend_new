// app/global-error.tsx
"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="mx-auto w-full max-w-2xl px-4 py-16">
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border bg-destructive/5 p-6 text-sm shadow-sm"
        >
          <div className="text-destructive font-medium">Something went wrong</div>
          <p className="mt-1 text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          {error?.digest ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Ref: <span className="font-mono">{error.digest}</span>
            </p>
          ) : null}
          <div className="mt-4">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
