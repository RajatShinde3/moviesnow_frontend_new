'use client';

/**
 * =============================================================================
 * Subscription Context - App-wide Premium State Management
 * =============================================================================
 * Provides subscription status across the app with:
 * - React Query for efficient caching
 * - Optimistic updates for better UX
 * - Premium feature gating utilities
 */

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'free' | 'active' | 'cancelled' | 'expired' | 'trial';

export interface SubscriptionState {
  isPremium: boolean;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  expiresAt: string | null;
  cancelledAt: string | null;
  canUpgrade: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface SubscriptionContextValue extends SubscriptionState {
  refetch: () => Promise<void>;
  checkFeatureAccess: (feature: PremiumFeature) => boolean;
  getMaxQuality: () => VideoQuality;
  getMaxDevices: () => number;
  shouldShowAds: () => boolean;
  canDirectDownload: () => boolean;
  upgrade: () => void;
  cancel: () => Promise<void>;
  reactivate: () => Promise<void>;
}

export type PremiumFeature =
  | 'ad_free'
  | 'direct_download'
  | 'multi_device'
  | 'offline_viewing'
  | 'early_access';

export type VideoQuality = '480p' | '720p' | '1080p' | '4K';

// ─────────────────────────────────────────────────────────────────────────────
// Feature Configuration
// ─────────────────────────────────────────────────────────────────────────────

const PREMIUM_FEATURES: Record<PremiumFeature, { free: boolean; premium: boolean }> = {
  ad_free: { free: false, premium: true },
  direct_download: { free: false, premium: true },
  multi_device: { free: false, premium: true },
  offline_viewing: { free: false, premium: true },
  early_access: { free: false, premium: true },
};

const QUALITY_LIMITS: Record<SubscriptionTier, VideoQuality> = {
  free: '720p',
  premium: '1080p', // Max quality as per CLAUDE.md spec (no 4K)
};

const DEVICE_LIMITS: Record<SubscriptionTier, number> = {
  free: 1,
  premium: 4,
};

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const SubscriptionContext = React.createContext<SubscriptionContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch} = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_BASE}/subscriptions/status`, {
        credentials: 'include',
      });

      if (!response.ok) {
        // Return free tier for unauthenticated users
        return {
          is_premium: false,
          status: 'free' as SubscriptionStatus,
          expires_at: null,
          cancelled_at: null,
          can_upgrade: true,
        };
      }

      return response.json();
    },
    staleTime: 60000, // Cache for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const isPremium = data?.is_premium ?? false;
  const status = (data?.status ?? 'free') as SubscriptionStatus;
  const tier: SubscriptionTier = isPremium ? 'premium' : 'free';

  const value: SubscriptionContextValue = React.useMemo(() => ({
    isPremium,
    status,
    tier,
    expiresAt: data?.expires_at ?? null,
    cancelledAt: data?.cancelled_at ?? null,
    canUpgrade: data?.can_upgrade ?? true,
    isLoading,
    error: error as Error | null,

    refetch: async () => {
      await refetch();
    },

    checkFeatureAccess: (feature: PremiumFeature) => {
      const featureConfig = PREMIUM_FEATURES[feature];
      return tier === 'premium' ? featureConfig.premium : featureConfig.free;
    },

    getMaxQuality: () => QUALITY_LIMITS[tier],

    getMaxDevices: () => DEVICE_LIMITS[tier],

    shouldShowAds: () => !isPremium,

    canDirectDownload: () => isPremium,

    upgrade: () => {
      window.location.href = '/subscribe';
    },

    cancel: async () => {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_BASE}/subscriptions/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      await refetch();
    },

    reactivate: async () => {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_BASE}/subscriptions/reactivate`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }
      await refetch();
    },
  }), [isPremium, status, tier, data, isLoading, error, refetch]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSubscription(): SubscriptionContextValue {
  const context = React.useContext(SubscriptionContext);

  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }

  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOC for Premium-Only Components
// ─────────────────────────────────────────────────────────────────────────────

interface WithPremiumCheckProps {
  fallback?: React.ReactNode;
  feature?: PremiumFeature;
}

export function withPremiumCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPremiumCheckProps = {}
) {
  return function PremiumGuardedComponent(props: P) {
    const { isPremium, checkFeatureAccess } = useSubscription();

    const hasAccess = options.feature
      ? checkFeatureAccess(options.feature)
      : isPremium;

    if (!hasAccess) {
      return options.fallback ?? null;
    }

    return <WrappedComponent {...props} />;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Premium Gate Component
// ─────────────────────────────────────────────────────────────────────────────

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: PremiumFeature;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  onUpgradeClick?: () => void;
}

export function PremiumGate({
  children,
  feature,
  fallback,
  showUpgradePrompt = true,
  onUpgradeClick,
}: PremiumGateProps) {
  const { isPremium, checkFeatureAccess } = useSubscription();

  const hasAccess = feature ? checkFeatureAccess(feature) : isPremium;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-yellow-500/20 p-4">
          <svg
            className="h-8 w-8 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">Premium Feature</h3>
        <p className="mt-2 text-sm text-gray-400">
          Upgrade to Premium to unlock this feature
        </p>
        {onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="mt-4 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 px-6 py-2 font-semibold text-black transition-all hover:from-yellow-500 hover:to-yellow-400"
          >
            Upgrade Now
          </button>
        )}
      </div>
    );
  }

  return null;
}
