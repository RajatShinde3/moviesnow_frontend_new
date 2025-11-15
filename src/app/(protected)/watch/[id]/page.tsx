// app/(protected)/watch/[id]/page.tsx
/**
 * =============================================================================
 * Watch Page - Movie Playback
 * =============================================================================
 */

import * as React from "react";
import { notFound, redirect } from "next/navigation";
import { api } from "@/lib/api/services";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { TitleRow } from "@/components/ui/TitleRow";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function WatchMoviePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { t: startTime } = await searchParams;

  try {
    const title = await api.discovery.getTitle(id);

    if (!title) {
      notFound();
    }

    // If it's a series, redirect to first episode
    if (title.type === "SERIES") {
      const seasons = await api.discovery.getSeasons(id);
      if (seasons && seasons.length > 0 && seasons[0].episodes && seasons[0].episodes.length > 0) {
        redirect(`/watch/${id}/s${seasons[0].season_number}/e1`);
      }
      notFound();
    }

    // Fetch similar titles
    const similar = await api.discovery.browse({
      genres: title.genres?.map((g) => g.slug) || [],
      page_size: 20,
    });

    return (
      <div className="min-h-screen bg-black">
        {/* Back Button */}
        <div className="absolute left-4 top-4 z-50">
          <Link
            href={`/title/${title.slug || id}`}
            className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Details
          </Link>
        </div>

        {/* Video Player */}
        <div className="mx-auto max-w-screen-2xl">
          <VideoPlayer
            titleId={id}
            quality="720p"
            autoPlay={true}
          />
        </div>

        {/* Title Info */}
        <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-2xl">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{title.name}</h1>
            {title.overview && (
              <p className="mt-2 max-w-4xl text-white/80">{title.overview}</p>
            )}

            {/* Metadata */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/60">
              {title.release_year && <span>{title.release_year}</span>}
              {title.content_rating && (
                <span className="rounded border border-white/30 px-2 py-0.5">
                  {title.content_rating}
                </span>
              )}
              {title.runtime_minutes && (
                <span>{Math.floor(title.runtime_minutes / 60)}h {title.runtime_minutes % 60}m</span>
              )}
              {title.vote_average && <span>⭐ {title.vote_average.toFixed(1)}/10</span>}
            </div>

            {/* Genres */}
            {title.genres && title.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {title.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Similar Movies */}
          {similar && similar.items && similar.items.length > 0 && (
            <div className="mx-auto max-w-screen-2xl">
              <TitleRow
                title="More Like This"
                titles={similar.items.filter((t) => t.id !== id).slice(0, 20)}
              />
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load movie:", error);
    notFound();
  }
}
