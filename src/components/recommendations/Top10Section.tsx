/**
 * =============================================================================
 * Top10Section Component
 * =============================================================================
 * Billboard-style top 10 display with large ranking numbers
 */

'use client';

import { useState } from 'react';
import { Trophy, Star, Play, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTop10 } from '@/lib/api/hooks/useRecommendations';
import { TitleItem } from '@/lib/api/services/recommendations';

interface Top10SectionProps {
  onItemClick?: (item: TitleItem) => void;
  onAddToWatchlist?: (item: TitleItem) => void;
  className?: string;
}

export default function Top10Section({
  onItemClick,
  onAddToWatchlist,
  className = '',
}: Top10SectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, isLoading, error } = useTop10('US');

  if (error) {
    return (
      <div className={`p-4 bg-red-500/10 border border-red-500/30 rounded-lg ${className}`}>
        <p className="text-red-400">Failed to load top 10</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={className}>
        <Top10Skeleton />
      </div>
    );
  }

  const items = data?.items || [];

  if (items.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const currentItem = items[currentIndex];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4">
        <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Top 10 in US</h2>
          <p className="text-sm text-gray-400">Most popular this week</p>
        </div>
      </div>

      {/* Featured Item */}
      <div className="relative group">
        {/* Background Image */}
        <div className="relative h-[500px] rounded-2xl overflow-hidden">
          {currentItem.backdrop_url ? (
            <img
              src={currentItem.backdrop_url}
              alt={currentItem.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
            {/* Rank Number */}
            <div className="flex items-start gap-6">
              <div className="text-[120px] font-black leading-none bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                #{currentIndex + 1}
              </div>

              <div className="flex-1 space-y-4">
                {/* Title */}
                <h3 className="text-5xl font-bold text-white drop-shadow-lg">
                  {currentItem.name}
                </h3>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-white">
                  {currentItem.rating_average !== undefined && currentItem.rating_average > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 backdrop-blur-sm rounded-full border border-yellow-500/30">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{currentItem.rating_average.toFixed(1)}</span>
                    </div>
                  )}
                  {currentItem.release_year && (
                    <span className="text-lg">{currentItem.release_year}</span>
                  )}
                  {currentItem.type && (
                    <>
                      <span>•</span>
                      <span className="capitalize text-lg">{currentItem.type}</span>
                    </>
                  )}
                </div>

                {/* Genres */}
                {currentItem.genres && currentItem.genres.length > 0 && (
                  <div className="flex gap-2">
                    {currentItem.genres.slice(0, 3).map((genre, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                {currentItem.description && (
                  <p className="text-gray-300 text-lg line-clamp-2 max-w-3xl">
                    {currentItem.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onItemClick?.(currentItem)}
                    className="px-8 py-3 bg-white hover:bg-white/90 rounded-lg font-bold text-black flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Play className="h-5 w-5 fill-black" />
                    Play Now
                  </button>

                  <button
                    onClick={() => onAddToWatchlist?.(currentItem)}
                    className="px-8 py-3 bg-gray-900/90 hover:bg-white/20 backdrop-blur-sm rounded-lg font-bold text-white flex items-center gap-2 transition-all duration-200 transform hover:scale-105 border border-white/30"
                  >
                    <Plus className="h-5 w-5" />
                    Add to Watchlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-12 bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'w-6 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
        {items.map((item, index) => (
          <button
            key={`${item.id}-${index}`}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-32 group/thumb transition-all duration-300 ${
              index === currentIndex ? 'scale-110' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
              {item.poster_url ? (
                <img
                  src={item.poster_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}

              {/* Rank Badge */}
              <div className="absolute top-2 left-2 h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-black text-white text-sm shadow-lg">
                {index + 1}
              </div>

              {/* Border for active item */}
              {index === currentIndex && (
                <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function Top10Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 px-4">
        <div className="h-10 w-10 bg-gray-800 rounded-lg" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-gray-800 rounded" />
          <div className="h-4 w-24 bg-gray-800 rounded" />
        </div>
      </div>

      {/* Featured Item Skeleton */}
      <div className="relative h-[500px] bg-gray-800 rounded-2xl" />

      {/* Thumbnails Skeleton */}
      <div className="flex gap-4 px-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="flex-shrink-0 w-32 aspect-[2/3] bg-gray-800 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
