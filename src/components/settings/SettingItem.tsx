/**
 * SettingItem Component - ENHANCED ENTERPRISE GRADE
 * Premium setting row with sophisticated hover states
 * Professional layout and interactive elements
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { Icon, type IconName } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

interface SettingItemProps {
  icon: IconName;
  label: string;
  description?: string;
  value?: string | React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  description,
  value,
  action,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group flex items-center justify-between py-4 px-4 -mx-4 rounded-xl',
        'border-b border-[#3A3A3A]/40 last:border-0',
        'hover:bg-gradient-to-r hover:from-[#242424]/30 hover:to-transparent',
        'transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 rounded-lg bg-gradient-to-br from-[#2D2D2D] to-[#242424] p-2 border border-[#3A3A3A]/50"
        >
          <Icon name={icon} className="text-[#B0B0B0] group-hover:text-[#E5E5E5] transition-colors" size={18} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#F0F0F0] group-hover:text-white transition-colors">
            {label}
          </p>
          {description && (
            <p className="text-xs text-[#808080] mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {value && (
          <span className="text-sm font-medium text-[#B0B0B0]">
            {typeof value === 'string' ? value : value}
          </span>
        )}
        {action}
      </div>
    </motion.div>
  );
};

SettingItem.displayName = 'SettingItem';
