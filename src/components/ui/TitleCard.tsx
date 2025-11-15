// components/ui/TitleCard.tsx
/**
 * =============================================================================
 * Title Card - Netflix-style content card
 * =============================================================================
 * Displays movie/series with poster, title, and metadata.
 * Optimized for performance with lazy-loaded images.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Title } from "@/lib/api/types";

export interface TitleCardProps {
  title: Title;
  size?: "sm" | "md" | "lg";
  showMetadata?: boolean;
  className?: string;
  priority?: boolean;
}

export function TitleCard({
  title,
  size = "md",
  showMetadata = false,
  className,
  priority = false,
}: TitleCardProps) {
  const sizeClasses = {
    sm: "w-32 sm:w-40",
    md: "w-40 sm:w-48",
    lg: "w-48 sm:w-56",
  };

  const aspectRatio = "aspect-[2/3]";

  return (
    <Link
      href={`/title/${title.slug || title.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-md transition-transform hover:scale-105",
        sizeClasses[size],
        className
      )}
    >
      {/* Poster Image */}
      <div className={cn("relative bg-muted", aspectRatio)}>
        {title.poster_url ? (
          <img
            src={title.poster_url}
            alt={title.name}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
            <span className="text-4xl opacity-20">🎬</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-full flex-col justify-end p-3">
            <h3 className="line-clamp-2 text-sm font-semibold text-white">
              {title.name}
            </h3>
            {showMetadata && (
              <div className="mt-1 flex items-center gap-2 text-xs text-white/80">
                {title.release_year && <span>{title.release_year}</span>}
                {title.content_rating && (
                  <span className="rounded border border-white/40 px-1">
                    {title.content_rating}
                  </span>
                )}
                {title.vote_average && (
                  <span className="flex items-center gap-1">
                    ⭐ {title.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title below (optional) */}
      {!showMetadata && (
        <div className="mt-2">
          <h3 className="line-clamp-1 text-sm font-medium">{title.name}</h3>
          {title.release_year && (
            <p className="text-xs text-muted-foreground">{title.release_year}</p>
          )}
        </div>
      )}
    </Link>
  );
}
