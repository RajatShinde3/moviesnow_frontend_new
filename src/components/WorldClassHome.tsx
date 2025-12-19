"use client";

/**
 * =============================================================================
 * MOVIESNOW - World-Class Homepage (Inspired by AnimeSuge)
 * =============================================================================
 */

import * as React from "react";
import Link from "next/link";
import {
  Play,
  Plus,
  Info,
  Star,
  Clock,
  Download,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Sparkles
} from "lucide-react";

// Dummy featured content for hero slider
const FEATURED_SLIDES = [
  {
    id: 1,
    title: "Demon Slayer: Kimetsu no Yaiba",
    description: "Tanjiro Kamado, joined with Inosuke Hashibira, a boy raised by boars who wears a boar's head, and Zenitsu Agatsuma, a scared boy who reveals his true power when he sleeps, boards the Infinity Train on a new mission.",
    rating: 8.6,
    year: 2024,
    type: "Anime",
    episodes: 26,
    backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=1080&fit=crop",
    genres: ["Action", "Adventure", "Fantasy"],
    qualities: ["480p", "720p", "1080p"]
  },
  {
    id: 2,
    title: "The Last of Us",
    description: "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.",
    rating: 9.1,
    year: 2024,
    type: "TV Series",
    episodes: 9,
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop",
    genres: ["Drama", "Action", "Thriller"],
    qualities: ["480p", "720p", "1080p"]
  },
  {
    id: 3,
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    rating: 8.9,
    year: 2024,
    type: "Movie",
    duration: "3h 0min",
    backdrop: "https://images.unsplash.com/photo-1574267432644-f610a7f78b6f?w=1920&h=1080&fit=crop",
    genres: ["Biography", "Drama", "History"],
    qualities: ["480p", "720p", "1080p"]
  }
];

// Content items
const CONTENT_SECTIONS = [
  {
    title: "Trending Now",
    icon: Flame,
    items: Array(15).fill(null).map((_, i) => ({
      id: i,
      title: `Trending Title ${i + 1}`,
      poster: `https://images.unsplash.com/photo-1560419085-89f61fe19d0c?w=300&h=450&fit=crop&q=${i}`,
      rating: (8 + Math.random()).toFixed(1),
      year: 2024,
      type: i % 3 === 0 ? "Movie" : i % 3 === 1 ? "Series" : "Anime",
      episodes: i % 3 !== 0 ? Math.floor(Math.random() * 24) + 1 : null,
      qualities: ["480p", "720p", "1080p"]
    }))
  },
  {
    title: "New Releases",
    icon: Sparkles,
    items: Array(15).fill(null).map((_, i) => ({
      id: i + 15,
      title: `New Release ${i + 1}`,
      poster: `https://images.unsplash.com/photo-1574267432644-f610a7f78b6f?w=300&h=450&fit=crop&q=${i}`,
      rating: (7.5 + Math.random()).toFixed(1),
      year: 2024,
      type: i % 2 === 0 ? "Movie" : "Series",
      episodes: i % 2 !== 0 ? Math.floor(Math.random() * 12) + 1 : null,
      qualities: ["480p", "720p", "1080p"]
    }))
  },
  {
    title: "Popular Movies",
    icon: TrendingUp,
    items: Array(15).fill(null).map((_, i) => ({
      id: i + 30,
      title: `Popular Movie ${i + 1}`,
      poster: `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop&q=${i}`,
      rating: (8.5 + Math.random() * 0.5).toFixed(1),
      year: 2023,
      type: "Movie",
      qualities: ["480p", "720p", "1080p"]
    }))
  }
];

function HeroSlider() {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + FEATURED_SLIDES.length) % FEATURED_SLIDES.length);
  };

  // Auto-advance slider
  React.useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = FEATURED_SLIDES[currentSlide];

  return (
    <div className="relative h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={slide.backdrop}
          alt={slide.title}
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-[1920px] mx-auto px-4 lg:px-8 flex items-center">
        <div className="max-w-2xl">
          {/* Type Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600/90 backdrop-blur-sm rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold text-white uppercase tracking-wide">{slide.type}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 drop-shadow-2xl leading-tight">
            {slide.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-white/90 mb-6">
            <div className="flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{slide.rating}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{slide.year}</span>
            </div>
            {slide.episodes && (
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{slide.episodes} Episodes</span>
              </div>
            )}
            {slide.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{slide.duration}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-6">
            {slide.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Quality Badges */}
          <div className="flex gap-2 mb-8">
            {slide.qualities.map((quality) => (
              <span
                key={quality}
                className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded uppercase"
              >
                {quality}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-lg text-white/90 mb-8 line-clamp-3 max-w-xl">
            {slide.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/watch/${slide.id}`}
              className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105 shadow-2xl"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Watch Now</span>
            </Link>

            <button className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <Plus className="w-5 h-5" />
              <span>My List</span>
            </button>

            <button className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>

            <button className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <Info className="w-5 h-5" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {FEATURED_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-white" : "w-6 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ContentCard({ item }: { item: any }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="group relative flex-shrink-0 w-[180px] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-white/30">
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-[270px] object-cover"
        />

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            {/* Action Buttons */}
            <div className="flex gap-2 mb-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-white/90 transition-all">
                <Play className="w-4 h-4 fill-current" />
                Play
              </button>
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all">
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-bold rounded">
            {item.type}
          </span>
        </div>

        {/* Quality Badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
            HD
          </span>
        </div>

        {/* Episodes Badge */}
        {item.episodes && (
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
              Ep {item.episodes}
            </span>
          </div>
        )}
      </div>

      {/* Title and Info */}
      <div className="mt-3">
        <h3 className="text-white text-sm font-medium line-clamp-1 group-hover:text-red-400 transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{item.rating}</span>
          </div>
          <span>•</span>
          <span>{item.year}</span>
        </div>
      </div>
    </div>
  );
}

function ContentSection({ title, icon: Icon, items }: any) {
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
    <section className="mb-12">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-6 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <Link href="/browse" className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors">
          View All →
        </Link>
      </div>

      {/* Scrollable Content */}
      <div className="relative group/section">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-black to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity flex items-center justify-center"
        >
          <div className="p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/90 transition-all">
            <ChevronLeft className="w-6 h-6 text-white" />
          </div>
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-black to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity flex items-center justify-center"
        >
          <div className="p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/90 transition-all">
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Content Cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 lg:px-8 pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item: any) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorldClassHomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Content Sections */}
      <div className="py-8">
        {CONTENT_SECTIONS.map((section, index) => (
          <ContentSection
            key={index}
            title={section.title}
            icon={section.icon}
            items={section.items}
          />
        ))}
      </div>
    </div>
  );
}
