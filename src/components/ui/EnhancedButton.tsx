"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { type ReactNode } from "react";

/**
 * Enhanced Button Component with Advanced Animations and States
 *
 * Features:
 * - 8 visual variants (primary, secondary, success, danger, ghost, link, gradient, neon)
 * - 5 sizes (xs, sm, md, lg, xl)
 * - Loading states with spinners
 * - Icon support (left/right)
 * - Ripple effect on click
 * - Keyboard accessible
 * - Disabled states
 * - Full width option
 *
 * @example
 * ```tsx
 * <EnhancedButton variant="primary" size="lg" icon={Download}>
 *   Download
 * </EnhancedButton>
 * ```
 */

interface EnhancedButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "link" | "gradient" | "neon";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  ripple?: boolean;
  className?: string;
}

export function EnhancedButton({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  ripple = true,
  className,
  onClick,
  ...props
}: EnhancedButtonProps) {
  // Variant styles
  const variantStyles = {
    primary: "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/30 border-0",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600",
    success: "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-500/30 border-0",
    danger: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/30 border-0",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600",
    link: "bg-transparent hover:bg-slate-800/50 text-emerald-400 hover:text-emerald-300 border-0 shadow-none",
    gradient: "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 text-white shadow-lg shadow-purple-500/30 border-0",
    neon: "bg-slate-950 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]",
  };

  // Size styles
  const sizeStyles = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };

  // Icon size based on button size
  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || isLoading) return;

    // Ripple effect
    if (ripple) {
      const button = e.currentTarget;
      const ripple = document.createElement("span");
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.add("ripple");

      button.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    }

    onClick?.(e);
  };

  return (
    <motion.button
      className={cn(
        "relative overflow-hidden font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        "flex items-center justify-center gap-2",
        className
      )}
      whileHover={{ scale: isDisabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled || isLoading ? 1 : 0.98 }}
      disabled={isDisabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
      )}

      {/* Left Icon */}
      {!isLoading && Icon && iconPosition === "left" && (
        <Icon className={iconSizes[size]} />
      )}

      {/* Button Text */}
      <span>{children}</span>

      {/* Right Icon */}
      {!isLoading && Icon && iconPosition === "right" && (
        <Icon className={iconSizes[size]} />
      )}

      {/* Ripple CSS */}
      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        }

        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </motion.button>
  );
}

/**
 * Button Group Component
 */
interface ButtonGroupProps {
  children: ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = "horizontal",
  className,
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row gap-3" : "flex-col gap-2",
        className
      )}
      role="group"
    >
      {children}
    </div>
  );
}

/**
 * Icon Button Component (circular button with only icon)
 */
interface IconButtonProps extends Omit<EnhancedButtonProps, "children"> {
  icon: LucideIcon;
  label: string; // For accessibility
}

export function IconButton({
  icon: Icon,
  label,
  size = "md",
  variant = "ghost",
  className,
  ...props
}: IconButtonProps) {
  const sizeStyles = {
    xs: "w-7 h-7",
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-13 h-13",
    xl: "w-16 h-16",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
  };

  return (
    <EnhancedButton
      variant={variant}
      className={cn("rounded-full p-0", sizeStyles[size], className)}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </EnhancedButton>
  );
}
