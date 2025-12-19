'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🎬 CINEMATIC HERO SECTION
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Large, immersive hero banner featuring trending/featured content.
 *
 * Features:
 * • Full-width cinematic backdrop with gradient overlay
 * • Parallax scroll effects
 * • Smooth fade-in animations
 * • Quality badges and metadata
 * • Primary CTAs (Play, Add to List)
 * • Mobile-responsive with touch optimization
 */

import * as React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, Plus, Info } from 'lucide-react';
import Link from 'next/link';
import { colors, shadows, animation, cardDimensions } from '@/lib/design-system';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface CinematicHeroProps {
  title: {
    id: string;
    name: string;
    slug: string;
    type: 'MOVIE' | 'SERIES';
    overview?: string | null;
    tagline?: string | null;
    backdrop_url?: string | null;
    rating_average?: number;
    release_year?: number;
    genres?: Array<{ id: string; name: string }>;
    enabled_stream_qualities?: string[];
  };
  onPlay?: () => void;
  onAddToList?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function CinematicHero({ title, onPlay, onAddToList }: CinematicHeroProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]); // Parallax effect
  const opacity = useTransform(scrollY, [0, 300], [1, 0]); // Fade out on scroll

  const backdropUrl = title.backdrop_url || '/placeholder-backdrop.jpg';
  const rating = title.rating_average ? (title.rating_average / 10).toFixed(1) : null;
  const year = title.release_year;
  const genres = title.genres?.slice(0, 3) || [];
  const topQuality = title.enabled_stream_qualities?.[0] || '1080p';

  return (
    <motion.section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: cardDimensions.hero.minHeight.lg,
        opacity
      }}
      initial="initial"
      animate="animate"
      variants={animation.variants.fadeIn}
    >
      {/* Backdrop Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backdropUrl})`,
            filter: 'brightness(0.7)',
          }}
        />
      </motion.div>

      {/* Gradient Overlays */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: colors.gradient.hero,
        }}
      />
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(90deg, ${colors.bg.primary} 0%, transparent 50%, ${colors.bg.primary} 100%)`,
        }}
      />

      {/* Content Container */}
      <div className="relative z-20 flex min-h-[600px] items-end px-4 pb-12 pt-32 sm:px-6 lg:px-8 lg:pb-16 lg:pt-40">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div
            className="max-w-2xl space-y-4"
            variants={animation.variants.slideUp}
          >
            {/* Title */}
            <motion.h1
              className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              style={{
                color: colors.text.primary,
                textShadow: shadows.lg,
              }}
              variants={animation.variants.slideUp}
            >
              {title.name}
            </motion.h1>

            {/* Metadata */}
            <motion.div
              className="flex flex-wrap items-center gap-3 text-sm sm:text-base"
              style={{ color: colors.text.secondary }}
              variants={animation.variants.slideUp}
            >
              {/* Rating */}
              {rating && (
                <div className="flex items-center gap-1">
                  <span style={{ color: colors.accent.success }} className="text-lg font-bold">
                    ★
                  </span>
                  <span className="font-semibold">{rating}</span>
                </div>
              )}

              {/* Year */}
              {year && <span className="font-medium">{year}</span>}

              {/* Quality Badge */}
              <span
                className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
                style={{
                  background: colors.accent.primary,
                  color: colors.text.inverse,
                }}
              >
                {topQuality}
              </span>

              {/* Type */}
              <span
                className="rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
                style={{
                  background: colors.bg.elevated,
                  color: colors.text.secondary,
                }}
              >
                {title.type}
              </span>
            </motion.div>

            {/* Genres */}
            {genres.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-2"
                variants={animation.variants.slideUp}
              >
                {genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/genre/${genre.name.toLowerCase()}`}
                    className="rounded-full px-3 py-1 text-sm font-medium transition-colors hover:bg-white/20"
                    style={{
                      background: colors.bg.glass,
                      color: colors.text.secondary,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {genre.name}
                  </Link>
                ))}
              </motion.div>
            )}

            {/* Tagline or Overview */}
            {(title.tagline || title.overview) && (
              <motion.p
                className="max-w-xl text-base leading-relaxed sm:text-lg"
                style={{
                  color: colors.text.secondary,
                  textShadow: shadows.md,
                }}
                variants={animation.variants.slideUp}
              >
                {title.tagline || title.overview?.slice(0, 180) + '...'}
              </motion.p>
            )}

            {/* Action Buttons */}
            <motion.div
              className="flex flex-wrap gap-3 pt-4"
              variants={animation.variants.slideUp}
            >
              {/* Play Button */}
              <motion.button
                onClick={onPlay}
                className="flex items-center gap-2 rounded-lg px-6 py-3 font-bold transition-all"
                style={{
                  background: colors.accent.primary,
                  color: colors.text.inverse,
                  boxShadow: shadows.glow.pink,
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 0, 128, 0.7)' }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={20} fill="currentColor" />
                <span>Play Now</span>
              </motion.button>

              {/* Add to List Button */}
              <motion.button
                onClick={onAddToList}
                className="flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all"
                style={{
                  background: colors.bg.glass,
                  color: colors.text.primary,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${colors.border.default}`,
                }}
                whileHover={{
                  scale: 1.05,
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderColor: colors.border.hover,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} />
                <span>My List</span>
              </motion.button>

              {/* More Info Link */}
              <Link href={`/title/${title.slug}`}>
                <motion.button
                  className="flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all"
                  style={{
                    background: colors.bg.glass,
                    color: colors.text.primary,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${colors.border.default}`,
                  }}
                  whileHover={{
                    scale: 1.05,
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderColor: colors.border.hover,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Info size={20} />
                  <span>More Info</span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div
        className="absolute bottom-0 left-0 right-0 z-15 h-24"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${colors.bg.primary} 100%)`,
        }}
      />
    </motion.section>
  );
}
