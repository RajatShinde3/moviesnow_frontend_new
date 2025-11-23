// components/HomePage.tsx
/**
 * =============================================================================
 * Home Page Component - Netflix-Style Content Discovery
 * =============================================================================
 * Features:
 * - Hero banner with featured content
 * - Continue Watching rail
 * - Trending Now rail
 * - Top 10 in Your Region rail
 * - Personalized Recommendations rails
 * - New Releases rail
 * - Browse by Genre rails
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import type { Genre, Title as ApiTitle } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";

interface Title {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  poster_url?: string;
  backdrop_url?: string;
  overview?: string;
  release_year?: number;
  rating?: number;
  genres?: string[] | Genre[];
  type: "movie" | "series" | "MOVIE" | "SERIES";
}

// Type guard to convert ApiTitle to local Title
function normalizeTitle(t: ApiTitle): Title {
  return {
    id: t.id,
    title: t.name,
    name: t.name,
    slug: t.slug,
    poster_url: t.poster_url,
    backdrop_url: t.backdrop_url,
    overview: t.overview,
    release_year: t.release_year,
    rating: t.vote_average,
    genres: t.genres,
    type: t.type.toLowerCase() as Title["type"],
  };
}

/**
 * Content Rail Component - Horizontal scrolling title cards
 */
function ContentRail({
  title,
  titles,
  isLoading,
  numbered = false,
}: {
  title: string;
  titles?: Title[];
  isLoading: boolean;
  numbered?: boolean;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    checkScroll();
    const current = scrollRef.current;
    if (current) {
      current.addEventListener("scroll", checkScroll);
      return () => current.removeEventListener("scroll", checkScroll);
    }
  }, [titles]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold text-white">{title}</h2>
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 w-64 animate-pulse rounded-lg bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!titles || titles.length === 0) return null;

  return (
    <div className="group/rail relative mb-12">
      <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl">{title}</h2>

      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-r-lg bg-black/80 p-2 opacity-0 transition-opacity group-hover/rail:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-l-lg bg-black/80 p-2 opacity-0 transition-opacity group-hover/rail:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {titles.map((title, index) => (
          <TitleCard key={title.id} title={title} number={numbered ? index + 1 : undefined} />
        ))}
      </div>
    </div>
  );
}

/**
 * Title Card Component
 */
function TitleCard({ title, number }: { title: Title; number?: number }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    router.push(`/watch/${title.id}`);
  };

  return (
    <div
      className="group relative flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Number badge for Top 10 */}
      {number !== undefined && (
        <div className="absolute -left-4 -top-2 z-10 flex h-24 w-16 items-center justify-center">
          <svg viewBox="0 0 100 150" className="h-full w-full">
            <text
              x="50"
              y="120"
              fontSize="120"
              fontWeight="900"
              fill="white"
              stroke="black"
              strokeWidth="8"
              textAnchor="middle"
              style={{ paintOrder: "stroke fill" }}
            >
              {number}
            </text>
          </svg>
        </div>
      )}

      <div className={cn("relative w-40 sm:w-48 md:w-56", number !== undefined && "ml-8")}>
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800">
          {title.poster_url ? (
            <img
              src={title.poster_url}
              alt={title.title || title.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-600">
              <Play className="h-12 w-12" />
            </div>
          )}

          {/* Hover overlay */}
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity">
              <Play className="h-16 w-16 text-white" fill="white" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mt-2 px-1">
          <p className="truncate text-sm font-medium text-white">{title.title || title.name}</p>
          {title.release_year && (
            <p className="text-xs text-gray-400">{title.release_year}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hero Banner Component
 */
function HeroBanner({ title }: { title?: Title }) {
  const router = useRouter();

  if (!title) {
    return (
      <div className="relative h-[70vh] w-full animate-pulse bg-gray-800" />
    );
  }

  return (
    <div className="relative h-[70vh] w-full">
      {/* Background image */}
      {title.backdrop_url && (
        <img
          src={title.backdrop_url}
          alt={title.title}
          className="h-full w-full object-cover"
        />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 lg:p-16">
        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            {title.title || title.name}
          </h1>

          {title.overview && (
            <p className="mb-6 line-clamp-3 text-lg text-white/90">
              {title.overview}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/watch/${title.id}`)}
              className="flex items-center gap-2 rounded-md bg-white px-8 py-3 text-lg font-semibold text-black transition-colors hover:bg-white/90"
            >
              <Play className="h-6 w-6" fill="black" />
              Play
            </button>

            <button
              onClick={() => router.push(`/title/${title.slug}`)}
              className="flex items-center gap-2 rounded-md bg-white/20 px-8 py-3 text-lg font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <Info className="h-6 w-6" />
              More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main HomePage Component
 */
export function HomePage() {
  // Fetch home page rails data
  const { data: homeData, isLoading: homeLoading } = useQuery({
    queryKey: ["home-rails"],
    queryFn: async () => {
      const response = await fetch("/api/v1/home/rails");
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Fetch trending
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => api.discovery.getTrending(20),
  });

  // Fetch top 10
  const { data: top10Data, isLoading: top10Loading } = useQuery({
    queryKey: ["top10"],
    queryFn: async () => {
      const response = await fetch("/api/v1/top10");
      if (!response.ok) return { items: [] };
      return response.json();
    },
  });

  // Fetch new releases
  const { data: newReleases, isLoading: newReleasesLoading } = useQuery({
    queryKey: ["new-releases"],
    queryFn: () => api.discovery.getNewReleases(20),
  });

  // Fetch continue watching (from watch history)
  const { data: continueWatching, isLoading: continueLoading } = useQuery({
    queryKey: ["continue-watching"],
    queryFn: async () => {
      const profiles = await api.profiles.list();
      if (!profiles || profiles.length === 0) return [];
      const activeProfile = profiles.find(p => p.is_active) || profiles[0];

      if (!activeProfile) return [];

      const response = await fetch(
        `/api/v1/users/${activeProfile.id}/history/streams?limit=10`
      );

      if (!response.ok) return [];

      const data = await response.json();
      // Filter to items with 5-95% progress
      return data.items?.filter((item: any) => {
        const progress = (item.progress_seconds / item.duration_seconds) * 100;
        return progress > 5 && progress < 95;
      }) || [];
    },
  });

  // Get hero title (first trending item)
  const heroTitle = trending?.[0] ? normalizeTitle(trending[0]) : undefined;

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner */}
      <HeroBanner title={heroTitle} />

      {/* Content Rails */}
      <div className="relative -mt-32 px-4 sm:px-6 lg:px-8">
        {/* Continue Watching */}
        {continueWatching && continueWatching.length > 0 && (
          <ContentRail
            title="Continue Watching"
            titles={continueWatching}
            isLoading={continueLoading}
          />
        )}

        {/* Trending Now */}
        <ContentRail
          title="Trending Now"
          titles={trending}
          isLoading={trendingLoading}
        />

        {/* Top 10 in Your Region */}
        <ContentRail
          title="Top 10 in Your Region"
          titles={top10Data?.items}
          isLoading={top10Loading}
          numbered={true}
        />

        {/* New Releases */}
        <ContentRail
          title="New Releases"
          titles={newReleases}
          isLoading={newReleasesLoading}
        />

        {/* Additional rails from backend */}
        {homeData?.rails?.map((rail: any, index: number) => (
          <ContentRail
            key={index}
            title={rail.title}
            titles={rail.items}
            isLoading={false}
          />
        ))}
      </div>
    </div>
  );
}
