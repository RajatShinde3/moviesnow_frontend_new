/**
 * =============================================================================
 * Ultra Premium Content Card
 * =============================================================================
 * Features:
 * - Glassmorphism 2.0 with multi-layer depth
 * - Advanced hover effects with spotlight
 * - Smooth spring animations
 * - Quality badges (HD, 4K)
 * - Progress indicators
 * - Interactive micro-animations
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import {
  PlayIcon,
  AddToListIcon,
  LikeIcon,
  InfoIcon,
  StarIcon,
  CheckIcon,
  HDBadgeIcon,
  FourKBadgeIcon,
} from '../icons/CustomIcons';

interface ContentCardProps {
  title: string;
  slug: string;
  thumbnail?: string;
  backdrop?: string;
  type?: 'MOVIE' | 'SERIES' | 'ANIME' | 'DOCUMENTARY';
  rating?: number;
  year?: number;
  duration?: string;
  quality?: 'HD' | '4K' | 'UHD';
  isNew?: boolean;
  inWatchlist?: boolean;
  progress?: number; // 0-100
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function UltraContentCard({
  title,
  slug,
  thumbnail,
  backdrop,
  type = 'MOVIE',
  rating,
  year,
  duration,
  quality = 'HD',
  isNew = false,
  inWatchlist = false,
  progress = 0,
  className,
  size = 'md',
}: ContentCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Mouse position for spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const rotateX = useTransform(y, [0, 1], [5, -5]);
  const rotateY = useTransform(x, [0, 1], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXLocal = e.clientX - rect.left;
    const mouseYLocal = e.clientY - rect.top;
    const xPct = mouseXLocal / width;
    const yPct = mouseYLocal / height;

    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const sizeClasses = {
    sm: 'aspect-[2/3] max-w-[150px]',
    md: 'aspect-[2/3] max-w-[200px]',
    lg: 'aspect-[16/9] max-w-[400px]',
  };

  return (
    <motion.div
      className={cn('group relative cursor-pointer', sizeClasses[size], className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        mouseX.set(0.5);
        mouseY.set(0.5);
      }}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/title/${slug}`}>
        <motion.div
          className="relative w-full h-full rounded-xl overflow-hidden shadow-card transition-shadow duration-300 group-hover:shadow-card-hover"
          style={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            transformStyle: 'preserve-3d',
          }}
          whileHover={{ scale: 1.05, z: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Image Container */}
          <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900">
            {thumbnail || backdrop ? (
              <>
                <Image
                  src={thumbnail || backdrop || '/placeholder.jpg'}
                  alt={title}
                  fill
                  className={cn(
                    'object-cover transition-all duration-700',
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110',
                    isHovered && 'scale-110 brightness-110'
                  )}
                  onLoad={() => setImageLoaded(true)}
                  sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 400px"
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 skeleton" />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
                <span className="text-6xl font-bold text-white/20">
                  {title.charAt(0)}
                </span>
              </div>
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

            {/* Spotlight Effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 150px at ${x.get() * 100}% ${y.get() * 100}%, rgba(139, 92, 246, 0.2), transparent 80%)`,
              }}
            />

            {/* Top Badges */}
            <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
              <div className="flex flex-col gap-1">
                {isNew && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="badge-new w-fit"
                  >
                    NEW
                  </motion.div>
                )}
                {quality && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {quality === '4K' ? (
                      <FourKBadgeIcon size={16} className="drop-shadow-lg" />
                    ) : (
                      <HDBadgeIcon size={16} className="text-white drop-shadow-lg" />
                    )}
                  </motion.div>
                )}
              </div>

              {/* Watchlist Button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'p-2 rounded-full glass transition-colors',
                  inWatchlist ? 'bg-primary/30' : 'bg-black/30'
                )}
                aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {inWatchlist ? (
                  <CheckIcon size={16} className="text-primary" />
                ) : (
                  <AddToListIcon size={16} className="text-white" />
                )}
              </motion.button>
            </div>

            {/* Hover Actions */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-x-0 bottom-0 p-4 z-20"
                >
                  {/* Title & Meta */}
                  <div className="mb-3">
                    <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 mb-1">
                      {title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      {year && <span>{year}</span>}
                      {duration && (
                        <>
                          <span>•</span>
                          <span>{duration}</span>
                        </>
                      )}
                      {rating && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <StarIcon size={12} filled className="text-yellow-400" />
                            <span>{rating.toFixed(1)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group/play flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black font-semibold text-sm transition-all hover:bg-primary hover:text-white"
                    >
                      <PlayIcon size={16} />
                      <span className="hidden sm:inline">Play</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg glass hover:bg-white/20 transition-colors"
                      aria-label="More info"
                    >
                      <InfoIcon size={16} className="text-white" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg glass hover:bg-white/20 transition-colors"
                      aria-label="Like"
                    >
                      <LikeIcon size={16} className="text-white" />
                    </motion.button>
                  </div>

                  {/* Progress Bar */}
                  {progress > 0 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="mt-3 h-1 w-full bg-white/20 rounded-full overflow-hidden"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-purple-500"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Glass Border Effect */}
          <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-white/30 transition-colors duration-300 pointer-events-none" />
        </motion.div>
      </Link>
    </motion.div>
  );
}

