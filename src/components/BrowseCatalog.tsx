// components/BrowseCatalog.tsx
/**
 * =============================================================================
 * Browse Catalog Component
 * =============================================================================
 * Best Practices:
 * - Genre-based navigation
 * - Multiple content rails
 * - Netflix-style horizontal scrolling
 * - Lazy loading images
 * - Responsive design
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Info,
  Plus,
  Star,
  Film,
  Tv,
} from "lucide-react";

interface Title {
  id: string;
  title: string;
  slug: string;
  type: "movie" | "series";
  poster_url?: string;
  backdrop_url?: string;
  release_year?: number;
  rating?: number;
  genres: string[];
  overview?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const GENRES = [
  { id: "action", name: "Action", color: "from-red-600 to-orange-600" },
  { id: "comedy", name: "Comedy", color: "from-yellow-500 to-orange-500" },
  { id: "drama", name: "Drama", color: "from-purple-600 to-blue-600" },
  { id: "horror", name: "Horror", color: "from-gray-800 to-red-900" },
  { id: "sci-fi", name: "Sci-Fi", color: "from-blue-600 to-purple-600" },
  { id: "romance", name: "Romance", color: "from-pink-500 to-red-500" },
  { id: "thriller", name: "Thriller", color: "from-gray-700 to-gray-900" },
  { id: "animation", name: "Animation", color: "from-green-400 to-blue-500" },
  { id: "documentary", name: "Documentary", color: "from-teal-600 to-green-600" },
  { id: "fantasy", name: "Fantasy", color: "from-indigo-500 to-purple-500" },
];

export function BrowseCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedGenre = searchParams.get("genre");
  const selectedType = searchParams.get("type") || "all";

  // Fetch featured content
  const { data: featured } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => {
      const response = await fetch("/api/v1/titles/featured", { credentials: "include" });
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Fetch trending
  const { data: trending } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const response = await fetch("/api/v1/titles/trending?limit=20", { credentials: "include" });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch new releases
  const { data: newReleases } = useQuery({
    queryKey: ["new-releases"],
    queryFn: async () => {
      const response = await fetch("/api/v1/titles/new-releases?limit=20", { credentials: "include" });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch top rated
  const { data: topRated } = useQuery({
    queryKey: ["top-rated"],
    queryFn: async () => {
      const response = await fetch("/api/v1/titles/top-rated?limit=20", { credentials: "include" });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch genre-specific content
  const { data: genreContent } = useQuery({
    queryKey: ["genre-content", selectedGenre],
    queryFn: async () => {
      if (!selectedGenre) return null;
      const response = await fetch(`/api/v1/titles?genre=${selectedGenre}&limit=40`, { credentials: "include" });
      if (!response.ok) return { items: [] };
      return response.json();
    },
    enabled: !!selectedGenre,
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner */}
      {featured && !selectedGenre && (
        <HeroBanner title={featured} />
      )}

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {/* Genre Grid Header */}
        {!selectedGenre && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-white">Browse by Genre</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {GENRES.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => router.push(`/browse?genre=${genre.id}`)}
                  className={cn(
                    "relative overflow-hidden rounded-lg bg-gradient-to-br p-6 text-left transition-transform hover:scale-105",
                    genre.color
                  )}
                >
                  <span className="text-lg font-bold text-white">{genre.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Genre Header */}
        {selectedGenre && (
          <div className="mb-8">
            <button
              onClick={() => router.push("/browse")}
              className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Browse
            </button>
            <h1 className="text-3xl font-bold capitalize text-white">
              {GENRES.find(g => g.id === selectedGenre)?.name || selectedGenre}
            </h1>

            {/* Type Filter */}
            <div className="mt-4 flex gap-2">
              {["all", "movie", "series"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    if (type === "all") params.delete("type");
                    else params.set("type", type);
                    router.push(`/browse?${params}`);
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors",
                    selectedType === type
                      ? "bg-white text-black"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  )}
                >
                  {type === "movie" && <Film className="h-4 w-4" />}
                  {type === "series" && <Tv className="h-4 w-4" />}
                  {type === "all" ? "All" : type === "movie" ? "Movies" : "Series"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Genre Content Grid */}
        {selectedGenre && genreContent ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {genreContent.items
              ?.filter((t: Title) => selectedType === "all" || t.type === selectedType)
              .map((title: Title) => (
                <TitleCard key={title.id} title={title} />
              ))}
          </div>
        ) : (
          <>
            {/* Content Rails */}
            {trending && trending.length > 0 && (
              <ContentRail title="Trending Now" titles={trending} />
            )}

            {newReleases && newReleases.length > 0 && (
              <ContentRail title="New Releases" titles={newReleases} />
            )}

            {topRated && topRated.length > 0 && (
              <ContentRail title="Top Rated" titles={topRated} />
            )}

            {/* Genre-specific rails */}
            {GENRES.slice(0, 5).map((genre) => (
              <GenreRail key={genre.id} genre={genre.id} genreName={genre.name} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Hero Banner Component
 */
function HeroBanner({ title }: { title: Title }) {
  const router = useRouter();

  return (
    <div className="relative h-[60vh] min-h-[400px] w-full">
      {/* Background */}
      <div className="absolute inset-0">
        {title.backdrop_url ? (
          <img
            src={title.backdrop_url}
            alt={title.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-gray-900 to-gray-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            {title.title}
          </h1>

          <div className="mb-4 flex items-center gap-4 text-sm text-gray-300">
            {title.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                {title.rating.toFixed(1)}
              </div>
            )}
            {title.release_year && <span>{title.release_year}</span>}
            <span className="capitalize">{title.type}</span>
          </div>

          {title.overview && (
            <p className="mb-6 line-clamp-3 text-gray-300">{title.overview}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/watch/${title.id}`)}
              className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-black transition-colors hover:bg-gray-200"
            >
              <Play className="h-5 w-5" fill="currentColor" />
              Play
            </button>
            <button
              onClick={() => router.push(`/title/${title.slug}`)}
              className="flex items-center gap-2 rounded-lg bg-gray-600/80 px-6 py-3 font-bold text-white transition-colors hover:bg-gray-600"
            >
              <Info className="h-5 w-5" />
              More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Content Rail Component
 */
function ContentRail({ title, titles }: { title: string; titles: Title[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!titles || titles.length === 0) return null;

  return (
    <div className="group relative mb-8">
      <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>

      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/80 p-2 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/80 p-2 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Scrollable Row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {titles.map((title) => (
          <TitleCard key={title.id} title={title} compact />
        ))}
      </div>
    </div>
  );
}

/**
 * Genre Rail Component
 */
function GenreRail({ genre, genreName }: { genre: string; genreName: string }) {
  const { data: titles } = useQuery({
    queryKey: ["genre", genre],
    queryFn: async () => {
      const response = await fetch(`/api/v1/titles?genre=${genre}&limit=20`, { credentials: "include" });
      if (!response.ok) return [];
      const data = await response.json();
      return data.items || [];
    },
  });

  if (!titles || titles.length === 0) return null;

  return <ContentRail title={genreName} titles={titles} />;
}

/**
 * Title Card Component
 */
function TitleCard({ title, compact }: { title: Title; compact?: boolean }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/title/${title.slug}`)}
      className={cn(
        "group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-gray-900 transition-transform hover:scale-105 hover:z-10",
        compact ? "w-40 sm:w-48" : "w-full"
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
        {title.poster_url ? (
          <img
            src={title.poster_url}
            alt={title.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-12 w-12 text-gray-600" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/watch/${title.id}`);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:bg-gray-200"
            >
              <Play className="h-5 w-5" fill="currentColor" />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-400 text-white hover:border-white"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      {!compact && (
        <div className="p-3">
          <h3 className="truncate font-semibold text-white">{title.title}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
            {title.release_year && <span>{title.release_year}</span>}
            {title.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
                {title.rating.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
