"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Loader2, Film } from "lucide-react";

/**
 * Enhanced Loading Component with Skeleton Loaders
 *
 * Features:
 * - Multiple loading variants
 * - Skeleton loaders for content
 * - Smooth animations
 * - Accessible loading states
 * - Custom loading messages
 *
 * @example
 * ```tsx
 * <EnhancedLoading variant="spinner" message="Loading content..." />
 * ```
 */

interface EnhancedLoadingProps {
  variant?: "spinner" | "dots" | "pulse" | "skeleton" | "logo";
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
}

export function EnhancedLoading({
  variant = "spinner",
  message,
  size = "md",
  fullScreen = false,
  className,
}: EnhancedLoadingProps) {
  const sizeStyles = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const containerClasses = cn(
    "flex flex-col items-center justify-center gap-4",
    fullScreen && "min-h-screen",
    className
  );

  // Spinner Variant
  if (variant === "spinner") {
    return (
      <div className={containerClasses} role="status" aria-live="polite">
        <Loader2 className={cn(sizeStyles[size], "animate-spin text-emerald-500")} />
        {message && <p className="text-slate-400 text-sm animate-pulse">{message}</p>}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Dots Variant
  if (variant === "dots") {
    return (
      <div className={containerClasses} role="status" aria-live="polite">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-emerald-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        {message && <p className="text-slate-400 text-sm">{message}</p>}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Pulse Variant
  if (variant === "pulse") {
    return (
      <div className={containerClasses} role="status" aria-live="polite">
        <motion.div
          className={cn(
            sizeStyles[size],
            "rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
        {message && <p className="text-slate-400 text-sm animate-pulse">{message}</p>}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Logo Variant
  if (variant === "logo") {
    return (
      <div className={containerClasses} role="status" aria-live="polite">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Film className={cn(sizeStyles[size], "text-emerald-500")} />
        </motion.div>
        {message && <p className="text-slate-400 text-sm animate-pulse">{message}</p>}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Skeleton Variant (default fallback)
  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Skeleton Component
 */
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "rectangular",
  animation = "pulse",
}: SkeletonProps) {
  const variantStyles = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationStyles = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-slate-800/50",
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Content Card Skeleton
 */
export function ContentCardSkeleton() {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 space-y-4">
      <Skeleton className="h-48 w-full" variant="rectangular" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-slate-700/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Profile Avatar Skeleton
 */
export function ProfileAvatarSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12" variant="circular" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/**
 * Stats Grid Skeleton
 */
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 space-y-3"
        >
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
