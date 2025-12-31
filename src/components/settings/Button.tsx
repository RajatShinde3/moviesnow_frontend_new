/**
 * Button Component - ENHANCED ENTERPRISE GRADE
 * Premium button with sophisticated variants and micro-interactions
 * Professional shadows, gradients, and state transitions
 */

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'ref'> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  children,
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden';

  const variantClasses = {
    primary:
      'bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] text-[#0F0F0F] shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:from-[#E5E5E5] hover:to-[#D0D0D0] border border-[#FFFFFF]/20',
    secondary:
      'bg-gradient-to-br from-[#242424] to-[#1A1A1A] border border-[#3A3A3A]/70 text-[#F0F0F0] hover:border-[#4A4A4A] hover:from-[#2D2D2D] hover:to-[#242424] shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20',
    ghost:
      'text-[#F0F0F0] hover:bg-gradient-to-br hover:from-[#2D2D2D] hover:to-[#242424]',
    danger:
      'bg-gradient-to-br from-[#EF4444]/10 to-[#EF4444]/5 border border-[#EF4444]/60 text-[#EF4444] hover:bg-[#EF4444]/15 hover:border-[#EF4444] shadow-md shadow-[#EF4444]/10 hover:shadow-lg hover:shadow-[#EF4444]/20',
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? undefined : { scale: 1.03, y: -1 }}
      whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(baseClasses, variantClasses[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shimmer effect for primary button */}
      {variant === 'primary' && !disabled && !isLoading && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}

      {isLoading ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

Button.displayName = 'Button';
