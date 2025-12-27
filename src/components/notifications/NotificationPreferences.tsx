/**
 * =============================================================================
 * NotificationPreferences Component
 * =============================================================================
 * Advanced notification preferences with granular control
 */

'use client';

import { useState } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  Clock,
  Moon,
} from 'lucide-react';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useResetNotificationPreferences,
  useMuteNotifications,
  useUnmuteNotifications,
} from '@/lib/api/hooks/useNotifications';
import { NotificationPreferences } from '@/lib/api/services/notifications';

export default function NotificationPreferencesPage() {
  const { data: prefsData, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const resetPrefs = useResetNotificationPreferences();
  const muteNotifications = useMuteNotifications();
  const unmuteNotifications = useUnmuteNotifications();

  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Use local state or fetched data
  const prefs = localPrefs || prefsData?.preferences;

  const updateLocalPrefs = (updates: Partial<NotificationPreferences>) => {
    if (!prefs) return;
    const newPrefs = { ...prefs, ...updates };
    setLocalPrefs(newPrefs);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localPrefs) return;
    await updatePrefs.mutateAsync(localPrefs);
    setHasChanges(false);
    setLocalPrefs(null);
  };

  const handleReset = async () => {
    if (!confirm('Reset all preferences to defaults?')) return;
    await resetPrefs.mutateAsync();
    setLocalPrefs(null);
    setHasChanges(false);
  };

  const handleMute = async (hours: number) => {
    await muteNotifications.mutateAsync(hours);
  };

  const handleUnmute = async () => {
    await unmuteNotifications.mutateAsync();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-red-500 mb-4"></div>
          <p className="text-gray-400">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (!prefs) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Notification Preferences</h1>
          <p className="text-gray-400">
            Customize how and when you receive notifications
          </p>
        </div>

        {/* Mute Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <VolumeX className="h-6 w-6 text-red-400" />
            Mute Notifications
          </h2>

          {prefs.mute_all_until && new Date(prefs.mute_all_until) > new Date() ? (
            <div>
              <p className="text-gray-400 mb-4">
                Notifications are muted until{' '}
                <span className="font-bold text-white">
                  {new Date(prefs.mute_all_until).toLocaleString()}
                </span>
              </p>
              <button
                onClick={handleUnmute}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Volume2 className="h-5 w-5" />
                Unmute Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 8, 24, 168].map((hours) => (
                <button
                  key={hours}
                  onClick={() => handleMute(hours)}
                  className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-center"
                >
                  <p className="font-bold text-lg">{hours}h</p>
                  <p className="text-xs text-gray-400">
                    {hours === 1
                      ? '1 hour'
                      : hours === 8
                      ? '8 hours'
                      : hours === 24
                      ? '1 day'
                      : '1 week'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Channel Preferences */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-400" />
            Notification Channels
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Choose how you want to receive notifications
          </p>

          <div className="space-y-4">
            <ToggleRow
              icon={<Mail className="h-5 w-5" />}
              label="Email Notifications"
              description="Receive notifications via email"
              checked={prefs.channels.email}
              onChange={(checked) =>
                updateLocalPrefs({ channels: { ...prefs.channels, email: checked } })
              }
            />

            <ToggleRow
              icon={<Smartphone className="h-5 w-5" />}
              label="Push Notifications"
              description="Browser and mobile push notifications"
              checked={prefs.channels.push}
              onChange={(checked) =>
                updateLocalPrefs({ channels: { ...prefs.channels, push: checked } })
              }
            />

            <ToggleRow
              icon={<MessageSquare className="h-5 w-5" />}
              label="In-App Notifications"
              description="Show notifications in the app"
              checked={prefs.channels.in_app}
              onChange={(checked) =>
                updateLocalPrefs({ channels: { ...prefs.channels, in_app: checked } })
              }
            />

            <ToggleRow
              icon={<Smartphone className="h-5 w-5" />}
              label="SMS Notifications"
              description="Text message notifications (premium only)"
              checked={prefs.channels.sms}
              onChange={(checked) =>
                updateLocalPrefs({ channels: { ...prefs.channels, sms: checked } })
              }
            />
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="h-6 w-6 text-purple-400" />
            Notification Types
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Control which types of notifications you receive
          </p>

          <div className="space-y-4">
            <ToggleRow
              icon={<span className="text-xl">🎬</span>}
              label="New Releases"
              description="New movies, series, and anime"
              checked={prefs.types.new_release}
              onChange={(checked) =>
                updateLocalPrefs({ types: { ...prefs.types, new_release: checked } })
              }
            />

            <ToggleRow
              icon={<span className="text-xl">📺</span>}
              label="Watchlist Updates"
              description="Updates on content in your watchlist"
              checked={prefs.types.watchlist_update}
              onChange={(checked) =>
                updateLocalPrefs({ types: { ...prefs.types, watchlist_update: checked } })
              }
            />

            <ToggleRow
              icon={<span className="text-xl">✨</span>}
              label="Recommendations"
              description="Personalized content recommendations"
              checked={prefs.types.recommendation}
              onChange={(checked) =>
                updateLocalPrefs({ types: { ...prefs.types, recommendation: checked } })
              }
            />

            <ToggleRow
              icon={<span className="text-xl">💳</span>}
              label="Subscription Updates"
              description="Subscription status and renewals"
              checked={prefs.types.subscription_update}
              onChange={(checked) =>
                updateLocalPrefs({ types: { ...prefs.types, subscription_update: checked } })
              }
            />

            <ToggleRow
              icon={<span className="text-xl">💰</span>}
              label="Payment Reminders"
              description="Upcoming payments and billing"
              checked={prefs.types.payment_reminder}
              onChange={(checked) =>
                updateLocalPrefs({ types: { ...prefs.types, payment_reminder: checked } })
              }
            />

            <ToggleRow
              icon={<span className="text-xl">🔒</span>}
              label="Account Security"
              description="Security alerts (always enabled)"
              checked={prefs.types.account_security}
              onChange={() => {}}
              disabled
            />

            <ToggleRow
              icon={<span className="text-xl">🎁</span>}
              label="Promotional Offers"
              description="Special deals and promotions"
              checked={prefs.types.promotional}
              onChange={(checked) =>
                updateLocalPrefs({ types: { ...prefs.types, promotional: checked } })
              }
            />

            <ToggleRow
              icon={<span className="text-xl">📢</span>}
              label="System Announcements"
              description="Important platform updates"
              checked={prefs.types.system_announcement}
              onChange={(checked) =>
                updateLocalPrefs({ types: { ...prefs.types, system_announcement: checked } })
              }
            />
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6 text-green-400" />
            Notification Frequency
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Control how often you receive digest emails
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Release Digest
              </label>
              <select
                value={prefs.frequency.new_release_frequency}
                onChange={(e) =>
                  updateLocalPrefs({
                    frequency: {
                      ...prefs.frequency,
                      new_release_frequency: e.target.value as any,
                    },
                  })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="instant">Instant (as they happen)</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recommendation Digest
              </label>
              <select
                value={prefs.frequency.recommendation_frequency}
                onChange={(e) =>
                  updateLocalPrefs({
                    frequency: {
                      ...prefs.frequency,
                      recommendation_frequency: e.target.value as any,
                    },
                  })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Digest Time (24-hour format)
              </label>
              <input
                type="time"
                value={prefs.frequency.digest_time}
                onChange={(e) =>
                  updateLocalPrefs({
                    frequency: { ...prefs.frequency, digest_time: e.target.value },
                  })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Moon className="h-6 w-6 text-indigo-400" />
            Quiet Hours
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Mute non-urgent notifications during specific hours
          </p>

          <div className="space-y-4">
            <ToggleRow
              label="Enable Quiet Hours"
              description="Automatically mute notifications during these hours"
              checked={prefs.quiet_hours_enabled}
              onChange={(checked) => updateLocalPrefs({ quiet_hours_enabled: checked })}
            />

            {prefs.quiet_hours_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={prefs.quiet_hours_start || '22:00'}
                    onChange={(e) =>
                      updateLocalPrefs({ quiet_hours_start: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={prefs.quiet_hours_end || '08:00'}
                    onChange={(e) => updateLocalPrefs({ quiet_hours_end: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={!hasChanges || updatePrefs.isPending}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            {updatePrefs.isPending ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={resetPrefs.isPending}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Reset to Defaults
          </button>
        </div>

        {hasChanges && (
          <p className="mt-4 text-sm text-yellow-400 text-center">
            You have unsaved changes
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle Row Component
// ─────────────────────────────────────────────────────────────────────────────

interface ToggleRowProps {
  icon?: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ icon, label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
        <div>
          <h4 className="font-medium text-white">{label}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
            checked ? 'peer-checked:bg-red-600' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        ></div>
      </label>
    </div>
  );
}
