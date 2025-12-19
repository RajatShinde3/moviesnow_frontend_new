'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 💎 PREMIUM LOADING SKELETONS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Beautiful loading skeletons with shimmer effects.
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { colors, cardDimensions } from '@/lib/design-system';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BASE SHIMMER COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Shimmer({ className = '', width, height }: { className?: string; width?: number | string; height?: number | string }) {
  return (
    <div
      className={`overflow-hidden rounded ${className}`}
      style={{
        width,
        height,
        background: `linear-gradient(110deg, ${colors.bg.secondary} 8%, ${colors.bg.elevated} 18%, ${colors.bg.secondary} 33%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s linear infinite',
      }}
    >
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
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HERO SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function HeroSkeleton() {
  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-lg"
      style={{
        minHeight: cardDimensions.hero.minHeight.lg,
        background: colors.bg.secondary,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background shimmer */}
      <Shimmer height="100%" />

      {/* Content area */}
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <Shimmer width="60%" height="48px" />
        <Shimmer width="40%" height="24px" />
        <Shimmer width="50%" height="20px" />

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Shimmer width="150px" height="48px" className="rounded-lg" />
          <Shimmer width="150px" height="48px" className="rounded-lg" />
          <Shimmer width="150px" height="48px" className="rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CARD SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function CardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cardWidth = {
    sm: 140,
    md: 180,
    lg: 220,
  }[size];

  const cardHeight = cardWidth * 1.5; // 2:3 aspect ratio

  return (
    <motion.div
      className="flex-shrink-0"
      style={{ width: cardWidth }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Shimmer width={cardWidth} height={cardHeight} className="rounded-lg" />
      <div className="mt-2 space-y-1">
        <Shimmer width="90%" height="16px" />
        <Shimmer width="60%" height="14px" />
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RAIL SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function RailSkeleton({ count = 6, size = 'md' }: { count?: number; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <Shimmer width="200px" height="28px" />

      {/* Cards */}
      <div className="flex gap-4 overflow-x-hidden">
        {[...Array(count)].map((_, i) => (
          <CardSkeleton key={i} size={size} />
        ))}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FULL PAGE SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function FullPageSkeleton() {
  return (
    <div className="min-h-screen space-y-8 py-8" style={{ background: colors.bg.primary }}>
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8">
        <HeroSkeleton />
      </div>

      {/* Rails */}
      {[...Array(4)].map((_, i) => (
        <RailSkeleton key={i} />
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRID SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function GridSkeleton({ count = 12, size = 'md' }: { count?: number; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:px-6 lg:px-8">
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} size={size} />
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEXT SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function TextSkeleton({ lines = 3, width = '100%' }: { lines?: number; width?: string }) {
  return (
    <div className="space-y-2" style={{ width }}>
      {[...Array(lines)].map((_, i) => (
        <Shimmer
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height="16px"
        />
      ))}
    </div>
  );
}
