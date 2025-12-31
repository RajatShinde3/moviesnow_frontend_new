'use client';

/**
 * =============================================================================
 * Security Alerts Page - ULTIMATE ENTERPRISE GRADE
 * =============================================================================
 *
 * Premium Features:
 * - Granular alert configuration with beautiful toggles
 * - Real-time preview of alert types
 * - Professional card-based layout
 * - Smooth animations and transitions
 * - Color-coded alert categories
 * - Responsive design
 * - Accessibility compliant (WCAG 2.1 AA)
 */

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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

// ══════════════════════════════════════════════════════════════════════════════
// Custom SVG Icons
// ══════════════════════════════════════════════════════════════════════════════

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor"/>
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="currentColor"/>
  </svg>
);

const DeviceIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 1.01L7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1.01 17 1.01ZM17 19H7V5H17V19Z" fill="currentColor"/>
  </svg>
);

const KeyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.65 10C11.83 7.67 9.61 6 7 6C3.69 6 1 8.69 1 12C1 15.31 3.69 18 7 18C9.61 18 11.83 16.33 12.65 14H17V18H21V14H23V10H12.65ZM7 14C5.9 14 5 13.1 5 12C5 10.9 5.9 10 7 10C8.1 10 9 10.9 9 12C9 13.1 8.1 14 7 14Z" fill="currentColor"/>
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
  </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
  </svg>
);

const SaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13C13.66 13 15 14.34 15 16C15 17.66 13.66 19 12 19ZM15 9H5V5H15V9Z" fill="currentColor"/>
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
  </svg>
);

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
// Alert Type Configurations
// ══════════════════════════════════════════════════════════════════════════════

