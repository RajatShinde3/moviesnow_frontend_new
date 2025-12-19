"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MOVIESNOW - AnimeSuge-Inspired Professional Homepage
 * ═══════════════════════════════════════════════════════════════════════════
 * Based on world-class anime streaming site design
 */

import * as React from "react";
import Link from "next/link";
import {
  Play,
  Info,
  Plus,
  Star,
  Clock,
  Flame,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  Volume2,
  VolumeX,
  Check,
  Eye,
  Download,
  Calendar,
  Film,
} from "lucide-react";
import { WorldClassFooter } from "./WorldClassFooter";

// ═══════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════

const HERO_SLIDES = [
  {
    id: 1,
    title: "Demon Slayer",
    tagline: "Mugen Train Arc",
    description: "Join Tanjiro and his companions on an epic journey aboard the mysterious Infinity Train.",
    rating: 8.9,
    year: 2024,
    duration: "2h 10m",
    genres: ["Action", "Adventure", "Anime"],
    backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=1080&fit=crop&q=90",
    maturity: "16+",
    views: "12M",
  },
  {
    id: 2,
    title: "Cyberpunk 2077",
    tagline: "Night City Chronicles",
    description: "Dive into a dystopian future where technology and humanity collide.",
    rating: 9.1,
    year: 2024,
    duration: "8 Episodes",
    genres: ["Sci-Fi", "Thriller", "Action"],
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop&q=90",
    maturity: "18+",
    views: "18M",
  },
];

