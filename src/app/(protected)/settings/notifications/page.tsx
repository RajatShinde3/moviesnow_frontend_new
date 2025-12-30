'use client';

/**
 * Notification Settings Page
 * ===========================
 * Professional eye-comfortable design with:
 * - Channel controls (email, push, in-app, SMS)
 * - Type-specific preferences
 * - Frequency settings
 * - Quiet hours configuration
 * - Temporary mute functionality
 * - Soft colors for reduced eye strain
 */

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

interface NotificationPreferences {
  channels: {
    email: boolean;
    push: boolean;
    in_app: boolean;
    sms: boolean;
  };
  types: {
    new_release: boolean;
    watchlist_update: boolean;
    recommendation: boolean;
    subscription_update: boolean;
    payment_reminder: boolean;
    account_security: boolean;
    promotional: boolean;
    system_announcement: boolean;
  };
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  mute_all_until: string | null;
}

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = React.useState(false);

  // Fetch preferences
  const { data: preferencesData, isLoading } = useQuery<{ preferences: NotificationPreferences }>({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      return await fetchJson<{ preferences: NotificationPreferences }>('/api/v1/notifications/preferences', {
        method: 'GET',
      });
    },
  });

  const [preferences, setPreferences] = React.useState<NotificationPreferences | null>(null);

  // Update local state when data loads
  React.useEffect(() => {
    if (preferencesData?.preferences) {
      setPreferences(preferencesData.preferences);
    }
  }, [preferencesData]);

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      return await fetchJson('/api/v1/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Notification preferences saved');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to save preferences');
    },
  });

  // Reset preferences mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      return await fetchJson('/api/v1/notifications/preferences/reset', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferences reset to defaults');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to reset preferences');
    },
  });

  // Mute temporarily mutation
  const muteMutation = useMutation({
    mutationFn: async (hours: number) => {
      return await fetchJson(`/api/v1/notifications/preferences/mute-temporarily?hours=${hours}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Notifications muted');
    },
  });

  // Unmute mutation
  const unmuteMutation = useMutation({
    mutationFn: async () => {
      return await fetchJson('/api/v1/notifications/preferences/unmute', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Notifications unmuted');
    },
  });

  const updateChannel = (channel: keyof NotificationPreferences['channels']) => {
    if (!preferences) return;
    const newPreferences = {
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel],
      },
    };
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const updateType = (type: keyof NotificationPreferences['types']) => {
    if (!preferences) return;
    const newPreferences = {
      ...preferences,
      types: {
        ...preferences.types,
        [type]: !preferences.types[type],
      },
    };
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const updateQuietHours = () => {
    if (!preferences) return;
    const newPreferences = {
      ...preferences,
      quiet_hours_enabled: !preferences.quiet_hours_enabled,
    };
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (preferences) {
      saveMutation.mutate(preferences);
    }
  };

  const handleCancel = () => {
    if (preferencesData?.preferences) {
      setPreferences(preferencesData.preferences);
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all notification preferences to defaults?')) {
      resetMutation.mutate();
    }
  };

  if (isLoading || !preferences) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3A3A3A] border-t-[#E5E5E5]"></div>
        </div>
      </SettingsLayout>
    );
  }

  const isMuted = preferences.mute_all_until && new Date(preferences.mute_all_until) > new Date();

  return (
    <SettingsLayout>
      <PageHeader
        title="Notification Settings"
        description="Manage how and when you receive notifications"
        icon="bell"
      />

      {/* Muted Banner */}
      {isMuted && (
        <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-[#242424] p-2.5 border border-[#3A3A3A]">
                <Icon name="bell-off" className="text-[#B0B0B0]" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F0F0F0] mb-1">Notifications Muted</h3>
                <p className="text-sm text-[#B0B0B0]">
                  All notifications are muted until{' '}
                  {new Date(preferences.mute_all_until).toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => unmuteMutation.mutate()}
              isLoading={unmuteMutation.isPending}
            >
              Unmute
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <SettingCard
        title="Quick Actions"
        description="Temporary notification controls"
        icon="settings"
        className="mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="secondary"
            onClick={() => muteMutation.mutate(1)}
            isLoading={muteMutation.isPending}
          >
            Mute 1 Hour
          </Button>
          <Button
            variant="secondary"
            onClick={() => muteMutation.mutate(8)}
            isLoading={muteMutation.isPending}
          >
            Mute 8 Hours
          </Button>
          <Button
            variant="secondary"
            onClick={() => muteMutation.mutate(24)}
            isLoading={muteMutation.isPending}
          >
            Mute 24 Hours
          </Button>
        </div>
      </SettingCard>

      {/* Channels */}
      <SettingCard
        title="Notification Channels"
        description="Choose how you want to receive notifications"
        icon="mail"
        className="mb-6"
      >
        <Toggle
          checked={preferences.channels.email}
          onChange={() => updateChannel('email')}
          label="Email Notifications"
          description="Receive notifications via email"
        />
        <Toggle
          checked={preferences.channels.push}
          onChange={() => updateChannel('push')}
          label="Push Notifications"
          description="Browser and mobile push notifications"
        />
        <Toggle
          checked={preferences.channels.in_app}
          onChange={() => updateChannel('in_app')}
          label="In-App Notifications"
          description="Notifications within the application"
        />
        <Toggle
          checked={preferences.channels.sms}
          onChange={() => updateChannel('sms')}
          label="SMS Notifications"
          description="Text message notifications (carrier rates apply)"
        />
      </SettingCard>

      {/* Notification Types */}
      <SettingCard
        title="Notification Types"
        description="Choose what you want to be notified about"
        icon="list"
        className="mb-6"
      >
        <Toggle
          checked={preferences.types.new_release}
          onChange={() => updateType('new_release')}
          label="New Releases"
          description="Notify me when new content is released"
        />
        <Toggle
          checked={preferences.types.watchlist_update}
          onChange={() => updateType('watchlist_update')}
          label="Watchlist Updates"
          description="Changes to content in your watchlist"
        />
        <Toggle
          checked={preferences.types.recommendation}
          onChange={() => updateType('recommendation')}
          label="Recommendations"
          description="Personalized content suggestions"
        />
        <Toggle
          checked={preferences.types.subscription_update}
          onChange={() => updateType('subscription_update')}
          label="Subscription Updates"
          description="Changes to your subscription plan"
        />
        <Toggle
          checked={preferences.types.payment_reminder}
          onChange={() => updateType('payment_reminder')}
          label="Payment Reminders"
          description="Upcoming payments and billing information"
        />
        <Toggle
          checked={preferences.types.account_security}
          onChange={() => updateType('account_security')}
          label="Account Security"
          description="Security alerts and login notifications"
        />
        <Toggle
          checked={preferences.types.promotional}
          onChange={() => updateType('promotional')}
          label="Promotional Offers"
          description="Special offers and promotions"
        />
        <Toggle
          checked={preferences.types.system_announcement}
          onChange={() => updateType('system_announcement')}
          label="System Announcements"
          description="Platform updates and maintenance"
        />
      </SettingCard>

      {/* Quiet Hours */}
      <SettingCard
        title="Quiet Hours"
        description="Pause notifications during specific times"
        icon="moon"
        className="mb-6"
      >
        <Toggle
          checked={preferences.quiet_hours_enabled}
          onChange={updateQuietHours}
          label="Enable Quiet Hours"
          description="Mute notifications during specified hours"
        />
        {preferences.quiet_hours_enabled && (
          <div className="pl-8 space-y-3 pt-2">
            <SettingItem
              icon="clock"
              label="Start Time"
              value={preferences.quiet_hours_start || 'Not set'}
              action={
                <Button variant="ghost" onClick={() => toast.info('Coming soon')}>
                  Change
                </Button>
              }
            />
            <SettingItem
              icon="clock"
              label="End Time"
              value={preferences.quiet_hours_end || 'Not set'}
              action={
                <Button variant="ghost" onClick={() => toast.info('Coming soon')}>
                  Change
                </Button>
              }
            />
          </div>
        )}
      </SettingCard>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="secondary"
          onClick={handleReset}
          isLoading={resetMutation.isPending}
        >
          Reset to Defaults
        </Button>

        {hasChanges && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={saveMutation.isPending}
            >
              Save Preferences
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
