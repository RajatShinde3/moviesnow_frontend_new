// components/ui/TitleRow.tsx
/**
 * =============================================================================
 * Title Row - Horizontal scrollable row of titles
 * =============================================================================
 * Netflix-style horizontal scrolling row with optional title.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Title } from "@/lib/api/types";
import { TitleCard } from "./TitleCard";

export interface TitleRowProps {
  title?: string;
  titles: Title[];
  size?: "sm" | "md" | "lg";
  showMetadata?: boolean;
  viewAllHref?: string;
  className?: string;
}

export function TitleRow({
  title,
  titles,
  size = "md",
  showMetadata = true,
  viewAllHref,
  className,
}: TitleRowProps) {
  if (titles.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-sm text-primary hover:underline"
            >
              View all →
            </Link>
          )}
        </div>
      )}

      {/* Scrollable Row */}
      <div className="relative">
        <div
          className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20"
          style={{ scrollbarGutter: "stable" }}
        >
          {titles.map((item) => (
            <div key={item.id} className="flex-shrink-0">
              <TitleCard
                title={item}
                size={size}
                showMetadata={showMetadata}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
