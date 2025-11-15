// app/(protected)/title/[slug]/SeasonsSection.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Season } from "@/lib/api/types";

interface SeasonsSectionProps {
  seasons: Season[];
  titleId: string;
}

export function SeasonsSection({ seasons, titleId }: SeasonsSectionProps) {
  const [selectedSeason, setSelectedSeason] = React.useState(seasons[0]);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Episodes</h2>

        {/* Season Selector */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            {selectedSeason.name || `Season ${selectedSeason.season_number}`}
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-md border bg-background shadow-lg">
                {seasons.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => {
                      setSelectedSeason(season);
                      setIsOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    {season.name || `Season ${season.season_number}`}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Season Info */}
      {selectedSeason.overview && (
        <p className="text-sm text-muted-foreground">{selectedSeason.overview}</p>
      )}

      {/* Episodes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {selectedSeason.episodes?.map((episode, index) => (
          <Link
            key={episode.id}
            href={`/watch/${titleId}/s${selectedSeason.season_number}/e${episode.episode_number}`}
            className="group overflow-hidden rounded-lg border bg-card transition-all hover:border-primary hover:shadow-lg"
          >
            {/* Episode Still */}
            <div className="relative aspect-video overflow-hidden bg-muted">
              {episode.still_url ? (
                <img
                  src={episode.still_url}
                  alt={episode.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
                  <span className="text-4xl opacity-20">▶</span>
                </div>
              )}

              {/* Episode Number Badge */}
              <div className="absolute left-2 top-2 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white">
                {episode.episode_number}
              </div>

              {/* Play Icon on Hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-full bg-white p-3">
                  <svg className="h-6 w-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Episode Info */}
            <div className="p-4">
              <h3 className="font-medium line-clamp-1">{episode.name}</h3>
              {episode.runtime_minutes && (
                <p className="mt-1 text-xs text-muted-foreground">{episode.runtime_minutes} min</p>
              )}
              {episode.overview && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {episode.overview}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
