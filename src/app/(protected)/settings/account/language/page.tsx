'use client';

/**
 * Language & Region Settings Page
 * Professional eye-comfortable design for language and regional preferences
 * - Language selection
 * - Timezone configuration
 * - Date/time format preferences
 * - Currency selection
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
  Button,
} from '@/components/settings';
import { Icon } from '@/components/icons/Icon';

// ══════════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════════

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageSettings {
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  currency: string;
}

const LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
  { value: 'Europe/London', label: 'London (GMT)', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: 'UTC+1' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 'UTC+8' },
];

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/29/2025' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '29/12/2025' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2025-12-29' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '29 Dec 2025' },
];

const TIME_FORMATS = [
  { value: '12h', label: '12-hour', example: '2:30 PM' },
  { value: '24h', label: '24-hour', example: '14:30' },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function LanguageSettingsPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = React.useState(false);

  // Mock data fallback
  const MOCK_SETTINGS: LanguageSettings = {
    language: 'en-US',
    timezone: 'America/Los_Angeles',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    currency: 'USD',
  };

  // Fetch language settings
  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['language-settings'],
    queryFn: async () => {
      try {
        const response = await fetchJson<{ settings: LanguageSettings }>('/api/v1/user/language-settings', {
          method: 'GET',
        });
        // Check if response has error property (backend returned error object)
        if (response && 'error' in response && (response as any).error) {
          return { settings: MOCK_SETTINGS };
        }
        return response;
      } catch (err: any) {
        // If endpoint doesn't exist (404), return mock data
        if (err?.status === 404 || err?.code === 404 || err?.message?.includes('Not Found')) {
          return { settings: MOCK_SETTINGS };
        }
        throw err;
      }
    },
  });

  const [settings, setSettings] = React.useState<LanguageSettings | null>(null);

  React.useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings);
    } else if (!isLoading && !settingsData) {
      // Fallback to mock data if no data received
      setSettings(MOCK_SETTINGS);
    }
  }, [settingsData, isLoading]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<LanguageSettings>) => {
      return await fetchJson('/api/v1/user/language-settings', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['language-settings'] });
      toast.success('Language settings saved');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to save language settings');
    },
  });

  const handleSelect = (field: keyof LanguageSettings, value: any) => {
    if (!settings) return;
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (settings) {
      saveMutation.mutate(settings);
    }
  };

  const handleCancel = () => {
    if (settingsData) {
      setSettings(settingsData.settings);
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
        title="Language & Region"
        description="Customize your language, timezone, and regional preferences"
        icon="globe"
      />

      {/* Language Selection */}
      <SettingCard
        title="Display Language"
        description="Choose your preferred language"
        icon="language"
        className="mb-6 mt-8"
      >
        <div>
          <label className="block text-sm font-medium text-[#F0F0F0] mb-3">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleSelect('language', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] focus:outline-none focus:border-[#E5E5E5] transition-colors"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>
      </SettingCard>

      {/* Timezone */}
      <SettingCard
        title="Timezone"
        description="Set your local timezone"
        icon="clock"
        className="mb-6"
      >
        <div>
          <label className="block text-sm font-medium text-[#F0F0F0] mb-3">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSelect('timezone', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] focus:outline-none focus:border-[#E5E5E5] transition-colors"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.offset})
              </option>
            ))}
          </select>
        </div>
      </SettingCard>

      {/* Date & Time Format */}
      <SettingCard
        title="Date & Time Format"
        description="Choose how dates and times are displayed"
        icon="calendar"
        className="mb-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Date Format */}
          <div>
            <label className="block text-sm font-medium text-[#F0F0F0] mb-3">
              Date Format
            </label>
            <select
              value={settings.date_format}
              onChange={(e) => handleSelect('date_format', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] focus:outline-none focus:border-[#E5E5E5] transition-colors"
            >
              {DATE_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label} - {format.example}
                </option>
              ))}
            </select>
          </div>

          {/* Time Format */}
          <div>
            <label className="block text-sm font-medium text-[#F0F0F0] mb-3">
              Time Format
            </label>
            <select
              value={settings.time_format}
              onChange={(e) => handleSelect('time_format', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] focus:outline-none focus:border-[#E5E5E5] transition-colors"
            >
              {TIME_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label} - {format.example}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SettingCard>

      {/* Currency */}
      <SettingCard
        title="Currency"
        description="Your preferred currency for pricing"
        icon="settings"
        className="mb-6"
      >
        <div>
          <label className="block text-sm font-medium text-[#F0F0F0] mb-3">
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => handleSelect('currency', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] focus:outline-none focus:border-[#E5E5E5] transition-colors"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code} - {curr.name}
              </option>
            ))}
          </select>
        </div>
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
            Save Language Settings
          </Button>
        </div>
      )}

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
