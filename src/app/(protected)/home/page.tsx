// ============================================================================
// MOVIESNOW - ULTRA-PREMIUM NETFLIX CLONE WITH ADVANCED FEATURES
// ============================================================================
// Features: Video backgrounds, preview modals, advanced animations, parallax
// Color Scheme: Pure Black (#000) + Netflix Red (#e50914)
// ============================================================================

"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Play, Info, ChevronLeft, ChevronRight, Plus, Check, Volume2, VolumeX, ThumbsUp, ChevronDown, Star, X, Download, Share2 } from "lucide-react";

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

// ============================================================================
// DEMO DATA
// ============================================================================

const featuredContent = {
  title: "The Dark Knight",
  slug: "the-dark-knight",
  overview: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests of his ability to fight injustice.",
  backdrop: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  rating: 9.0,
  year: 2008,
  maturity: "PG-13",
  duration: "2h 32m",
  genres: ["Action", "Crime", "Drama"],
  tagline: "Why So Serious?",
};

const demoMovies: ContentItem[] = [
  {
    id: "1",
    title: "The Dark Knight",
    slug: "the-dark-knight",
    image: "https://ui-avatars.com/api/?name=TDK&size=400&background=1a1a2e&color=fff&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
    rating: 9.0,
    year: 2008,
    type: "MOVIE",
    overview: "Batman faces his greatest challenge as the Joker creates chaos across Gotham City.",
    genres: ["Action", "Crime", "Drama"],
    maturity: "PG-13",
    duration: "2h 32m",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "2",
    title: "Inception",
    slug: "inception",
    image: "https://ui-avatars.com/api/?name=IN&size=400&background=2d4263&color=fff&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    rating: 8.8,
    year: 2010,
    type: "MOVIE",
    overview: "A skilled thief who can enter people's dreams and steal their secrets must plant an idea into a target's subconscious.",
    genres: ["Sci-Fi", "Action", "Thriller"],
    maturity: "PG-13",
    duration: "2h 28m",
  },
  {
    id: "3",
    title: "Interstellar",
    slug: "interstellar",
    image: "https://ui-avatars.com/api/?name=IN&size=400&background=191919&color=fff&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    rating: 8.6,
    year: 2014,
    type: "MOVIE",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    maturity: "PG-13",
    duration: "2h 49m",
  },
  {
    id: "4",
    title: "The Matrix",
    slug: "the-matrix",
    image: "https://ui-avatars.com/api/?name=TM&size=400&background=003d00&color=0f0&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
    rating: 8.7,
    year: 1999,
    type: "MOVIE",
    overview: "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
    genres: ["Sci-Fi", "Action"],
    maturity: "R",
    duration: "2h 16m",
  },
  {
    id: "5",
    title: "Pulp Fiction",
    slug: "pulp-fiction",
    image: "https://ui-avatars.com/api/?name=PF&size=400&background=8b0000&color=fff&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
    rating: 8.9,
    year: 1994,
    type: "MOVIE",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    genres: ["Crime", "Drama"],
    maturity: "R",
    duration: "2h 34m",
  },
  {
    id: "6",
    title: "Oppenheimer",
    slug: "oppenheimer",
    image: "https://ui-avatars.com/api/?name=OP&size=400&background=654321&color=fff&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    rating: 8.4,
    year: 2023,
    type: "MOVIE",
    overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    genres: ["Drama", "History", "Biography"],
    maturity: "R",
    duration: "3h 0m",
  },
  {
    id: "7",
    title: "Dune: Part Two",
    slug: "dune-part-two",
    image: "https://ui-avatars.com/api/?name=DT&size=400&background=c19a6b&color=000&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    rating: 8.6,
    year: 2024,
    type: "MOVIE",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    genres: ["Sci-Fi", "Adventure", "Action"],
    maturity: "PG-13",
    duration: "2h 46m",
  },
];

