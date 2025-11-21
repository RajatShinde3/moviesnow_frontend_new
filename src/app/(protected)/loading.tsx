// app/(protected)/loading.tsx
/**
 * =============================================================================
 * Loading State for Protected Routes
 * =============================================================================
 * Beautiful loading spinner shown during page transitions
 */

import * as React from "react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>

        {/* Loading Text */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Loading</span>
          <span className="animate-pulse">.</span>
          <span className="animate-pulse animation-delay-200">.</span>
          <span className="animate-pulse animation-delay-400">.</span>
        </div>
      </div>
    </div>
  );
}
