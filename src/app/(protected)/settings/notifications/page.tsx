'use client';

/**
 * Notification Settings Page - PROFESSIONAL DARK THEME
 * Premium notification management with:
 * - Channel controls (email, push, in-app, SMS)
 * - Type-specific preferences
 * - Frequency settings
 * - Quiet hours configuration
 * - Temporary mute functionality
 * Professional animations and visual hierarchy
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';

// Custom SVG Icons
const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
  </svg>
);

const BellOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 18.69L7.84 6.14L5.27 3.49L4 4.76L6.8 7.56V11C6.8 13.17 5.85 14.99 4.43 16.17C4.15 16.4 4 16.75 4 17.13V18H16.73L19.23 20.5L20.5 19.23L20 18.69ZM12 22C13.11 22 14 21.11 14 20H10C10 21.11 10.9 22 12 22ZM18 14.68L15.5 12.18V11C15.5 8.17 13.66 5.85 11 5.18V4.5C11 3.67 10.33 3 9.5 3C9.35 3 9.21 3.03 9.08 3.08L18 11.98V14.68Z" fill="currentColor"/>
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 1.01L7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1.01 17 1.01ZM17 19H7V5H17V19Z" fill="currentColor"/>
  </svg>
);

const ListIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z" fill="currentColor"/>
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="currentColor"/>
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
  </svg>
);

const SaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM19 19H5V5H16.17L19 7.83V19ZM12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12ZM6 6H15V10H6V6Z" fill="currentColor"/>
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
  </svg>
);

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

// Simple layout wrapper
const SettingsLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#1A1A1A]">
    {children}
  </div>
);

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = React.useState(false);

  // Fetch preferences
  const { data: preferencesData, isLoading } = useQuery<{ preferences: NotificationPreferences }>({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      return await fetchJson<{ preferences: NotificationPreferences }>('/notifications/preferences', {
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
      return await fetchJson('/notifications/preferences', {
        method: 'PUT',
        json: updates,
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
      return await fetchJson('/notifications/preferences/reset', {
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
      return await fetchJson(`/notifications/preferences/mute-temporarily?hours=${hours}`, {
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
      return await fetchJson('/notifications/preferences/unmute', {
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
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2A2A2A] border-t-[#A0A0A0]" />
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-[#A0A0A0]/30" />
          </div>
          <p className="text-[#B0B0B0] text-sm font-medium animate-pulse">Loading notification preferences...</p>
        </div>
      </SettingsLayout>
    );
  }

  const isMuted = preferences.mute_all_until && new Date(preferences.mute_all_until) > new Date();

  return (
    <SettingsLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-20">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="relative p-4 bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] border border-[#3A3A3A] rounded-2xl backdrop-blur-xl shadow-xl shadow-black/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#3A3A3A]/20 to-transparent rounded-2xl animate-pulse" />
              <BellIcon className="w-8 h-8 text-[#A0A0A0] relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#F0F0F0] tracking-tight">
                Notification Settings
              </h1>
              <p className="text-[#909090] mt-1.5 text-sm sm:text-base">
                Manage how and when you receive notifications
              </p>
            </div>
          </div>
        </motion.div>

        {/* Muted Banner */}
        {isMuted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="group relative rounded-xl border border-[#3A3A3A] bg-gradient-to-br from-[#2A2A2A]/80 to-[#1F1F1F]/80 p-5 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#3A3A3A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] border border-[#3A3A3A]">
                  <BellOffIcon className="w-5 h-5 text-[#A0A0A0]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#F0F0F0] mb-1">
                    Notifications Muted
                  </h3>
                  <p className="text-sm text-[#808080]">
                    All notifications are muted until{' '}
                    <span className="font-medium text-[#D0D0D0]">
                      {new Date(preferences.mute_all_until!).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => unmuteMutation.mutate()}
                disabled={unmuteMutation.isPending}
                className="px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] text-[#D0D0D0] rounded-lg hover:bg-[#2F2F2F] hover:border-[#404040] transition-all text-sm font-medium disabled:opacity-50"
              >
                {unmuteMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-[#D0D0D0]/30 border-t-[#D0D0D0] rounded-full animate-spin" />
                ) : (
                  'Unmute'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
          className="relative rounded-xl border border-[#3A3A3A] bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 p-6 backdrop-blur-xl shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#2A2A2A]/20 to-transparent opacity-50" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#2A2A2A]">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] border border-[#3A3A3A]">
                <SettingsIcon className="w-4 h-4 text-[#A0A0A0]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#F0F0F0]">Quick Actions</h2>
                <p className="text-xs text-[#707070] mt-0.5">Temporary notification controls</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Mute 1 Hour', hours: 1 },
                { label: 'Mute 8 Hours', hours: 8 },
                { label: 'Mute 24 Hours', hours: 24 },
              ].map((action, index) => (
                <motion.button
                  key={action.hours}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => muteMutation.mutate(action.hours)}
                  disabled={muteMutation.isPending}
                  className="px-4 py-2.5 bg-[#2A2A2A] border border-[#3A3A3A] text-[#D0D0D0] rounded-lg hover:bg-[#2F2F2F] hover:border-[#404040] transition-all text-sm font-medium disabled:opacity-50"
                >
                  {muteMutation.isPending ? (
                    <div className="w-4 h-4 mx-auto border-2 border-[#D0D0D0]/30 border-t-[#D0D0D0] rounded-full animate-spin" />
                  ) : (
                    action.label
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notification Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          className="relative rounded-xl border border-[#3A3A3A] bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 p-6 backdrop-blur-xl shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#2A2A2A]/20 to-transparent opacity-50" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#2A2A2A]">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] border border-[#3A3A3A]">
                <MailIcon className="w-4 h-4 text-[#A0A0A0]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#F0F0F0]">Notification Channels</h2>
                <p className="text-xs text-[#707070] mt-0.5">Choose how you want to receive notifications</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'email' as const, label: 'Email Notifications', description: 'Receive notifications via email', icon: MailIcon },
                { key: 'push' as const, label: 'Push Notifications', description: 'Browser and mobile push notifications', icon: BellIcon },
                { key: 'in_app' as const, label: 'In-App Notifications', description: 'Notifications within the application', icon: BellIcon },
                { key: 'sms' as const, label: 'SMS Notifications', description: 'Text message notifications (carrier rates apply)', icon: PhoneIcon },
              ].map((channel, index) => {
                const Icon = channel.icon;
                return (
                  <motion.div
                    key={channel.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                    className="group relative bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 border border-[#3A3A3A] rounded-lg p-4 hover:border-[#404040] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F]">
                          <Icon className="w-4 h-4 text-[#A0A0A0]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#F0F0F0] mb-1">{channel.label}</h3>
                          <p className="text-xs text-[#808080] leading-relaxed">{channel.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-3">
                        <input
                          type="checkbox"
                          checked={preferences.channels[channel.key]}
                          onChange={() => updateChannel(channel.key)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-[#2A2A2A] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3A3A3A] rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#E0E0E0] after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#505050]"></div>
                      </label>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Notification Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
          className="relative rounded-xl border border-[#3A3A3A] bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 p-6 backdrop-blur-xl shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#2A2A2A]/20 to-transparent opacity-50" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#2A2A2A]">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] border border-[#3A3A3A]">
                <ListIcon className="w-4 h-4 text-[#A0A0A0]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#F0F0F0]">Notification Types</h2>
                <p className="text-xs text-[#707070] mt-0.5">Choose what you want to be notified about</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'new_release' as const, label: 'New Releases', description: 'Notify me when new content is released' },
                { key: 'watchlist_update' as const, label: 'Watchlist Updates', description: 'Changes to content in your watchlist' },
                { key: 'recommendation' as const, label: 'Recommendations', description: 'Personalized content suggestions' },
                { key: 'subscription_update' as const, label: 'Subscription Updates', description: 'Changes to your subscription plan' },
                { key: 'payment_reminder' as const, label: 'Payment Reminders', description: 'Upcoming payments and billing information' },
                { key: 'account_security' as const, label: 'Account Security', description: 'Security alerts and login notifications' },
                { key: 'promotional' as const, label: 'Promotional Offers', description: 'Special offers and promotions' },
                { key: 'system_announcement' as const, label: 'System Announcements', description: 'Platform updates and maintenance' },
              ].map((type, index) => (
                <motion.div
                  key={type.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.03, type: 'spring', stiffness: 200, damping: 20 }}
                  className="group relative bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 border border-[#3A3A3A] rounded-lg p-4 hover:border-[#404040] transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#F0F0F0] mb-1">{type.label}</h3>
                      <p className="text-xs text-[#808080] leading-relaxed">{type.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-3">
                      <input
                        type="checkbox"
                        checked={preferences.types[type.key]}
                        onChange={() => updateType(type.key)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-[#2A2A2A] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3A3A3A] rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#E0E0E0] after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#505050]"></div>
                    </label>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quiet Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.4 }}
          className="relative rounded-xl border border-[#3A3A3A] bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 p-6 backdrop-blur-xl shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#2A2A2A]/20 to-transparent opacity-50" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#2A2A2A]">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] border border-[#3A3A3A]">
                <MoonIcon className="w-4 h-4 text-[#A0A0A0]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#F0F0F0]">Quiet Hours</h2>
                <p className="text-xs text-[#707070] mt-0.5">Pause notifications during specific times</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="group relative bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 border border-[#3A3A3A] rounded-lg p-4 hover:border-[#404040] transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#F0F0F0] mb-1">Enable Quiet Hours</h3>
                    <p className="text-xs text-[#808080] leading-relaxed">Mute notifications during specified hours</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
                    <input
                      type="checkbox"
                      checked={preferences.quiet_hours_enabled}
                      onChange={updateQuietHours}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#2A2A2A] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3A3A3A] rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#E0E0E0] after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#505050]"></div>
                  </label>
                </div>
              </div>

              <AnimatePresence>
                {preferences.quiet_hours_enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 border border-[#3A3A3A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <ClockIcon className="w-4 h-4 text-[#A0A0A0]" />
                        <div>
                          <p className="text-sm font-medium text-[#F0F0F0]">Start Time</p>
                          <p className="text-xs text-[#808080]">{preferences.quiet_hours_start || 'Not set'}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toast.info('Coming soon')}
                        className="px-3 py-1.5 text-xs font-medium text-[#D0D0D0] hover:text-[#F0F0F0] transition-colors"
                      >
                        Change
                      </motion.button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 border border-[#3A3A3A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <ClockIcon className="w-4 h-4 text-[#A0A0A0]" />
                        <div>
                          <p className="text-sm font-medium text-[#F0F0F0]">End Time</p>
                          <p className="text-xs text-[#808080]">{preferences.quiet_hours_end || 'Not set'}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toast.info('Coming soon')}
                        className="px-3 py-1.5 text-xs font-medium text-[#D0D0D0] hover:text-[#F0F0F0] transition-colors"
                      >
                        Change
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className="px-5 py-2.5 bg-[#2A2A2A] border border-[#3A3A3A] text-[#D0D0D0] rounded-lg hover:bg-[#2F2F2F] hover:border-[#404040] transition-all text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {resetMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-[#D0D0D0]/30 border-t-[#D0D0D0] rounded-full animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RefreshIcon className="w-4 h-4" />
                Reset to Defaults
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="px-5 py-2.5 bg-[#2A2A2A] border border-[#3A3A3A] text-[#D0D0D0] rounded-lg hover:bg-[#2F2F2F] hover:border-[#404040] transition-all text-sm font-medium flex items-center gap-2"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="px-5 py-2.5 bg-[#F0F0F0] text-[#1A1A1A] rounded-lg hover:bg-white transition-all text-sm font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saveMutation.isPending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-3.5 h-3.5" />
                      Save Preferences
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </SettingsLayout>
  );
}
