"use client";

// app/(protected)/title/[slug]/page.tsx
/**
 * =============================================================================
 * Title Detail Page - Complete movie/series information
 * =============================================================================
 * Netflix-style detail page with metadata, seasons, cast, reviews, and more.
 */

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import { Button } from "@/components/ui/Button";
import { TitleRow } from "@/components/ui/TitleRow";
import { Play, Plus, Check, Download, Share2, Info, Loader2 } from "lucide-react";
import type { Title, Season } from "@/lib/api/types";
import { AddToWatchlistButton } from "./AddToWatchlistButton";
import { SeasonsSection } from "./SeasonsSection";
import { CastSection } from "./CastSection";
import { ReviewsSection } from "./ReviewsSection";

export default function TitleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [title, setTitle] = React.useState<any>(null);
  const [seasons, setSeasons] = React.useState<any>(null);
  const [reviews, setReviews] = React.useState<any>(null);
  const [similar, setSimilar] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const titleData = await api.discovery.getTitleBySlug(slug);

        if (!titleData) {
          setError("Title not found");
          return;
        }

        setTitle(titleData);

        const [seasonsData, reviewsData] = await Promise.all([
          titleData.type === "SERIES" ? api.discovery.getSeasons(titleData.id) : Promise.resolve(null),
          api.reviews.getByTitle(titleData.id, 1, 10),
        ]);

        setSeasons(seasonsData);
        setReviews(reviewsData);

        // Fetch similar titles
        const similarData = await api.discovery.browse({
          genres: titleData.genres?.map((g: any) => g.slug) || [],
          page_size: 20,
        });

        setSimilar(similarData?.items || []);
      } catch (err) {
        console.error("Failed to fetch title:", err);
        setError("Failed to load title");
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (error || !title) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold text-white mb-2">Oops!</h1>
        <p className="text-white/70 mb-4">{error || "Title not found"}</p>
        <Button onClick={() => router.push("/home")} variant="play">
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Backdrop */}
      <div className="relative">
        {/* Backdrop Image */}
        <div className="relative h-[60vh] w-full overflow-hidden">
          {title.backdrop_url ? (
            <img
              src={title.backdrop_url}
              alt={title.name}
              className="h-full w-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/30 to-purple-500/30" />
          )}

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-4 pb-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-screen-2xl">
              <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
                {/* Poster */}
                <div className="flex-shrink-0">
                  <div className="w-48 overflow-hidden rounded-lg shadow-2xl lg:w-64">
                    {title.poster_url ? (
                      <img
                        src={title.poster_url}
                        alt={title.name}
                        className="aspect-[2/3] w-full object-cover"
                        loading="eager"
                      />
                    ) : (
                      <div className="flex aspect-[2/3] w-full items-center justify-center bg-muted">
                        <span className="text-6xl opacity-20">🎬</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex-1 space-y-4 text-white">
                  {/* Title */}
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                      {title.name}
                    </h1>
                    {title.original_name && title.original_name !== title.name && (
                      <p className="mt-2 text-lg text-white/70">{title.original_name}</p>
                    )}
                  </div>

                  {/* Tagline */}
                  {title.tagline && (
                    <p className="text-lg italic text-white/80">{title.tagline}</p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {title.release_year && (
                      <span className="font-medium">{title.release_year}</span>
                    )}
                    {title.content_rating && (
                      <span className="rounded border border-white/40 px-2 py-0.5">
                        {title.content_rating}
                      </span>
                    )}
                    {title.runtime_minutes && (
                      <span>
                        {Math.floor(title.runtime_minutes / 60)}h {title.runtime_minutes % 60}m
                      </span>
                    )}
                    {title.vote_average && (
                      <span className="flex items-center gap-1 font-medium">
                        ⭐ {title.vote_average.toFixed(1)}/10
                        {title.vote_count && (
                          <span className="text-xs text-white/60">
                            ({title.vote_count.toLocaleString()} votes)
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Genres */}
                  {title.genres && title.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {title.genres.map((genre: any) => (
                        <Link
                          key={genre.id}
                          href={`/genre/${genre.slug}`}
                          className="rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Overview */}
                  {title.overview && (
                    <p className="max-w-3xl text-base leading-relaxed text-white/90">
                      {title.overview}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      size="lg"
                      variant="play"
                      asChild
                    >
                      <Link
                        href={
                          title.type === "MOVIE"
                            ? `/watch/${title.id}`
                            : seasons && seasons.length > 0
                              ? `/watch/${title.id}/s${seasons[0].season_number}/e1`
                              : "#"
                        }
                      >
                        <Play className="h-5 w-5" fill="currentColor" />
                        {title.type === "MOVIE" ? "Play Movie" : "Play Series"}
                      </Link>
                    </Button>

                    <AddToWatchlistButton titleId={title.id} />

                    <Button size="lg" variant="info">
                      <Download className="h-5 w-5" />
                      Download
                    </Button>

                    <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                    {title.spoken_languages && title.spoken_languages.length > 0 && (
                      <div>
                        <span className="font-medium text-white">Languages:</span>{" "}
                        {title.spoken_languages.join(", ")}
                      </div>
                    )}
                    {title.origin_countries && title.origin_countries.length > 0 && (
                      <div>
                        <span className="font-medium text-white">Country:</span>{" "}
                        {title.origin_countries.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl space-y-12">
          {/* Seasons & Episodes (for Series) */}
          {title.type === "SERIES" && seasons && seasons.length > 0 && (
            <SeasonsSection seasons={seasons} titleId={title.id} />
          )}

          {/* Cast & Crew */}
          {title.credits && title.credits.length > 0 && (
            <CastSection credits={title.credits} />
          )}

          {/* Reviews */}
          {reviews && reviews.items && reviews.items.length > 0 && (
            <ReviewsSection reviews={reviews.items} titleId={title.id} />
          )}

          {/* Similar Titles */}
          {similar.length > 0 && (
            <TitleRow
              title="More Like This"
              titles={similar.filter((t) => t.id !== title.id).slice(0, 20)}
            />
          )}

          {/* Additional Details */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">About {title.name}</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {title.release_date && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Release Date</dt>
                  <dd className="mt-1">
                    {new Date(title.release_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              )}
              {title.status && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1 capitalize">{title.status.toLowerCase().replace("_", " ")}</dd>
                </div>
              )}
              {title.imdb_id && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">IMDb</dt>
                  <dd className="mt-1">
                    <a
                      href={`https://www.imdb.com/title/${title.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {title.imdb_id}
                    </a>
                  </dd>
                </div>
              )}
              {title.tmdb_id && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">TMDb</dt>
                  <dd className="mt-1">
                    <a
                      href={`https://www.themoviedb.org/${title.type === "MOVIE" ? "movie" : "tv"}/${title.tmdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View on TMDb
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
