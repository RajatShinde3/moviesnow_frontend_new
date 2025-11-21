// app/not-found.tsx
/**
 * =============================================================================
 * 404 Not Found Page
 * =============================================================================
 * Custom error page for routes that don't exist
 */

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home, Search, Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-flex items-center justify-center">
            <div className="text-[150px] font-bold leading-none text-muted opacity-20 sm:text-[200px]">
              404
            </div>
            <div className="absolute">
              <Film className="h-24 w-24 text-primary sm:h-32 sm:w-32" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold sm:text-4xl">Page Not Found</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Oops! The page you're looking for doesn't exist. It might have been moved
          or deleted.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/home">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/browse">
              <Film className="h-4 w-4" />
              Browse Content
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/search">
              <Search className="h-4 w-4" />
              Search
            </Link>
          </Button>
        </div>

        {/* Popular Suggestions */}
        <div className="mt-12 rounded-lg border bg-card p-6 text-left">
          <h2 className="mb-4 font-semibold">Popular Pages</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/home"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                → Home
              </Link>
            </li>
            <li>
              <Link
                href="/browse"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                → Browse All Content
              </Link>
            </li>
            <li>
              <Link
                href="/watchlist"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                → My Watchlist
              </Link>
            </li>
            <li>
              <Link
                href="/downloads"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                → Downloads
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