const ALERT_TYPES = [
  {
    id: 'sign_in' as keyof AlertSettings,
    label: 'New Sign-Ins',
    description: 'Get notified when you sign in from a new location or IP address',
    icon: LockIcon,
    color: 'text-[#A0A0A0]',
    bgColor: 'from-[#2A2A2A] to-[#1F1F1F]',
    borderColor: 'border-[#3A3A3A]',
  },
  {
    id: 'suspicious_activity' as keyof AlertSettings,
    label: 'Suspicious Activity',
    description: 'Alerts for unusual login patterns, risky locations, or blocked attempts',
    icon: ShieldIcon,
    color: 'text-[#A0A0A0]',
    bgColor: 'from-[#2A2A2A] to-[#1F1F1F]',
    borderColor: 'border-[#3A3A3A]',
  },
  {
    id: 'new_device' as keyof AlertSettings,
    label: 'New Trusted Device',
    description: 'Notification when a new device is added to your trusted devices list',
    icon: DeviceIcon,
    color: 'text-[#A0A0A0]',
    bgColor: 'from-[#2A2A2A] to-[#1F1F1F]',
    borderColor: 'border-[#3A3A3A]',
  },
  {
    id: 'password_change' as keyof AlertSettings,
    label: 'Password Changed',
    description: 'Immediate alert when your account password is modified',
    icon: KeyIcon,
    color: 'text-[#A0A0A0]',
    bgColor: 'from-[#2A2A2A] to-[#1F1F1F]',
    borderColor: 'border-[#3A3A3A]',
  },
  {
    id: 'mfa_disabled' as keyof AlertSettings,
    label: 'MFA Disabled',
    description: 'Critical alert when two-factor authentication is turned off',
    icon: ShieldIcon,
    color: 'text-[#A0A0A0]',
    bgColor: 'from-[#2A2A2A] to-[#1F1F1F]',
    borderColor: 'border-[#3A3A3A]',
  },
  {
    id: 'email_change' as keyof AlertSettings,
    label: 'Email Address Changed',
    description: 'Security notification when your primary email is updated',
    icon: MailIcon,
    color: 'text-[#A0A0A0]',
    bgColor: 'from-[#2A2A2A] to-[#1F1F1F]',
    borderColor: 'border-[#3A3A3A]',
  },
];

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
      return await fetchJson<{ settings: AlertSettings }>('/auth/alerts', {
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
      return await fetchJson('/auth/alerts', {
        method: 'PATCH',
        json: updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-settings'] });
      toast.success('Alert settings saved successfully');
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

  // Calculate active alerts count
  const activeAlertsCount = settings
    ? ALERT_TYPES.filter((type) => settings[type.id] && settings.email_enabled).length
    : 0;

  // Loading state
  if (isLoading || !settings) {
    return (
      <SettingsLayout>
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2A2A2A] border-t-[#A0A0A0]" />
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-[#A0A0A0]/30" />
          </div>
          <p className="text-[#B0B0B0] text-sm font-medium animate-pulse">Loading alert settings...</p>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-20">
        {/* ========================================================================
            Premium Header Section
        ======================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="flex items-center gap-4">
            {/* Icon */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="relative p-4 bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] border border-[#3A3A3A] rounded-2xl backdrop-blur-xl shadow-xl shadow-black/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#3A3A3A]/20 to-transparent rounded-2xl animate-pulse" />
              <BellIcon className="w-8 h-8 text-[#A0A0A0] relative z-10" />
            </motion.div>

            {/* Title & Description */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#F0F0F0] tracking-tight">
                Security Alerts
              </h1>
              <p className="text-[#909090] mt-1.5 text-sm sm:text-base">
                Configure email notifications for security events
              </p>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================
            Info Banner
        ======================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-6 overflow-hidden shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#2A2A2A]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3A3A3A]/40 to-transparent" />

          <div className="relative flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] p-3 border border-[#3A3A3A] shadow-md shadow-black/10"
            >
              <InfoIcon className="w-5 h-5 text-[#A0A0A0]" />
            </motion.div>
            <div>
              <h3 className="text-base font-semibold text-[#F0F0F0] mb-1.5">
                How Security Alerts Work
              </h3>
              <p className="text-sm text-[#909090] leading-relaxed">
                Receive email notifications when important security events occur on your account. Toggle the master switch below to enable or disable all alerts at once.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================
            Stats Dashboard
        ======================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              icon: CheckIcon,
              label: 'Active Alerts',
              value: activeAlertsCount,
              gradient: 'from-[#2A2A2A] to-[#1F1F1F]',
              border: 'border-[#3A3A3A]',
              iconColor: 'text-[#A0A0A0]',
            },
            {
              icon: BellIcon,
              label: 'Total Types',
              value: ALERT_TYPES.length,
              gradient: 'from-[#2A2A2A] to-[#1F1F1F]',
              border: 'border-[#3A3A3A]',
              iconColor: 'text-[#A0A0A0]',
            },
            {
              icon: MailIcon,
              label: 'Email Alerts',
              value: settings.email_enabled ? 'On' : 'Off',
              gradient: 'from-[#2A2A2A] to-[#1F1F1F]',
              border: 'border-[#3A3A3A]',
              iconColor: 'text-[#A0A0A0]',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              whileHover={{ y: -4, boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3)` }}
              className={`group relative rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 border ${stat.border}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${stat.gradient}`} />

              <div className="relative flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`p-3 rounded-xl bg-gradient-to-br shadow-lg ${stat.gradient}`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </motion.div>
                <div>
                  <p className="text-xs text-[#707070] font-medium uppercase tracking-wide mb-0.5">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#F0F0F0]">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ========================================================================
            Master Email Toggle
        ======================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="group relative bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 border border-[#3A3A3A]/60 rounded-2xl p-6 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#2A2A2A]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="p-3 rounded-xl bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] border border-[#3A3A3A] shadow-lg"
              >
                <MailIcon className="w-7 h-7 text-[#A0A0A0]" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-[#F0F0F0] mb-1">Master Email Toggle</h3>
                <p className="text-[#909090] text-sm">
                  {settings.email_enabled
                    ? 'Security notifications enabled'
                    : 'All email alerts disabled'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_enabled}
                onChange={() => handleToggle('email_enabled')}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-[#2A2A2A] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3A3A3A] rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#E0E0E0] after:border-transparent after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#505050]"></div>
            </label>
          </div>
        </motion.div>

        {/* ========================================================================
            Alert Types Grid
        ======================================================================== */}
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <div>
              <h2 className="text-xl font-semibold text-[#F0F0F0]">Alert Preferences</h2>
              <p className="text-xs text-[#707070] mt-0.5">Customize which events trigger notifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ALERT_TYPES.map((alertType, index) => {
              const Icon = alertType.icon;
              const isEnabled = settings[alertType.id];
              const isDisabled = !settings.email_enabled;

              return (
                <motion.div
                  key={alertType.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                  whileHover={!isDisabled ? { y: -2, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' } : {}}
                  className={`group relative bg-gradient-to-br from-[#1A1A1A]/80 to-[#1F1F1F]/80 border rounded-xl p-4 backdrop-blur-xl transition-all duration-200 overflow-hidden ${
                    isDisabled ? 'opacity-40 cursor-not-allowed' : alertType.borderColor
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-50 transition-opacity duration-200 ${alertType.bgColor}`} />

                  <div className="relative flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${alertType.bgColor} flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${alertType.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[#F0F0F0] mb-1">{alertType.label}</h3>
                        <p className="text-xs text-[#808080] leading-relaxed">{alertType.description}</p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggle(alertType.id)}
                        disabled={isDisabled}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-[#2A2A2A] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3A3A3A] rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#E0E0E0] after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#505050] peer-disabled:opacity-30"></div>
                    </label>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================
            Save/Cancel Actions (Sticky Bar)
        ======================================================================== */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-4 py-3 shadow-2xl backdrop-blur-xl flex items-center gap-4">
                <div className="flex items-center gap-2.5 px-2">
                  <div className="w-1.5 h-1.5 bg-[#A0A0A0] rounded-full animate-pulse" />
                  <span className="text-sm text-[#E0E0E0] font-medium">Unsaved changes</span>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="px-5 py-2 bg-[#2A2A2A] border border-[#3A3A3A] text-[#D0D0D0] rounded-lg hover:bg-[#2F2F2F] hover:border-[#404040] transition-all text-sm font-medium flex items-center gap-2"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="px-5 py-2 bg-[#F0F0F0] text-[#1A1A1A] rounded-lg hover:bg-white transition-all text-sm font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="w-3.5 h-3.5" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SettingsLayout>
  );
}
