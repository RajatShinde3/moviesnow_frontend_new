// components/ui/Button.tsx
/**
 * =============================================================================
 * Button Component - Enterprise-Grade Netflix/Prime Style (Enterprise-Grade)
 * =============================================================================
 * Premium button component featuring:
 * - Multiple visual variants (Netflix-style primary, glass, gradient)
 * - Smooth hover animations with scale and glow effects
 * - Loading state with animated spinner
 * - Ripple effect on click
 * - Full accessibility support
 * - Icon slot support
 */

"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  // Base styles
  [
    "group relative inline-flex items-center justify-center gap-2.5",
    "whitespace-nowrap rounded-lg text-sm font-semibold",
    "transition-all duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Default - Solid dark button
        default: [
          "bg-primary text-primary-foreground shadow-lg",
          "hover:bg-primary/90 hover:shadow-xl hover:scale-[1.02]",
          "focus-visible:ring-primary",
        ].join(" "),

        // Netflix Red - Primary CTA
        netflix: [
          "bg-gradient-to-r from-red-600 to-red-700 text-white",
          "shadow-lg shadow-red-500/30",
          "hover:from-red-500 hover:to-red-600 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02]",
          "focus-visible:ring-red-500",
        ].join(" "),

        // Play Button - White primary action
        play: [
          "bg-white text-black shadow-lg",
          "hover:bg-white/90 hover:shadow-xl hover:scale-[1.05]",
          "focus-visible:ring-white",
        ].join(" "),

        // Info Button - Glass morphism
        info: [
          "bg-white/10 text-white backdrop-blur-md",
          "border border-white/20",
          "hover:bg-white/20 hover:border-white/30 hover:scale-[1.02]",
          "focus-visible:ring-white/50",
        ].join(" "),

        // Glass - Transparent with blur
        glass: [
          "bg-black/40 text-white backdrop-blur-xl",
          "border border-white/10",
          "hover:bg-black/60 hover:border-white/20",
          "focus-visible:ring-white/30",
        ].join(" "),

        // Destructive - Red for dangerous actions
        destructive: [
          "bg-red-600 text-white shadow-sm",
          "hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30",
          "focus-visible:ring-red-500",
        ].join(" "),

        // Outline - Bordered button
        outline: [
          "border-2 border-white/30 bg-transparent text-white",
          "hover:bg-white/10 hover:border-white/50",
          "focus-visible:ring-white/50",
        ].join(" "),

        // Secondary - Muted background
        secondary: [
          "bg-secondary text-secondary-foreground shadow-sm",
          "hover:bg-secondary/80 hover:shadow-md",
          "focus-visible:ring-secondary",
        ].join(" "),

        // Ghost - No background until hover
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:ring-accent",
        ].join(" "),

        // Link - Text-only button
        link: [
          "bg-transparent text-primary underline-offset-4",
          "hover:underline",
          "focus-visible:ring-primary",
        ].join(" "),

        // Premium - Gold gradient for premium features
        premium: [
          "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black",
          "shadow-lg shadow-amber-500/30",
          "hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.02]",
          "focus-visible:ring-amber-500",
        ].join(" "),

        // Icon Circle - Round icon button
        iconCircle: [
          "bg-black/40 text-white backdrop-blur-sm",
          "border-2 border-white/50 rounded-full",
          "hover:bg-black/60 hover:border-white hover:scale-110",
          "focus-visible:ring-white/50",
        ].join(" "),
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-10 w-10 p-0",
        iconSm: "h-8 w-8 p-0",
        iconLg: "h-12 w-12 p-0",
        iconXl: "h-14 w-14 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      disabled,
      children,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    // When asChild is true, we render the Slot with just the children
    // The child element receives all the button's props and styling
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    // Regular button rendering with all features
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Left Icon */}
        {!loading && leftIcon && (
          <span className="transition-transform duration-200 group-hover:scale-110">
            {leftIcon}
          </span>
        )}

        {/* Button Content */}
        {children}

        {/* Right Icon */}
        {rightIcon && (
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            {rightIcon}
          </span>
        )}

        {/* Shine Effect for Netflix variant */}
        {variant === "netflix" && (
          <span
            className={cn(
              "absolute inset-0 -z-10 overflow-hidden rounded-lg",
              "before:absolute before:inset-0 before:-translate-x-full",
              "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
              "before:transition-transform before:duration-500",
              "group-hover:before:translate-x-full"
            )}
          />
        )}

        {/* Glow Effect for Premium variant */}
        {variant === "premium" && (
          <span
            className={cn(
              "absolute -inset-1 -z-10 rounded-xl opacity-0",
              "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 blur-lg",
              "transition-opacity duration-300",
              "group-hover:opacity-50"
            )}
          />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// Export variants for external use
export { buttonVariants };
