// components/TitleDetail.tsx
/**
 * =============================================================================
 * Title Detail Component
 * =============================================================================
 * Best Practices:
 * - Complete title information
 * - Episode browser for series
 * - Cast/crew with photos
 * - Reviews section
 * - Similar recommendations
 * - Watchlist/share actions
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import { cn } from "@/lib/cn";
import { ReviewSystem } from "./ReviewSystem";
import {
  Play,
  Plus,
  Check,
  Share2,
  Star,
  Calendar,
  Clock,
  Users,
  ChevronDown,
  Download,
} from "lucide-react";

interface TitleData {
  id: string;
  title: string;
  slug: string;
  type: "movie" | "series";
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  release_year?: number;
  rating?: number;
  runtime_minutes?: number;
  genres: string[];
  overview?: string;
  tagline?: string;
  cast: { id: string; name: string; character: string; photo_url?: string }[];
  crew: { id: string; name: string; role: string; photo_url?: string }[];
  seasons?: Season[];
  total_episodes?: number;
  similar: { id: string; title: string; slug: string; poster_url?: string }[];
}

interface Season {
  id: string;
  season_number: number;
  name: string;
  episode_count: number;
  overview?: string;
  poster_url?: string;
  episodes: Episode[];
}

interface Episode {
  id: string;
  episode_number: number;
  title: string;
  overview?: string;
  still_url?: string;
  runtime_minutes?: number;
  air_date?: string;
}

export function TitleDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedSeason, setSelectedSeason] = React.useState(1);
  const [showTrailer, setShowTrailer] = React.useState(false);

  // Fetch title details
  const { data: title, isLoading } = useQuery({
    queryKey: ["title", slug],
    queryFn: async () => {
      const response = await fetch(`/api/v1/titles/${slug}`, { credentials: "include" });
      if (!response.ok) throw new Error("Title not found");
      return response.json();
    },
  });

  // Check if in watchlist
  const { data: inWatchlist } = useQuery({
    queryKey: ["watchlist-check", title?.id],
    queryFn: async () => {
      if (!title?.id) return false;
      const profiles = await api.profiles.list();
      if (!profiles || profiles.length === 0) return false;
      const activeProfile = profiles.find(p => p.is_active) || profiles[0];
      if (!activeProfile) return false;

      const response = await fetch(
        `/api/v1/users/${activeProfile.id}/watchlist/${title.id}/check`,
        { credentials: "include" }
      );
      if (!response.ok) return false;
      const data = await response.json();
      return data.in_watchlist;
    },
    enabled: !!title?.id,
  });

  // Add to watchlist mutation
  const watchlistMutation = useMutation({
    mutationFn: async () => {
      const profiles = await api.profiles.list();
      if (!profiles || profiles.length === 0) throw new Error("No profiles found");
      const activeProfile = profiles.find(p => p.is_active) || profiles[0];

      const method = inWatchlist ? "DELETE" : "POST";
      const response = await fetch(
        `/api/v1/users/${activeProfile.id}/watchlist/${title.id}`,
        { method, credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to update watchlist");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist-check", title?.id] });
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  // Share functionality
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: title?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="h-[70vh] animate-pulse bg-gray-900" />
        <div className="mx-auto max-w-7xl p-8">
          <div className="h-8 w-1/2 animate-pulse rounded bg-gray-900" />
        </div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Title not found</h1>
          <button
            onClick={() => router.push("/browse")}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            Browse titles
          </button>
        </div>
      </div>
    );
  }

  const currentSeason = title.seasons?.find((s: Season) => s.season_number === selectedSeason);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px]">
        {/* Background */}
        <div className="absolute inset-0">
          {title.backdrop_url ? (
            <img
              src={title.backdrop_url}
              alt={title.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-gray-900 to-gray-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Poster */}
              <div className="hidden flex-shrink-0 lg:block">
                {title.poster_url && (
                  <img
                    src={title.poster_url}
                    alt={title.title}
                    className="h-80 w-56 rounded-lg object-cover shadow-xl"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                {title.tagline && (
                  <p className="mb-2 text-lg italic text-gray-400">{title.tagline}</p>
                )}

                <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                  {title.title}
                </h1>

                {/* Meta Info */}
                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  {title.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                      <span className="font-semibold">{title.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {title.release_year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {title.release_year}
                    </div>
                  )}
                  {title.runtime_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.floor(title.runtime_minutes / 60)}h {title.runtime_minutes % 60}m
                    </div>
                  )}
                  {title.type === "series" && title.total_episodes && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {title.seasons?.length} Seasons • {title.total_episodes} Episodes
                    </div>
                  )}
                </div>

                {/* Genres */}
                {title.genres?.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {title.genres.map((genre: string) => (
                      <span
                        key={genre}
                        className="rounded-full bg-gray-700/50 px-3 py-1 text-sm text-gray-300"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Overview */}
                {title.overview && (
                  <p className="mb-6 max-w-3xl text-gray-300 line-clamp-3 lg:line-clamp-none">
                    {title.overview}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push(`/watch/${title.id}`)}
                    className="flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-bold text-black transition-colors hover:bg-gray-200"
                  >
                    <Play className="h-5 w-5" fill="currentColor" />
                    Play
                  </button>

                  {title.trailer_url && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="flex items-center gap-2 rounded-lg bg-gray-600/80 px-6 py-3 font-bold text-white transition-colors hover:bg-gray-600"
                    >
                      <Play className="h-5 w-5" />
                      Trailer
                    </button>
                  )}

                  <button
                    onClick={() => watchlistMutation.mutate()}
                    disabled={watchlistMutation.isPending}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-6 py-3 font-bold transition-colors",
                      inWatchlist
                        ? "bg-green-600/80 text-white hover:bg-green-600"
                        : "bg-gray-600/80 text-white hover:bg-gray-600"
                    )}
                  >
                    {inWatchlist ? (
                      <>
                        <Check className="h-5 w-5" />
                        In Watchlist
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        Watchlist
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 rounded-lg bg-gray-600/80 px-4 py-3 font-bold text-white transition-colors hover:bg-gray-600"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>

                  <button className="flex items-center gap-2 rounded-lg bg-gray-600/80 px-4 py-3 font-bold text-white transition-colors hover:bg-gray-600">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Episodes (for series) */}
        {title.type === "series" && title.seasons?.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Episodes</h2>

              {/* Season Selector */}
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                  className="appearance-none rounded-lg bg-gray-900 py-2 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {title.seasons.map((season: Season) => (
                    <option key={season.id} value={season.season_number}>
                      Season {season.season_number}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Episode List */}
            <div className="space-y-3">
              {currentSeason?.episodes?.map((episode: Episode) => (
                <div
                  key={episode.id}
                  onClick={() =>
                    router.push(`/watch/${title.id}?s=${selectedSeason}&e=${episode.episode_number}`)
                  }
                  className="group flex cursor-pointer gap-4 rounded-lg bg-gray-900 p-4 transition-colors hover:bg-gray-800"
                >
                  {/* Thumbnail */}
                  <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded bg-gray-800">
                    {episode.still_url ? (
                      <img
                        src={episode.still_url}
                        alt={episode.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Play className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-10 w-10 text-white" fill="white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Episode {episode.episode_number}</p>
                        <h3 className="font-semibold text-white">{episode.title}</h3>
                      </div>
                      {episode.runtime_minutes && (
                        <span className="text-sm text-gray-400">{episode.runtime_minutes}m</span>
                      )}
                    </div>
                    {episode.overview && (
                      <p className="mt-2 text-sm text-gray-400 line-clamp-2">{episode.overview}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cast */}
        {title.cast?.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-bold text-white">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {title.cast.slice(0, 10).map((person: TitleData["cast"][0]) => (
                <div key={person.id} className="flex-shrink-0 text-center">
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-gray-800">
                    {person.photo_url ? (
                      <img
                        src={person.photo_url}
                        alt={person.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl text-gray-600">
                        {person.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-white">{person.name}</p>
                  <p className="text-xs text-gray-400">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mb-12">
          <ReviewSystem titleId={title.id} titleName={title.title} />
        </section>

        {/* Similar Titles */}
        {title.similar?.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">More Like This</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {title.similar.slice(0, 6).map((item: TitleData["similar"][0]) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/title/${item.slug}`)}
                  className="cursor-pointer overflow-hidden rounded-lg bg-gray-900 transition-transform hover:scale-105"
                >
                  <div className="aspect-[2/3] bg-gray-800">
                    {item.poster_url ? (
                      <img
                        src={item.poster_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Play className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="truncate text-sm font-medium text-white">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailer && title.trailer_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div className="aspect-video w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={title.trailer_url}
              className="h-full w-full rounded-lg"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
