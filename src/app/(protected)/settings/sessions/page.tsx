'use client';

/**
 * Active Sessions Page
 * Professional eye-comfortable design for managing authentication sessions
 * - View all active sessions
 * - Revoke individual sessions
 * - Sign out from all sessions
 */

import * as React from 'react';
import Link from 'next/link';
import { SettingsLayout, PageHeader, Button } from '@/components/settings';
import { Icon } from '@/components/icons/Icon';
import SessionsTable from '@/components/tables/SessionsTable';

export default function SessionsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <SettingsLayout>
      <div className="flex items-start justify-between mb-8">
        <PageHeader
          title="Active Sessions"
          description="Review where your account is signed in and manage access"
          icon="activity"
        />
        <Button variant="ghost" onClick={() => setRefreshKey((k) => k + 1)}>
          <Icon name="refresh" size={16} />
          Refresh
        </Button>
      </div>

      {/* Info Notice */}
      <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[#242424] p-2.5 border border-[#3A3A3A]">
            <Icon name="info" className="text-[#B0B0B0]" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F0F0F0] mb-1">Security Tip</h3>
            <p className="text-sm text-[#B0B0B0]">
              If you notice any unfamiliar sessions, revoke them immediately and{' '}
              <Link href="/settings/security/password" className="text-[#E5E5E5] hover:underline">
                change your password
              </Link>
              . Your current session is highlighted below.
            </p>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] shadow-sm overflow-hidden">
        <SessionsTable key={refreshKey} className="bg-transparent" />
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex items-center justify-between">
        <Link href="/settings/security">
          <Button variant="ghost">
            <Icon name="arrow-left" size={16} />
            Back to Security
          </Button>
        </Link>
      </div>

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
