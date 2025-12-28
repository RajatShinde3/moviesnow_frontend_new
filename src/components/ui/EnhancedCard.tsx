"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { type ReactNode } from "react";

/**
 * Enhanced Card Component with Advanced Animations
 *
 * Features:
 * - Glassmorphism design
 * - Hover effects with elevation
 * - Shimmer loading state
 * - Interactive particles
 * - Gradient borders
 * - Smooth transitions
 *
 * @example
 * ```tsx
 * <EnhancedCard variant="glass" hoverEffect="glow">
 *   <CardContent>Your content</CardContent>
 * </EnhancedCard>
 * ```
 */

interface EnhancedCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  variant?: "glass" | "solid" | "gradient" | "neon";
  hoverEffect?: "lift" | "glow" | "scale" | "tilt" | "none";
  isLoading?: boolean;
  glowColor?: string;
  borderGradient?: boolean;
  className?: string;
}

export function EnhancedCard({
  children,
  variant = "glass",
  hoverEffect = "lift",
  isLoading = false,
  glowColor = "rgb(16, 185, 129)", // emerald-500
  borderGradient = false,
  className,
  ...props
}: EnhancedCardProps) {
  // Variant styles
  const variantStyles = {
    glass: "bg-slate-900/40 backdrop-blur-xl border border-slate-700/50",
    solid: "bg-slate-900 border border-slate-700",
    gradient: "bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-700/30",
    neon: "bg-slate-950 border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
  };

  // Hover effect animations
  const hoverEffects = {
    lift: {
      whileHover: { y: -4, scale: 1.01 },
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    glow: {
      whileHover: {
        boxShadow: `0 0 25px ${glowColor}, 0 0 50px ${glowColor}40`,
      },
      transition: { duration: 0.3 },
    },
    scale: {
      whileHover: { scale: 1.03 },
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
    tilt: {
      whileHover: { rotateY: 5, scale: 1.02 },
      transition: { type: "spring", stiffness: 300 },
    },
    none: {},
  };

  const selectedHoverEffect = hoverEffects[hoverEffect];

  return (
    <motion.div
      {...(selectedHoverEffect as any)}
      className={cn(
        "relative rounded-xl overflow-hidden",
        variantStyles[variant],
        isLoading && "animate-pulse",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      {...selectedHoverEffect}
      {...props}
    >
      {/* Gradient Border Overlay */}
      {borderGradient && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" />
      )}

      {/* Shimmer Loading Effect */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/**
 * Card Header Component
 */
interface CardHeaderProps {
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ children, icon, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between p-6 border-b border-slate-700/50", className)}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-emerald-400">{icon}</div>}
        <h3 className="text-xl font-bold text-white">{children}</h3>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * Card Content Component
 */
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

/**
 * Card Footer Component
 */
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("p-6 border-t border-slate-700/50 bg-slate-800/30", className)}>
      {children}
    </div>
  );
}
