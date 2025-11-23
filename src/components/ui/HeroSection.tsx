// components/ui/HeroSection.tsx
/**
 * =============================================================================
 * Hero Section - Netflix/Prime-style Featured Content Banner (Enterprise-Grade)
 * =============================================================================
 * Premium hero banner featuring:
 * - Cinematic backdrop with Ken Burns effect
 * - Multi-layer gradient overlays
 * - Animated content reveal
 * - Glass morphism CTA buttons
 * - Video background support (optional)
 * - Responsive design with fluid typography
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Info, Plus, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Title } from "@/lib/api/types";

export interface HeroSectionProps {
  title: Title;
  className?: string;
  showVideo?: boolean;
  autoPlayVideo?: boolean;
}

export function HeroSection({
  title,
  className,
  showVideo = false,
  autoPlayVideo = true,
}: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Calculate match percentage (Netflix-style)
  const matchPercentage = title.vote_average
    ? Math.round(title.vote_average * 10)
    : null;

  // Format runtime
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Handle video mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        "min-h-[60vh] sm:min-h-[70vh] lg:min-h-[85vh]",
        className
      )}
    >
      {/* Background Container */}
      <div className="absolute inset-0">
        {/* Backdrop Image with Ken Burns Effect */}
        {title.backdrop_url && !isVideoPlaying ? (
          <img
            src={title.backdrop_url}
            alt={title.name}
            className={cn(
              "h-full w-full object-cover object-top",
              "transition-all duration-1000",
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
              "animate-netflix-zoom"
            )}
            loading="eager"
            onLoad={() => setIsLoaded(true)}
          />
        ) : !title.backdrop_url ? (
          <div className="h-full w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
        ) : null}

        {/* Video Background (if available) */}
        {showVideo && title.trailer_url && (
          <video
            ref={videoRef}
            src={title.trailer_url}
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              "transition-opacity duration-1000",
              isVideoPlaying ? "opacity-100" : "opacity-0"
            )}
            autoPlay={autoPlayVideo}
            muted={isMuted}
            loop
            playsInline
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
          />
        )}

        {/* Multi-layer Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

        {/* Vignette Effect */}
        <div className="absolute inset-0 shadow-inset-dark" />
      </div>

      {/* Content Container */}
      <div className="relative flex h-full min-h-[60vh] sm:min-h-[70vh] lg:min-h-[85vh] flex-col justify-end">
        <div className="container mx-auto px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28">
          <div className="max-w-3xl space-y-5 sm:space-y-6">
            {/* Content Type Badge */}
            {title.type && (
              <div
                className={cn(
                  "inline-flex items-center gap-2",
                  "animate-fadeInUp opacity-0",
                  isLoaded && "opacity-100"
                )}
                style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                    {title.type === "MOVIE" ? "Film" : "Series"}
                  </span>
                </span>
                {matchPercentage && matchPercentage >= 70 && (
                  <span className="text-xs font-bold text-green-400">
                    {matchPercentage}% Match
                  </span>
                )}
              </div>
            )}

            {/* Title with Text Shadow */}
            <h1
              className={cn(
                "text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl",
                "text-shadow-lg",
                "animate-fadeInUp opacity-0"
              )}
              style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
            >
              {title.name}
            </h1>

            {/* Metadata Row */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-3 text-sm sm:text-base",
                "animate-fadeInUp opacity-0"
              )}
              style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
            >
              {/* Year */}
              {title.release_year && (
                <span className="font-medium text-white/90">
                  {title.release_year}
                </span>
              )}

              {/* Separator */}
              {title.release_year && (title.content_rating || title.runtime_minutes) && (
                <span className="h-1 w-1 rounded-full bg-white/40" />
              )}

              {/* Content Rating */}
              {title.content_rating && (
                <span className="rounded border border-white/50 px-2 py-0.5 text-xs font-medium text-white/90">
                  {title.content_rating}
                </span>
              )}

              {/* Separator */}
              {title.content_rating && title.runtime_minutes && (
                <span className="h-1 w-1 rounded-full bg-white/40" />
              )}

              {/* Runtime */}
              {title.runtime_minutes && (
                <span className="text-white/80">
                  {formatRuntime(title.runtime_minutes)}
                </span>
              )}

              {/* Separator */}
              {title.runtime_minutes && title.vote_average && (
                <span className="h-1 w-1 rounded-full bg-white/40" />
              )}

              {/* Rating */}
              {title.vote_average && (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold">{title.vote_average.toFixed(1)}</span>
                </span>
              )}

              {/* HD Badge */}
              <span className="badge-hd ml-2 text-white/80">HD</span>
            </div>

            {/* Genres */}
            {title.genres && title.genres.length > 0 && (
              <div
                className={cn(
                  "flex flex-wrap items-center gap-2",
                  "animate-fadeInUp opacity-0"
                )}
                style={{ animationDelay: "350ms", animationFillMode: "forwards" }}
              >
                {title.genres.slice(0, 4).map((genre, idx) => (
                  <React.Fragment key={genre.id}>
                    <span className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer">
                      {genre.name}
                    </span>
                    {idx < Math.min(title.genres!.length - 1, 3) && (
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Overview/Description */}
            {title.overview && (
              <p
                className={cn(
                  "line-clamp-3 max-w-2xl text-base text-white/80 sm:text-lg",
                  "leading-relaxed",
                  "animate-fadeInUp opacity-0"
                )}
                style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
              >
                {title.overview}
              </p>
            )}

            {/* CTA Buttons */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-3 pt-2",
                "animate-fadeInUp opacity-0"
              )}
              style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
            >
              {/* Play Button - Primary CTA */}
              <Link
                href={`/watch/${title.type === "MOVIE" ? title.id : `${title.id}/s1/e1`}`}
                className={cn(
                  "group inline-flex items-center gap-2.5",
                  "rounded-md bg-white px-6 py-3 sm:px-8 sm:py-3.5",
                  "text-base font-bold text-black sm:text-lg",
                  "shadow-lg transition-all duration-300",
                  "hover:bg-white/90 hover:scale-105 hover:shadow-xl",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                )}
              >
                <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current transition-transform group-hover:scale-110" />
                <span>Play</span>
              </Link>

              {/* More Info Button - Secondary CTA */}
              <Link
                href={`/title/${title.slug || title.id}`}
                className={cn(
                  "group inline-flex items-center gap-2.5",
                  "rounded-md px-6 py-3 sm:px-8 sm:py-3.5",
                  "text-base font-semibold text-white sm:text-lg",
                  "glass-dark",
                  "transition-all duration-300",
                  "hover:bg-white/20 hover:scale-105",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                )}
              >
                <Info className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:scale-110" />
                <span>More Info</span>
              </Link>

              {/* Add to List Button */}
              <button
                className={cn(
                  "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center",
                  "rounded-full border-2 border-white/50",
                  "bg-black/30 backdrop-blur-sm",
                  "text-white transition-all duration-300",
                  "hover:border-white hover:bg-black/50 hover:scale-110",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                )}
                aria-label="Add to My List"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Volume Control (if video is playing) */}
              {showVideo && title.trailer_url && isVideoPlaying && (
                <button
                  onClick={toggleMute}
                  className={cn(
                    "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center",
                    "rounded-full border-2 border-white/50",
                    "bg-black/30 backdrop-blur-sm",
                    "text-white transition-all duration-300",
                    "hover:border-white hover:bg-black/50 hover:scale-110",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  )}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade for Content Below */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
