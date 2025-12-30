'use client';

/**
 * Downloads Settings Page
 * Professional eye-comfortable design for managing downloads
 * - Download history
 * - Storage statistics
 * - Quality preferences
 * - Clear history
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

interface DownloadItem {
  id: string;
  title: string;
  quality: '480p' | '720p' | '1080p';
  size: number; // MB
  downloaded_at: string;
}

interface DownloadSettings {
  auto_delete_watched: boolean;
  wifi_only: boolean;
  default_quality: '480p' | '720p' | '1080p';
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function DownloadsPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = React.useState(false);

  // Mock data
  const MOCK_DOWNLOADS: DownloadItem[] = [
    {
      id: '1',
      title: 'Inception',
      date: new Date().toISOString(),
      size: 2147483648, // 2GB
      quality: '1080p',
      status: 'completed',
    },
    {
      id: '2',
      title: 'The Matrix',
      date: new Date(Date.now() - 86400000).toISOString(),
      size: 1610612736, // 1.5GB
      quality: '720p',
      status: 'completed',
    },
  ];

  const MOCK_SETTINGS: DownloadSettings = {
    auto_delete_watched: false,
    wifi_only: true,
    default_quality: '1080p',
  };

  // Fetch download history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['download-history'],
    queryFn: async () => {
      try {
        const response = await fetchJson<{ downloads: DownloadItem[] }>('/api/v1/downloads/history', {
          method: 'GET',
        });
        // Check if response has error property (backend returned error object)
        if (response && 'error' in response && (response as any).error) {
          return { downloads: MOCK_DOWNLOADS };
        }
        return response;
      } catch (err: any) {
        if (err?.status === 404 || err?.code === 404 || err?.message?.includes('Not Found')) {
          return { downloads: MOCK_DOWNLOADS };
        }
        throw err;
      }
    },
  });

  // Fetch download settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['download-settings'],
    queryFn: async () => {
      try {
        const response = await fetchJson<{ settings: DownloadSettings }>('/api/v1/downloads/settings', {
          method: 'GET',
        });
        // Check if response has error property (backend returned error object)
        if (response && 'error' in response && (response as any).error) {
          return { settings: MOCK_SETTINGS };
        }
        return response;
      } catch (err: any) {
        if (err?.status === 404 || err?.code === 404 || err?.message?.includes('Not Found')) {
          return { settings: MOCK_SETTINGS };
        }
        throw err;
      }
    },
  });

  const [settings, setSettings] = React.useState<DownloadSettings | null>(null);

  React.useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings);
    } else if (!settingsLoading && !settingsData) {
      setSettings(MOCK_SETTINGS);
    }
  }, [settingsData, settingsLoading]);

  const downloads = historyData?.downloads ?? [];
  const totalSize = downloads.reduce((sum, item) => sum + item.size, 0);

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<DownloadSettings>) => {
      return await fetchJson('/api/v1/downloads/settings', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['download-settings'] });
      toast.success('Download settings saved');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to save download settings');
    },
  });

  // Clear history mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      return await fetchJson('/api/v1/downloads/history', {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['download-history'] });
      toast.success('Download history cleared');
    },
    onError: () => {
      toast.error('Failed to clear download history');
    },
  });

  const handleToggle = (field: keyof DownloadSettings) => {
    if (!settings) return;
    const newSettings = { ...settings, [field]: !settings[field] };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSelect = (field: keyof DownloadSettings, value: any) => {
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

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all download history?')) {
      clearMutation.mutate();
    }
  };

  const formatSize = (mb: number) => {
    if (mb >= 1000) return `${(mb / 1000).toFixed(2)} GB`;
    return `${mb} MB`;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (historyLoading || settingsLoading || !settings) {
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
        title="Downloads"
        description="Manage your download settings and history"
        icon="download"
      />

      {/* Storage Stats */}
      <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6 mb-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[#242424] p-2.5 border border-[#3A3A3A]">
            <Icon name="download" className="text-[#B0B0B0]" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#F0F0F0] mb-1">Download Statistics</h3>
            <div className="flex gap-6 mt-3">
              <div>
                <p className="text-xs text-[#808080]">Total Downloads</p>
                <p className="text-xl font-bold text-[#F0F0F0]">{downloads.length}</p>
              </div>
              <div>
                <p className="text-xs text-[#808080]">Total Size</p>
                <p className="text-xl font-bold text-[#F0F0F0]">{formatSize(totalSize)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Settings */}
      <SettingCard
        title="Download Preferences"
        description="Configure download behavior"
        icon="settings"
        className="mb-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
              Default Quality
            </label>
            <select
              value={settings.default_quality}
              onChange={(e) => handleSelect('default_quality', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] bg-[#242424] text-[#F0F0F0] focus:outline-none focus:border-[#E5E5E5] transition-colors"
            >
              <option value="480p">480p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>
          </div>

          <Toggle
            checked={settings.wifi_only}
            onChange={() => handleToggle('wifi_only')}
            label="Wi-Fi Only Downloads"
            description="Only download content when connected to Wi-Fi"
          />

          <Toggle
            checked={settings.auto_delete_watched}
            onChange={() => handleToggle('auto_delete_watched')}
            label="Auto-Delete Watched"
            description="Automatically remove downloads after watching"
          />
        </div>
      </SettingCard>

      {/* Download History */}
      {downloads.length > 0 ? (
        <SettingCard
          title="Download History"
          description={`${downloads.length} download${downloads.length !== 1 ? 's' : ''} in history`}
          icon="clock"
          className="mb-6"
        >
          <div className="space-y-3">
            {downloads.slice(0, 10).map((download) => (
              <div
                key={download.id}
                className="flex items-center justify-between p-4 rounded-lg border border-[#3A3A3A] bg-[#242424] hover:border-[#4A4A4A] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#F0F0F0] truncate">
                    {download.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#808080]">
                    <span>{download.quality}</span>
                    <span>•</span>
                    <span>{formatSize(download.size)}</span>
                    <span>•</span>
                    <span>{formatDate(download.downloaded_at)}</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-1 text-xs font-medium text-[#10B981]">
                  {download.quality}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#3A3A3A]">
            <Button
              variant="danger"
              onClick={handleClearHistory}
              isLoading={clearMutation.isPending}
            >
              Clear Download History
            </Button>
          </div>
        </SettingCard>
      ) : (
        <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-12 text-center mb-6">
          <Icon name="download" className="text-[#808080] mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">No Downloads Yet</h3>
          <p className="text-sm text-[#808080]">
            Your download history will appear here
          </p>
        </div>
      )}

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
            Save Download Settings
          </Button>
        </div>
      )}

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