const CONTENT_ROWS = [
  {
    id: "trending",
    title: "Trending Now",
    icon: Flame,
    color: "from-orange-500 to-red-500",
    items: Array(18).fill(null).map((_, i) => ({
      id: `trending-${i}`,
      title: `Trending Title ${i + 1}`,
      poster: `https://images.unsplash.com/photo-1560419085-89f61fe19d0c?w=500&h=750&fit=crop&q=85&v=${i}`,
      rating: (8 + Math.random() * 1.5).toFixed(1),
      year: 2024,
      type: i % 3 === 0 ? "Movie" : "Series",
      episodes: i % 3 === 0 ? null : Math.floor(Math.random() * 24 + 12),
      rank: i < 10 ? i + 1 : null,
      quality: ["1080p", "720p", "480p"],
      hasDownload: true,
      isNew: i < 3,
    })),
  },
  {
    id: "new",
    title: "New Releases",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
    items: Array(18).fill(null).map((_, i) => ({
      id: `new-${i}`,
      title: `New Release ${i + 1}`,
      poster: `https://images.unsplash.com/photo-1574267432644-f610a7f78b6f?w=500&h=750&fit=crop&q=85&v=${i}`,
      rating: (7.5 + Math.random() * 2).toFixed(1),
      year: 2024,
      type: i % 2 === 0 ? "Movie" : "Series",
      episodes: i % 2 === 0 ? null : Math.floor(Math.random() * 12 + 6),
      quality: ["1080p", "720p"],
      hasDownload: true,
      isNew: true,
    })),
  },
  {
    id: "popular",
    title: "Popular This Week",
    icon: TrendingUp,
    color: "from-purple-500 to-pink-500",
    items: Array(18).fill(null).map((_, i) => ({
      id: `popular-${i}`,
      title: `Popular ${i + 1}`,
      poster: `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop&q=85&v=${i}`,
      rating: (8.5 + Math.random() * 1).toFixed(1),
      year: 2023,
      type: "Movie",
      quality: ["1080p"],
      hasDownload: true,
    })),
  },
  {
    id: "top",
    title: "Top Rated All Time",
    icon: Award,
    color: "from-yellow-500 to-orange-500",
    items: Array(18).fill(null).map((_, i) => ({
      id: `top-${i}`,
      title: `Top Rated ${i + 1}`,
      poster: `https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop&q=85&v=${i}`,
      rating: (9 + Math.random() * 0.5).toFixed(1),
      year: 2023,
      type: i % 2 === 0 ? "Movie" : "Series",
      episodes: i % 2 === 0 ? null : Math.floor(Math.random() * 24 + 12),
      quality: ["1080p", "720p"],
      hasDownload: true,
    })),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION - AnimeSuge Style
// ═══════════════════════════════════════════════════════════════════════════

function AnimeHero() {
  const [current, setCurrent] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const [muted, setMuted] = React.useState(true);
  const hero = HERO_SLIDES[current];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    setLoaded(false);
    setTimeout(() => setLoaded(true), 100);
  }, [current]);

  return (
    <div className="relative h-[85vh] bg-[#0a0a0a]">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={hero.backdrop}
          alt={hero.title}
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.3)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          <div className={`max-w-2xl transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Badges */}
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-[#fffc01] text-black text-xs font-black rounded">
                {hero.maturity}
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur text-white text-xs font-bold rounded flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {hero.views}
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur text-white text-xs font-bold rounded flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {hero.year}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-6xl font-black text-white mb-3 leading-none tracking-tight">
              {hero.title}
            </h1>
            <h2 className="text-xl text-gray-300 font-medium mb-6">{hero.tagline}</h2>

            {/* Meta */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-[#fffc01] text-[#fffc01]" />
                <span className="text-white font-bold">{hero.rating}</span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-300">{hero.duration}</span>
              <span className="text-gray-500">•</span>
              <div className="flex gap-2">
                {hero.genres.slice(0, 3).map((g) => (
                  <span key={g} className="px-2 py-0.5 bg-white/5 text-gray-300 text-sm rounded">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-xl">
              {hero.description}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href={`/watch/${hero.id}`}
                className="flex items-center gap-2 px-8 py-3.5 bg-[#fffc01] text-black font-bold rounded-lg hover:bg-[#fff000] transition-all hover:scale-105 hover:shadow-xl shadow-[0_0_30px_rgba(255,252,1,0.3)]"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Watch Now</span>
              </Link>

              <Link
                href={`/title/${hero.id}`}
                className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur text-white font-bold rounded-lg border border-white/20 hover:bg-white/15 transition-all"
              >
                <Info className="w-5 h-5" />
                <span>Details</span>
              </Link>

              <Link
                href={`/download/${hero.id}`}
                className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur text-white font-bold rounded-lg border border-white/20 hover:bg-white/15 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Download</span>
              </Link>

              <button
                onClick={() => setMuted(!muted)}
                className="p-3.5 bg-white/10 backdrop-blur text-white rounded-lg border border-white/20 hover:bg-white/15 transition-all"
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1 rounded-full transition-all ${
              idx === current ? "w-8 bg-[#fffc01]" : "w-4 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT CARD - AnimeSuge Style
// ═══════════════════════════════════════════════════════════════════════════

function AnimeCard({ item }: any) {
  const [hovered, setHovered] = React.useState(false);
  const [imgLoaded, setImgLoaded] = React.useState(false);

  return (
    <div
      className="group relative flex-shrink-0 w-[185px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/watch/${item.id}`}>
        <div className={`relative rounded-lg overflow-hidden aspect-[2/3] bg-[#1a1a1a] transition-all duration-300 ${
          hovered ? "scale-105 shadow-2xl ring-2 ring-[#fffc01]/50" : "shadow-lg"
        }`}>
          {/* Image */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse" />
          )}
          <img
            src={item.poster}
            alt={item.title}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            } ${hovered ? "scale-110" : "scale-100"}`}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          {/* Rank Badge */}
          {item.rank && (
            <div className="absolute top-0 left-0 w-12 h-16">
              <div className="relative w-full h-full bg-[#fffc01] flex items-center justify-center clip-rank">
                <span className="text-black text-2xl font-black">{item.rank}</span>
              </div>
            </div>
          )}

          {/* New Badge */}
          {item.isNew && !item.rank && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 bg-[#fffc01] text-black text-[10px] font-black rounded">
                NEW
              </span>
            </div>
          )}

          {/* Quality Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {item.quality.includes("1080p") && (
              <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[9px] font-bold rounded">
                1080P
              </span>
            )}
            {item.hasDownload && (
              <span className="px-1.5 py-0.5 bg-green-600 text-white text-[9px] font-bold rounded flex items-center gap-0.5">
                <Download className="w-2.5 h-2.5" />
                DL
              </span>
            )}
          </div>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-bold text-sm leading-tight mb-1.5 line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#fffc01] text-[#fffc01]" />
                <span className="text-white font-bold">{item.rating}</span>
              </div>
              {item.episodes && (
                <span className="text-gray-400">{item.episodes} eps</span>
              )}
              {!item.episodes && (
                <span className="text-gray-400">{item.type}</span>
              )}
            </div>
          </div>

          {/* Hover Play */}
          <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}>
            <div className="w-16 h-16 bg-[#fffc01] rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-black fill-current ml-1" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT ROW - AnimeSuge Style
// ═══════════════════════════════════════════════════════════════════════════

function AnimeRow({ title, icon: Icon, items, color }: any) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanLeft(scrollLeft > 10);
      setCanRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
      return () => ref.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -900 : 900,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 bg-gradient-to-br ${color} rounded-lg shadow-lg`}>
            <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
        </div>
        <Link
          href={`/browse/${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-bold transition-colors group"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Scroll Container */}
      <div className="relative group/row">
        {canLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-[#1a1a1a]/95 backdrop-blur border-2 border-white/20 rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-[#fffc01] hover:border-[#fffc01] transition-all shadow-xl group/btn"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover/btn:text-black rotate-180" strokeWidth={3} />
          </button>
        )}

        {canRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-[#1a1a1a]/95 backdrop-blur border-2 border-white/20 rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-[#fffc01] hover:border-[#fffc01] transition-all shadow-xl group/btn"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover/btn:text-black" strokeWidth={3} />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 lg:px-12 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item: any) => (
            <AnimeCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

export function PremiumHome() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <AnimeHero />
      <div className="py-12">
        {CONTENT_ROWS.map((row) => (
          <AnimeRow
            key={row.id}
            title={row.title}
            icon={row.icon}
            items={row.items}
            color={row.color}
          />
        ))}
      </div>
      <WorldClassFooter />
    </main>
  );
}
