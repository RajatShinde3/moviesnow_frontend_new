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

  return (
    <SettingsLayout>
      <PageHeader
        title="Preferences"
        description="Customize your viewing experience"
        icon="settings"
      />

      {/* Playback Settings */}
      <SettingCard
        title="Playback"
        description="Control how videos play"
        icon="play"
        className="mb-6 mt-8"
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

      {/* Display Settings */}
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

      {/* Content Settings */}
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

      {/* Download Settings */}
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

      {/* Accessibility Settings */}
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
            Save Preferences
          </Button>
        </div>
      )}

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
