// app/(protected)/watch/[id]/s[season]/e[episode]/page.tsx
/**
 * =============================================================================
 * Watch Page - Episode Playback
 * =============================================================================
 */

import * as React from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api/services";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string; season: string; episode: string }>;
}

export default async function WatchEpisodePage({ params }: PageProps) {
  const { id, season: seasonParam, episode: episodeParam } = await params;
  const seasonNum = parseInt(seasonParam.replace("s", ""), 10);
  const episodeNum = parseInt(episodeParam.replace("e", ""), 10);

  try {
    const [title, seasons] = await Promise.all([
      api.discovery.getTitle(id),
      api.discovery.getSeasons(id),
    ]);

    if (!title || !seasons) {
      notFound();
    }

    const currentSeason = seasons.find((s) => s.season_number === seasonNum);
    if (!currentSeason || !currentSeason.episodes) {
      notFound();
    }

    const currentEpisode = currentSeason.episodes.find((e) => e.episode_number === episodeNum);
    if (!currentEpisode) {
      notFound();
    }

    // Find next episode
    const currentEpisodeIndex = currentSeason.episodes.findIndex((e) => e.episode_number === episodeNum);
    const nextEpisode = currentSeason.episodes[currentEpisodeIndex + 1];
    const nextSeason = !nextEpisode ? seasons.find((s) => s.season_number === seasonNum + 1) : undefined;

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
            episodeId={currentEpisode.id}
            quality="720p"
            autoPlay={true}
            onEnded={() => {
              // Auto-play next episode
              if (nextEpisode) {
                window.location.href = `/watch/${id}/s${seasonNum}/e${nextEpisode.episode_number}`;
              } else if (nextSeason && nextSeason.episodes && nextSeason.episodes.length > 0) {
                window.location.href = `/watch/${id}/s${nextSeason.season_number}/e1`;
              }
            }}
          />
        </div>

        {/* Episode Info & Navigation */}
        <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-2xl space-y-6">
            {/* Episode Title */}
            <div>
              <p className="text-sm text-white/60">
                Season {seasonNum} • Episode {episodeNum}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                {currentEpisode.name}
              </h1>
              {currentEpisode.overview && (
                <p className="mt-3 max-w-4xl text-white/80">{currentEpisode.overview}</p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-wrap gap-3">
              {currentEpisodeIndex > 0 && (
                <Button variant="info" asChild>
                  <Link href={`/watch/${id}/s${seasonNum}/e${currentSeason.episodes[currentEpisodeIndex - 1].episode_number}`}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous Episode
                  </Link>
                </Button>
              )}

              {nextEpisode && (
                <Button variant="play" asChild>
                  <Link href={`/watch/${id}/s${seasonNum}/e${nextEpisode.episode_number}`}>
                    Next Episode
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}

              {!nextEpisode && nextSeason && nextSeason.episodes && nextSeason.episodes.length > 0 && (
                <Button variant="play" asChild>
                  <Link href={`/watch/${id}/s${nextSeason.season_number}/e1`}>
                    Next Season
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Episodes List */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">All Episodes - Season {seasonNum}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {currentSeason.episodes.map((episode) => (
                  <Link
                    key={episode.id}
                    href={`/watch/${id}/s${seasonNum}/e${episode.episode_number}`}
                    className={`group overflow-hidden rounded-lg border transition-all ${
                      episode.id === currentEpisode.id
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <div className="relative aspect-video bg-black/50">
                      {episode.still_url ? (
                        <img
                          src={episode.still_url}
                          alt={episode.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-3xl text-white/20">▶</span>
                        </div>
                      )}
                      <div className="absolute left-2 top-2 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white">
                        {episode.episode_number}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-white line-clamp-1">{episode.name}</h3>
                      {episode.runtime_minutes && (
                        <p className="mt-1 text-xs text-white/60">{episode.runtime_minutes} min</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load episode:", error);
    notFound();
  }
}
