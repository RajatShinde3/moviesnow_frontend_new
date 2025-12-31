/**
 * SettingsLayout Component - ENHANCED ENTERPRISE GRADE
 * Professional layout with subtle gradients and modern design
 * Eye-comfortable background with depth and visual hierarchy
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
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#0F0F0F] to-[#1A1A1A] relative overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255 255 255) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E5E5E5]/[0.02] rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E5E5E5]/[0.015] rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8',
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};

SettingsLayout.displayName = 'SettingsLayout';
