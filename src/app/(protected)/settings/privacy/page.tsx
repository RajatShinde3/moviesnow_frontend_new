'use client';

/**
 * Privacy Settings Page
 * ===========================
 * Privacy preference management with real backend integration:
 * - Activity visibility controls
 * - Profile privacy settings
 * - Data sharing preferences
 * - Watch history privacy
 * - Real-time updates with backend
 * - Consistent red/slate color scheme
 */

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { settingsService, type PrivacySettings } from '@/lib/api/services/settings';
import {
  Eye,
  EyeOff,
  Shield,
  Users,
  Lock,
  Globe,
  History,
  UserCheck,
  ArrowLeft,
  Info,
  AlertTriangle,
  Download,
  Trash2,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/cn';

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function PrivacySettingsPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = React.useState(false);

  // Fetch privacy settings from backend
  const { data: privacyData, isLoading } = useQuery({
    queryKey: ['privacy-settings'],
    queryFn: async () => {
      return await settingsService.getPrivacySettings();
    },
  });

  const [settings, setSettings] = React.useState<PrivacySettings | null>(null);

  // Update local state when data loads
  React.useEffect(() => {
    if (privacyData) {
      setSettings(privacyData);
    }
  }, [privacyData]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<PrivacySettings>) => {
      return await settingsService.updatePrivacySettings(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] });
      toast.success('Privacy settings saved');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to save privacy settings');
    },
  });

  const handleToggle = (field: keyof PrivacySettings) => {
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

  if (isLoading || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  const privacyToggles = [
    {
      field: 'show_watch_history' as keyof PrivacySettings,
      title: 'Show Watch History',
      description: 'Display your recently watched content on your profile',
      icon: History,
    },
    {
      field: 'share_watching_activity' as keyof PrivacySettings,
      title: 'Share Watching Activity',
      description: 'Let others see what you\'re currently watching',
      icon: Eye,
    },
    {
      field: 'personalized_recommendations' as keyof PrivacySettings,
      title: 'Personalized Recommendations',
      description: 'Use your watch history to suggest content',
      icon: Users,
    },
    {
      field: 'allow_analytics' as keyof PrivacySettings,
      title: 'Analytics & Performance',
      description: 'Help us improve by sharing anonymous usage data',
      icon: UserCheck,
    },
    {
      field: 'adult_content' as keyof PrivacySettings,
      title: 'Show Adult Content',
      description: 'Include mature-rated content in search and recommendations',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Settings
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <motion.div
              className="rounded-2xl bg-gradient-to-br from-red-600 to-red-500 p-3 shadow-2xl shadow-red-500/30"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Shield className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black text-white">Privacy Settings</h1>
              <p className="text-slate-400 mt-1">
                Control who can see your activity and information
              </p>
            </div>
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-xl p-6 shadow-xl mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-red-500/20 p-2.5 ring-2 ring-red-500/30">
              <Info className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Your Privacy Matters</h3>
              <p className="text-sm text-slate-300">
                We respect your privacy and give you full control over your data. These
                settings let you decide what information you share and who can see it.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <div className="space-y-6">
          {privacyToggles.map((toggle, index) => {
            const Icon = toggle.icon;
            const isEnabled = Boolean(settings[toggle.field]);
            return (
              <motion.div
                key={toggle.field}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl hover:border-red-500/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={cn(
                        'rounded-xl p-2.5 ring-2 transition-all',
                        isEnabled
                          ? 'bg-red-500/20 ring-red-500/30'
                          : 'bg-slate-800/50 ring-slate-700/30'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-6 w-6 transition-colors',
                          isEnabled ? 'text-red-400' : 'text-slate-400'
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {toggle.title}
                      </h3>
                      <p className="text-sm text-slate-400">{toggle.description}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <motion.button
                    onClick={() => handleToggle(toggle.field)}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
                      isEnabled
                        ? 'bg-gradient-to-r from-red-600 to-red-500'
                        : 'bg-slate-700'
                    )}
                  >
                    <motion.span
                      layout
                      className={cn(
                        'inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform',
                        isEnabled ? 'translate-x-7' : 'translate-x-1'
                      )}
                    />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 rounded-3xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 p-2.5 ring-2 ring-red-500/30">
              <Lock className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Data Management</h2>
              <p className="text-sm text-slate-400">Control your personal data</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl border border-slate-800/50 bg-slate-800/30 p-4 text-left hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Download className="h-5 w-5 text-red-400" />
                <span className="font-semibold text-white">Download Your Data</span>
              </div>
              <p className="text-xs text-slate-400">
                Get a copy of all your personal data
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-left hover:bg-red-500/20 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Trash2 className="h-5 w-5 text-red-400" />
                <span className="font-semibold text-red-400">Delete All Data</span>
              </div>
              <p className="text-xs text-slate-400">
                Permanently delete all your data
              </p>
            </motion.button>
          </div>
        </motion.div>

        {/* Save Button */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-end gap-3"
          >
            <motion.button
              onClick={() => {
                if (privacyData) {
                  setSettings(privacyData);
                  setHasChanges(false);
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl border border-slate-700 bg-slate-800/50 px-6 py-3 font-medium text-white transition hover:bg-slate-800"
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-8 py-3 font-bold text-white shadow-2xl shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                {saveMutation.isPending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Privacy Settings</span>
                  </>
                )}
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
