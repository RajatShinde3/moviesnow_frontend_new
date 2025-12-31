/**
 * PageHeader Component - ENHANCED ENTERPRISE GRADE
 * Sophisticated page header with premium visual elements
 * Professional typography hierarchy and interactive elements
 */

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icon, type IconName } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: IconName;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  backHref = '/settings',
  backLabel = 'Back to Settings',
  action,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn('mb-10', className)}
    >
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#B0B0B0] hover:text-[#F0F0F0] transition-all duration-200 mb-6 group"
        >
          <Icon
            name="arrow-left"
            className="group-hover:-translate-x-1 transition-transform duration-200"
            size={16}
          />
          <span className="relative">
            {backLabel}
            <span className="absolute bottom-0 left-0 w-0 h-px bg-[#F0F0F0] group-hover:w-full transition-all duration-200" />
          </span>
        </Link>
      )}

      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          {icon && (
            <motion.div
              className="relative rounded-2xl bg-gradient-to-br from-[#242424] to-[#1A1A1A] border border-[#3A3A3A]/50 p-4 shadow-xl shadow-black/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#E5E5E5]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <Icon name={icon} className="relative text-[#F0F0F0]" size={28} />
            </motion.div>
          )}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#B0B0B0] bg-clip-text text-transparent">
              {title}
            </h1>
            {description && (
              <p className="text-base text-[#808080] max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {action && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex-shrink-0"
          >
            {action}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

PageHeader.displayName = 'PageHeader';
