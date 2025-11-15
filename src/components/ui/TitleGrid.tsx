// components/ui/TitleGrid.tsx
/**
 * =============================================================================
 * Title Grid - Responsive grid for displaying content
 * =============================================================================
 * Auto-responsive grid that adapts to screen size.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { Title } from "@/lib/api/types";
import { TitleCard } from "./TitleCard";

export interface TitleGridProps {
  titles: Title[];
  size?: "sm" | "md" | "lg";
  showMetadata?: boolean;
  className?: string;
  emptyMessage?: string;
}

export function TitleGrid({
  titles,
  size = "md",
  showMetadata = false,
  className,
  emptyMessage = "No titles found",
}: TitleGridProps) {
  if (titles.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7",
        className
      )}
    >
      {titles.map((title) => (
        <TitleCard
          key={title.id}
          title={title}
          size={size}
          showMetadata={showMetadata}
        />
      ))}
    </div>
  );
}

