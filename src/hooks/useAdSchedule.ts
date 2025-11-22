'use client';

/**
 * =============================================================================
 * Ad Schedule Hook - Manages ad breaks during video playback
 * =============================================================================
 * Features:
 * - Fetches ad schedule from API
 * - Tracks which ads have been shown
 * - Determines when to show ads based on current playback position
 * - Integrates with subscription context for premium users
 */

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSubscription } from '@/contexts/SubscriptionContext';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AdBreak {
  type: 'pre_roll' | 'mid_roll' | 'post_roll';
  position_seconds: number;
  skippable_after: number;
}

export interface AdConfig {
  show_ads: boolean;
  placement?: string;
  provider?: string;
  ad_unit_id?: string;
  duration_seconds?: number;
  skip_after_seconds?: number;
  custom_video_url?: string;
  custom_click_url?: string;
}

export interface AdSchedule {
  ad_breaks: AdBreak[];
  is_premium: boolean;
  upgrade_prompt: boolean;
}

interface UseAdScheduleOptions {
  titleId: string;
  durationSeconds: number;
  enabled?: boolean;
}

interface UseAdScheduleReturn {
  adSchedule: AdSchedule | null;
  currentAdBreak: AdBreak | null;
  adConfig: AdConfig | null;
  shownAdBreaks: Set<number>;
  isLoading: boolean;
  error: Error | null;
  shouldShowAd: (currentTime: number) => AdBreak | null;
  markAdAsShown: (adBreak: AdBreak) => void;
  resetAds: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────

export function useAdSchedule({
  titleId,
  durationSeconds,
  enabled = true,
}: UseAdScheduleOptions): UseAdScheduleReturn {
  const { isPremium } = useSubscription();
  const [shownAdBreaks, setShownAdBreaks] = React.useState<Set<number>>(new Set());
  const [currentAdBreak, setCurrentAdBreak] = React.useState<AdBreak | null>(null);

  // Fetch ad schedule
  const {
    data: adSchedule,
    isLoading: scheduleLoading,
    error: scheduleError,
  } = useQuery({
    queryKey: ['ad-schedule', titleId, durationSeconds],
    queryFn: async (): Promise<AdSchedule> => {
      const response = await fetch(
        `/api/v1/ads/schedule/${titleId}?duration_seconds=${Math.floor(durationSeconds)}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ad schedule');
      }

      return response.json();
    },
    enabled: enabled && !isPremium && !!titleId && durationSeconds > 0,
    staleTime: 300000, // Cache for 5 minutes
  });

  // Fetch ad config for current placement
  const {
    data: adConfig,
    isLoading: configLoading,
    error: configError,
  } = useQuery({
    queryKey: ['ad-config', currentAdBreak?.type],
    queryFn: async (): Promise<AdConfig> => {
      const response = await fetch(
        `/api/v1/ads/config?placement=${currentAdBreak?.type}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ad config');
      }

      return response.json();
    },
    enabled: !!currentAdBreak && !isPremium,
    staleTime: 60000,
  });

  // Check if we should show an ad at current position
  const shouldShowAd = React.useCallback(
    (currentTime: number): AdBreak | null => {
      if (isPremium || !adSchedule?.ad_breaks) {
        return null;
      }

      for (const adBreak of adSchedule.ad_breaks) {
        // Check if this ad break should trigger (within 1 second of the position)
        const shouldTrigger =
          Math.abs(currentTime - adBreak.position_seconds) < 1 &&
          !shownAdBreaks.has(adBreak.position_seconds);

        if (shouldTrigger) {
          return adBreak;
        }
      }

      return null;
    },
    [isPremium, adSchedule, shownAdBreaks]
  );

  // Mark an ad break as shown
  const markAdAsShown = React.useCallback((adBreak: AdBreak) => {
    setShownAdBreaks((prev) => new Set([...prev, adBreak.position_seconds]));
    setCurrentAdBreak(null);
  }, []);

  // Reset all shown ads (for replay)
  const resetAds = React.useCallback(() => {
    setShownAdBreaks(new Set());
    setCurrentAdBreak(null);
  }, []);

  // Set current ad break when one is detected
  const handleAdBreakDetected = React.useCallback((adBreak: AdBreak | null) => {
    if (adBreak && !currentAdBreak) {
      setCurrentAdBreak(adBreak);
    }
  }, [currentAdBreak]);

  return {
    adSchedule: isPremium ? { ad_breaks: [], is_premium: true, upgrade_prompt: false } : adSchedule ?? null,
    currentAdBreak,
    adConfig: adConfig ?? null,
    shownAdBreaks,
    isLoading: scheduleLoading || configLoading,
    error: (scheduleError || configError) as Error | null,
    shouldShowAd,
    markAdAsShown,
    resetAds,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ad Break Detector Component
// ─────────────────────────────────────────────────────────────────────────────

interface AdBreakDetectorProps {
  currentTime: number;
  titleId: string;
  duration: number;
  onAdBreak: (adBreak: AdBreak) => void;
}

export function useAdBreakDetector({
  currentTime,
  titleId,
  duration,
  onAdBreak,
}: AdBreakDetectorProps) {
  const { shouldShowAd } = useAdSchedule({
    titleId,
    durationSeconds: duration,
  });

  React.useEffect(() => {
    const adBreak = shouldShowAd(currentTime);
    if (adBreak) {
      onAdBreak(adBreak);
    }
  }, [currentTime, shouldShowAd, onAdBreak]);
}
