'use client';

/**
 * Security Alerts Page
 * Professional eye-comfortable design for managing security notifications
 * - Configure which security events trigger alerts
 * - Email notifications for security events
 * - Granular control over alert types
 */

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';
import {
  SettingsLayout,
  PageHeader,
  SettingCard,
  Toggle,
  Button,
} from '@/components/settings';
import { Icon } from '@/components/icons/Icon';

// ══════════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════════

interface AlertSettings {
  email_enabled: boolean;
  sign_in: boolean;
  suspicious_activity: boolean;
  new_device: boolean;
  password_change: boolean;
  mfa_disabled: boolean;
  email_change: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = React.useState(false);

  // Fetch alert settings
  const { data: alertsData, isLoading } = useQuery<{ settings: AlertSettings }>({
    queryKey: ['alert-settings'],
    queryFn: async () => {
      return await fetchJson<{ settings: AlertSettings }>('/api/v1/auth/alerts', {
        method: 'GET',
      });
    },
  });

  const [settings, setSettings] = React.useState<AlertSettings | null>(null);

  React.useEffect(() => {
    if (alertsData) {
      setSettings(alertsData.settings);
    }
  }, [alertsData]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<AlertSettings>) => {
      return await fetchJson('/api/v1/auth/alerts', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-settings'] });
      toast.success('Alert settings saved');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to save alert settings');
    },
  });

  const handleToggle = (field: keyof AlertSettings) => {
    if (!settings) return;
    const newSettings = { ...settings, [field]: !settings[field] };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (settings) {
      saveMutation.mutate(settings);
    }
  };

  const handleCancel = () => {
    if (alertsData) {
      setSettings(alertsData.settings);
      setHasChanges(false);
    }
  };

  if (isLoading || !settings) {
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
      <PageHeader
        title="Security Alerts"
        description="Manage security notifications and alerts"
        icon="bell-ring"
      />

      {/* Info Notice */}
      <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6 mb-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[#242424] p-2.5 border border-[#3A3A3A]">
            <Icon name="info" className="text-[#B0B0B0]" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F0F0F0] mb-1">Stay Informed</h3>
            <p className="text-sm text-[#B0B0B0]">
              Security alerts help you stay informed about important account events. We'll send
              you email notifications when enabled.
            </p>
          </div>
        </div>
      </div>

      {/* Master Toggle */}
      <SettingCard
        title="Email Alerts"
        description="Enable or disable all email security alerts"
        icon="mail"
        className="mb-6"
      >
        <Toggle
          checked={settings.email_enabled}
          onChange={() => handleToggle('email_enabled')}
          label="Email Security Alerts"
          description="Receive security notifications via email"
        />
      </SettingCard>

      {/* Alert Categories */}
      <SettingCard
        title="Alert Types"
        description="Choose which security events trigger notifications"
        icon="bell"
        className="mb-6"
      >
        <Toggle
          checked={settings.sign_in}
          onChange={() => handleToggle('sign_in')}
          label="New Sign-Ins"
          description="Notify on successful sign-ins from new locations"
          disabled={!settings.email_enabled}
        />

        <Toggle
          checked={settings.suspicious_activity}
          onChange={() => handleToggle('suspicious_activity')}
          label="Suspicious Activity"
          description="Notify on risky or blocked login attempts"
          disabled={!settings.email_enabled}
        />

        <Toggle
          checked={settings.new_device}
          onChange={() => handleToggle('new_device')}
          label="New Trusted Device"
          description="Notify when a new device is remembered for MFA"
          disabled={!settings.email_enabled}
        />

        <Toggle
          checked={settings.password_change}
          onChange={() => handleToggle('password_change')}
          label="Password Changed"
          description="Notify when your password is changed"
          disabled={!settings.email_enabled}
        />

        <Toggle
          checked={settings.mfa_disabled}
          onChange={() => handleToggle('mfa_disabled')}
          label="MFA Disabled"
          description="Notify when two-factor authentication is turned off"
          disabled={!settings.email_enabled}
        />

        <Toggle
          checked={settings.email_change}
          onChange={() => handleToggle('email_change')}
          label="Email Changed"
          description="Notify when your email address is changed"
          disabled={!settings.email_enabled}
        />
      </SettingCard>

      {/* Save/Cancel Actions */}
      {hasChanges && (
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={saveMutation.isPending}
          >
            Save Alert Settings
          </Button>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-8">
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
