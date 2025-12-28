"use client";

import { motion } from "framer-motion";
import { type LucideIcon, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

/**
 * Enhanced Input Component with Advanced Features
 *
 * Features:
 * - Beautiful glassmorphism design
 * - Icon support (left/right)
 * - Password visibility toggle
 * - Success/error states with icons
 * - Floating labels
 * - Character count
 * - Helper text
 * - Keyboard accessible
 * - Focus animations
 *
 * @example
 * ```tsx
 * <EnhancedInput
 *   label="Email"
 *   type="email"
 *   icon={Mail}
 *   placeholder="Enter your email"
 *   error="Invalid email"
 * />
 * ```
 */

interface EnhancedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  error?: string;
  success?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
  variant?: "default" | "filled" | "outlined";
  inputSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      label,
      icon: Icon,
      iconPosition = "left",
      error,
      success,
      helperText,
      showCharCount = false,
      maxLength,
      variant = "default",
      inputSize = "md",
      fullWidth = true,
      type = "text",
      className,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [charCount, setCharCount] = useState(
      typeof value === "string" ? value.length : 0
    );

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    // Variant styles
    const variantStyles = {
      default: "bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 focus:border-emerald-500",
      filled: "bg-slate-800 border border-transparent focus:border-emerald-500",
      outlined: "bg-transparent border-2 border-slate-700 focus:border-emerald-500",
    };

    // Size styles
    const sizeStyles = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-5 py-4 text-lg",
    };

    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showCharCount || maxLength) {
        setCharCount(e.target.value.length);
      }
      props.onChange?.(e);
    };

    return (
      <div className={cn("relative", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            className={cn(
              "block text-sm font-medium mb-2 transition-colors",
              hasError ? "text-red-400" : hasSuccess ? "text-green-400" : "text-slate-300"
            )}
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && iconPosition === "left" && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon className={iconSizes[inputSize]} />
            </div>
          )}

          {/* Input Field */}
          <motion.input
            {...({} as any)}
            ref={ref}
            type={inputType}
            value={value}
            maxLength={maxLength}
            className={cn(
              "w-full rounded-lg transition-all duration-200 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
              variantStyles[variant],
              sizeStyles[inputSize],
              Icon && iconPosition === "left" && "pl-11",
              (Icon && iconPosition === "right") || isPassword || hasError || hasSuccess
                ? "pr-11"
                : "",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/50",
              hasSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500/50",
              props.disabled && "opacity-50 cursor-not-allowed bg-slate-800/30",
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={handleChange}
            {...props}
          />

          {/* Right Icons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Password Toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className={iconSizes[inputSize]} />
                ) : (
                  <Eye className={iconSizes[inputSize]} />
                )}
              </button>
            )}

            {/* Error Icon */}
            {hasError && (
              <AlertCircle className={cn(iconSizes[inputSize], "text-red-400")} />
            )}

            {/* Success Icon */}
            {hasSuccess && (
              <CheckCircle2 className={cn(iconSizes[inputSize], "text-green-400")} />
            )}

            {/* Right Icon */}
            {Icon && iconPosition === "right" && !isPassword && !hasError && !hasSuccess && (
              <Icon className={cn(iconSizes[inputSize], "text-slate-400")} />
            )}
          </div>

          {/* Focus Border Animation */}
          {isFocused && (
            <motion.div
              layoutId="input-focus"
              className="absolute inset-0 rounded-lg border-2 border-emerald-500 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </div>

        {/* Helper Text / Error / Success / Character Count */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex-1">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.p>
            )}
            {success && !error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-green-400 flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </motion.p>
            )}
            {helperText && !error && !success && (
              <p className="text-sm text-slate-400">{helperText}</p>
            )}
          </div>

          {/* Character Count */}
          {(showCharCount || maxLength) && (
            <p
              className={cn(
                "text-xs transition-colors",
                maxLength && charCount > maxLength * 0.9
                  ? "text-amber-400"
                  : "text-slate-500"
              )}
            >
              {charCount}
              {maxLength && `/${maxLength}`}
            </p>
          )}
        </div>
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

/**
 * Textarea Component (extends EnhancedInput concept)
 */
interface EnhancedTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  showCharCount?: boolean;
  textareaSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      showCharCount = false,
      maxLength,
      textareaSize = "md",
      fullWidth = true,
      className,
      value,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(
      typeof value === "string" ? value.length : 0
    );

    const sizeStyles = {
      sm: "px-3 py-2 text-sm min-h-[80px]",
      md: "px-4 py-3 text-base min-h-[120px]",
      lg: "px-5 py-4 text-lg min-h-[160px]",
    };

    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharCount || maxLength) {
        setCharCount(e.target.value.length);
      }
      props.onChange?.(e);
    };

    return (
      <div className={cn("relative", fullWidth && "w-full")}>
        {label && (
          <label
            className={cn(
              "block text-sm font-medium mb-2 transition-colors",
              hasError ? "text-red-400" : hasSuccess ? "text-green-400" : "text-slate-300"
            )}
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            "w-full rounded-lg bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 transition-all duration-200 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none",
            sizeStyles[textareaSize],
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/50",
            hasSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500/50",
            props.disabled && "opacity-50 cursor-not-allowed bg-slate-800/30",
            className
          )}
          onChange={handleChange}
          {...props}
        />

        {/* Helper Text / Character Count */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex-1">
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-sm text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-sm text-slate-400">{helperText}</p>
            )}
          </div>

          {(showCharCount || maxLength) && (
            <p
              className={cn(
                "text-xs transition-colors",
                maxLength && charCount > maxLength * 0.9
                  ? "text-amber-400"
                  : "text-slate-500"
              )}
            >
              {charCount}
              {maxLength && `/${maxLength}`}
            </p>
          )}
        </div>
      </div>
    );
  }
);

EnhancedTextarea.displayName = "EnhancedTextarea";
