/**
 * Button Component
 * Professional button with variants for settings pages
 * Eye-comfortable colors and smooth interactions
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
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-[#E5E5E5] text-[#0F0F0F] hover:bg-[#D0D0D0] shadow-sm hover:shadow-md',
    secondary:
      'border border-[#3A3A3A] text-[#F0F0F0] hover:bg-[#2D2D2D] hover:border-[#4A4A4A]',
    ghost: 'text-[#F0F0F0] hover:bg-[#2D2D2D]',
    danger:
      'border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/80',
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      className={cn(baseClasses, variantClasses[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

Button.displayName = 'Button';
