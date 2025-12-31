/**
 * SettingCard Component - ENHANCED ENTERPRISE GRADE
 * Premium card container with depth and sophisticated design
 * Professional shadows, borders, and micro-interactions
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { Icon, type IconName } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

interface SettingCardProps {
  title: string;
  description?: string;
  icon: IconName;
  children: React.ReactNode;
  className?: string;
}

export const SettingCard: React.FC<SettingCardProps> = ({
  title,
  description,
  icon,
  children,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative rounded-2xl overflow-hidden',
        'bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F]',
        'border border-[#3A3A3A]/60',
        'shadow-lg shadow-black/10',
        'hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20',
        'transition-all duration-300 ease-out',
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative p-7">
        {/* Header */}
        <div className="flex items-start gap-4 mb-7">
          <motion.div
            className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#2D2D2D] to-[#242424] p-3 border border-[#3A3A3A]/50"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon name={icon} className="text-[#E5E5E5]" size={22} />
          </motion.div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-xl font-bold text-[#F0F0F0] mb-1">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-[#808080] leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#3A3A3A] to-transparent mb-6" />

        {/* Children */}
        <div className="space-y-5">{children}</div>
      </div>

      {/* Bottom accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent" />
    </motion.div>
  );
};

SettingCard.displayName = 'SettingCard';
