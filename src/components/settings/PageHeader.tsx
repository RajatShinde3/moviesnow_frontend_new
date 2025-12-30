/**
 * PageHeader Component
 * Consistent page header for all settings pages
 * Eye-comfortable typography with proper hierarchy
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
      transition={{ duration: 0.4 }}
      className={cn('mb-8', className)}
    >
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-[#B0B0B0] hover:text-[#F0F0F0] transition-colors mb-4 group"
        >
          <Icon
            name="arrow-left"
            className="group-hover:-translate-x-1 transition-transform"
            size={16}
          />
          {backLabel}
        </Link>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <motion.div
              className="rounded-2xl bg-[#1A1A1A] border border-[#3A3A3A] p-3 shadow-lg"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Icon name={icon} className="text-[#F0F0F0]" size={24} />
            </motion.div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-[#F0F0F0]">{title}</h1>
            {description && (
              <p className="text-[#808080] mt-1">{description}</p>
            )}
          </div>
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </motion.div>
  );
};

PageHeader.displayName = 'PageHeader';
