'use client';

/**
 * Privacy Settings Page
 * Professional eye-comfortable dark design for privacy controls
 * - Activity visibility controls
 * - Profile privacy settings
 * - Data sharing preferences
 * - Watch history privacy
 * - Real-time updates with backend
 */

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { type PrivacySettings } from '@/lib/api/services/settings';

// ══════════════════════════════════════════════════════════════════════════════
// Custom SVG Icons
// ══════════════════════════════════════════════════════════════════════════════

const ShieldIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const InfoIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const EyeIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SettingsIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m0-18l-2 2m2-2l2 2m-2 16l-2-2m2 2l2-2m5-9h6m-6 0l2-2m-2 2l2 2m-16 0H1m6 0l-2-2m2 2l-2 2" />
  </svg>
);

const LockIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const DownloadIcon = ({ className = '', size = 18 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const TrashIcon = ({ className = '', size = 18 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// Toggle Component
// ══════════════════════════════════════════════════════════════════════════════

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}

const Toggle = ({ checked, onChange, label, description }: ToggleProps) => (
  <div className="flex items-start justify-between py-6 px-3 -mx-3 border-b border-[#222222] last:border-b-0 hover:bg-[#131313]/50 transition-all duration-300 rounded-xl group">
    <div className="flex-1 pr-8">
      <h3 className="text-base font-bold text-[#F0F0F0] mb-2 group-hover:text-[#FFFFFF] transition-colors duration-200">{label}</h3>
      <p className="text-xs text-[#999999] leading-relaxed max-w-xl group-hover:text-[#AAAAAA] transition-colors duration-200">{description}</p>
    </div>
    <button
      onClick={onChange}
      className={`
        relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 flex-shrink-0 shadow-lg
        ${checked
          ? 'bg-gradient-to-r from-[#4F4F4F] via-[#454545] to-[#3C3C3C] shadow-black/30'
          : 'bg-gradient-to-r from-[#222222] to-[#1C1C1C] shadow-black/20'
        }
        border ${checked ? 'border-[#5A5A5A]' : 'border-[#2A2A2A]'}
        hover:border-[#505050] hover:shadow-xl hover:shadow-black/40
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full transition-all duration-300 shadow-lg
          ${checked
            ? 'translate-x-6 bg-gradient-to-br from-[#FAFAFA] to-[#E5E5E5] shadow-black/30'
            : 'translate-x-1 bg-gradient-to-br from-[#7A7A7A] to-[#606060] shadow-black/20'
          }
        `}
      />
    </button>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function PrivacySettingsPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = React.useState(false);

  // Fetch privacy settings from backend (using mock data for now)
  const { data: privacyData, isLoading } = useQuery({
    queryKey: ['privacy-settings'],
    queryFn: async () => {
      // Mock data until backend endpoint is implemented
      return {
        user_id: 'mock-user',
        show_watch_history: true,
        share_watching_activity: false,
        personalized_recommendations: true,
        allow_analytics: true,
        adult_content: false,
      };
    },
  });

  const [settings, setSettings] = React.useState<PrivacySettings | null>(null);

  // Update local state when data loads
  React.useEffect(() => {
    if (privacyData) {
      setSettings(privacyData);
    }
  }, [privacyData]);

  // Save mutation (mock for now)
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<PrivacySettings>) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...privacyData, ...updates } as PrivacySettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] });
      toast.success('Privacy settings saved successfully');
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

  const handleCancel = () => {
    if (privacyData) {
      setSettings(privacyData);
      setHasChanges(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5]">
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
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#0A0A0A] to-[#050505] text-[#E5E5E5] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-6 mb-10">
          <div className="rounded-2xl bg-gradient-to-br from-[#252525] via-[#1C1C1C] to-[#161616] p-5 border border-[#2F2F2F] shadow-2xl shadow-black/60 backdrop-blur-sm">
            <ShieldIcon className="text-[#999999]" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#F0F0F0] mb-2 tracking-tight bg-gradient-to-r from-[#F5F5F5] to-[#D0D0D0] bg-clip-text text-transparent">Privacy Settings</h1>
            <p className="text-sm text-[#999999] leading-relaxed max-w-2xl">
              Take control of your personal information and decide what you share with others
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 mb-8 shadow-2xl shadow-black/60 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2A2A2A]/20 to-transparent rounded-full blur-3xl -z-10"></div>
          <div className="flex items-start gap-5">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3.5 border border-[#2F2F2F] shadow-lg">
              <InfoIcon className="text-[#888888]" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F0F0F0] mb-2.5 tracking-tight">Your Privacy Matters</h3>
              <p className="text-sm text-[#999999] leading-relaxed max-w-3xl">
                We respect your privacy and give you full control over your data. These
                settings let you decide what information you share and who can see it.
              </p>
            </div>
          </div>
        </div>

        {/* Activity Privacy */}
        <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 mb-7 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1A1A1A]/10 to-transparent rounded-full blur-3xl -z-10"></div>
          <div className="flex items-center gap-4 mb-7">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
              <EyeIcon className="text-[#888888]" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0] tracking-tight">Activity Privacy</h2>
              <p className="text-sm text-[#888888] mt-1">
                Control what others can see about your viewing activity
              </p>
            </div>
          </div>
          <div>
            <Toggle
              checked={Boolean(settings.show_watch_history)}
              onChange={() => handleToggle('show_watch_history')}
              label="Show Watch History"
              description="Display your recently watched content on your profile"
            />
            <Toggle
              checked={Boolean(settings.share_watching_activity)}
              onChange={() => handleToggle('share_watching_activity')}
              label="Share Watching Activity"
              description="Let others see what you're currently watching"
            />
            <Toggle
              checked={Boolean(settings.personalized_recommendations)}
              onChange={() => handleToggle('personalized_recommendations')}
              label="Personalized Recommendations"
              description="Use your watch history to suggest content"
            />
            <Toggle
              checked={Boolean(settings.allow_analytics)}
              onChange={() => handleToggle('allow_analytics')}
              label="Analytics & Performance"
              description="Help us improve by sharing anonymous usage data"
            />
          </div>
        </div>

        {/* Content Preferences */}
        <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 mb-7 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#1F1F1F]/10 to-transparent rounded-full blur-3xl -z-10"></div>
          <div className="flex items-center gap-4 mb-7">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
              <SettingsIcon className="text-[#888888]" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0] tracking-tight">Content Preferences</h2>
              <p className="text-sm text-[#888888] mt-1">
                Manage content visibility and filters
              </p>
            </div>
          </div>
          <div>
            <Toggle
              checked={Boolean(settings.adult_content)}
              onChange={() => handleToggle('adult_content')}
              label="Show Adult Content"
              description="Include mature-rated content in search and recommendations"
            />
          </div>
        </div>

        {/* Data Management */}
        <div className="relative rounded-2xl border border-[#252525] bg-gradient-to-br from-[#161616] via-[#131313] to-[#0F0F0F] p-7 mb-8 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-[#1C1C1C]/10 to-transparent rounded-full blur-3xl -z-10"></div>
          <div className="flex items-center gap-4 mb-7">
            <div className="rounded-xl bg-gradient-to-br from-[#222222] to-[#181818] p-3 border border-[#2F2F2F] shadow-lg">
              <LockIcon className="text-[#888888]" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0] tracking-tight">Data Management</h2>
              <p className="text-sm text-[#888888] mt-1">
                Control your personal data
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {/* Download Your Data */}
            <div className="flex items-start justify-between py-6 px-2 border-b border-[#222222] hover:bg-[#131313]/50 transition-all duration-300 rounded-xl -mx-2">
              <div className="flex items-start gap-4 flex-1">
                <div className="rounded-xl bg-gradient-to-br from-[#1F1F1F] to-[#181818] p-3 border border-[#2A2A2A] shadow-md">
                  <DownloadIcon className="text-[#888888]" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F0F0F0] mb-2">
                    Download Your Data
                  </h3>
                  <p className="text-xs text-[#999999] leading-relaxed max-w-md">
                    Get a copy of all your personal data in a portable format
                  </p>
                </div>
              </div>
              <button
                onClick={() => toast.info('Coming soon')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#222222] to-[#1A1A1A] border border-[#2F2F2F] text-[#D0D0D0] text-sm font-semibold hover:from-[#252525] hover:to-[#1F1F1F] hover:border-[#3A3A3A] transition-all duration-300 shadow-lg flex-shrink-0"
              >
                Request
              </button>
            </div>

            {/* Delete All Data */}
            <div className="flex items-start justify-between py-6 px-2 hover:bg-[#131313]/50 transition-all duration-300 rounded-xl -mx-2">
              <div className="flex items-start gap-4 flex-1">
                <div className="rounded-xl bg-gradient-to-br from-[#1F1F1F] to-[#181818] p-3 border border-[#2A2A2A] shadow-md">
                  <TrashIcon className="text-[#DD4444]" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F0F0F0] mb-2">
                    Delete All Data
                  </h3>
                  <p className="text-xs text-[#999999] leading-relaxed max-w-md">
                    Permanently erase all your data. This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() => toast.info('Coming soon')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1F1F1F] to-[#1A1A1A] border border-[#DD4444]/50 text-[#DD4444] text-sm font-semibold hover:from-[#DD4444]/15 hover:to-[#DD4444]/10 hover:border-[#DD4444]/70 transition-all duration-300 shadow-lg flex-shrink-0"
              >
                Delete
              </button>
            </div>
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
              <span className="relative z-10">{saveMutation.isPending ? 'Saving...' : 'Save Privacy Settings'}</span>
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
