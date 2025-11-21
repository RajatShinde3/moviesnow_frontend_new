// components/ui/ExpandedTitleCard.tsx
/**
 * =============================================================================
 * Expanded Title Card - Netflix-Style Detailed Preview
 * =============================================================================
 * Shows on hover with more details: cast, runtime, description, match %
 */

"use client";

import * as React from "react";
import Link from "next/link";
import {
  Play,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Check,
  Volume2,
  VolumeX,
  ChevronDown,
} from "lucide-react";
import type { Title } from "@/lib/api/types";

interface ExpandedTitleCardProps {
  title: Title;
  position: { x: number; y: number };
  onClose: () => void;
}

export function ExpandedTitleCard({ title, position, onClose }: ExpandedTitleCardProps) {
  const [isMuted, setIsMuted] = React.useState(true);
  const [userRating, setUserRating] = React.useState<"like" | "dislike" | null>(null);
  const [isInWatchlist, setIsInWatchlist] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Auto-play trailer
  React.useEffect(() => {
    if (videoRef.current && title.trailer_url) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, that's okay
      });
    }
  }, [title.trailer_url]);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Calculate match percentage (mock - in production use ML/AI)
  const matchPercentage = title.vote_average
    ? Math.round(title.vote_average * 10)
    : Math.floor(Math.random() * 30) + 70; // 70-100%

  const runtime = title.runtime || 120; // minutes
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  const runtimeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Expanded Card */}
      <div
        ref={cardRef}
        className="fixed z-50 w-96 overflow-hidden rounded-lg bg-zinc-900 shadow-2xl"
        style={{
          top: position.y,
          left: position.x,
          transform: "translate(-50%, -10%)",
        }}
      >
        {/* Video/Image Header */}
        <div className="relative aspect-video w-full">
          {title.trailer_url ? (
            <video
              ref={videoRef}
              src={title.trailer_url}
              className="h-full w-full object-cover"
              muted={isMuted}
              loop
              playsInline
            />
          ) : (
            <img
              src={title.backdrop_url || title.poster_url || ""}
              alt={title.name}
              className="h-full w-full object-cover"
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

          {/* Mute Toggle */}
          {title.trailer_url && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`/watch/${title.id}`}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-white font-semibold text-black transition-all hover:bg-white/90"
              onClick={onClose}
            >
              <Play className="h-5 w-5 fill-black" />
              <span>Play</span>
            </Link>

            <button
              onClick={() => setIsInWatchlist(!isInWatchlist)}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/60 bg-black/40 backdrop-blur-sm transition-all hover:border-white hover:bg-black/60"
              title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isInWatchlist ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <Plus className="h-5 w-5 text-white" />
              )}
            </button>

            <button
              onClick={() => setUserRating(userRating === "like" ? null : "like")}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                userRating === "like"
                  ? "border-white bg-white/20"
                  : "border-white/60 bg-black/40 hover:border-white hover:bg-black/60"
              } backdrop-blur-sm`}
            >
              <ThumbsUp
                className={`h-5 w-5 ${
                  userRating === "like" ? "fill-white text-white" : "text-white"
                }`}
              />
            </button>

            <button
              onClick={() =>
                setUserRating(userRating === "dislike" ? null : "dislike")
              }
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                userRating === "dislike"
                  ? "border-white bg-white/20"
                  : "border-white/60 bg-black/40 hover:border-white hover:bg-black/60"
              } backdrop-blur-sm`}
            >
              <ThumbsDown
                className={`h-5 w-5 ${
                  userRating === "dislike" ? "fill-white text-white" : "text-white"
                }`}
              />
            </button>

            <Link
              href={`/title/${title.slug || title.id}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/60 bg-black/40 backdrop-blur-sm transition-all hover:border-white hover:bg-black/60"
              onClick={onClose}
            >
              <ChevronDown className="h-5 w-5 text-white" />
            </Link>
          </div>

          {/* Metadata */}
          <div className="mt-4 flex items-center gap-2 text-sm text-white">
            <span className="font-semibold text-green-400">{matchPercentage}% Match</span>
            {title.release_year && <span>{title.release_year}</span>}
            <span className="rounded border border-white/40 px-1 text-xs">
              {title.content_rating || "PG-13"}
            </span>
            <span>{runtimeDisplay}</span>
            {title.video_quality && (
              <span className="rounded border border-white/40 px-1 text-xs">
                {title.video_quality}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-3 line-clamp-3 text-sm text-white/80">
            {title.description || title.synopsis || "No description available."}
          </p>

          {/* Cast */}
          {title.cast && title.cast.length > 0 && (
            <div className="mt-4 text-sm">
              <span className="text-white/60">Cast: </span>
              <span className="text-white/90">
                {title.cast
                  .slice(0, 3)
                  .map((c) => c.name)
                  .join(", ")}
              </span>
            </div>
          )}

          {/* Genres */}
          {title.genres && title.genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {title.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Awards/Recognition (if available) */}
          {title.awards && title.awards.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400">
              <span>🏆</span>
              <span>{title.awards[0]}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
