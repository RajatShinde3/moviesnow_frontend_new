'use client';

/**
 * Security Settings Overview Page - ENHANCED ENTERPRISE GRADE
 * Premium design for security management with:
 * - MFA status and management
 * - Password management
 * - Trusted devices
 * - Active sessions
 * - Security alerts toggle
 * - Real-time status updates
 * Professional animations and visual hierarchy
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';
import {
  SettingsLayout,
  PageHeader,
  SettingCard,
  Toggle,
  Button,
  SettingItem,
} from '@/components/settings';
import { Icon } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

// ══════════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════════

interface SecurityStatus {
  mfa_enabled: boolean;
  recovery_codes_remaining?: number;
  trusted_devices_count: number;
  active_sessions_count: number;
  security_alerts_enabled: boolean;
  password_last_changed?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function SecurityOverviewPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch security status
  const { data: statusData, isLoading, refetch } = useQuery<{ status: SecurityStatus }>({
    queryKey: ['security-status'],
    queryFn: async () => {
      return await fetchJson<{ status: SecurityStatus }>('/api/v1/security/status', {
        method: 'GET',
      });
    },
  });

  const status = statusData?.status;

  // Toggle security alerts
  const alertsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return await fetchJson('/api/v1/security/alerts', {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-status'] });
      toast.success('Security alert settings updated');
    },
    onError: () => {
      toast.error('Failed to update security alerts');
    },
  });

  const handleRefresh = () => {
    refetch();
    router.refresh();
  };

  if (isLoading || !status) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-[#E5E5E5]"></div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-8"
      >
        <PageHeader
          title="Security"
          description="Review your account protection and manage security controls"
          icon="shield"
        />
        <Button variant="ghost" onClick={handleRefresh}>
          <Icon name="refresh" size={16} />
          Refresh
        </Button>
      </motion.div>

      {/* Security Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-8 mb-6 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent" />

        <div className="relative flex items-start gap-5">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#2D2D2D] to-[#242424] p-3 border border-[#3A3A3A]/50 shadow-md shadow-black/10"
          >
            <Icon name="shield-check" className="text-[#B0B0B0] group-hover:text-[#E5E5E5] transition-colors" size={24} />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#B0B0B0] bg-clip-text text-transparent mb-2">
              Security Status
            </h3>
            <p className="text-sm text-[#B0B0B0] leading-relaxed mb-4">
              {status.mfa_enabled
                ? 'Your account is protected with two-factor authentication.'
                : 'Enhance your security by enabling two-factor authentication.'}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {status.mfa_enabled ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#10B981]/15 to-[#10B981]/10 border border-[#10B981]/40 px-3 py-1.5 shadow-sm shadow-[#10B981]/10"
                >
                  <Icon name="check" className="text-[#10B981]" size={14} />
                  <span className="text-xs font-semibold text-[#10B981]">Protected</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#EF4444]/15 to-[#EF4444]/10 border border-[#EF4444]/40 px-3 py-1.5 shadow-sm shadow-[#EF4444]/10"
                >
                  <Icon name="alert" className="text-[#EF4444]" size={14} />
                  <span className="text-xs font-semibold text-[#EF4444]">At Risk</span>
                </motion.div>
              )}
              <span className="text-xs font-medium text-[#808080]">
                {status.active_sessions_count} active session{status.active_sessions_count !== 1 ? 's' : ''}
              </span>
              <span className="text-xs font-medium text-[#808080]">
                {status.trusted_devices_count} trusted device{status.trusted_devices_count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Authentication Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <SettingCard
          title="Authentication"
          description="Manage your login security and verification methods"
          icon="lock"
          className="mb-6"
        >
          <SettingItem
            icon="shield-check"
            label="Two-Factor Authentication"
            description={
              status.mfa_enabled
                ? `Enabled · ${status.recovery_codes_remaining ?? 0} recovery codes remaining`
                : 'Add an extra layer of security to your account'
            }
            action={
              <Link href="/settings/security/mfa">
                <Button variant={status.mfa_enabled ? 'secondary' : 'primary'}>
                  {status.mfa_enabled ? 'Manage' : 'Enable'}
                </Button>
              </Link>
            }
          />

          <SettingItem
            icon="key"
            label="Recovery Codes"
            description="Backup codes for account recovery if you lose access"
            action={
              <Link href="/settings/security/recovery-codes">
                <Button variant="ghost">View Codes</Button>
              </Link>
            }
          />

          <SettingItem
            icon="lock"
            label="Password"
            description={
              status.password_last_changed
                ? `Last changed: ${new Date(status.password_last_changed).toLocaleDateString()}`
                : 'Manage your account password'
            }
            action={
              <Link href="/settings/security/password">
                <Button variant="ghost">Change</Button>
              </Link>
            }
          />
        </SettingCard>
      </motion.div>

      {/* Devices & Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <SettingCard
          title="Devices & Sessions"
          description="Monitor and manage your logged-in devices and sessions"
          icon="smartphone"
          className="mb-6"
        >
          <SettingItem
            icon="smartphone"
            label="Trusted Devices"
            description={`${status.trusted_devices_count} device${status.trusted_devices_count !== 1 ? 's' : ''} remembered after MFA`}
            action={
              <Link href="/settings/trusted-devices">
                <Button variant="ghost">Manage</Button>
              </Link>
            }
          />

          <SettingItem
            icon="activity"
            label="Active Sessions"
            description={`${status.active_sessions_count} active session${status.active_sessions_count !== 1 ? 's' : ''} on your account`}
            action={
              <Link href="/settings/sessions">
                <Button variant="ghost">View All</Button>
              </Link>
            }
          />
        </SettingCard>
      </motion.div>

      {/* Security Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      >
        <SettingCard
          title="Security Alerts"
          description="Get notified about important security events"
          icon="bell"
          className="mb-6"
        >
          <Toggle
            checked={status.security_alerts_enabled}
            onChange={(enabled) => alertsMutation.mutate(enabled)}
            label="Security Alerts"
            description="Receive email notifications for new sign-ins and security changes"
            disabled={alertsMutation.isPending}
          />

          <SettingItem
            icon="bell-ring"
            label="Alert Preferences"
            description="Customize which security events trigger notifications"
            action={
              <Link href="/settings/alerts">
                <Button variant="ghost">Configure</Button>
              </Link>
            }
          />
        </SettingCard>
      </motion.div>

      {/* Activity & Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      >
        <SettingCard
          title="Activity & Monitoring"
          description="Review your account activity and security history"
          icon="eye"
          className="mb-6"
        >
          <SettingItem
            icon="activity"
            label="Account Activity"
            description="View recent login attempts, password changes, and security events"
            action={
              <Link href="/settings/activity">
                <Button variant="ghost">View Activity</Button>
              </Link>
            }
          />
        </SettingCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-6 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent" />

        <h3 className="relative text-sm font-semibold bg-gradient-to-br from-[#F0F0F0] to-[#B0B0B0] bg-clip-text text-transparent mb-4">
          Quick Actions
        </h3>
        <div className="relative flex flex-wrap gap-3">
          {!status.mfa_enabled && (
            <Link href="/settings/security/mfa">
              <Button variant="primary">
                <Icon name="shield-check" size={16} />
                Enable 2FA
              </Button>
            </Link>
          )}
          <Link href="/settings/security/recovery-codes">
            <Button variant="secondary">
              <Icon name="key" size={16} />
              Recovery Codes
            </Button>
          </Link>
          <Link href="/settings/activity">
            <Button variant="secondary">
              <Icon name="activity" size={16} />
              View Activity
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