const demoSeries: ContentItem[] = [
  {
    id: "10",
    title: "Breaking Bad",
    slug: "breaking-bad",
    image: "https://ui-avatars.com/api/?name=BB&size=400&background=006400&color=fff&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/eSzpy96DwBujGFj0xMbXBcGcfxX.jpg",
    rating: 9.5,
    year: 2008,
    type: "SERIES",
    overview: "A high school chemistry teacher turned methamphetamine producer partners with a former student.",
    genres: ["Drama", "Crime", "Thriller"],
    maturity: "TV-MA",
    duration: "5 Seasons",
  },
  {
    id: "11",
    title: "Stranger Things",
    slug: "stranger-things",
    image: "https://ui-avatars.com/api/?name=ST&size=400&background=8b0000&color=fff&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    rating: 8.7,
    year: 2016,
    type: "SERIES",
    overview: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.",
    genres: ["Sci-Fi", "Horror", "Drama"],
    maturity: "TV-14",
    duration: "4 Seasons",
  },
  {
    id: "12",
    title: "Game of Thrones",
    slug: "game-of-thrones",
    image: "https://ui-avatars.com/api/?name=GOT&size=400&background=2c2c2c&color=gold&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    rating: 9.3,
    year: 2011,
    type: "SERIES",
    overview: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns.",
    genres: ["Fantasy", "Drama", "Adventure"],
    maturity: "TV-MA",
    duration: "8 Seasons",
  },
  {
    id: "13",
    title: "Attack on Titan",
    slug: "attack-on-titan",
    image: "https://ui-avatars.com/api/?name=AOT&size=400&background=4a4a4a&color=fff&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg",
    rating: 9.0,
    year: 2013,
    type: "SERIES",
    overview: "After his hometown is destroyed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans.",
    genres: ["Anime", "Action", "Fantasy"],
    maturity: "TV-MA",
    duration: "4 Seasons",
  },
  {
    id: "14",
    title: "Death Note",
    slug: "death-note",
    image: "https://ui-avatars.com/api/?name=DN&size=400&background=000000&color=fff&bold=true&font-size=0.5",
    backdrop: "https://image.tmdb.org/t/p/original/qkWAYP3XhQ0vvMKNyISxcgfvpMK.jpg",
    rating: 9.0,
    year: 2006,
    type: "SERIES",
    overview: "A high school student discovers a supernatural notebook that allows him to kill anyone by writing their name.",
    genres: ["Anime", "Thriller", "Mystery"],
    maturity: "TV-14",
    duration: "1 Season",
  },
];

// ============================================================================
// PREVIEW MODAL - NETFLIX STYLE
// ============================================================================

