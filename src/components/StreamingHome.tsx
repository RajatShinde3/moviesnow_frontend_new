"use client";

/**
 * =============================================================================
 * MOVIESNOW - Content-Focused Streaming Homepage
 * =============================================================================
 *
 * Design inspired by popular streaming/download sites
 * Focus: Content cards, thumbnails, browse by genre
 * NO pricing tables, NO FAQ, NO marketing fluff
 */

import * as React from "react";
import Link from "next/link";
import { Play, Plus, Info, Star, Clock, Download } from "lucide-react";

// Dummy data - replace with API calls
const FEATURED_CONTENT = {
  title: "Demon Slayer: Kimetsu no Yaiba",
  description: "Tanjiro sets out on a dangerous journey to find a way to restore his sister back to normal and destroy the demon who ruined his life.",
  rating: 8.6,
  year: 2024,
  duration: "24 min",
  genre: "Action, Adventure, Anime",
  backdrop: "/api/placeholder/1920/1080",
  qualities: ["480p", "720p", "1080p"]
};

const CONTENT_ROWS = [
  {
    title: "Trending Now",
    items: Array(10).fill(null).map((_, i) => ({
      id: i,
      title: `Movie ${i + 1}`,
      thumbnail: "/api/placeholder/300/450",
      rating: 8.5,
      year: 2024,
      qualities: ["480p", "720p", "1080p"]
    }))
  },
  {
    title: "New Releases",
    items: Array(10).fill(null).map((_, i) => ({
      id: i + 10,
      title: `Series ${i + 1}`,
      thumbnail: "/api/placeholder/300/450",
      rating: 7.8,
      year: 2024,
      qualities: ["480p", "720p", "1080p"]
    }))
  },
  {
    title: "Popular Movies",
    items: Array(10).fill(null).map((_, i) => ({
      id: i + 20,
      title: `Popular ${i + 1}`,
      thumbnail: "/api/placeholder/300/450",
      rating: 9.0,
      year: 2023,
      qualities: ["480p", "720p", "1080p"]
    }))
  },
  {
    title: "Top Web Series",
    items: Array(10).fill(null).map((_, i) => ({
      id: i + 30,
      title: `Series ${i + 1}`,
      thumbnail: "/api/placeholder/300/450",
      rating: 8.2,
      year: 2024,
      qualities: ["480p", "720p", "1080p"]
    }))
  },
  {
    title: "Anime Corner",
    items: Array(10).fill(null).map((_, i) => ({
      id: i + 40,
      title: `Anime ${i + 1}`,
      thumbnail: "/api/placeholder/300/450",
      rating: 8.9,
      year: 2024,
      qualities: ["480p", "720p", "1080p"]
    }))
  },
  {
    title: "Documentaries",
    items: Array(10).fill(null).map((_, i) => ({
      id: i + 50,
      title: `Documentary ${i + 1}`,
      thumbnail: "/api/placeholder/300/450",
      rating: 7.5,
      year: 2024,
      qualities: ["480p", "720p"]
    }))
  }
];

function ContentCard({ item }: { item: any }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="group relative flex-shrink-0 w-[200px] cursor-pointer transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 shadow-lg">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-[300px] object-cover"
        />

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Action Buttons */}
            <div className="flex gap-2 mb-3">
              <button className="flex items-center justify-center w-10 h-10 bg-white rounded-full hover:bg-white/80 transition-colors">
                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
              </button>
              <button className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors border border-white/30">
                <Plus className="w-5 h-5 text-white" />
              </button>
              <button className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors border border-white/30">
                <Download className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{item.rating}</span>
              </div>
              <span>•</span>
              <span>{item.year}</span>
            </div>

            {/* Quality Badges */}
            <div className="flex gap-1">
              {item.qualities.map((quality: string) => (
                <span
                  key={quality}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-red-600 text-white rounded"
                >
                  {quality}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Badge (always visible) */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded shadow-lg">
            HD
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-2 text-sm font-medium text-white line-clamp-1 group-hover:text-red-400 transition-colors">
        {item.title}
      </h3>
    </div>
  );
}

function ContentRow({ title, items }: { title: string; items: any[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 800;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="mb-8">
      {/* Row Title */}
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-8">
        {title}
      </h2>

      {/* Scrollable Content */}
      <div className="relative group/row">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:from-black"
          aria-label="Scroll left"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:from-black"
          aria-label="Scroll right"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Content Cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function StreamingHero() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] flex items-center overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src={FEATURED_CONTENT.backdrop}
          alt={FEATURED_CONTENT.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="max-w-2xl">
          {/* Genre Badge */}
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 text-sm font-semibold bg-red-600 text-white rounded-full">
              Featured
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">
            {FEATURED_CONTENT.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-white/90 mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{FEATURED_CONTENT.rating}</span>
            </div>
            <span>•</span>
            <span>{FEATURED_CONTENT.year}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{FEATURED_CONTENT.duration}</span>
            </div>
            <span>•</span>
            <span className="text-sm">{FEATURED_CONTENT.genre}</span>
          </div>

          {/* Quality Badges */}
          <div className="flex gap-2 mb-6">
            {FEATURED_CONTENT.qualities.map((quality) => (
              <span
                key={quality}
                className="px-3 py-1 text-sm font-bold bg-white/10 backdrop-blur-sm text-white rounded border border-white/20"
              >
                {quality}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-white/90 mb-8 line-clamp-3">
            {FEATURED_CONTENT.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/watch/1"
              className="group flex items-center gap-3 px-8 py-3.5 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-xl"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Watch Now</span>
            </Link>

            <button className="flex items-center gap-3 px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 shadow-xl">
              <Plus className="w-5 h-5" />
              <span>My List</span>
            </button>

            <button className="flex items-center gap-3 px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 shadow-xl">
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>

            <button className="flex items-center gap-3 px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 shadow-xl">
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StreamingContent() {
  return (
    <section className="relative bg-black py-12">
      {CONTENT_ROWS.map((row, index) => (
        <ContentRow key={index} title={row.title} items={row.items} />
      ))}
    </section>
  );
}
