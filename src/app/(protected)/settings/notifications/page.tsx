'use client';

/**
 * Notification Settings Page
 * ===========================
 * Advanced notification preference management with:
 * - Channel controls (email, push, in-app, SMS)
 * - Type-specific preferences
 * - Frequency settings for digests
 * - Quiet hours configuration
 * - Temporary mute functionality
 * - Real-time preview
 */

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';
import {
  Bell,
  BellOff,
  Mail,
  Smartphone,
  MessageSquare,
  Clock,
  Moon,
  Sparkles,
  AlertCircle,
  CreditCard,
  Shield,
  Megaphone,
  Heart,
  TrendingUp,
  Save,
  RotateCcw,
  Info
} from 'lucide-react';

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
  frequency: {
    new_release_frequency: string;
    recommendation_frequency: string;
    digest_time: string;
    timezone: string;
  };
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  mute_all_until: string | null;
}

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch preferences
  const { data: preferencesData, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      return await fetchJson('/api/v1/notifications/preferences', {
        method: 'GET',
      });
    },
  });

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

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

  const updatePreference = (path: string, value: any) => {
    if (!preferences) return;

    const keys = path.split('.');
    const newPreferences = { ...preferences };
    let current: any = newPreferences;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (preferences) {
      saveMutation.mutate(preferences);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all notification preferences to defaults?')) {
      resetMutation.mutate();
    }
  };

  if (isLoading || !preferences) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  const isMuted = preferences.mute_all_until && new Date(preferences.mute_all_until) > new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Notification Settings
          </h1>
          <p className="mt-2 text-gray-400">
            Customize how and when you receive notifications from MoviesNow
          </p>
        </div>

        {/* Mute Banner */}
        {isMuted && (
          <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <BellOff className="h-5 w-5 flex-shrink-0 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium text-amber-500">
                  Notifications are muted
                </p>
                <p className="mt-1 text-sm text-amber-500/80">
                  Until {new Date(preferences.mute_all_until!).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => unmuteMutation.mutate()}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400"
              >
                Unmute
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            onClick={() => muteMutation.mutate(24)}
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-800 p-4 text-white transition hover:bg-gray-700"
          >
            <Moon className="h-5 w-5" />
            <span>Mute for 24h</span>
          </button>
          <button
            onClick={() => muteMutation.mutate(168)}
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-800 p-4 text-white transition hover:bg-gray-700"
          >
            <Clock className="h-5 w-5" />
            <span>Mute for 1 week</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-800 p-4 text-white transition hover:bg-gray-700"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Reset All</span>
          </button>
        </div>

        {/* Notification Channels */}
        <div className="mb-6 rounded-lg bg-gray-800/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <Bell className="h-5 w-5" />
            Delivery Channels
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            Choose how you want to receive notifications
          </p>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', icon: Mail, desc: 'Receive emails for important updates' },
              { key: 'push', label: 'Push Notifications', icon: Smartphone, desc: 'Get push notifications on your devices' },
              { key: 'in_app', label: 'In-App Notifications', icon: Bell, desc: 'See notifications within the app' },
              { key: 'sms', label: 'SMS Notifications', icon: MessageSquare, desc: 'Get text messages (premium feature)' },
            ].map(({ key, label, icon: Icon, desc }) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-gray-900/50 p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">{label}</p>
                    <p className="text-sm text-gray-400">{desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => updatePreference(`channels.${key}`, !preferences.channels[key as keyof typeof preferences.channels])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    preferences.channels[key as keyof typeof preferences.channels]
                      ? 'bg-red-600'
                      : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      preferences.channels[key as keyof typeof preferences.channels]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Types */}
        <div className="mb-6 rounded-lg bg-gray-800/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <Sparkles className="h-5 w-5" />
            Notification Types
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            Control which types of notifications you want to receive
          </p>

          <div className="space-y-4">
            {[
              { key: 'new_release', label: 'New Releases', icon: TrendingUp, desc: 'Notify me when new content is added', locked: false },
              { key: 'watchlist_update', label: 'Watchlist Updates', icon: Heart, desc: 'Updates for items in your watchlist', locked: false },
              { key: 'recommendation', label: 'Recommendations', icon: Sparkles, desc: 'Personalized content recommendations', locked: false },
              { key: 'subscription_update', label: 'Subscription Updates', icon: CreditCard, desc: 'Changes to your subscription', locked: false },
              { key: 'payment_reminder', label: 'Payment Reminders', icon: AlertCircle, desc: 'Billing and payment notifications', locked: false },
              { key: 'account_security', label: 'Security Alerts', icon: Shield, desc: 'Important security notifications', locked: true },
              { key: 'promotional', label: 'Promotions & Offers', icon: Megaphone, desc: 'Special deals and promotions', locked: false },
              { key: 'system_announcement', label: 'System Announcements', icon: Info, desc: 'Platform updates and announcements', locked: false },
            ].map(({ key, label, icon: Icon, desc, locked }) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-gray-900/50 p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">{label}</p>
                    <p className="text-sm text-gray-400">{desc}</p>
                  </div>
                </div>
                {locked ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="h-4 w-4" />
                    <span>Always On</span>
                  </div>
                ) : (
                  <button
                    onClick={() => updatePreference(`types.${key}`, !preferences.types[key as keyof typeof preferences.types])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      preferences.types[key as keyof typeof preferences.types]
                        ? 'bg-red-600'
                        : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.types[key as keyof typeof preferences.types]
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="mb-6 rounded-lg bg-gray-800/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <Clock className="h-5 w-5" />
            Frequency & Timing
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            Control when and how often you receive digest emails
          </p>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                New Release Digest
              </label>
              <select
                value={preferences.frequency.new_release_frequency}
                onChange={(e) => updatePreference('frequency.new_release_frequency', e.target.value)}
                className="w-full rounded-lg bg-gray-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Recommendation Digest
              </label>
              <select
                value={preferences.frequency.recommendation_frequency}
                onChange={(e) => updatePreference('frequency.recommendation_frequency', e.target.value)}
                className="w-full rounded-lg bg-gray-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Preferred Digest Time
              </label>
              <input
                type="time"
                value={preferences.frequency.digest_time}
                onChange={(e) => updatePreference('frequency.digest_time', e.target.value)}
                className="w-full rounded-lg bg-gray-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="mb-8 rounded-lg bg-gray-800/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <Moon className="h-5 w-5" />
                Quiet Hours
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Pause notifications during specific hours
              </p>
            </div>
            <button
              onClick={() => updatePreference('quiet_hours_enabled', !preferences.quiet_hours_enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                preferences.quiet_hours_enabled ? 'bg-red-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  preferences.quiet_hours_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.quiet_hours_enabled && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours_start || '22:00'}
                  onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                  className="w-full rounded-lg bg-gray-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours_end || '08:00'}
                  onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                  className="w-full rounded-lg bg-gray-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Actions */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-900/95 p-4 backdrop-blur-sm">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <p className="text-sm text-gray-400">You have unsaved changes</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (preferencesData?.preferences) {
                      setPreferences(preferencesData.preferences);
                      setHasChanges(false);
                    }
                  }}
                  className="rounded-lg border border-gray-700 px-6 py-2 font-medium text-white transition hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
