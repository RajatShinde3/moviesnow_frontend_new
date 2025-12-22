/**
 * =============================================================================
 * Ultra Hero Section - Modern Design with Gradient Mesh
 * =============================================================================
 * Features:
 * - Animated gradient mesh background
 * - Glassmorphism overlays
 * - Parallax effects
 * - Smooth scroll animations
 * - Auto-play video preview on hover
 * - Responsive design
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/cn';
import {
  PlayIcon,
  AddToListIcon,
  InfoIcon,
  VolumeHighIcon,
  VolumeMutedIcon,
  StarIcon,
} from '../icons/CustomIcons';

interface HeroSectionProps {
  title: string;
  slug: string;
  description?: string;
  backdrop?: string;
  logo?: string;
  rating?: number;
  year?: number;
  genres?: string[];
  videoPreview?: string;
  className?: string;
}

export function UltraHeroSection({
  title,
  slug,
  description,
  backdrop,
  logo,
  rating,
  year,
  genres = [],
  videoPreview,
  className,
}: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [videoMuted, setVideoMuted] = React.useState(true);
  const [showVideo, setShowVideo] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Auto-play video preview
  React.useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay failed
      });
    }
  }, [showVideo]);

  return (
    <motion.section
      style={{ opacity }}
      className={cn('relative w-full overflow-hidden', className)}
    >
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 mesh-gradient opacity-40" />

      {/* Backdrop Image Container */}
      <div className="relative h-[70vh] md:h-[85vh] lg:h-[95vh] max-h-[1080px]">
        <motion.div style={{ y }} className="absolute inset-0">
          {/* Background Image */}
          {backdrop && (
            <>
              <Image
                src={backdrop}
                alt={title}
                fill
                priority
                className={cn(
                  'object-cover object-top transition-all duration-1000',
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                )}
                onLoad={() => setImageLoaded(true)}
                quality={90}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 skeleton" />
              )}
            </>
          )}

          {/* Video Preview (on hover/after delay) */}
          {videoPreview && (
            <motion.video
              ref={videoRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: showVideo ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              src={videoPreview}
              muted={videoMuted}
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
        </motion.div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex items-end md:items-center">
          <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20 lg:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl space-y-4 md:space-y-6"
            >
              {/* Logo or Title */}
              {logo ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="relative w-full max-w-md h-24 md:h-32"
                >
                  <Image
                    src={logo}
                    alt={title}
                    fill
                    className="object-contain object-left"
                  />
                </motion.div>
              ) : (
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white text-shadow-lg leading-tight"
                >
                  {title}
                </motion.h1>
              )}

              {/* Meta Information */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center gap-3 text-sm md:text-base"
              >
                {rating && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass">
                    <StarIcon size={16} filled className="text-yellow-400" />
                    <span className="text-white font-semibold">{rating.toFixed(1)}</span>
                  </div>
                )}
                {year && (
                  <span className="text-white/90 font-medium px-3 py-1.5 rounded-full glass">
                    {year}
                  </span>
                )}
                {genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="text-white/70 text-xs md:text-sm px-3 py-1.5 rounded-full glass"
                  >
                    {genre}
                  </span>
                ))}
              </motion.div>

              {/* Description */}
              {description && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-white/90 text-sm md:text-base lg:text-lg leading-relaxed line-clamp-3 max-w-xl text-shadow"
                >
                  {description}
                </motion.p>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link href={`/watch/${slug}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-lg bg-white text-black font-bold text-sm md:text-base transition-all duration-300 hover:bg-primary hover:text-white shadow-xl"
                  >
                    <PlayIcon size={20} className="transition-transform group-hover:scale-110" />
                    <span>Play Now</span>
                  </motion.button>
                </Link>

                <Link href={`/title/${slug}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-lg glass hover:bg-white/20 text-white font-semibold text-sm md:text-base transition-all duration-300 shadow-xl"
                  >
                    <InfoIcon size={20} />
                    <span>More Info</span>
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 md:p-4 rounded-lg glass hover:bg-white/20 text-white transition-all duration-300 shadow-xl"
                  aria-label="Add to watchlist"
                >
                  <AddToListIcon size={20} />
                </motion.button>

                {videoPreview && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setVideoMuted(!videoMuted)}
                    className="p-3 md:p-4 rounded-lg glass hover:bg-white/20 text-white transition-all duration-300 shadow-xl"
                    aria-label={videoMuted ? 'Unmute' : 'Mute'}
                  >
                    {videoMuted ? (
                      <VolumeMutedIcon size={20} />
                    ) : (
                      <VolumeHighIcon size={20} />
                    )}
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Animated Mesh Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        />
      </div>
    </motion.section>
  );
}
