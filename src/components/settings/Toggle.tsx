/**
 * Toggle Component
 * Professional toggle switch with eye-comfortable colors
 * Smooth animations and accessibility support
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
    <div className={cn('flex items-center justify-between py-3', className)}>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <p className="text-sm font-medium text-[#F0F0F0]">{label}</p>
          )}
          {description && (
            <p className="text-xs text-[#808080] mt-0.5">{description}</p>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full',
          'transition-colors duration-200 flex-shrink-0',
          disabled && 'opacity-50 cursor-not-allowed',
          checked ? 'bg-[#E5E5E5]' : 'bg-[#3A3A3A]'
        )}
      >
        <motion.span
          layout
          className={cn(
            'inline-block h-4 w-4 transform rounded-full',
            'transition-transform duration-200',
            checked ? 'bg-[#0F0F0F]' : 'bg-[#808080]'
          )}
          animate={{
            x: checked ? 24 : 4,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
    </div>
  );
};

Toggle.displayName = 'Toggle';
