'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🎴 PREMIUM CONTENT CARD
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Modern, interactive content card with hover effects.
 *
 * Features:
 * • Smooth hover lift and glow
 * • Quality badges (1080p/720p/480p)
 * • Rating and metadata overlay
 * • Lazy-loaded poster images
 * • Accessibility (keyboard nav, ARIA labels)
 * • Responsive sizing
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import { colors, shadows, animation, qualityColor, typeColor } from '@/lib/design-system';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PremiumCardProps {
  title: {
    id: string;
    name: string;
    slug: string;
    type: 'MOVIE' | 'SERIES';
    poster_url?: string | null;
    rating_average?: number;
    release_year?: number;
    enabled_stream_qualities?: string[];
    genres?: Array<{ id: string; name: string }>;
  };
  onPlay?: () => void;
  onAddToList?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function PremiumCard({ title, onPlay, onAddToList, size = 'md' }: PremiumCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);

  const posterUrl = title.poster_url || '/placeholder-poster.jpg';
  const rating = title.rating_average ? (title.rating_average / 10).toFixed(1) : null;
  const year = title.release_year;
  const topQuality = title.enabled_stream_qualities?.[0] || '1080p';
  const firstGenre = title.genres?.[0]?.name;

  // Responsive card width based on size
  const cardWidth = {
    sm: 140,
    md: 180,
    lg: 220,
  }[size];

  const cardHeight = cardWidth * 1.5; // 2:3 aspect ratio for posters

  return (
    <motion.div
      className="group relative flex-shrink-0 cursor-pointer"
      style={{
        width: cardWidth,
      }}
      variants={animation.variants.slideUp}
      whileHover="whileHover"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link href={`/title/${title.slug}`}>
        <motion.div
          className="relative overflow-hidden rounded-lg"
          style={{
            height: cardHeight,
            boxShadow: shadows.md,
          }}
          variants={animation.variants.hoverLift}
          whileHover={{
            boxShadow: `${shadows.xl}, ${shadows.glow.pink}`,
          }}
        >
          {/* Poster Image */}
          <div className="absolute inset-0">
            <img
              src={posterUrl}
              alt={title.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-cover transition-all duration-500 ${
                imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
              }`}
              style={{
                filter: isHovering ? 'brightness(1.1)' : 'brightness(1)',
              }}
            />
          </div>

          {/* Skeleton Loader */}
          {!imageLoaded && (
            <div
              className="absolute inset-0 animate-pulse"
              style={{ background: colors.bg.tertiary }}
            />
          )}

          {/* Top Badges */}
          <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
            {/* Quality Badge */}
            <motion.div
              className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
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
              className="rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
              style={{
                background: colors.bg.glass,
                color: colors.text.primary,
                backdropFilter: 'blur(10px)',
                boxShadow: shadows.md,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              {title.type}
            </motion.div>
          </div>

          {/* Bottom Gradient Overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 z-10"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(10, 10, 15, 0.9) 100%)',
              height: '60%',
            }}
          />

          {/* Title & Info */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-3 space-y-1">
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

              {/* Genre */}
              {firstGenre && (
                <span className="truncate" title={firstGenre}>
                  {firstGenre}
                </span>
              )}
            </div>
          </div>

          {/* Hover Overlay - Quick Actions */}
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(10, 10, 15, 0.85)',
              backdropFilter: 'blur(5px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Play Button */}
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlay?.();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: colors.accent.primary,
                color: colors.text.inverse,
                boxShadow: shadows.glow.pink,
              }}
              whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(255, 0, 128, 0.8)' }}
              whileTap={{ scale: 0.9 }}
              aria-label="Play"
            >
              <Play size={18} fill="currentColor" />
            </motion.button>

            {/* Add to List Button */}
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToList?.();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: colors.bg.glass,
                color: colors.text.primary,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${colors.border.default}`,
              }}
              whileHover={{
                scale: 1.1,
                background: 'rgba(255, 255, 255, 0.2)',
                borderColor: colors.border.hover,
              }}
              whileTap={{ scale: 0.9 }}
              aria-label="Add to list"
            >
              <Plus size={18} />
            </motion.button>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
