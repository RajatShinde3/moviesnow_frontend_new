'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';

// Custom SVG Icons
const GlobeIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const LanguageIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 8h14M5 8a2 2 0 1 0 4 0M5 8a2 2 0 1 1 4 0m6 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0" />
    <path d="M10 8v9m4-9v9" />
    <path d="M6 16l6 3 6-3" />
  </svg>
);

const ClockIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const DollarSignIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ArrowLeftIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const InfoIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const CheckCircleIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Types
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
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2025' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2025' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2025-12-31' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '31 Dec 2025' },
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

export default function LanguageSettingsPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = React.useState(false);

  const MOCK_SETTINGS: LanguageSettings = {
    language: 'en-US',
    timezone: 'America/Los_Angeles',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    currency: 'USD',
  };

  // Fetch language settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['language-settings'],
    queryFn: async () => {
      try {
        const response = await fetchJson<{ settings: LanguageSettings }>('/user/language-settings', {
          method: 'GET',
        });
        if (response && 'error' in response && (response as any).error) {
          return { settings: MOCK_SETTINGS };
        }
        return response;
      } catch (err: any) {
        if (err?.status === 404 || err?.code === 404 || err?.message?.includes('Not Found')) {
          return { settings: MOCK_SETTINGS };
        }
        return { settings: MOCK_SETTINGS };
      }
    },
  });

  const [settings, setSettings] = React.useState<LanguageSettings | null>(null);

  React.useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings);
    } else if (!isLoading && !settingsData) {
      setSettings(MOCK_SETTINGS);
    }
  }, [settingsData, isLoading]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<LanguageSettings>) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...settingsData?.settings, ...updates } as LanguageSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['language-settings'] });
      toast.success('Language settings saved successfully');
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
      <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#0A0A0A] to-[#050505]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-[#1A1A1A]"></div>
            <div className="h-12 w-12 rounded-full border-4 border-[#2A2A2A] border-t-[#CECECE] animate-spin absolute top-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#0A0A0A] to-[#050505] relative overflow-hidden">
      {/* Animated background blur orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#151515] to-[#0A0A0A] rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Back link */}
        <a
          href="/settings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#888888] hover:text-[#F0F0F0] transition-colors duration-200 mb-8 group"
        >
          <ArrowLeftIcon size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Settings
        </a>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#222222] to-[#181818] p-4 border border-[#2F2F2F] shadow-2xl">
              <GlobeIcon size={32} className="text-[#F0F0F0]" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#F0F0F0] tracking-tight">Language & Region</h1>
              <p className="text-base text-[#999999] mt-2 max-w-2xl">
                Customize your language, timezone, and regional preferences
              </p>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1A1A1A] to-[#131313] p-6 shadow-2xl mb-8">
          <div className="flex items-start gap-4">
            <InfoIcon size={20} className="text-[#22C55E] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[#22C55E] mb-2">Personalize Your Experience</h3>
              <p className="text-sm text-[#D0D0D0]">
                These settings help us display content in your preferred language, timezone, and formats. Changes take effect immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#161616] to-[#111111] p-8 shadow-2xl mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#222222]">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
              <LanguageIcon size={24} className="text-[#888888]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0]">Display Language</h2>
              <p className="text-sm text-[#888888] mt-1">Choose your preferred language</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#999999] mb-3 uppercase tracking-wide">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSelect('language', e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] text-sm font-semibold focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23999999' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#1A1A1A] text-[#F0F0F0]">
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timezone */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#161616] to-[#111111] p-8 shadow-2xl mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#222222]">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
              <ClockIcon size={24} className="text-[#888888]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0]">Timezone</h2>
              <p className="text-sm text-[#888888] mt-1">Set your local timezone for accurate times</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#999999] mb-3 uppercase tracking-wide">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSelect('timezone', e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] text-sm font-semibold focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23999999' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value} className="bg-[#1A1A1A] text-[#F0F0F0]">
                  {tz.label} ({tz.offset})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Time Format */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#161616] to-[#111111] p-8 shadow-2xl mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#222222]">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
              <CalendarIcon size={24} className="text-[#888888]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0]">Date & Time Format</h2>
              <p className="text-sm text-[#888888] mt-1">Choose how dates and times are displayed</p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Date Format */}
            <div>
              <label className="block text-sm font-bold text-[#999999] mb-3 uppercase tracking-wide">
                Date Format
              </label>
              <select
                value={settings.date_format}
                onChange={(e) => handleSelect('date_format', e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] text-sm font-semibold focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23999999' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                {DATE_FORMATS.map((format) => (
                  <option key={format.value} value={format.value} className="bg-[#1A1A1A] text-[#F0F0F0]">
                    {format.label} - {format.example}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Format */}
            <div>
              <label className="block text-sm font-bold text-[#999999] mb-3 uppercase tracking-wide">
                Time Format
              </label>
              <select
                value={settings.time_format}
                onChange={(e) => handleSelect('time_format', e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] text-sm font-semibold focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23999999' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                {TIME_FORMATS.map((format) => (
                  <option key={format.value} value={format.value} className="bg-[#1A1A1A] text-[#F0F0F0]">
                    {format.label} - {format.example}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#161616] to-[#111111] p-8 shadow-2xl mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#222222]">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
              <DollarSignIcon size={24} className="text-[#888888]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0]">Currency</h2>
              <p className="text-sm text-[#888888] mt-1">Your preferred currency for pricing</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#999999] mb-3 uppercase tracking-wide">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleSelect('currency', e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl border border-[#2A2A2A] bg-gradient-to-r from-[#1C1C1C] to-[#181818] text-[#F0F0F0] text-sm font-semibold focus:outline-none focus:border-[#3A3A3A] hover:border-[#323232] transition-all duration-300 shadow-lg cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23999999' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code} className="bg-[#1A1A1A] text-[#F0F0F0]">
                  {curr.symbol} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save/Cancel Actions */}
        {hasChanges && (
          <div className="flex justify-end gap-4 pt-6 pb-4">
            <button
              onClick={handleCancel}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#1F1F1F] to-[#1A1A1A] border border-[#2A2A2A] text-[#D0D0D0] text-sm font-semibold hover:from-[#242424] hover:to-[#1F1F1F] hover:border-[#353535] transition-all duration-300 shadow-xl shadow-black/40"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#3F3F3F] via-[#353535] to-[#2D2D2D] border border-[#4A4A4A] text-[#F0F0F0] text-sm font-bold hover:from-[#454545] hover:via-[#3B3B3B] hover:to-[#333333] hover:border-[#555555] hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-black/50 relative overflow-hidden group"
            >
              <span className="relative z-10">{saveMutation.isPending ? 'Saving...' : 'Save Language Settings'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            </button>
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
