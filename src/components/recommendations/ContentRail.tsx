/**
 * =============================================================================
 * ContentRail Component
 * =============================================================================
 * Horizontal scrolling content rail with beautiful cards
 */

'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Play, Plus } from 'lucide-react';
import { TitleItem } from '@/lib/api/services/recommendations';

interface ContentRailProps {
  title: string;
  items: TitleItem[];
  onItemClick?: (item: TitleItem) => void;
  onAddToWatchlist?: (item: TitleItem) => void;
  className?: string;
}

export default function ContentRail({
  title,
  items,
  onItemClick,
  onAddToWatchlist,
  className = '',
}: ContentRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    const newScrollLeft =
      scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={`relative group ${className}`}>
      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-4 px-4">{title}</h2>

      {/* Rail Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-black/80 to-transparent w-16 flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll left"
          >
            <div className="p-2 bg-gray-900/90 rounded-full hover:bg-white/20 transition-colors">
              <ChevronLeft className="h-8 w-8 text-white" />
            </div>
          </button>
        )}

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((item, index) => (
            <ContentCard
              key={`${item.id}-${index}`}
              item={item}
              onClick={() => onItemClick?.(item)}
              onAddToWatchlist={() => onAddToWatchlist?.(item)}
            />
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-black/80 to-transparent w-16 flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll right"
          >
            <div className="p-2 bg-gray-900/90 rounded-full hover:bg-white/20 transition-colors">
              <ChevronRight className="h-8 w-8 text-white" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ContentCard Sub-Component
// ─────────────────────────────────────────────────────────────────────────────

interface ContentCardProps {
  item: TitleItem;
  onClick?: () => void;
  onAddToWatchlist?: () => void;
}

function ContentCard({ item, onClick, onAddToWatchlist }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex-shrink-0 w-48 group/card cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 transition-transform duration-300 group-hover/card:scale-105">
        {/* Poster Image */}
        {item.poster_url ? (
          <img
            src={item.poster_url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Star className="h-16 w-16 text-gray-600" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

        {/* Rating Badge */}
        {item.rating_average !== undefined && item.rating_average > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-white">
              {item.rating_average.toFixed(1)}
            </span>
          </div>
        )}

        {/* Hover Actions */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="p-3 bg-white hover:bg-white/90 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
              aria-label="Play"
            >
              <Play className="h-6 w-6 text-black fill-black" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToWatchlist?.();
              }}
              className="p-3 bg-gray-900/90 hover:bg-white/20 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
              aria-label="Add to watchlist"
            >
              <Plus className="h-6 w-6 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Title and Info */}
      <div className="mt-2">
        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover/card:text-red-400 transition-colors">
          {item.name}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          {item.release_year && <span>{item.release_year}</span>}
          {item.type && (
            <>
              <span>•</span>
              <span className="capitalize">{item.type}</span>
            </>
          )}
        </div>
        {item.genres && item.genres.length > 0 && (
          <div className="flex gap-1 mt-1">
            {item.genres.slice(0, 2).map((genre, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-400"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
