// components/ui/TitleCardWithPreview.tsx
/**
 * =============================================================================
 * Netflix-Style Title Card with Hover Video Preview
 * =============================================================================
 * Card that shows video preview on hover after 1 second
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Plus, ChevronDown, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import type { Title } from "@/lib/api/types";
import { api } from "@/lib/api/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface TitleCardWithPreviewProps {
  title: Title;
  showMetadata?: boolean;
  priority?: boolean;
  delay?: number; // Hover delay in ms
}

export function TitleCardWithPreview({
  title,
  showMetadata = false,
  priority = false,
  delay = 1000,
}: TitleCardWithPreviewProps) {
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [isInWatchlist, setIsInWatchlist] = React.useState(false);
  const [userRating, setUserRating] = React.useState<"like" | "dislike" | null>(null);
  const hoverTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Hover delay timer
  React.useEffect(() => {
    if (isHovered) {
      hoverTimerRef.current = setTimeout(() => {
        setShowPreview(true);
      }, delay);
    } else {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      setShowPreview(false);
    }

    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [isHovered, delay]);

  // Auto-play video when preview shows
  React.useEffect(() => {
    if (showPreview && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, that's okay
      });
    } else if (!showPreview && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [showPreview]);

  const addToWatchlist = useMutation({
    mutationFn: () => api.watchlist.add(title.id),
    onSuccess: () => {
      setIsInWatchlist(true);
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const removeFromWatchlist = useMutation({
    mutationFn: async () => {
      const items = await api.watchlist.get();
      if (!items) return;
      const item = items.find((i) => i.title?.id === title.id);
      if (item) {
        await api.watchlist.remove(item.id);
      }
    },
    onSuccess: () => {
      setIsInWatchlist(false);
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const rateMutation = useMutation({
    mutationFn: (rating: "like" | "dislike") =>
      api.user.rateTitle(title.id, rating),
    onSuccess: (_, rating) => {
      setUserRating(rating);
    },
  });

  const removeRatingMutation = useMutation({
    mutationFn: () =>
      api.user.rateTitle(title.id, "like"), // Send "like" to remove (or implement dedicated remove endpoint)
    onSuccess: () => {
      setUserRating(null);
    },
  });

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWatchlist) {
      removeFromWatchlist.mutate();
    } else {
      addToWatchlist.mutate();
    }
  };

  const handleRate = (e: React.MouseEvent, rating: "like" | "dislike") => {
    e.preventDefault();
    e.stopPropagation();
    if (userRating === rating) {
      // Remove rating when clicking the same rating again
      removeRatingMutation.mutate();
    } else {
      rateMutation.mutate(rating);
    }
  };

  const imageUrl = title.poster_url || title.backdrop_url || "";
  const trailerUrl = title.trailer_url; // Assuming backend provides this

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/title/${title.slug || title.id}`}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
          {/* Static Poster */}
          {!showPreview && imageUrl && (
            <img
              src={imageUrl}
              alt={title.name}
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
          )}

          {/* Video Preview */}
          {showPreview && trailerUrl && (
            <video
              ref={videoRef}
              src={trailerUrl}
              className="h-full w-full object-cover"
              muted
              loop
              playsInline
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Hover Controls */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Play Button */}
              <Link
                href={`/watch/${title.id}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform hover:scale-110"
                onClick={(e) => e.stopPropagation()}
              >
                <Play className="h-4 w-4 fill-black text-black" />
              </Link>

              {/* Add to Watchlist */}
              <button
                onClick={toggleWatchlist}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/60 bg-black/40 backdrop-blur-sm transition-all hover:border-white hover:bg-black/60"
                title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              >
                {isInWatchlist ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Plus className="h-4 w-4 text-white" />
                )}
              </button>

              {/* Like Button */}
              <button
                onClick={(e) => handleRate(e, "like")}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  userRating === "like"
                    ? "border-white bg-white/20"
                    : "border-white/60 bg-black/40 hover:border-white hover:bg-black/60"
                } backdrop-blur-sm`}
                title="I like this"
              >
                <ThumbsUp
                  className={`h-4 w-4 ${
                    userRating === "like" ? "fill-white text-white" : "text-white"
                  }`}
                />
              </button>

              {/* Dislike Button */}
              <button
                onClick={(e) => handleRate(e, "dislike")}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  userRating === "dislike"
                    ? "border-white bg-white/20"
                    : "border-white/60 bg-black/40 hover:border-white hover:bg-black/60"
                } backdrop-blur-sm`}
                title="Not for me"
              >
                <ThumbsDown
                  className={`h-4 w-4 ${
                    userRating === "dislike" ? "fill-white text-white" : "text-white"
                  }`}
                />
              </button>

              {/* More Info */}
              <div className="flex-1" />
              <Link
                href={`/title/${title.slug || title.id}`}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/60 bg-black/40 backdrop-blur-sm transition-all hover:border-white hover:bg-black/60"
                onClick={(e) => e.stopPropagation()}
                title="More info"
              >
                <ChevronDown className="h-4 w-4 text-white" />
              </Link>
            </div>

            {/* Title & Metadata */}
            {showMetadata && (
              <div className="mt-3 space-y-1">
                <h3 className="line-clamp-1 text-sm font-semibold text-white">
                  {title.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  {title.vote_average && (
                    <span className="font-semibold text-green-400">
                      {Math.round(title.vote_average * 10)}% Match
                    </span>
                  )}
                  {title.release_year && <span>{title.release_year}</span>}
                  {title.content_rating && (
                    <span className="rounded border border-white/40 px-1">
                      {title.content_rating}
                    </span>
                  )}
                </div>
                {title.genres && title.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {title.genres.slice(0, 3).map((genre) => (
                      <span key={genre.id} className="text-xs text-white/60">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
