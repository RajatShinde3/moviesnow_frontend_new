// components/ui/TitleCard.tsx
/**
 * =============================================================================
 * Title Card - Netflix-style content card (Enterprise-Grade)
 * =============================================================================
 * Premium movie/series card with:
 * - Smooth hover animations with spring physics
 * - Glass morphism overlays
 * - Staggered content reveal
 * - Accessibility-first design
 * - Optimized lazy loading with blur placeholder
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Plus, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Title } from "@/lib/api/types";

export interface TitleCardProps {
  title: Title;
  size?: "sm" | "md" | "lg" | "xl";
  showMetadata?: boolean;
  showQuickActions?: boolean;
  className?: string;
  priority?: boolean;
  index?: number; // For staggered animations
}

export function TitleCard({
  title,
  size = "md",
  showMetadata = false,
  showQuickActions = true,
  className,
  priority = false,
  index = 0,
}: TitleCardProps) {
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const sizeClasses = {
    sm: "w-28 sm:w-36 md:w-40",
    md: "w-36 sm:w-44 md:w-48",
    lg: "w-44 sm:w-52 md:w-56",
    xl: "w-52 sm:w-60 md:w-64",
  };

  const aspectRatio = "aspect-[2/3]";

  // Calculate match percentage (Netflix-style)
  const matchPercentage = title.vote_average
    ? Math.round(title.vote_average * 10)
    : null;

  return (
    <Link
      href={`/title/${title.slug || title.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-lg",
        "transition-all duration-300 ease-out",
        "hover:z-10 hover:scale-[1.08]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        sizeClasses[size],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Card Container with shadow */}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-muted shadow-lg",
          "transition-shadow duration-300",
          "group-hover:shadow-2xl group-hover:shadow-black/50",
          aspectRatio
        )}
      >
        {/* Blur placeholder while loading */}
        {!isImageLoaded && (
          <div className="absolute inset-0 skeleton animate-pulse" />
        )}

        {/* Poster Image */}
        {title.poster_url ? (
          <img
            src={title.poster_url}
            alt={title.name}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setIsImageLoaded(true)}
            className={cn(
              "h-full w-full object-cover",
              "transition-all duration-500",
              isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
              "group-hover:scale-110"
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <div className="text-center">
              <span className="block text-4xl opacity-30">🎬</span>
              <span className="mt-2 block text-xs text-white/30">No Image</span>
            </div>
          </div>
        )}

        {/* Gradient Overlays */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent",
            "opacity-0 transition-opacity duration-300",
            "group-hover:opacity-100"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent",
            "opacity-0 transition-opacity duration-300",
            "group-hover:opacity-100"
          )}
        />

        {/* Quick Action Buttons */}
        {showQuickActions && (
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "flex items-center gap-2",
              "opacity-0 transition-all duration-300",
              "scale-75 group-hover:scale-100 group-hover:opacity-100"
            )}
          >
            {/* Play Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/watch/${title.id}`;
              }}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                "bg-white text-black shadow-lg",
                "transition-all duration-200",
                "hover:scale-110 hover:bg-white/90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              )}
              aria-label={`Play ${title.name}`}
            >
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </button>

            {/* Add to List Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle add to watchlist
              }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                "border-2 border-white/70 bg-black/50 backdrop-blur-sm",
                "transition-all duration-200",
                "hover:scale-110 hover:border-white hover:bg-black/70",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              )}
              aria-label={`Add ${title.name} to my list`}
            >
              <Plus className="h-4 w-4 text-white" />
            </button>

            {/* Info Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/title/${title.slug || title.id}`;
              }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                "border-2 border-white/70 bg-black/50 backdrop-blur-sm",
                "transition-all duration-200",
                "hover:scale-110 hover:border-white hover:bg-black/70",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              )}
              aria-label={`More info about ${title.name}`}
            >
              <Info className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        {/* Bottom Content Overlay */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 p-3",
            "translate-y-full transition-transform duration-300",
            "group-hover:translate-y-0"
          )}
        >
          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-bold text-white text-shadow-lg">
            {title.name}
          </h3>

          {/* Metadata */}
          {showMetadata && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              {/* Match Percentage */}
              {matchPercentage && matchPercentage >= 60 && (
                <span className="font-bold text-green-400">
                  {matchPercentage}% Match
                </span>
              )}

              {/* Year */}
              {title.release_year && (
                <span className="text-white/70">{title.release_year}</span>
              )}

              {/* Content Rating */}
              {title.content_rating && (
                <span className="badge-hd text-white/80">
                  {title.content_rating}
                </span>
              )}

              {/* Rating */}
              {title.vote_average && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {title.vote_average.toFixed(1)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* NEW Badge (if applicable) */}
        {title.release_year && title.release_year >= new Date().getFullYear() && (
          <div className="absolute left-2 top-2">
            <span className="badge-new text-white">NEW</span>
          </div>
        )}

        {/* HD Badge */}
        <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="badge-hd text-white">HD</span>
        </div>
      </div>

      {/* Title below card (when not showing inline metadata) */}
      {!showMetadata && (
        <div className="mt-2.5 space-y-1 px-0.5">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-white">
            {title.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {title.release_year && <span>{title.release_year}</span>}
            {title.content_rating && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span>{title.content_rating}</span>
              </>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
