/**
 * =============================================================================
 * HeroSection Component
 * =============================================================================
 * Featured content hero with auto-rotating showcase
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Info, Plus, Check, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedTitle {
  id: string;
  name: string;
  description: string;
  backdrop_url: string;
  logo_url?: string;
  trailer_url?: string;
  type: string;
  genres: string[];
  rating_average: number;
}

interface HeroSectionProps {
  featuredTitles: FeaturedTitle[];
  autoRotate?: boolean;
  rotateInterval?: number;
}

export default function HeroSection({
  featuredTitles,
  autoRotate = true,
  rotateInterval = 8000,
}: HeroSectionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const currentTitle = featuredTitles[currentIndex];

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate || featuredTitles.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredTitles.length);
    }, rotateInterval);

    return () => clearInterval(timer);
  }, [autoRotate, featuredTitles.length, rotateInterval]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredTitles.length) % featuredTitles.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredTitles.length);
  };

  const handlePlay = () => {
    router.push(`/watch/${currentTitle.id}`);
  };

  const handleMoreInfo = () => {
    router.push(`/title/${currentTitle.id}`);
  };

  return (
    <div className="relative h-screen">
      {/* Background Image/Video */}
      <div className="absolute inset-0">
        {currentTitle.trailer_url && !isMuted ? (
          <video
            key={currentTitle.id}
            autoPlay
            muted={isMuted}
            loop
            className="w-full h-full object-cover"
            src={currentTitle.trailer_url}
          />
        ) : (
          <img
            src={currentTitle.backdrop_url}
            alt={currentTitle.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 w-full">
          <div className="max-w-2xl space-y-6">
            {/* Logo or Title */}
            {currentTitle.logo_url ? (
              <img
                src={currentTitle.logo_url}
                alt={currentTitle.name}
                className="w-full max-w-md drop-shadow-2xl"
              />
            ) : (
              <h1 className="text-6xl md:text-7xl font-black text-white drop-shadow-2xl">
                {currentTitle.name}
              </h1>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-white">
              <span className="px-3 py-1 bg-red-600 font-bold text-sm rounded">
                TOP 10
              </span>
              <span className="font-semibold">{currentTitle.type.toUpperCase()}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="font-bold">{currentTitle.rating_average.toFixed(1)}</span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {currentTitle.genres.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full border border-white/20"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-white text-lg line-clamp-3 drop-shadow-lg">
              {currentTitle.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handlePlay}
                className="px-8 py-4 bg-white hover:bg-white/90 text-black rounded-lg font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 shadow-2xl"
              >
                <Play className="h-6 w-6 fill-black" />
                Play Now
              </button>

              <button
                onClick={handleMoreInfo}
                className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 border-2 border-white/30"
              >
                <Info className="h-6 w-6" />
                More Info
              </button>

              <button
                onClick={() => setIsInWatchlist(!isInWatchlist)}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105 border-2 border-white/20"
              >
                {isInWatchlist ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <Plus className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {featuredTitles.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>
        </>
      )}

      {/* Volume Control */}
      {currentTitle.trailer_url && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-32 right-8 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all border-2 border-white/20"
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6 text-white" />
          ) : (
            <Volume2 className="h-6 w-6 text-white" />
          )}
        </button>
      )}

      {/* Progress Indicators */}
      {featuredTitles.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredTitles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-12 bg-white'
                  : 'w-6 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-sm">Scroll to explore</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
