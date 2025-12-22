/**
 * =============================================================================
 * Loading States & Skeletons - Beautiful Shimmer Effects
 * =============================================================================
 * Modern loading components with shimmer animations
 */

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

// Base Skeleton Component
interface SkeletonProps {
  className?: string;
  variant?: 'pulse' | 'shimmer' | 'wave';
}

export function Skeleton({ className, variant = 'shimmer' }: SkeletonProps) {
  const variants = {
    pulse: 'animate-pulse bg-white/5',
    shimmer: 'skeleton',
    wave: 'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5',
  };

  return (
    <div
      className={cn(
        'rounded-lg',
        variants[variant],
        className
      )}
    />
  );
}

// Content Card Skeleton
export function ContentCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-[150px] h-[225px]',
    md: 'w-[200px] h-[300px]',
    lg: 'w-[400px] h-[225px]',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('relative rounded-xl overflow-hidden', sizeClasses[size])}
    >
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </motion.div>
  );
}

// Hero Section Skeleton
export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] md:h-[85vh] lg:h-[95vh] max-h-[1080px] overflow-hidden">
      <Skeleton className="absolute inset-0" />

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <div className="relative z-10 h-full flex items-end md:items-center">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20 lg:pb-24">
          <div className="max-w-2xl space-y-4 md:space-y-6">
            <Skeleton className="h-16 md:h-24 w-3/4 md:w-1/2" />

            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-5/6 max-w-xl" />
              <Skeleton className="h-4 w-4/6 max-w-xl" />
            </div>

            <div className="flex gap-3">
              <Skeleton className="h-12 md:h-14 w-32 md:w-40 rounded-lg" />
              <Skeleton className="h-12 md:h-14 w-32 md:w-40 rounded-lg" />
              <Skeleton className="h-12 md:h-14 w-12 md:w-14 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Content Row Skeleton
export function ContentRowSkeleton({ cardSize = 'md' }: { cardSize?: 'sm' | 'md' | 'lg' }) {
  return (
    <section className="relative py-4 md:py-6">
      <div className="px-4 sm:px-6 lg:px-8 mb-4">
        <Skeleton className="h-8 w-48 md:w-64" />
      </div>

      <div className="flex gap-3 md:gap-4 overflow-hidden px-4 sm:px-6 lg:px-8 py-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ContentCardSkeleton key={i} size={cardSize} />
        ))}
      </div>
    </section>
  );
}

// Spinner Component
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn(sizes[size], className)}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-25"
        />
        <path
          d="M12 2C6.47715 2 2 6.47715 2 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-75"
        />
      </svg>
    </motion.div>
  );
}

// Loading Overlay
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-white text-lg font-medium">{message}</p>
      </div>
    </motion.div>
  );
}

// Progress Bar
interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ progress, className, showPercentage = false }: ProgressBarProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {showPercentage && (
        <div className="flex justify-between text-sm text-white/70">
          <span>Loading...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500"
        />
      </div>
    </div>
  );
}

// Pulse Loader (3 dots)
export function PulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="w-2 h-2 bg-primary rounded-full"
        />
      ))}
    </div>
  );
}

// Grid Skeleton (for browse pages)
export function GridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 sm:p-6 lg:p-8">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Page Loading Component
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner size="lg" className="text-primary mx-auto" />
        <p className="text-white/70 text-lg">Loading amazing content...</p>
      </div>
    </div>
  );
}

// Error State
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Oops! Something went wrong',
  message = 'We couldn\'t load this content. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex items-center justify-center p-8"
    >
      <div className="text-center space-y-4 max-w-md">
        <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-red-500"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-white/70">{message}</p>

        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            Try Again
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// Empty State
interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'Nothing here yet',
  message = 'Check back later for new content',
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex items-center justify-center p-8"
    >
      <div className="text-center space-y-4 max-w-md">
        {icon || (
          <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white/40"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
            </svg>
          </div>
        )}

        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-white/70">{message}</p>

        {actionLabel && onAction && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAction}
            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            {actionLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
