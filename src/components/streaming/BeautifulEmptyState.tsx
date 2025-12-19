'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🎨 BEAUTIFUL EMPTY STATES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Engaging empty states with animations and CTAs.
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Film,
  Heart,
  Download,
  TrendingUp,
  Sparkles,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';
import { colors, shadows, animation } from '@/lib/design-system';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type EmptyStateType =
  | 'search'
  | 'watchlist'
  | 'downloads'
  | 'history'
  | 'trending'
  | 'generic';

interface BeautifulEmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRESETS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const emptyStatePresets: Record<
  EmptyStateType,
  {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
    gradient: string;
  }
> = {
  search: {
    icon: <Search size={64} />,
    title: 'No results found',
    description: 'Try different keywords or browse our catalog',
    actionLabel: 'Browse All',
    actionHref: '/browse',
    gradient: colors.accent.secondary,
  },
  watchlist: {
    icon: <Heart size={64} />,
    title: 'Your watchlist is empty',
    description: 'Start adding titles you want to watch later',
    actionLabel: 'Explore Trending',
    actionHref: '/browse?sort_by=popularity',
    gradient: colors.accent.primary,
  },
  downloads: {
    icon: <Download size={64} />,
    title: 'No downloads yet',
    description: 'Download content to watch offline anytime',
    actionLabel: 'Find Something to Download',
    actionHref: '/browse',
    gradient: colors.accent.tertiary,
  },
  history: {
    icon: <PlayCircle size={64} />,
    title: 'No watch history',
    description: 'Start watching to build your personal history',
    actionLabel: 'Start Watching',
    actionHref: '/home',
    gradient: colors.accent.success,
  },
  trending: {
    icon: <TrendingUp size={64} />,
    title: 'Nothing trending right now',
    description: 'Check back soon for the hottest content',
    actionLabel: 'Browse Catalog',
    actionHref: '/browse',
    gradient: colors.accent.secondary,
  },
  generic: {
    icon: <Film size={64} />,
    title: 'Nothing here yet',
    description: 'Explore our amazing catalog of content',
    actionLabel: 'Get Started',
    actionHref: '/home',
    gradient: colors.accent.primary,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function BeautifulEmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: BeautifulEmptyStateProps) {
  const preset = emptyStatePresets[type];

  const finalTitle = title || preset.title;
  const finalDescription = description || preset.description;
  const finalActionLabel = actionLabel || preset.actionLabel;
  const finalActionHref = actionHref || preset.actionHref;

  return (
    <motion.div
      className="flex min-h-[400px] flex-col items-center justify-center px-4 py-16 text-center"
      initial="initial"
      animate="animate"
      variants={animation.variants.fadeIn}
    >
      {/* Floating Icon with Glow */}
      <motion.div
        className="relative mb-8"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            filter: `blur(30px)`,
            background: preset.gradient,
            opacity: 0.3,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Icon */}
        <div
          className="relative rounded-full p-6"
          style={{
            background: colors.bg.elevated,
            color: preset.gradient,
            border: `2px solid ${colors.border.default}`,
          }}
        >
          {preset.icon}
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        className="mb-3 text-3xl font-bold"
        style={{ color: colors.text.primary }}
        variants={animation.variants.slideUp}
      >
        {finalTitle}
      </motion.h2>

      {/* Description */}
      <motion.p
        className="mb-8 max-w-md text-lg"
        style={{ color: colors.text.secondary }}
        variants={animation.variants.slideUp}
      >
        {finalDescription}
      </motion.p>

      {/* CTA Button */}
      <motion.div variants={animation.variants.slideUp}>
        {onAction ? (
          <motion.button
            onClick={onAction}
            className="rounded-lg px-8 py-3 font-bold text-lg"
            style={{
              background: preset.gradient,
              color: colors.text.inverse,
              boxShadow: `0 0 20px ${preset.gradient}80`,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 0 30px ${preset.gradient}`,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {finalActionLabel}
          </motion.button>
        ) : (
          <Link href={finalActionHref}>
            <motion.button
              className="rounded-lg px-8 py-3 font-bold text-lg"
              style={{
                background: preset.gradient,
                color: colors.text.inverse,
                boxShadow: `0 0 20px ${preset.gradient}80`,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 30px ${preset.gradient}`,
              }}
              whileTap={{ scale: 0.95 }}
            >
              {finalActionLabel}
            </motion.button>
          </Link>
        )}
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-64 w-64 rounded-full"
            style={{
              background: `radial-gradient(circle, ${preset.gradient}20, transparent)`,
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
