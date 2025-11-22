'use client';

/**
 * =============================================================================
 * Download Button - Premium-aware download functionality
 * =============================================================================
 * Features:
 * - Direct download for premium users
 * - Redirect flow with timer for free users
 * - Quality selection based on subscription tier
 * - Loading states and error handling
 * - Premium upgrade prompts
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  Download,
  Loader2,
  Crown,
  ChevronDown,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PremiumUpgradeModal } from '@/components/subscription/PremiumUpgradeModal';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DownloadButtonProps {
  titleId: string;
  episodeId?: string;
  titleName: string;
  className?: string;
  variant?: 'default' | 'compact' | 'icon';
}

interface DownloadResponse {
  type: 'direct' | 'redirect';
  download_url?: string;
  redirect_page_url?: string;
  quality: string;
  expires_in?: number;
  timer_seconds?: number;
  show_ads?: boolean;
  ad_count?: number;
}

type DownloadQuality = '480p' | '720p' | '1080p' | '4k';

const QUALITY_OPTIONS: { value: DownloadQuality; label: string; premium: boolean }[] = [
  { value: '480p', label: '480p (SD)', premium: false },
  { value: '720p', label: '720p (HD)', premium: false },
  { value: '1080p', label: '1080p (Full HD)', premium: true },
  { value: '4k', label: '4K (Ultra HD)', premium: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DownloadButton({
  titleId,
  episodeId,
  titleName,
  className = '',
  variant = 'default',
}: DownloadButtonProps) {
  const router = useRouter();
  const { isPremium, getMaxQuality, canDirectDownload } = useSubscription();

  const [selectedQuality, setSelectedQuality] = React.useState<DownloadQuality>('720p');
  const [showQualityMenu, setShowQualityMenu] = React.useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Filter available qualities based on subscription
  const availableQualities = React.useMemo(() => {
    const maxQuality = getMaxQuality();
    const qualityOrder: DownloadQuality[] = ['480p', '720p', '1080p', '4k'];
    const maxIndex = qualityOrder.indexOf(maxQuality as DownloadQuality);

    return QUALITY_OPTIONS.map((opt) => ({
      ...opt,
      available: qualityOrder.indexOf(opt.value) <= maxIndex,
    }));
  }, [getMaxQuality]);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowQualityMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async (quality: DownloadQuality): Promise<DownloadResponse> => {
      const params = new URLSearchParams({
        quality,
        ...(episodeId && { episode_id: episodeId }),
      });

      const response = await fetch(
        `/api/v1/downloads/request/${titleId}?${params}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to request download');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.type === 'direct') {
        // Premium user - initiate direct download
        window.location.href = data.download_url!;
      } else {
        // Free user - redirect to timer page
        router.push(data.redirect_page_url!);
      }
    },
  });

  const handleDownload = () => {
    downloadMutation.mutate(selectedQuality);
  };

  const handleQualitySelect = (quality: DownloadQuality, available: boolean) => {
    if (!available) {
      setShowUpgradeModal(true);
      setShowQualityMenu(false);
      return;
    }
    setSelectedQuality(quality);
    setShowQualityMenu(false);
  };

  // Render based on variant
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleDownload}
          disabled={downloadMutation.isPending}
          className={`rounded-full p-2 transition-colors hover:bg-white/10 disabled:opacity-50 ${className}`}
          title={`Download ${titleName}`}
        >
          {downloadMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
        </button>

        <PremiumUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          trigger="download"
        />
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <div className={`relative inline-flex ${className}`} ref={menuRef}>
          <button
            onClick={handleDownload}
            disabled={downloadMutation.isPending}
            className="flex items-center gap-2 rounded-l-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
          >
            {downloadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download
          </button>
          <button
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="flex items-center rounded-r-lg border-l border-gray-600 bg-gray-700 px-2 py-2 text-white transition-colors hover:bg-gray-600"
          >
            <span className="text-xs text-gray-300">{selectedQuality}</span>
            <ChevronDown className="ml-1 h-3 w-3" />
          </button>

          {/* Quality Menu */}
          {showQualityMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
              {availableQualities.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleQualitySelect(opt.value, opt.available)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                    opt.available
                      ? 'text-white hover:bg-gray-700'
                      : 'text-gray-500'
                  }`}
                >
                  <span>{opt.label}</span>
                  {!opt.available && <Crown className="h-4 w-4 text-yellow-500" />}
                  {selectedQuality === opt.value && opt.available && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <PremiumUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          trigger="download"
        />
      </>
    );
  }

  // Default variant
  return (
    <>
      <div className={`relative ${className}`} ref={menuRef}>
        {/* Main Download Card */}
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-white">Download</span>
            </div>
            {!isPremium && (
              <span className="flex items-center gap-1 text-xs text-yellow-500">
                <Crown className="h-3 w-3" />
                Premium = Instant
              </span>
            )}
          </div>

          {/* Quality Selection */}
          <div className="p-4">
            <p className="mb-3 text-sm text-gray-400">Select Quality</p>
            <div className="grid grid-cols-2 gap-2">
              {availableQualities.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleQualitySelect(opt.value, opt.available)}
                  className={`relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all ${
                    selectedQuality === opt.value && opt.available
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : opt.available
                      ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                      : 'border-gray-700 text-gray-500'
                  }`}
                >
                  <span>{opt.label}</span>
                  {!opt.available && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  {selectedQuality === opt.value && opt.available && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Download Button */}
          <div className="border-t border-gray-700 p-4">
            <button
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {downloadMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Preparing...
                </>
              ) : canDirectDownload() ? (
                <>
                  <Download className="h-5 w-5" />
                  Download Now
                </>
              ) : (
                <>
                  <ExternalLink className="h-5 w-5" />
                  Get Download Link
                </>
              )}
            </button>

            {!canDirectDownload() && (
              <p className="mt-2 text-center text-xs text-gray-500">
                Free users: 15 second wait with ads
              </p>
            )}
          </div>

          {/* Premium Upsell */}
          {!isPremium && (
            <div className="border-t border-gray-700 bg-gradient-to-r from-yellow-600/10 to-yellow-500/10 p-4">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-yellow-500/10"
              >
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      Skip the wait
                    </p>
                    <p className="text-xs text-gray-400">
                      Get instant downloads with Premium
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-black">
                  Upgrade
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="download"
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline Download Button (for lists/cards)
// ─────────────────────────────────────────────────────────────────────────────

interface InlineDownloadButtonProps {
  titleId: string;
  episodeId?: string;
  className?: string;
}

export function InlineDownloadButton({
  titleId,
  episodeId,
  className = '',
}: InlineDownloadButtonProps) {
  const router = useRouter();
  const { canDirectDownload } = useSubscription();

  const downloadMutation = useMutation({
    mutationFn: async (): Promise<DownloadResponse> => {
      const params = new URLSearchParams({
        quality: '720p',
        ...(episodeId && { episode_id: episodeId }),
      });

      const response = await fetch(
        `/api/v1/downloads/request/${titleId}?${params}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to request download');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.type === 'direct') {
        window.location.href = data.download_url!;
      } else {
        router.push(data.redirect_page_url!);
      }
    },
  });

  return (
    <button
      onClick={() => downloadMutation.mutate()}
      disabled={downloadMutation.isPending}
      className={`group flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-sm transition-all hover:bg-white/20 disabled:opacity-50 ${className}`}
      title={canDirectDownload() ? 'Download' : 'Get download link'}
    >
      {downloadMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="hidden group-hover:inline">
        {canDirectDownload() ? 'Download' : 'Get Link'}
      </span>
    </button>
  );
}