function PreviewModal({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const [isMuted, setIsMuted] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && item.trailerUrl) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, user interaction needed
      });
    }
  }, [item.trailerUrl]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-4xl bg-[#141414] rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all"
        >
          <X className="w-6 h-6 text-white" />
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
              />
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/40 flex items-center justify-center transition-all"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </>
          ) : (
            <Image
              src={item.backdrop || item.image}
              alt={item.title}
              fill
              className="object-cover"
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-4xl font-bold text-white mb-4">{item.title}</h2>

          {/* Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <a href={`/title/${item.slug}`} className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded bg-white hover:bg-white/90 text-black font-bold text-lg transition-colors">
                <Play className="w-6 h-6" fill="black" />
                Play
              </button>
            </a>
            <button className="w-12 h-12 rounded-full bg-transparent border-2 border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all">
              <Plus className="w-6 h-6 text-white" />
            </button>
            <button className="w-12 h-12 rounded-full bg-transparent border-2 border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all">
              <ThumbsUp className="w-6 h-6 text-white" />
            </button>
            <button className="w-12 h-12 rounded-full bg-transparent border-2 border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all">
              <Download className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 mb-4 text-sm">
            <span className="text-[#46d369] font-bold text-lg">{(item.rating * 10).toFixed(0)}% Match</span>
            <span className="text-white font-semibold">{item.year}</span>
            {item.maturity && (
              <span className="px-2 py-1 border border-white/60 text-white text-xs font-bold">
                {item.maturity}
              </span>
            )}
            <span className="text-white">{item.duration}</span>
            <span className="px-2 py-1 border border-white/60 text-white text-xs font-bold">HD</span>
          </div>

          {/* Overview */}
          <p className="text-white/90 text-base leading-relaxed mb-4">{item.overview}</p>

          {/* Genres */}
          {item.genres && (
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Genres:</span>
              <span className="text-white text-sm">{item.genres.join(", ")}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// ULTRA-PREMIUM NETFLIX CARD
// ============================================================================

interface CardProps extends ContentItem {
  index: number;
  isRowHovered: boolean;
  hoveredCard: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
}

function UltraPremiumCard({ title, image, backdrop, rating, year, slug, overview, genres, maturity, duration, trailerUrl, id, index, isRowHovered, hoveredCard, onHover, onLeave }: CardProps) {
  const [inWatchlist, setInWatchlist] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout>();
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Compute if THIS card is the hovered one
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

  return (
    <>
      <motion.div
        ref={cardRef}
        className="relative cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="relative rounded-md overflow-hidden bg-zinc-900 shadow-2xl"
          animate={{
            scale: isHovered ? 1.5 : 1,
            y: isHovered ? 50 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
            delay: isHovered ? 0.3 : 0,
          }}
          style={{
            transformOrigin: "center top",
            zIndex: isHovered ? 50 : 1,
            position: "relative",
          }}
        >
          {/* Poster - Only visible when NOT hovered */}
          <AnimatePresence>
            {!isHovered && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative aspect-[2/3] w-full"
              >
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover rounded-md"
                  sizes="400px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded Card - Ultra Premium Netflix Style */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="relative w-full bg-gradient-to-b from-[#1a1a1a] via-[#141414] to-[#0f0f0f] rounded-lg shadow-2xl ring-1 ring-white/10 overflow-visible"
                style={{ aspectRatio: '16/14' }}
              >
                {/* Backdrop Preview - 42% height for full image visibility */}
                <div className="relative w-full h-[42%]">
                  <Image
                    src={backdrop || image}
                    alt={title}
                    fill
                    className="object-cover rounded-t-lg"
                    sizes="600px"
                    unoptimized
                  />
                  {/* Subtle bottom gradient only */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

                  {/* Play Button - Centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button
                      onClick={handleCardClick}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                      whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(255,255,255,0.6)" }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-all"
                    >
                      <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                    </motion.button>
                  </div>

                  {/* Info Button - Top Right */}
                  <motion.button
                    onClick={handleCardClick}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm border border-white/30 hover:border-white/60 hover:bg-black/90 flex items-center justify-center transition-all group"
                  >
                    <Info className="w-3 h-3 text-white group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                  </motion.button>
                </div>

                {/* Info Section - 58% height with perfect spacing */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="h-[58%] px-3 py-3 flex flex-col justify-between"
                >
                  {/* Top Section - Title & Metadata */}
                  <div className="space-y-2">
                    {/* Title */}
                    <motion.h3
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="text-white font-bold text-xs leading-tight line-clamp-2"
                    >
                      {title}
                    </motion.h3>

                    {/* Metadata Row */}
                    <div className="flex items-center flex-wrap gap-1.5">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="text-[#46d369] font-bold text-[10px] leading-none"
                      >
                        {(rating * 10).toFixed(0)}% Match
                      </motion.span>

                      <span className="text-white/90 font-semibold text-[9px] leading-none">{year}</span>

                      {maturity && (
                        <span className="px-1 py-0.5 border border-white/50 text-white text-[7px] font-bold leading-none">
                          {maturity}
                        </span>
                      )}

                      {duration && (
                        <span className="text-white/80 font-medium text-[9px] leading-none">{duration}</span>
                      )}

                      <span className="px-1 py-0.5 bg-white/20 text-white text-[7px] font-black leading-none ml-auto">
                        HD
                      </span>
                    </div>

                    {/* Genres Pills */}
                    {genres && genres.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
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

                  {/* Bottom Section - Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
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

          {/* Premium Glow Effect on Hover */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            animate={{
              boxShadow: isHovered
                ? "0 0 40px rgba(229, 9, 20, 0.5), 0 0 80px rgba(229, 9, 20, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)"
                : "none",
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Enhanced Drop Shadow */}
        {isHovered && (
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
            item={{ title, image, backdrop, rating, year, slug, overview, genres, maturity, duration, trailerUrl, type: "MOVIE", id: slug }}
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

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -scrollRef.current.clientWidth : scrollRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

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
  }, []);

  return (
    <section className="relative group/row mb-8">
      {/* Section Title with Underline Effect */}
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        className="text-white text-base md:text-lg lg:text-xl font-bold mb-3 px-6 md:px-12 lg:px-16 hover:text-gray-300 transition-colors cursor-pointer group relative w-fit"
      >
        {title}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-red-600 to-red-700 rounded-full"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </motion.h2>

      {/* Nav Arrows - Enhanced */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scroll("left")}
            whileHover={{ scale: 1.05 }}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-40 h-full w-16 items-center justify-center bg-gradient-to-r from-black via-black/95 to-transparent opacity-0 group-hover/row:opacity-100 transition-all duration-300"
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
            whileHover={{ scale: 1.05 }}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-40 h-full w-16 items-center justify-center bg-gradient-to-l from-black via-black/95 to-transparent opacity-0 group-hover/row:opacity-100 transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-full bg-black/90 border-2 border-white/30 hover:border-white/60 flex items-center justify-center hover:bg-black transition-all shadow-2xl">
              <ChevronRight className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cards Container - Optimized Spacing */}
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto overflow-y-visible scrollbar-hide px-6 md:px-12 lg:px-16 scroll-smooth pb-[250px] pt-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="flex-shrink-0 w-[180px] md:w-[220px] lg:w-[260px]"
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

function CinematicHero() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const [isMuted, setIsMuted] = React.useState(true);
  const [showVideo, setShowVideo] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    // Delay video playback for performance
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (videoRef.current && showVideo) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, that's okay
      });
    }
  }, [showVideo]);

  return (
    <motion.div style={{ opacity }} className="relative h-[85vh] overflow-hidden">
      <motion.div style={{ scale }} className="absolute inset-0">
        {/* Video Background */}
        <AnimatePresence>
          {showVideo && (
            <motion.video
              ref={videoRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              poster={featuredContent.backdrop}
            >
              <source src={featuredContent.videoUrl} type="video/mp4" />
            </motion.video>
          )}
        </AnimatePresence>

        {/* Fallback Image */}
        {!showVideo && (
          <Image
            src={featuredContent.backdrop}
            alt={featuredContent.title}
            fill
            className="object-cover"
            priority
            quality={90}
          />
        )}

        {/* Enhanced Multi-layer Gradients for Depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
      </motion.div>

      <div className="relative z-10 h-full flex items-end">
        <div className="px-6 md:px-12 lg:px-16 pb-16 md:pb-20 max-w-4xl">
          {/* Trending Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-red-600 to-red-700 mb-5 shadow-2xl ring-2 ring-red-500/30"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-lg" />
            <span className="text-white text-xs font-bold uppercase tracking-widest">#1 in Movies Today</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-5 leading-none tracking-tight"
            style={{
              textShadow: "0 4px 40px rgba(0,0,0,0.95), 0 2px 20px rgba(0,0,0,0.9), 0 0 60px rgba(229, 9, 20, 0.4)",
            }}
          >
            {featuredContent.title}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-red-400 text-lg md:text-xl font-bold italic mb-5"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
          >
            "{featuredContent.tagline}"
          </motion.p>

          {/* Metadata Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center flex-wrap gap-3 md:gap-4 mb-5 text-base"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
              <span className="text-white font-bold text-xl md:text-2xl">{featuredContent.rating}</span>
            </div>
            <span className="text-gray-400 text-lg">•</span>
            <span className="text-white font-semibold text-base md:text-lg">{featuredContent.year}</span>
            <span className="text-gray-400 text-lg">•</span>
            <span className="px-2.5 py-1 border-2 border-white/70 text-white font-bold text-xs md:text-sm rounded shadow-lg">
              {featuredContent.maturity}
            </span>
            <span className="text-gray-400 text-lg">•</span>
            <span className="text-white text-base md:text-lg font-medium">{featuredContent.duration}</span>
          </motion.div>

          {/* Overview */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-white/95 text-base md:text-lg leading-relaxed mb-7 max-w-2xl line-clamp-3"
            style={{ textShadow: "0 2px 15px rgba(0,0,0,0.9)" }}
          >
            {featuredContent.overview}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center flex-wrap gap-3 md:gap-4"
          >
            <a href={`/title/${featuredContent.slug}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 px-8 md:px-10 py-3 md:py-3.5 rounded-md bg-white hover:bg-gray-100 text-black font-bold text-base md:text-lg shadow-2xl transition-all"
              >
                <Play className="w-5 h-5 md:w-6 md:h-6" fill="black" />
                <span>Play</span>
              </motion.button>
            </a>

            <a href={`/title/${featuredContent.slug}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 px-7 md:px-9 py-3 md:py-3.5 rounded-md bg-gray-700/70 hover:bg-gray-700/90 backdrop-blur-sm text-white font-bold text-base md:text-lg border-2 border-white/50 hover:border-white/70 transition-all shadow-xl"
              >
                <Info className="w-5 h-5 md:w-6 md:h-6" />
                <span>More Info</span>
              </motion.button>
            </a>

            {/* Mute Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMuted(!isMuted)}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-transparent border-2 border-white/60 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all shadow-lg"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
              ) : (
                <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />

      {/* Age Rating Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-20 md:top-24 right-4 md:right-8 px-3 md:px-4 py-1.5 md:py-2 border-3 md:border-4 border-white/80 text-white font-black text-lg md:text-2xl rounded shadow-2xl backdrop-blur-sm bg-black/20"
      >
        {featuredContent.maturity}
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// MAIN
// ============================================================================

export default function UltraPremiumHome() {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden scroll-smooth">
      {/* Cinematic Hero Section */}
      <CinematicHero />

      {/* Content Rows Section */}
      <div className="relative -mt-16 z-20 overflow-x-hidden bg-black pt-4">
        {/* Top gradient blend for seamless transition */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />

        {/* Content Grid */}
        <div className="relative pb-12">
          <EnhancedContentRow title="Trending Now" items={demoMovies} index={0} />
          <EnhancedContentRow title="Popular on MoviesNow" items={demoSeries} index={1} />
          <EnhancedContentRow title="Action Blockbusters" items={demoMovies} index={2} />
          <EnhancedContentRow title="Award-Winning Series" items={demoSeries} index={3} />
          <EnhancedContentRow title="New Releases" items={demoMovies} index={4} />
          <EnhancedContentRow title="Top Rated Anime" items={demoSeries} index={5} />
          <EnhancedContentRow title="Critically Acclaimed" items={demoMovies} index={6} />
        </div>
      </div>
    </div>
  );
}
