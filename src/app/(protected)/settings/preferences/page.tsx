'use client';

/**
 * Preferences Settings Page
 * Professional eye-comfortable design for managing app preferences
 * - Playback settings
 * - Display preferences
 * - Download settings
 * - Accessibility options
 */

import * as React from 'react';
import Link from 'next/link';
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

// ══════════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════════

interface UserPreferences {
  default_quality: '480p' | '720p' | '1080p' | 'auto';
  auto_play_next_episode: boolean;
  skip_intro: boolean;
  skip_recap: boolean;
  theme: 'dark' | 'light' | 'auto';
  language: string;
  mature_content: boolean;
  default_download_quality: '480p' | '720p' | '1080p';
  wifi_only_downloads: boolean;
  high_contrast: boolean;
  reduce_motion: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function PreferencesPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = React.useState(false);

  // Mock data fallback
  const MOCK_PREFERENCES: UserPreferences = {
    default_quality: 'auto',
    auto_play_next_episode: true,
    skip_intro: true,
    skip_recap: true,
    theme: 'dark',
    language: 'en',
    mature_content: false,
    default_download_quality: '1080p',
    wifi_only_downloads: true,
    high_contrast: false,
    reduce_motion: false,
  };

  // Fetch preferences
  const { data: preferencesData, isLoading } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      try {
        const response = await fetchJson<{ preferences: UserPreferences }>('/api/v1/user/preferences', {
          method: 'GET',
        });
        // Check if response has error property (backend returned error object)
        if (response && 'error' in response && (response as any).error) {
          return { preferences: MOCK_PREFERENCES };
        }
        return response;
      } catch (err: any) {
        // If endpoint doesn't exist (404), return mock data
        if (err?.status === 404 || err?.code === 404 || err?.message?.includes('Not Found')) {
          return { preferences: MOCK_PREFERENCES };
        }
        throw err;
      }
    },
  });

  const [preferences, setPreferences] = React.useState<UserPreferences | null>(null);

  React.useEffect(() => {
    if (preferencesData?.preferences) {
      setPreferences(preferencesData.preferences);
    } else if (!isLoading && !preferencesData) {
      setPreferences(MOCK_PREFERENCES);
    }
  }, [preferencesData, isLoading]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      return await fetchJson('/api/v1/user/preferences', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      toast.success('Preferences saved');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to save preferences');
    },
  });

  const handleToggle = (field: keyof UserPreferences) => {
    if (!preferences) return;
    const newPreferences = { ...preferences, [field]: !preferences[field] };
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSelect = (field: keyof UserPreferences, value: any) => {
    if (!preferences) return;
    const newPreferences = { ...preferences, [field]: value };
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (preferences) {
      saveMutation.mutate(preferences);
    }
  };

  const handleCancel = () => {
    if (preferencesData) {
      setPreferences(preferencesData.preferences);
      setHasChanges(false);
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

  // Calculate active features count
  const activeFeatures = [
    preferences.auto_play_next_episode,
    preferences.skip_intro,
    preferences.skip_recap,
    preferences.wifi_only_downloads,
    preferences.high_contrast,
    preferences.reduce_motion,
  ].filter(Boolean).length;

  return (
    <SettingsLayout>
      <PageHeader
        title="Preferences"
        description="Customize your viewing experience"
        icon="settings"
      />

      {/* Preferences Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-8 mb-6 mt-8 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent" />

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Theme */}
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/10 p-3 border border-[#8B5CF6]/40 shadow-md shadow-black/10"
            >
              <Icon name="monitor" className="text-[#8B5CF6]" size={24} />
            </motion.div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] bg-clip-text text-transparent mb-1 capitalize">
                {preferences.theme}
              </div>
              <div className="text-sm font-medium text-[#B0B0B0]">Active Theme</div>
              <p className="text-xs text-[#808080] mt-1">Current appearance</p>
            </div>
          </div>

          {/* Default Quality */}
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/10 p-3 border border-[#10B981]/40 shadow-md shadow-black/10"
            >
              <Icon name="play" className="text-[#10B981]" size={24} />
            </motion.div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] bg-clip-text text-transparent mb-1 uppercase">
                {preferences.default_quality}
              </div>
              <div className="text-sm font-medium text-[#B0B0B0]">Video Quality</div>
              <p className="text-xs text-[#808080] mt-1">Streaming preference</p>
            </div>
          </div>

          {/* Active Features */}
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/10 p-3 border border-[#3B82F6]/40 shadow-md shadow-black/10"
            >
              <Icon name="settings" className="text-[#3B82F6]" size={24} />
            </motion.div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] bg-clip-text text-transparent mb-1">
                {activeFeatures}
              </div>
              <div className="text-sm font-medium text-[#B0B0B0]">Active Features</div>
              <p className="text-xs text-[#808080] mt-1">Enabled options</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Playback Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <SettingCard
          title="Playback"
          description="Control how videos play"
          icon="play"
          className="mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                Default Quality
              </label>
              <select
                value={preferences.default_quality}
                onChange={(e) => handleSelect('default_quality', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] focus:outline-none focus:border-[#E5E5E5] transition-colors"
              >
                <option value="auto">Auto</option>
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>

            <Toggle
              checked={preferences.auto_play_next_episode}
              onChange={() => handleToggle('auto_play_next_episode')}
              label="Auto-play Next Episode"
              description="Automatically play the next episode"
            />

            <Toggle
              checked={preferences.skip_intro}
              onChange={() => handleToggle('skip_intro')}
              label="Skip Intro"
              description="Automatically skip opening sequences"
            />

            <Toggle
              checked={preferences.skip_recap}
              onChange={() => handleToggle('skip_recap')}
              label="Skip Recap"
              description="Automatically skip recap segments"
            />
          </div>
        </SettingCard>
      </motion.div>

      {/* Display Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <SettingCard
          title="Display"
          description="Customize the app appearance"
          icon="monitor"
          className="mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => handleSelect('theme', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] focus:outline-none focus:border-[#E5E5E5] transition-colors"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handleSelect('language', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] focus:outline-none focus:border-[#E5E5E5] transition-colors"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </SettingCard>
      </motion.div>

      {/* Content Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      >
        <SettingCard
          title="Content"
          description="Filter and customize content"
          icon="eye"
          className="mb-6"
        >
          <Toggle
            checked={preferences.mature_content}
            onChange={() => handleToggle('mature_content')}
            label="Show Mature Content"
            description="Include adult-rated content in search and recommendations"
          />
        </SettingCard>
      </motion.div>

      {/* Download Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      >
        <SettingCard
          title="Downloads"
          description="Manage download preferences"
          icon="download"
          className="mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                Default Download Quality
              </label>
              <select
                value={preferences.default_download_quality}
                onChange={(e) => handleSelect('default_download_quality', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] focus:outline-none focus:border-[#E5E5E5] transition-colors"
              >
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>

            <Toggle
              checked={preferences.wifi_only_downloads}
              onChange={() => handleToggle('wifi_only_downloads')}
              label="Wi-Fi Only Downloads"
              description="Only download content when connected to Wi-Fi"
            />
          </div>
        </SettingCard>
      </motion.div>

      {/* Accessibility Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
      >
        <SettingCard
          title="Accessibility"
          description="Improve accessibility and comfort"
          icon="eye"
          className="mb-6"
        >
          <Toggle
            checked={preferences.high_contrast}
            onChange={() => handleToggle('high_contrast')}
            label="High Contrast"
            description="Increase contrast for better visibility"
          />

          <Toggle
            checked={preferences.reduce_motion}
            onChange={() => handleToggle('reduce_motion')}
            label="Reduce Motion"
            description="Minimize animations and transitions"
          />
        </SettingCard>
      </motion.div>

      {/* Save/Cancel Actions */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-end gap-3 pt-4"
        >
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
        </motion.div>
      )}

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
