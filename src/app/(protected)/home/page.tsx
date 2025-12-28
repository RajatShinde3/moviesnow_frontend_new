// ============================================================================
// MOVIESNOW - WORLD-CLASS STREAMING PLATFORM
// ============================================================================
// Premium Netflix-inspired UI with best practices & advanced features
// Color Scheme: Pure Black (#000) + Netflix Red (#e50914)
// ============================================================================

"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, Info, ChevronLeft, ChevronRight, Plus, Check, Volume2, VolumeX, ThumbsUp, ChevronDown, Star, X, Download, Share2, Sparkles } from "lucide-react";
import { getTitles, getTrendingTitles, getPopularTitles, getNewReleases, getTopRated, getTitlesByGenre, normalizeRating, formatRuntime, type TitleSummary } from "@/lib/api/titles";

// ============================================================================
// TYPES
// ============================================================================

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  image: string;
  backdrop?: string;
  rating: number;
  year: number;
  type: string;
  overview?: string;
  genres?: string[];
  maturity?: string;
  duration?: string;
  trailerUrl?: string;
}

// Helper: Convert backend TitleSummary to frontend ContentItem
function mapTitleToContentItem(title: TitleSummary): ContentItem {
  return {
    id: title.id,
    title: title.name,
    slug: title.slug,
    image: title.poster_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(title.name)}&size=400&background=1a1a2e&color=fff&bold=true&font-size=0.3`,
    backdrop: title.backdrop_url || undefined,
    rating: normalizeRating(title.rating_average),
    year: title.release_year || new Date().getFullYear(),
    type: title.type,
    overview: title.overview || "",
    genres: title.genres || [],
    maturity: title.content_rating || "NR",
    duration: title.type === "MOVIE" ? formatRuntime(title.runtime_minutes) : undefined,
    trailerUrl: title.trailer_url || undefined,
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UltraPremiumHome() {
  const [trending, setTrending] = React.useState<ContentItem[]>([]);
  const [popular, setPopular] = React.useState<ContentItem[]>([]);
  const [newReleases, setNewReleases] = React.useState<ContentItem[]>([]);
  const [topRated, setTopRated] = React.useState<ContentItem[]>([]);
  const [actionMovies, setActionMovies] = React.useState<ContentItem[]>([]);
  const [dramaMovies, setDramaMovies] = React.useState<ContentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [featuredContent, setFeaturedContent] = React.useState<ContentItem | null>(null);

  const prefersReducedMotion = useReducedMotion();

  // Fetch data on mount with error handling
  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Parallel API calls for optimal performance
        const [
          trendingData,
          popularData,
          newReleasesData,
          topRatedData,
          actionData,
          dramaData,
        ] = await Promise.all([
          getTrendingTitles("US", "24h"),
          getPopularTitles(1, 20),
          getNewReleases(1, 20),
          getTopRated(1, 20),
          getTitlesByGenre("Action", 1, 20),
          getTitlesByGenre("Drama", 1, 20),
        ]);

        // Debug logging
        console.log('[HOME] Raw API Responses:', {
          trendingData,
          popularData,
          newReleasesData,
          topRatedData,
          actionData,
          dramaData,
        });

        console.log('[HOME] API Responses:', {
          trending: trendingData ? `${trendingData.items?.length || 0} items` : 'undefined',
          popular: popularData ? `${popularData.items?.length || 0} items` : 'undefined',
          newReleases: newReleasesData ? `${newReleasesData.items?.length || 0} items` : 'undefined',
          topRated: topRatedData ? `${topRatedData.items?.length || 0} items` : 'undefined',
          action: actionData ? `${actionData.items?.length || 0} items` : 'undefined',
          drama: dramaData ? `${dramaData.items?.length || 0} items` : 'undefined',
        });

        // Map backend data to frontend format
        const trendingItems = trendingData?.items?.map(mapTitleToContentItem) || [];
        const popularItems = popularData?.items?.map(mapTitleToContentItem) || [];
        const newReleaseItems = newReleasesData?.items?.map(mapTitleToContentItem) || [];
        const topRatedItems = topRatedData?.items?.map(mapTitleToContentItem) || [];
        const actionItems = actionData?.items?.map(mapTitleToContentItem) || [];
        const dramaItems = dramaData?.items?.map(mapTitleToContentItem) || [];

        console.log('[HOME] Mapped items:', {
          trending: trendingItems.length,
          popular: popularItems.length,
          newReleases: newReleaseItems.length,
          topRated: topRatedItems.length,
          action: actionItems.length,
          drama: dramaItems.length,
        });

        setTrending(trendingItems);
        setPopular(popularItems);
        setNewReleases(newReleaseItems);
        setTopRated(topRatedItems);
        setActionMovies(actionItems);
        setDramaMovies(dramaItems);

        // Set featured content
        const featured = trendingItems[0] || popularItems[0];
        if (featured) {
          setFeaturedContent(featured);
        }
      } catch (err) {
        console.error("Failed to fetch content:", err);
        setError("Unable to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Premium Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Animated Logo/Spinner */}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-transparent border-t-[#e50914] border-r-[#e50914] rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-white/20 border-l-white/20 rounded-full"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white text-xl font-medium tracking-wide"
          >
            Loading amazing content...
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1 w-48 bg-gradient-to-r from-transparent via-[#e50914] to-transparent origin-left"
          />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-600/10 flex items-center justify-center border-2 border-red-600/30"
          >
            <X className="w-10 h-10 text-red-600" />
          </motion.div>
          <h2 className="text-white text-2xl font-bold mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (!featuredContent && trending.length === 0 && popular.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-2xl"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-white text-3xl font-bold mb-3">Coming Soon!</h2>
          <p className="text-gray-400 text-lg">We're preparing amazing content for you. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden overflow-y-auto scroll-smooth">
      {/* Spacer for navbar (adjust height to match your navbar) */}
      <div className="h-16 md:h-20 bg-transparent" />

      {/* Cinematic Hero Section */}
      {featuredContent && <CinematicHeroWithData content={featuredContent} />}

      {/* Content Rows Section */}
      <div className="relative -mt-24 md:-mt-32 z-20 overflow-x-hidden overflow-y-visible bg-black pt-4">
        {/* Seamless gradient blend */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/90 to-transparent pointer-events-none z-10" />

        {/* Content Grid with stagger animations */}
        <div className="relative pb-16 space-y-4 md:space-y-6">
          {trending.length > 0 && <EnhancedContentRow title="Trending Now" items={trending} index={0} />}
          {popular.length > 0 && <EnhancedContentRow title="Popular on MoviesNow" items={popular} index={1} />}
          {actionMovies.length > 0 && <EnhancedContentRow title="Action Blockbusters" items={actionMovies} index={2} />}
          {topRated.length > 0 && <EnhancedContentRow title="Top Rated" items={topRated} index={3} />}
          {newReleases.length > 0 && <EnhancedContentRow title="New Releases" items={newReleases} index={4} />}
          {dramaMovies.length > 0 && <EnhancedContentRow title="Award-Winning Drama" items={dramaMovies} index={5} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW MODAL - ENHANCED NETFLIX STYLE
// ============================================================================

function PreviewModal({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const [isMuted, setIsMuted] = React.useState(true);
  const [inWatchlist, setInWatchlist] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (videoRef.current && item.trailerUrl) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked - silent fail
      });
    }

    // Close on ESC key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [item.trailerUrl, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-5xl bg-[#141414] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 hover:border-white/40 flex items-center justify-center transition-all backdrop-blur-sm group"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Video/Backdrop */}
        <div className="relative w-full aspect-video bg-black">
          {item.trailerUrl ? (
            <>
              <video
                ref={videoRef}
                src={item.trailerUrl}
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
                aria-label={`Trailer for ${item.title}`}
              />
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-black/70 hover:bg-black/90 border border-white/30 hover:border-white/60 flex items-center justify-center transition-all backdrop-blur-sm group"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                )}
              </button>
            </>
          ) : (
            <Image
              src={item.backdrop || item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-8 md:p-10">
          <h2 id="modal-title" className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            {item.title}
          </h2>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-3 mb-6">
            <a href={`/title/${item.slug}`} className="flex-1 min-w-[140px]">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-md bg-white hover:bg-gray-100 text-black font-bold text-base md:text-lg shadow-xl transition-colors"
              >
                <Play className="w-6 h-6" fill="black" />
                <span>Play</span>
              </motion.button>
            </a>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInWatchlist(!inWatchlist)}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${
                inWatchlist
                  ? "bg-white border-white"
                  : "bg-transparent border-white/60 hover:border-white hover:bg-white/10"
              }`}
              aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              {inWatchlist ? (
                <Check className="w-6 h-6 text-black" strokeWidth={3} />
              ) : (
                <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-transparent border-2 border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all shadow-lg"
              aria-label="Like"
            >
              <ThumbsUp className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-transparent border-2 border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all shadow-lg"
              aria-label="Download"
            >
              <Download className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Metadata */}
          <div className="flex items-center flex-wrap gap-3 mb-5 text-sm md:text-base">
            <span className="text-[#46d369] font-bold text-lg">{(item.rating * 10).toFixed(0)}% Match</span>
            <span className="text-white font-semibold">{item.year}</span>
            {item.maturity && (
              <span className="px-2.5 py-1 border border-white/60 text-white text-xs font-bold rounded">
                {item.maturity}
              </span>
            )}
            {item.duration && <span className="text-white">{item.duration}</span>}
            <span className="px-2.5 py-1 bg-white/20 text-white text-xs font-bold rounded">HD</span>
          </div>

          {/* Overview */}
          {item.overview && (
            <p className="text-white/90 text-base md:text-lg leading-relaxed mb-5">{item.overview}</p>
          )}

          {/* Genres */}
          {item.genres && item.genres.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <span className="text-white/60 font-medium">Genres:</span>
              <span className="text-white flex-1">{item.genres.join(", ")}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// ULTRA-PREMIUM CARD COMPONENT
// ============================================================================

interface CardProps extends ContentItem {
  index: number;
  isRowHovered: boolean;
  hoveredCard: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
}

function UltraPremiumCard({
  title,
  image,
  backdrop,
  rating,
  year,
  slug,
  overview,
  genres,
  maturity,
  duration,
  trailerUrl,
  id,
  index,
  isRowHovered,
  hoveredCard,
  onHover,
  onLeave,
}: CardProps) {
  const [inWatchlist, setInWatchlist] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = false; // useReducedMotion hook removed for compatibility

  const isHovered = hoveredCard === id;

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      onHover(id);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    onLeave();
  };

  const handleCardClick = () => {
    setShowModal(true);
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <motion.div
        ref={cardRef}
        className="relative cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <motion.div
          className="relative rounded-lg overflow-hidden bg-zinc-900 shadow-2xl"
          animate={{
            scale: isHovered && !prefersReducedMotion ? 1.5 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          }}
          style={{
            transformOrigin: "center center",
            zIndex: isHovered ? 50 : 1,
            position: "relative",
            willChange: "transform",
          }}
        >
          {/* Poster - Base State */}
          <AnimatePresence mode="wait">
            {!isHovered && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative aspect-[2/3] w-full bg-zinc-900"
              >
                {/* Image skeleton/placeholder */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black animate-pulse" />
                )}

                <Image
                  src={image}
                  alt={title}
                  fill
                  className={`object-cover rounded-lg transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="(max-width: 768px) 180px, (max-width: 1024px) 220px, 260px"
                  onLoad={() => setImageLoaded(true)}
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded Card - Hover State */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full bg-gradient-to-b from-[#1a1a1a] via-[#141414] to-[#0f0f0f] rounded-lg shadow-2xl ring-1 ring-white/10"
                style={{ aspectRatio: "16/14" }}
              >
                {/* Backdrop Preview */}
                <div className="relative w-full h-[42%]">
                  <Image
                    src={backdrop || image}
                    alt={title}
                    fill
                    className="object-cover rounded-t-lg"
                    sizes="600px"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

                  {/* Play Button - Centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button
                      onClick={handleCardClick}
                      initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                      whileHover={{ scale: 1.15, boxShadow: "0 0 30px rgba(255,255,255,0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      className="w-11 h-11 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-all"
                      aria-label={`Play ${title}`}
                    >
                      <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                    </motion.button>
                  </div>

                  {/* Info Button */}
                  <motion.button
                    onClick={handleCardClick}
                    initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm border border-white/30 hover:border-white/60 hover:bg-black/90 flex items-center justify-center transition-all group/info"
                    aria-label="More info"
                  >
                    <Info className="w-3.5 h-3.5 text-white group-hover/info:scale-110 transition-transform" strokeWidth={2.5} />
                  </motion.button>
                </div>

                {/* Info Section */}
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="h-[58%] px-3 py-3 flex flex-col justify-between"
                >
                  {/* Title & Metadata */}
                  <div className="space-y-2">
                    <motion.h3
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-white font-bold text-xs leading-tight line-clamp-2"
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: '700',
                        letterSpacing: '-0.015em'
                      }}
                    >
                      {title}
                    </motion.h3>

                    {/* Metadata Row */}
                    <div className="flex items-center flex-wrap gap-1.5">
                      <motion.span
                        initial={prefersReducedMotion ? {} : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="text-[#46d369] font-bold text-[10px] leading-none"
                      >
                        {(rating * 10).toFixed(0)}% Match
                      </motion.span>

                      <span className="text-white/90 font-semibold text-[9px] leading-none">{year}</span>

                      {maturity && (
                        <span className="px-1 py-0.5 border border-white/50 text-white text-[7px] font-bold leading-none rounded">
                          {maturity}
                        </span>
                      )}

                      {duration && (
                        <span className="text-white/80 font-medium text-[9px] leading-none">{duration}</span>
                      )}

                      <span className="px-1.5 py-0.5 bg-white/20 text-white text-[7px] font-black leading-none ml-auto rounded">
                        HD
                      </span>
                    </div>

                    {/* Genres Pills */}
                    {genres && genres.length > 0 && (
                      <motion.div
                        initial={prefersReducedMotion ? {} : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="flex flex-wrap items-center gap-1"
                      >
                        {genres.slice(0, 3).map((genre, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white text-[8px] font-medium border border-white/20 transition-all cursor-pointer leading-none"
                          >
                            {genre}
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-1.5"
                  >
                    <button
                      onClick={handleCardClick}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-white hover:bg-gray-100 text-black font-bold text-[10px] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
                    >
                      <Play className="w-3 h-3" fill="black" />
                      <span>Play</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInWatchlist(!inWatchlist);
                      }}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                        inWatchlist
                          ? "bg-white border-white shadow-lg"
                          : "bg-[#2a2a2a] border-white/50 hover:border-white hover:bg-[#3a3a3a]"
                      }`}
                      aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                    >
                      {inWatchlist ? (
                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                      ) : (
                        <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLiked(!isLiked);
                      }}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                        isLiked
                          ? "bg-white border-white shadow-lg"
                          : "bg-[#2a2a2a] border-white/50 hover:border-white hover:bg-[#3a3a3a]"
                      }`}
                      aria-label={isLiked ? "Unlike" : "Like"}
                    >
                      <ThumbsUp
                        className={`w-3 h-3 ${isLiked ? "text-black" : "text-white"}`}
                        strokeWidth={2.5}
                        fill={isLiked ? "black" : "none"}
                      />
                    </button>

                    <button
                      onClick={handleCardClick}
                      className="w-7 h-7 rounded-full border-2 bg-[#2a2a2a] border-white/50 hover:border-white hover:bg-[#3a3a3a] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      aria-label="More info"
                    >
                      <ChevronDown className="w-3 h-3 text-white" strokeWidth={2.5} />
                    </button>
                  </motion.div>
                </motion.div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Premium Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            animate={{
              boxShadow: isHovered && !prefersReducedMotion
                ? "0 0 40px rgba(229, 9, 20, 0.4), 0 0 80px rgba(229, 9, 20, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)"
                : "none",
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Enhanced Drop Shadow */}
        {isHovered && !prefersReducedMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-6 -z-10 bg-gradient-radial from-red-900/20 via-black/40 to-transparent blur-3xl rounded-lg"
          />
        )}
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showModal && (
          <PreviewModal
            item={{
              title,
              image,
              backdrop,
              rating,
              year,
              slug,
              overview,
              genres,
              maturity,
              duration,
              trailerUrl,
              type: "MOVIE",
              id: slug,
            }}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// CONTENT ROW WITH ENHANCED ANIMATIONS
// ============================================================================

function EnhancedContentRow({ title, items, index }: { title: string; items: ContentItem[]; index: number }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const checkScroll = React.useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  React.useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      checkScroll();
      return () => {
        ref.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll]);

  return (
    <section className="relative group/row mb-12 md:mb-16 overflow-visible" role="region" aria-label={title}>
      {/* Section Title */}
      <motion.h2
        initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        className="text-white text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-5 md:mb-6 px-6 md:px-12 lg:px-16 hover:text-gray-300 transition-colors cursor-pointer group relative w-fit tracking-tight z-10"
        style={{
          fontFamily: 'var(--font-sans)',
          letterSpacing: '-0.02em'
        }}
      >
        {title}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-red-600 to-red-700 rounded-full"
          initial={{ width: 0 }}
          whileHover={prefersReducedMotion ? {} : { width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </motion.h2>

      {/* Navigation Arrows */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scroll("left")}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-40 h-full w-16 items-center justify-center bg-gradient-to-r from-black via-black/95 to-transparent opacity-0 group-hover/row:opacity-100 transition-all duration-300"
            aria-label="Scroll left"
          >
            <div className="w-11 h-11 rounded-full bg-black/90 border-2 border-white/30 hover:border-white/60 flex items-center justify-center hover:bg-black transition-all shadow-2xl">
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
          </motion.button>
        )}

        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scroll("right")}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-40 h-full w-16 items-center justify-center bg-gradient-to-l from-black via-black/95 to-transparent opacity-0 group-hover/row:opacity-100 transition-all duration-300"
            aria-label="Scroll right"
          >
            <div className="w-11 h-11 rounded-full bg-black/90 border-2 border-white/30 hover:border-white/60 flex items-center justify-center hover:bg-black transition-all shadow-2xl">
              <ChevronRight className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cards Container - Fixed overflow for hover cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto overflow-y-visible px-6 md:px-12 lg:px-16 scroll-smooth scrollbar-hide"
        style={{
          paddingBottom: "120px",
          paddingTop: "120px",
          marginTop: "-120px",
          marginBottom: "-120px"
        }}
      >
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="flex-shrink-0 w-[180px] md:w-[220px] lg:w-[260px]"
            style={{
              position: "relative",
              minHeight: "270px"
            }}
          >
            <UltraPremiumCard
              {...item}
              index={idx}
              isRowHovered={hoveredCard !== null}
              hoveredCard={hoveredCard}
              onHover={(id) => setHoveredCard(id)}
              onLeave={() => setHoveredCard(null)}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// CINEMATIC HERO WITH VIDEO BACKGROUND
// ============================================================================

function CinematicHeroWithData({ content }: { content: ContentItem }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const [isMuted, setIsMuted] = React.useState(true);
  const [showVideo, setShowVideo] = React.useState(false);
  const [inWatchlist, setInWatchlist] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    // Delay video for performance
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (videoRef.current && showVideo && content.trailerUrl) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked
      });
    }
  }, [showVideo, content.trailerUrl]);

  const backdropUrl = content.backdrop || content.image;

  return (
    <motion.div style={{ opacity }} className="relative h-[90vh] md:h-[85vh] overflow-hidden">
      <motion.div style={prefersReducedMotion ? {} : { scale }} className="absolute inset-0">
        {/* Video Background */}
        <AnimatePresence>
          {showVideo && content.trailerUrl && (
            <motion.video
              ref={videoRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              poster={backdropUrl}
            >
              <source src={content.trailerUrl} type="video/mp4" />
            </motion.video>
          )}
        </AnimatePresence>

        {/* Fallback Image */}
        {(!showVideo || !content.trailerUrl) && (
          <Image
            src={backdropUrl}
            alt={content.title}
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
            unoptimized
          />
        )}

        {/* Multi-layer Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
      </motion.div>

      <div className="relative z-10 h-full flex items-end">
        <div className="px-6 md:px-12 lg:px-16 pb-20 md:pb-24 max-w-4xl">
          {/* Trending Badge */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-red-600 to-red-700 mb-6 shadow-2xl ring-2 ring-red-500/30"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-lg" />
            <span className="text-white text-xs font-bold uppercase tracking-widest">#1 Trending Today</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-[0.95] tracking-tighter"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: '900',
              letterSpacing: '-0.04em',
              textShadow: "0 4px 40px rgba(0,0,0,0.95), 0 2px 20px rgba(0,0,0,0.9), 0 0 60px rgba(229, 9, 20, 0.4)",
            }}
          >
            {content.title}
          </motion.h1>

          {/* Metadata */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center flex-wrap gap-3 md:gap-4 mb-6 text-base"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
              <span className="text-white font-bold text-xl md:text-2xl">{content.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-400 text-lg">•</span>
            <span className="text-white font-semibold text-base md:text-lg">{content.year}</span>
            {content.maturity && (
              <>
                <span className="text-gray-400 text-lg">•</span>
                <span className="px-2.5 py-1 border-2 border-white/70 text-white font-bold text-xs md:text-sm rounded shadow-lg">
                  {content.maturity}
                </span>
              </>
            )}
            {content.duration && (
              <>
                <span className="text-gray-400 text-lg">•</span>
                <span className="text-white text-base md:text-lg font-medium">{content.duration}</span>
              </>
            )}
          </motion.div>

          {/* Overview */}
          {content.overview && (
            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-white/95 text-base md:text-lg lg:text-xl leading-relaxed mb-8 max-w-2xl line-clamp-3 font-normal"
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: '400',
                letterSpacing: '-0.01em',
                textShadow: "0 2px 15px rgba(0,0,0,0.9)"
              }}
            >
              {content.overview}
            </motion.p>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center flex-wrap gap-3 md:gap-4"
          >
            <a href={`/title/${content.slug}`}>
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                className="flex items-center gap-2.5 px-8 md:px-12 py-3.5 md:py-4 rounded-lg bg-white hover:bg-gray-100 text-black font-bold text-base md:text-lg shadow-2xl transition-all"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: '700',
                  letterSpacing: '-0.01em'
                }}
              >
                <Play className="w-6 h-6 md:w-7 md:h-7" fill="black" />
                <span>Play</span>
              </motion.button>
            </a>

            <a href={`/title/${content.slug}`}>
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                className="flex items-center gap-2.5 px-7 md:px-10 py-3.5 md:py-4 rounded-lg bg-gray-700/70 hover:bg-gray-700/90 backdrop-blur-sm text-white font-bold text-base md:text-lg border-2 border-white/50 hover:border-white/70 transition-all shadow-xl"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: '700',
                  letterSpacing: '-0.01em'
                }}
              >
                <Info className="w-6 h-6 md:w-7 md:h-7" />
                <span>More Info</span>
              </motion.button>
            </a>

            {/* Mute Button */}
            {content.trailerUrl && (
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                onClick={() => setIsMuted(!isMuted)}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-transparent border-2 border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all shadow-lg backdrop-blur-sm"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                ) : (
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
                )}
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />

      {/* Age Rating Badge */}
      {content.maturity && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="absolute top-24 md:top-28 right-6 md:right-12 px-4 md:px-5 py-2 md:py-2.5 border-3 md:border-4 border-white/80 text-white font-black text-lg md:text-2xl rounded shadow-2xl backdrop-blur-sm bg-black/20"
        >
          {content.maturity}
        </motion.div>
      )}
    </motion.div>
  );
}
