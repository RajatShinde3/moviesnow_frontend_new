// components/ui/Top10Row.tsx
/**
 * =============================================================================
 * Top 10 Trending Row - Netflix-Style Ranked List
 * =============================================================================
 * Shows top 10 trending titles with large numbered badges
 */

"use client";

import * as React from "react";
import Link from "next/link";
import type { Title } from "@/lib/api/types";

interface Top10RowProps {
  titles: Title[];
  title?: string;
  country?: string;
}

export function Top10Row({ titles, title = "Top 10", country }: Top10RowProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 600;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const top10Titles = titles.slice(0, 10);

  return (
    <div className="group/row relative">
      {/* Header */}
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        {country && (
          <span className="text-sm text-muted-foreground">in {country} Today</span>
        )}
      </div>

      {/* Scroll Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 flex h-16 w-12 -translate-y-1/2 items-center justify-center bg-black/80 opacity-0 transition-opacity hover:bg-black/90 group-hover/row:opacity-100"
        >
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 flex h-16 w-12 -translate-y-1/2 items-center justify-center bg-black/80 opacity-0 transition-opacity hover:bg-black/90 group-hover/row:opacity-100"
        >
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {top10Titles.map((title, index) => (
          <Top10Card key={title.id} title={title} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

interface Top10CardProps {
  title: Title;
  rank: number;
}

function Top10Card({ title, rank }: Top10CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link
      href={`/title/${title.slug || title.id}`}
      className="group relative flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex h-64 w-40 items-end transition-transform duration-300 group-hover:scale-105 sm:h-80 sm:w-48">
        {/* Giant Rank Number */}
        <div className="absolute bottom-0 left-0 z-0 flex items-end">
          <svg
            className="h-auto w-32 sm:w-40"
            viewBox="0 0 200 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outline */}
            <text
              x="50%"
              y="90%"
              fontSize="280"
              fontWeight="900"
              fill="transparent"
              stroke="#ffffff"
              strokeWidth="12"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
            >
              {rank}
            </text>
            {/* Fill */}
            <text
              x="50%"
              y="90%"
              fontSize="280"
              fontWeight="900"
              fill="#1a1a1a"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
            >
              {rank}
            </text>
          </svg>
        </div>

        {/* Poster Image */}
        <div className="relative z-10 ml-12 h-full w-full overflow-hidden rounded-lg bg-muted shadow-xl sm:ml-16">
          {title.poster_url && (
            <img
              src={title.poster_url}
              alt={title.name}
              className="h-full w-full object-cover"
            />
          )}

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-x-0 bottom-0 p-3">
              <h3 className="line-clamp-2 text-sm font-semibold text-white">
                {title.name}
              </h3>
              {title.vote_average && (
                <div className="mt-1 text-xs text-green-400">
                  {Math.round(title.vote_average * 10)}% Match
                </div>
              )}
              {title.genres && title.genres.length > 0 && (
                <div className="mt-1 text-xs text-white/60">
                  {title.genres[0].name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trending Badge */}
        <div className="absolute right-2 top-2 z-20 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white shadow-lg">
          #{rank}
        </div>
      </div>
    </Link>
  );
}
