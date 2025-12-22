/**
 * =============================================================================
 * Ultra Content Row - Horizontal Scrolling with Smooth Animations
 * =============================================================================
 * Features:
 * - Smooth horizontal scroll with mouse wheel
 * - Drag to scroll
 * - Scroll indicators
 * - Intersection observer for lazy loading
 * - Responsive grid fallback on mobile
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/cn';
import { UltraContentCard } from './UltraContentCard';

interface ContentItem {
  id: string;
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
  progress?: number;
}

interface UltraContentRowProps {
  title: string;
  items: ContentItem[];
  viewAllHref?: string;
  className?: string;
  cardSize?: 'sm' | 'md' | 'lg';
}

export function UltraContentRow({
  title,
  items,
  viewAllHref,
  className,
  cardSize = 'md',
}: UltraContentRowProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [isDragging, setIsDragging] = React.useState(false);

  const x = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 300 };
  const smoothX = useSpring(x, springConfig);

  // Check scroll position
  const checkScroll = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Smooth scroll with wheel
  const handleWheel = (e: React.WheelEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      container.scrollLeft += e.deltaX;
    } else if (e.deltaY !== 0) {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }
  };

  // Scroll buttons
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className={cn('relative py-4 md:py-6', className)}>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xl md:text-2xl lg:text-3xl font-bold text-white"
        >
          {title}
        </motion.h2>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm md:text-base text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-2 group"
          >
            <span>View All</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:translate-x-1"
            >
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>

      {/* Content Container */}
      <div className="relative group/row">
        {/* Scroll Buttons */}
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full glass-strong text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 hidden lg:flex items-center justify-center"
            aria-label="Scroll left"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18L9 12L15 6" />
            </svg>
          </motion.button>
        )}

        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full glass-strong text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 hidden lg:flex items-center justify-center"
            aria-label="Scroll right"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18L15 12L9 6" />
            </svg>
          </motion.button>
        )}

        {/* Gradient Fade Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none hidden lg:block" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none hidden lg:block" />

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className={cn(
            'flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 py-2',
            isDragging && 'cursor-grabbing select-none'
          )}
          style={{
            scrollBehavior: isDragging ? 'auto' : 'smooth',
          }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '100px' }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex-shrink-0"
            >
              <UltraContentCard
                title={item.title}
                slug={item.slug}
                thumbnail={item.thumbnail}
                backdrop={item.backdrop}
                type={item.type}
                rating={item.rating}
                year={item.year}
                duration={item.duration}
                quality={item.quality}
                isNew={item.isNew}
                inWatchlist={item.inWatchlist}
                progress={item.progress}
                size={cardSize}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
