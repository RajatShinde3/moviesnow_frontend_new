"use client";

// app/(protected)/watch/[id]/page.tsx
/**
 * =============================================================================
 * Watch Page - Movie Playback
 * =============================================================================
 */

import * as React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api/services";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { TitleRow } from "@/components/ui/TitleRow";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function WatchMoviePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const startTime = searchParams.get("t");

  const [title, setTitle] = React.useState<any>(null);
  const [similar, setSimilar] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const titleData = await api.discovery.getTitle(id);

        if (!titleData) {
          setError("Title not found");
          return;
        }

        // If it's a series, redirect to first episode
        if (titleData.type === "SERIES") {
          const seasons = await api.discovery.getSeasons(id);
          if (seasons && seasons.length > 0 && seasons[0].episodes && seasons[0].episodes.length > 0) {
            router.push(`/watch/${id}/s${seasons[0].season_number}/e1`);
            return;
          }
          setError("No episodes found");
          return;
        }

        setTitle(titleData);

        // Fetch similar titles
        const similarData = await api.discovery.browse({
          genres: titleData.genres?.map((g: any) => g.slug) || [],
          page_size: 20,
        });

        setSimilar(similarData);
      } catch (err) {
        console.error("Failed to load movie:", err);
        setError("Failed to load movie");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !title) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Oops!</h1>
          <p className="text-white/70 mb-6">{error || "Title not found"}</p>
          <Link
            href="/"
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

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
              {title.genres.map((genre: any) => (
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
              titles={similar.items.filter((t: any) => t.id !== id).slice(0, 20)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
