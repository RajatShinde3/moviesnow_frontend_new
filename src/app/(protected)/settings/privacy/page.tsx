'use client';

/**
 * Privacy Settings Page
 * ===========================
 * Professional eye-comfortable design with:
 * - Activity visibility controls
 * - Profile privacy settings
 * - Data sharing preferences
 * - Watch history privacy
 * - Real-time updates with backend
 * - Soft colors for reduced eye strain
 */

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { settingsService, type PrivacySettings } from '@/lib/api/services/settings';
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

  const handleCancel = () => {
    if (privacyData) {
      setSettings(privacyData);
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
        title="Privacy Settings"
        description="Control who can see your activity and information"
        icon="shield"
      />

      {/* Privacy Notice */}
      <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[#242424] p-2.5 border border-[#3A3A3A]">
            <Icon name="info" className="text-[#B0B0B0]" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F0F0F0] mb-1">Your Privacy Matters</h3>
            <p className="text-sm text-[#B0B0B0]">
              We respect your privacy and give you full control over your data. These
              settings let you decide what information you share and who can see it.
            </p>
          </div>
        </div>
      </div>

      {/* Activity Privacy */}
      <SettingCard
        title="Activity Privacy"
        description="Control what others can see about your viewing activity"
        icon="eye"
        className="mb-6"
      >
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
      </SettingCard>

      {/* Content Preferences */}
      <SettingCard
        title="Content Preferences"
        description="Manage content visibility and filters"
        icon="settings"
        className="mb-6"
      >
        <Toggle
          checked={Boolean(settings.adult_content)}
          onChange={() => handleToggle('adult_content')}
          label="Show Adult Content"
          description="Include mature-rated content in search and recommendations"
        />
      </SettingCard>

      {/* Data Management */}
      <SettingCard
        title="Data Management"
        description="Control your personal data"
        icon="lock"
        className="mb-6"
      >
        <SettingItem
          icon="download"
          label="Download Your Data"
          description="Get a copy of all your personal data"
          action={
            <Button variant="ghost" onClick={() => toast.info('Coming soon')}>
              Request
            </Button>
          }
        />

        <SettingItem
          icon="trash"
          label="Delete All Data"
          description="Permanently erase all your data"
          action={
            <Button variant="danger" onClick={() => toast.info('Coming soon')}>
              Delete
            </Button>
          }
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
            Save Privacy Settings
          </Button>
        </div>
      )}

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
