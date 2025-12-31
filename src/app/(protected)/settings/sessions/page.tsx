'use client';

/**
 * Active Sessions Page
 * Professional eye-comfortable design for managing authentication sessions
 * - View all active sessions
 * - Revoke individual sessions
 * - Sign out from all sessions
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SettingsLayout, PageHeader, Button } from '@/components/settings';
import { Icon } from '@/components/icons/Icon';
import SessionsTable from '@/components/tables/SessionsTable';

export default function SessionsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <SettingsLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-start justify-between mb-8"
      >
        <PageHeader
          title="Active Sessions"
          description="Review where your account is signed in and manage access"
          icon="activity"
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" onClick={() => setRefreshKey((k) => k + 1)}>
            <Icon name="refresh" size={16} />
            Refresh
          </Button>
        </motion.div>
      </motion.div>

      {/* Security Tip Notice - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-6 mb-6 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent" />

        <div className="relative flex items-start gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/10 p-3 border border-[#3B82F6]/30 shadow-md shadow-[#3B82F6]/5"
          >
            <Icon name="info" className="text-[#3B82F6]" size={20} />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] bg-clip-text text-transparent mb-2">
              Security Tip
            </h3>
            <p className="text-sm text-[#B0B0B0] leading-relaxed">
              If you notice any unfamiliar sessions, revoke them immediately and{' '}
              <Link
                href="/settings/security/password"
                className="text-[#3B82F6] hover:text-[#60A5FA] font-medium underline decoration-[#3B82F6]/30 hover:decoration-[#60A5FA]/50 transition-colors"
              >
                change your password
              </Link>
              . Your current session is highlighted below.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sessions Table - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3A3A3A] to-transparent" />

        <div className="relative sessions-table-wrapper">
          <style jsx>{`
            .sessions-table-wrapper :global(section) {
              background: transparent !important;
              border: none !important;
              border-radius: 0 !important;
            }
            .sessions-table-wrapper :global(.border-b) {
              border-color: rgba(58, 58, 58, 0.4) !important;
            }

            /* Toolbar styling */
            .sessions-table-wrapper :global(section > div:first-child) {
              background: rgba(31, 31, 31, 0.5) !important;
              border-color: rgba(58, 58, 58, 0.4) !important;
              padding: 1.25rem 1.5rem !important;
            }

            /* Table headers */
            .sessions-table-wrapper :global(thead tr) {
              background: rgba(36, 36, 36, 0.5) !important;
              border-color: rgba(58, 58, 58, 0.4) !important;
            }
            .sessions-table-wrapper :global(th) {
              color: #E5E5E5 !important;
              font-weight: 600 !important;
              font-size: 0.75rem !important;
              text-transform: uppercase !important;
              letter-spacing: 0.05em !important;
              padding: 1rem 0.75rem !important;
            }

            /* Table rows */
            .sessions-table-wrapper :global(tbody tr) {
              border-color: rgba(58, 58, 58, 0.3) !important;
              transition: all 0.2s !important;
            }
            .sessions-table-wrapper :global(tbody tr:hover) {
              background: rgba(36, 36, 36, 0.4) !important;
            }
            .sessions-table-wrapper :global(td) {
              color: #F0F0F0 !important;
              padding: 1rem 0.75rem !important;
            }
            .sessions-table-wrapper :global(.text-muted-foreground) {
              color: #B0B0B0 !important;
            }

            /* Stats text */
            .sessions-table-wrapper :global(section > div:nth-child(2)) {
              color: #B0B0B0 !important;
              padding: 1rem 1.5rem !important;
              background: rgba(26, 26, 26, 0.3) !important;
            }

            /* Toolbar buttons */
            .sessions-table-wrapper :global(button) {
              border-radius: 0.5rem !important;
              transition: all 0.2s !important;
              font-weight: 500 !important;
              font-size: 0.875rem !important;
              padding: 0.625rem 1rem !important;
            }

            /* Refresh button - special styling */
            .sessions-table-wrapper :global(section > div:first-child button:first-of-type),
            .sessions-table-wrapper :global(.hover\\:bg-gray-50) {
              background: linear-gradient(135deg, rgba(58, 58, 58, 0.8), rgba(42, 42, 42, 0.6)) !important;
              border: 1px solid rgba(74, 74, 74, 0.6) !important;
              color: #E5E5E5 !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
            }
            .sessions-table-wrapper :global(section > div:first-child button:first-of-type:hover),
            .sessions-table-wrapper :global(.hover\\:bg-gray-50:hover:not(:disabled)) {
              background: linear-gradient(135deg, rgba(74, 74, 74, 0.9), rgba(58, 58, 58, 0.8)) !important;
              border-color: rgba(96, 96, 96, 0.8) !important;
              transform: translateY(-1px) !important;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
            }
            .sessions-table-wrapper :global(section > div:first-child button:first-of-type:disabled) {
              opacity: 0.5 !important;
              cursor: not-allowed !important;
            }

            /* Badge styling */
            .sessions-table-wrapper :global(.bg-emerald-100) {
              background: rgba(16, 185, 129, 0.15) !important;
              border: 1px solid rgba(16, 185, 129, 0.3) !important;
              color: #10B981 !important;
              padding: 0.25rem 0.625rem !important;
              font-weight: 600 !important;
            }

            /* Action buttons */
            .sessions-table-wrapper :global(.bg-red-600) {
              background: linear-gradient(135deg, #EF4444, #DC2626) !important;
              border: none !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
            }
            .sessions-table-wrapper :global(.bg-red-600:hover:not(:disabled)) {
              background: linear-gradient(135deg, #DC2626, #B91C1C) !important;
              transform: translateY(-1px) !important;
              box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25) !important;
            }
            .sessions-table-wrapper :global(.bg-amber-600) {
              background: linear-gradient(135deg, #F59E0B, #D97706) !important;
              border: none !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
            }
            .sessions-table-wrapper :global(.bg-amber-600:hover:not(:disabled)) {
              background: linear-gradient(135deg, #D97706, #B45309) !important;
              transform: translateY(-1px) !important;
              box-shadow: 0 4px 6px rgba(245, 158, 11, 0.25) !important;
            }
            .sessions-table-wrapper :global(.bg-gray-400) {
              background: rgba(128, 128, 128, 0.3) !important;
              color: #808080 !important;
            }

            /* Heading */
            .sessions-table-wrapper :global(h2) {
              background: linear-gradient(to bottom right, #F0F0F0, #E5E5E5) !important;
              -webkit-background-clip: text !important;
              -webkit-text-fill-color: transparent !important;
              background-clip: text !important;
              font-size: 1rem !important;
              font-weight: 700 !important;
            }
            .sessions-table-wrapper :global(h2 + p) {
              color: #B0B0B0 !important;
              font-size: 0.875rem !important;
            }

            /* Loading skeleton */
            .sessions-table-wrapper :global(.animate-pulse) {
              background: rgba(58, 58, 58, 0.3) !important;
            }

            /* Error banner */
            .sessions-table-wrapper :global([role="alert"]) {
              background: rgba(239, 68, 68, 0.1) !important;
              border: 1px solid rgba(239, 68, 68, 0.3) !important;
              border-radius: 0.75rem !important;
              color: #FCA5A5 !important;
              padding: 1rem !important;
              margin: 1rem 1.5rem !important;
            }

            /* Empty state */
            .sessions-table-wrapper :global(td[colspan]) {
              color: #B0B0B0 !important;
              text-align: center !important;
              padding: 3rem 1.5rem !important;
              font-size: 0.875rem !important;
            }
          `}</style>
          <SessionsTable key={refreshKey} className="!bg-transparent !border-transparent" />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-6 flex items-center justify-between"
      >
        <Link href="/settings/security">
          <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
            <Button variant="ghost">
              <Icon name="arrow-left" size={16} />
              Back to Security
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
