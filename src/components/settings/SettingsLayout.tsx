/**
 * SettingsLayout Component
 * Main layout wrapper for all settings pages
 * Eye-comfortable background with consistent padding
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface SettingsLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn('mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8', className)}
      >
        {children}
      </motion.div>
    </div>
  );
};

SettingsLayout.displayName = 'SettingsLayout';
