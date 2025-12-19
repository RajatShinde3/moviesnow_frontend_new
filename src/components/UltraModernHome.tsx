"use client";

/**
 * =============================================================================
 * MOVIESNOW - Ultra Modern Glassmorphism Design
 * =============================================================================
 *
 * Premium features:
 * - Advanced glassmorphism effects
 * - Animated gradient backgrounds
 * - Floating particles
 * - Smooth micro-interactions
 * - Blur effects and depth
 */

import * as React from "react";
import Link from "next/link";
import {
  Play,
  Plus,
  Star,
  Clock,
  Download,
  Eye,
  Flame,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Featured content
const FEATURED_CONTENT = [
  {
    id: 1,
    title: "Demon Slayer: Mugen Train",
    description: "Experience the breathtaking journey as Tanjiro and his companions board the mysterious Infinity Train. A story of courage, friendship, and the eternal battle between humanity and demons.",
    rating: 8.9,
    year: 2024,
    duration: "2h 10min",
    genre: ["Action", "Adventure", "Anime"],
    backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=1080&fit=crop",
  },
  {
    id: 2,
    title: "Cyberpunk Chronicles",
    description: "In a dystopian future where technology and humanity blur, one hacker must navigate the dangerous digital underworld to uncover a conspiracy that threatens existence itself.",
    rating: 9.2,
    year: 2024,
    duration: "8 Episodes",
    genre: ["Sci-Fi", "Thriller", "Action"],
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop",
  },
];

const TRENDING_ITEMS = Array(20).fill(null).map((_, i) => ({
  id: i,
  title: `Trending ${i + 1}`,
  poster: `https://images.unsplash.com/photo-1560419085-89f61fe19d0c?w=300&h=450&fit=crop&v=${i}`,
  rating: (8 + Math.random()).toFixed(1),
  year: 2024,
  quality: "4K",
  type: i % 3 === 0 ? "Movie" : "Series",
}));

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array(20).fill(null).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${10 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

function GlassHero() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const featured = FEATURED_CONTENT[currentIndex];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_CONTENT.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[90vh] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <img
          src={featured.backdrop}
          alt={featured.title}
          className="w-full h-full object-cover scale-110 animate-slow-zoom"
        />
        {/* Multiple gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-blue-900/70 to-pink-900/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex items-center">
        <div className="max-w-3xl">
          {/* Glass Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 mb-6 shadow-2xl animate-fade-in">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">Featured Now</span>
          </div>

          {/* Title with gradient */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight animate-slide-up">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
              {featured.title}
            </span>
          </h1>

          {/* Meta info in glass cards */}
          <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-xl border border-yellow-500/30 shadow-xl">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-bold text-white">{featured.rating}</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl">
              <span className="text-white font-semibold">{featured.year}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-white font-semibold">{featured.duration}</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {featured.genre.map((genre) => (
              <span
                key={genre}
                className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-sm text-white/90 hover:bg-white/10 transition-all shadow-lg"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-lg text-white/90 leading-relaxed mb-10 max-w-2xl animate-slide-up backdrop-blur-sm" style={{ animationDelay: "0.3s" }}>
            {featured.description}
          </p>

          {/* Action buttons with glass effect */}
          <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Link
              href={`/watch/${featured.id}`}
              className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-purple-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3">
                <Play className="w-5 h-5 fill-current" />
                <span className="text-lg">Watch Now</span>
              </div>
            </Link>

            <button className="group px-10 py-4 bg-white/10 backdrop-blur-2xl rounded-2xl font-bold text-white border-2 border-white/20 hover:bg-white/20 transition-all hover:scale-105 shadow-xl">
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5" />
                <span className="text-lg">My List</span>
              </div>
            </button>

            <button className="group px-10 py-4 bg-white/10 backdrop-blur-2xl rounded-2xl font-bold text-white border-2 border-white/20 hover:bg-white/20 transition-all hover:scale-105 shadow-xl">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5" />
                <span className="text-lg">Download</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {FEATURED_CONTENT.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex
                ? "w-12 bg-white shadow-lg shadow-white/50"
                : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function GlassContentCard({ item }: any) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="group relative flex-shrink-0 w-[220px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glass card with hover effect */}
      <div className="relative overflow-hidden rounded-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/30">
        {/* Poster */}
        <div className="relative">
          <img
            src={item.poster}
            alt={item.title}
            className="w-full h-[330px] object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

          {/* Glass overlay on hover */}
          <div className={`absolute inset-0 bg-white/5 backdrop-blur-sm transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-blue-900/50 to-transparent" />
          </div>

          {/* Hover content */}
          <div className={`absolute inset-x-0 bottom-0 p-5 transition-all duration-500 ${isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            <div className="flex gap-2 mb-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30 text-white font-bold hover:bg-white/30 transition-all shadow-xl">
                <Play className="w-4 h-4 fill-current" />
                <span>Play</span>
              </button>
              <button className="p-3 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30 hover:bg-white/30 transition-all shadow-xl">
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Quality badge */}
          <div className="absolute top-3 right-3">
            <div className="px-3 py-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg text-white text-xs font-bold shadow-lg">
              {item.quality}
            </div>
          </div>

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <div className="px-3 py-1 bg-white/20 backdrop-blur-xl rounded-lg text-white text-xs font-bold border border-white/30 shadow-lg">
              {item.type}
            </div>
          </div>
        </div>
      </div>

      {/* Info below card */}
      <div className="mt-4 px-1">
        <h3 className="text-white font-semibold text-base mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white/80 font-semibold">{item.rating}</span>
          </div>
          <span className="text-white/50">•</span>
          <span className="text-white/80">{item.year}</span>
        </div>
      </div>
    </div>
  );
}

function GlassSection({ title, icon: Icon, items }: any) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -800 : 800, behavior: "smooth" });
    }
  };

  return (
    <section className="mb-16">
      {/* Section header with glass effect */}
      <div className="flex items-center justify-between mb-8 px-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/30">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">
            {title}
          </h2>
        </div>
        <Link
          href="/browse"
          className="group flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white font-semibold hover:bg-white/20 transition-all shadow-lg"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="relative group/section">
        {/* Scroll buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity flex items-center justify-start pl-4"
        >
          <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/20 transition-all shadow-xl">
            <ChevronLeft className="w-6 h-6 text-white" />
          </div>
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity flex items-center justify-end pr-4"
        >
          <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/20 transition-all shadow-xl">
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-6 pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item: any) => (
            <GlassContentCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function UltraModernHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Hero */}
      <GlassHero />

      {/* Content sections */}
      <div className="py-16 space-y-8">
        <GlassSection title="Trending Now" icon={Flame} items={TRENDING_ITEMS} />
        <GlassSection title="New Releases" icon={Sparkles} items={TRENDING_ITEMS} />
        <GlassSection title="Popular This Week" icon={TrendingUp} items={TRENDING_ITEMS} />
      </div>
    </div>
  );
}
