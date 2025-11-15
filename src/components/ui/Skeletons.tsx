// components/ui/Skeletons.tsx
/**
 * =============================================================================
 * Skeleton Loading States
 * =============================================================================
 * Loading placeholders for various components.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function TitleCardSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-32 sm:w-40",
    md: "w-40 sm:w-48",
    lg: "w-48 sm:w-56",
  };

  return (
    <div className={cn("space-y-2", sizeClasses[size])}>
      <Skeleton className="aspect-[2/3] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function TitleGridSkeleton({
  count = 12,
  size = "md",
}: {
  count?: number;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {Array.from({ length: count }).map((_, i) => (
        <TitleCardSkeleton key={i} size={size} />
      ))}
    </div>
  );
}

export function TitleRowSkeleton({
  count = 7,
  size = "md",
}: {
  count?: number;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <TitleCardSkeleton size={size} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg"
      style={{ aspectRatio: "21/9" }}
    >
      <Skeleton className="h-full w-full" />
      <div className="absolute bottom-0 left-0 p-6 sm:p-10 lg:p-16">
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
