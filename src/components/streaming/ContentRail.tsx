'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🎞️ CONTENT RAIL
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Horizontal scrolling rail for content cards (Netflix-style).
 *
 * Features:
 * • Smooth horizontal scroll with momentum
 * • Mouse wheel support
 * • Touch-optimized for mobile
 * • Lazy loading for performance
 * • Gradient fade at edges
 * • Scroll indicators (arrows)
 * • View all link
 */

import * as React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { colors, animation } from '@/lib/design-system';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ContentRailProps {
  title: string;
  viewAllHref?: string;
  children: React.ReactNode;
  className?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ContentRail({ title, viewAllHref, children, className = '' }: ContentRailProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);

  // Update scroll button states
  const updateScrollButtons = React.useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Scroll left
  const scrollLeft = () => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    });
  };

  // Scroll right
  const scrollRight = () => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  // Setup scroll listener
  React.useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    updateScrollButtons();
    scrollContainer.addEventListener('scroll', updateScrollButtons);

    return () => scrollContainer.removeEventListener('scroll', updateScrollButtons);
  }, [updateScrollButtons]);

  // Mouse wheel horizontal scroll
  React.useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        return; // Vertical scroll, allow default behavior
      }
      e.preventDefault();
      scrollContainer.scrollLeft += e.deltaY;
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <motion.section
      className={`relative space-y-4 ${className}`}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-100px' }}
      variants={animation.variants.fadeIn}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-xl font-bold sm:text-2xl"
          style={{ color: colors.text.primary }}
          variants={animation.variants.slideUp}
        >
          {title}
        </motion.h2>

        {viewAllHref && (
          <Link href={viewAllHref}>
            <motion.span
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
              style={{ color: colors.text.secondary }}
              whileHover={{ color: colors.accent.primary }}
            >
              View All
              <ChevronRight size={16} />
            </motion.span>
          </Link>
        )}
      </div>

      {/* Scroll Container */}
      <div className="relative group">
        {/* Left Scroll Button */}
        {canScrollLeft && isHovering && (
          <motion.button
            onClick={scrollLeft}
            className="absolute left-0 top-0 bottom-0 z-30 flex items-center justify-center w-12 lg:w-16"
            style={{
              background: `linear-gradient(90deg, ${colors.bg.primary} 0%, transparent 100%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            aria-label="Scroll left"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full transition-all"
              style={{
                background: colors.bg.glass,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${colors.border.default}`,
              }}
            >
              <ChevronRight size={24} style={{ color: colors.text.primary, transform: 'rotate(180deg)' }} />
            </div>
          </motion.button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && isHovering && (
          <motion.button
            onClick={scrollRight}
            className="absolute right-0 top-0 bottom-0 z-30 flex items-center justify-center w-12 lg:w-16"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${colors.bg.primary} 100%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            aria-label="Scroll right"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full transition-all"
              style={{
                background: colors.bg.glass,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${colors.border.default}`,
              }}
            >
              <ChevronRight size={24} style={{ color: colors.text.primary }} />
            </div>
          </motion.button>
        )}

        {/* Content Container */}
        <motion.div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8 lg:gap-4"
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
          variants={animation.variants.staggerContainer}
        >
          {children}
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Chrome/Safari */
            }
          `}</style>
        </motion.div>

        {/* Left Fade Gradient */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-20 w-12 lg:w-16"
          style={{
            background: `linear-gradient(90deg, ${colors.bg.primary} 0%, transparent 100%)`,
          }}
        />

        {/* Right Fade Gradient */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-20 w-12 lg:w-16"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.bg.primary} 100%)`,
          }}
        />
      </div>
    </motion.section>
  );
}
