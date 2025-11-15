// components/ui/HeroSection.tsx
/**
 * =============================================================================
 * Hero Section - Large featured content banner
 * =============================================================================
 * Netflix-style hero banner with backdrop, title, and CTAs.
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Title } from "@/lib/api/types";

export interface HeroSectionProps {
  title: Title;
  className?: string;
}

export function HeroSection({ title, className }: HeroSectionProps) {
  return (
    <section
      className={cn("relative w-full overflow-hidden rounded-lg", className)}
      style={{ aspectRatio: "21/9" }}
    >
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        {title.backdrop_url ? (
          <img
            src={title.backdrop_url}
            alt={title.name}
            className="h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-primary/20 to-purple-500/20" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex h-full flex-col justify-end p-6 sm:p-10 lg:p-16">
        <div className="max-w-2xl space-y-4">
          {/* Title */}
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {title.name}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
            {title.release_year && <span>{title.release_year}</span>}
            {title.content_rating && (
              <span className="rounded border border-white/40 px-2 py-0.5">
                {title.content_rating}
              </span>
            )}
            {title.runtime_minutes && (
              <span>{Math.floor(title.runtime_minutes / 60)}h {title.runtime_minutes % 60}m</span>
            )}
            {title.vote_average && (
              <span className="flex items-center gap-1">
                ⭐ {title.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          {/* Overview */}
          {title.overview && (
            <p className="line-clamp-3 text-sm text-white/80 sm:text-base">
              {title.overview}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/watch/${title.type === "MOVIE" ? title.id : `${title.id}/s1/e1`}`}
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Play
            </Link>
            <Link
              href={`/title/${title.slug || title.id}`}
              className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              More Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
