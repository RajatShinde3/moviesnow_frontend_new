// app/offline/page.tsx
/**
 * =============================================================================
 * Offline Page - Shown when user has no internet connection
 * =============================================================================
 */

import * as React from "react";
import Link from "next/link";
import { WifiOff, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute h-32 w-32 animate-pulse rounded-full bg-muted" />
            <WifiOff className="relative h-24 w-24 text-muted-foreground" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold sm:text-4xl">You&apos;re Offline</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          It looks like you&apos;ve lost your internet connection. But don&apos;t worry!
        </p>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Button
            size="lg"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Button>

          <Button size="lg" variant="outline" asChild className="w-full">
            <Link href="/downloads">
              <Download className="h-5 w-5" />
              View Downloaded Content
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-12 rounded-lg border bg-muted/50 p-6 text-left text-sm">
          <h3 className="mb-3 font-semibold">While You&apos;re Offline:</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Check your internet connection</li>
            <li>• Watch downloaded content</li>
            <li>• Browse cached pages</li>
            <li>• Changes will sync when you&apos;re back online</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
