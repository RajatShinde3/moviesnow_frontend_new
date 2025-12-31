/**
 * Toggle Component - ENHANCED ENTERPRISE GRADE
 * Premium toggle switch with sophisticated animations
 * Professional state transitions and micro-interactions
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={cn('flex items-center justify-between py-4', className)}>
      {(label || description) && (
        <div className="flex-1 pr-4">
          {label && (
            <p className="text-sm font-semibold text-[#F0F0F0]">{label}</p>
          )}
          {description && (
            <p className="text-xs text-[#808080] mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleClick}
        disabled={disabled}
        whileTap={disabled ? undefined : { scale: 0.95 }}
        className={cn(
          'relative inline-flex h-7 w-14 items-center rounded-full flex-shrink-0',
          'transition-all duration-300 shadow-inner',
          disabled && 'opacity-40 cursor-not-allowed',
          checked
            ? 'bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
            : 'bg-gradient-to-br from-[#3A3A3A] to-[#2D2D2D] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]'
        )}
      >
        {/* Glow effect when checked */}
        {checked && !disabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-full bg-[#E5E5E5]/30 blur-sm"
          />
        )}

        {/* Toggle thumb */}
        <motion.span
          layout
          className={cn(
            'relative inline-block h-5 w-5 transform rounded-full shadow-lg',
            'transition-all duration-200',
            checked
              ? 'bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A]'
              : 'bg-gradient-to-br from-[#808080] to-[#606060]'
          )}
          animate={{
            x: checked ? 30 : 4,
          }}
          transition={{
            type: 'spring',
            stiffness: 600,
            damping: 35,
          }}
        >
          {/* Inner highlight */}
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
        </motion.span>
      </motion.button>
    </div>
  );
};

Toggle.displayName = 'Toggle';
