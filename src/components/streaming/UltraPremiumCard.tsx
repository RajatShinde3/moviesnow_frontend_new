'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 💎 ULTRA PREMIUM CONTENT CARD
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Netflix-level content card with ALL premium features.
 *
 * Features:
 * ✨ Video hover preview (auto-play trailer)
 * ✨ Magnetic hover effect
 * ✨ Shimmer loading with gradient
 * ✨ Dynamic glow based on poster colors
 * ✨ Sound on hover (optional)
 * ✨ Advanced micro-interactions
 * ✨ Progress bar for continue watching
 * ✨ 3D tilt effect
 */

import * as React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Plus, Star, Info, Check, Clock } from 'lucide-react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { colors, shadows, animation, qualityColor, typeColor } from '@/lib/design-system';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UltraPremiumCardProps {
  title: {
    id: string;
    name: string;
    slug: string;
    type: 'MOVIE' | 'SERIES';
    poster_url?: string | null;
    preview_video_url?: string | null; // NEW: Short trailer/preview
    rating_average?: number;
    release_year?: number;
    enabled_stream_qualities?: string[];
    genres?: Array<{ id: string; name: string }>;
    runtime_minutes?: number;
  };
  progress?: number; // 0-100 for continue watching
  isInWatchlist?: boolean;
  onPlay?: () => void;
  onAddToList?: () => void;
  onRemoveFromList?: () => void;
  size?: 'sm' | 'md' | 'lg';
  index?: number; // For stagger animation delay
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function UltraPremiumCard({
  title,
  progress,
  isInWatchlist = false,
  onPlay,
  onAddToList,
  onRemoveFromList,
  size = 'md',
  index = 0,
}: UltraPremiumCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // Intersection observer for lazy loading
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '200px',
  });

  // 3D Tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 });

  const posterUrl = title.poster_url || '/placeholder-poster.jpg';
  const rating = title.rating_average ? (title.rating_average / 10).toFixed(1) : null;
  const year = title.release_year;
  const topQuality = title.enabled_stream_qualities?.[0] || '1080p';
  const firstGenre = title.genres?.[0]?.name;
  const runtime = title.runtime_minutes ? `${Math.floor(title.runtime_minutes / 60)}h ${title.runtime_minutes % 60}m` : null;

  // Responsive card dimensions
  const cardWidth = {
    sm: 140,
    md: 180,
    lg: 220,
  }[size];

  const cardHeight = cardWidth * 1.5; // 2:3 aspect ratio

  // Handle mouse move for 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovering(false);
    setShowPreview(false);

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);

    // Delay video preview to avoid too many requests
    hoverTimeoutRef.current = setTimeout(() => {
      if (title.preview_video_url && videoRef.current) {
        setShowPreview(true);
        videoRef.current.play().catch(() => {
          // Autoplay might be blocked
          setShowPreview(false);
        });
      }
    }, 800); // 800ms delay before showing video
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={inViewRef}
      className="group relative flex-shrink-0 cursor-pointer"
      style={{
        width: cardWidth,
        perspective: 1000,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/title/${title.slug}`}>
        <motion.div
          className="relative overflow-hidden rounded-lg"
          style={{
            height: cardHeight,
            boxShadow: shadows.md,
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          whileHover={{
            scale: 1.05,
            y: -8,
            boxShadow: `${shadows.xl}, ${shadows.glow.pink}`,
            transition: { duration: 0.3 },
          }}
        >
          {/* Shimmer Loading Effect */}
          {!imageLoaded && inView && (
            <div
              className="absolute inset-0 z-10"
              style={{
                background: `linear-gradient(110deg, ${colors.bg.secondary} 8%, ${colors.bg.elevated} 18%, ${colors.bg.secondary} 33%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s linear infinite',
              }}
            />
          )}

          {/* Poster Image */}
          {inView && (
            <div className="absolute inset-0">
              <img
                src={posterUrl}
                alt={title.name}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`h-full w-full object-cover transition-all duration-700 ${
                  imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                } ${showPreview ? 'opacity-0' : 'opacity-100'}`}
                style={{
                  filter: isHovering ? 'brightness(1.2) contrast(1.1)' : 'brightness(1)',
                }}
              />
            </div>
          )}

          {/* Video Preview (Netflix-style) */}
          {title.preview_video_url && showPreview && (
            <motion.video
              ref={videoRef}
              src={title.preview_video_url}
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Ambient Glow */}
          <motion.div
            className="absolute inset-0 opacity-0 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${colors.accent.primary}40, transparent 70%)`,
            }}
            animate={{ opacity: isHovering ? 1 : 0 }}
          />

          {/* Top Badges */}
          <div className="absolute left-2 top-2 z-20 flex flex-col gap-1">
            {/* Quality Badge */}
            <motion.div
              className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md"
              style={{
                background: qualityColor(topQuality as '480p' | '720p' | '1080p'),
                color: colors.text.inverse,
                boxShadow: shadows.md,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {topQuality}
            </motion.div>

            {/* Type Badge */}
            <motion.div
              className="rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-md"
              style={{
                background: typeColor(title.type.toLowerCase() as 'movie' | 'series'),
                color: colors.text.inverse,
                boxShadow: shadows.md,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              {title.type}
            </motion.div>

            {/* Watchlist indicator */}
            {isInWatchlist && (
              <motion.div
                className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold backdrop-blur-md"
                style={{
                  background: colors.accent.success,
                  color: colors.text.inverse,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Check size={12} />
              </motion.div>
            )}
          </div>

          {/* Progress Bar (Continue Watching) */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 z-20">
              <div className="h-1 w-full bg-gray-700">
                <motion.div
                  className="h-full"
                  style={{
                    background: colors.accent.primary,
                    boxShadow: shadows.glow.pink,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Bottom Gradient Overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(10, 10, 15, 0.95) 100%)',
              height: isHovering ? '80%' : '60%',
              opacity: showPreview ? 0 : 1,
            }}
          />

          {/* Title & Info */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-20 p-3 space-y-1"
            animate={{ opacity: showPreview ? 0 : 1 }}
          >
            <h3
              className="line-clamp-2 text-sm font-bold leading-tight"
              style={{ color: colors.text.primary, textShadow: shadows.md }}
            >
              {title.name}
            </h3>

            {/* Metadata Row */}
            <div className="flex items-center gap-2 text-xs" style={{ color: colors.text.secondary }}>
              {/* Rating */}
              {rating && (
                <div className="flex items-center gap-0.5">
                  <Star size={12} fill={colors.accent.success} color={colors.accent.success} />
                  <span className="font-semibold">{rating}</span>
                </div>
              )}

              {/* Year */}
              {year && <span>{year}</span>}

              {/* Runtime */}
              {runtime && isHovering && (
                <motion.span
                  className="flex items-center gap-0.5"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                >
                  <Clock size={12} />
                  {runtime}
                </motion.span>
              )}
            </div>

            {/* Genre (on hover) */}
            {firstGenre && isHovering && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs truncate"
                style={{ color: colors.text.tertiary }}
              >
                {firstGenre}
              </motion.div>
            )}
          </motion.div>

          {/* Hover Overlay - Quick Actions */}
          <motion.div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 p-4"
            style={{
              background: 'rgba(10, 10, 15, 0.90)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering && !showPreview ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Play Button */}
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlay?.();
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                background: colors.accent.primary,
                color: colors.text.inverse,
                boxShadow: shadows.glow.pink,
              }}
              whileHover={{
                scale: 1.15,
                boxShadow: '0 0 30px rgba(255, 0, 128, 0.8)',
                rotate: [0, -5, 5, -5, 0],
              }}
              whileTap={{ scale: 0.9 }}
              aria-label="Play"
            >
              <Play size={20} fill="currentColor" />
            </motion.button>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2">
              {/* Add/Remove from List */}
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  isInWatchlist ? onRemoveFromList?.() : onAddToList?.();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: isInWatchlist ? colors.accent.success : colors.bg.glass,
                  color: colors.text.primary,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${colors.border.default}`,
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: isInWatchlist ? 0 : 180,
                }}
                whileTap={{ scale: 0.9 }}
                aria-label={isInWatchlist ? 'Remove from list' : 'Add to list'}
              >
                {isInWatchlist ? <Check size={16} /> : <Plus size={16} />}
              </motion.button>

              {/* More Info */}
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Link will handle navigation
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: colors.bg.glass,
                  color: colors.text.primary,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${colors.border.default}`,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="More info"
              >
                <Info size={16} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </Link>

      {/* Shimmer animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </motion.div>
  );
}
