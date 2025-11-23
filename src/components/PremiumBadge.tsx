'use client';

/**
 * =============================================================================
 * Premium Badge Component
 * =============================================================================
 * Displays a premium badge for subscribed users with various styles
 */

import * as React from 'react';
import { Crown, Sparkles, Star, Zap } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PremiumBadgeProps {
  variant?: 'default' | 'compact' | 'inline' | 'profile' | 'card';
  showIfFree?: boolean;
  onClick?: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PremiumBadge({
  variant = 'default',
  showIfFree = false,
  onClick,
  className = '',
}: PremiumBadgeProps) {
  const { isPremium, status, expiresAt } = useSubscription();

  // Calculate days remaining (must be before any early returns to comply with hooks rules)
  const daysRemaining = React.useMemo(() => {
    if (!expiresAt) return null;
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [expiresAt]);

  // Don't show badge for free users unless explicitly requested
  if (!isPremium && !showIfFree) {
    return null;
  }

  // Variant: Compact (for headers/nav)
  if (variant === 'compact') {
    if (!isPremium) {
      return (
        <button
          onClick={onClick}
          className={`flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-500 transition-all hover:from-yellow-600/30 hover:to-yellow-500/30 ${className}`}
        >
          <Crown className="h-3 w-3" />
          Upgrade
        </button>
      );
    }

    return (
      <div
        className={`flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-500 px-2 py-0.5 text-xs font-bold text-black ${className}`}
      >
        <Crown className="h-3 w-3" />
        PRO
      </div>
    );
  }

  // Variant: Inline (for text inline)
  if (variant === 'inline') {
    if (!isPremium) {
      return null;
    }

    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs font-medium text-yellow-500 ${className}`}
      >
        <Crown className="h-3 w-3" />
        Premium
      </span>
    );
  }

  // Variant: Profile (for profile pages)
  if (variant === 'profile') {
    if (!isPremium) {
      return (
        <button
          onClick={onClick}
          className={`flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-600/10 to-yellow-500/10 p-4 transition-all hover:from-yellow-600/20 hover:to-yellow-500/20 ${className}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
            <Crown className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-white">Upgrade to Premium</p>
            <p className="text-sm text-gray-400">
              Unlock ad-free viewing, 4K quality & more
            </p>
          </div>
          <div className="ml-auto rounded-full bg-yellow-500 px-4 py-1.5 text-sm font-bold text-black">
            Upgrade
          </div>
        </button>
      );
    }

    return (
      <div
        className={`flex items-center gap-4 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 p-4 ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/20">
          <Crown className="h-6 w-6 text-black" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-black">Premium Member</p>
            <Sparkles className="h-4 w-4 text-black/60" />
          </div>
          <p className="text-sm text-black/70">
            {status === 'cancelled'
              ? `Access until ${new Date(expiresAt!).toLocaleDateString()}`
              : daysRemaining !== null
              ? `Renews in ${daysRemaining} days`
              : 'Active subscription'}
          </p>
        </div>
        {status === 'cancelled' && (
          <button
            onClick={onClick}
            className="ml-auto rounded-full bg-black px-4 py-1.5 text-sm font-bold text-white hover:bg-black/80"
          >
            Resubscribe
          </button>
        )}
      </div>
    );
  }

  // Variant: Card (for subscription cards)
  if (variant === 'card') {
    if (!isPremium) {
      return (
        <div
          className={`overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 ${className}`}
        >
          <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-semibold text-white">Free Tier</p>
                <p className="text-sm text-gray-400">Basic access with ads</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                Watch with ads every 15 minutes
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                Download via external links
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                Up to 720p quality
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                1 device at a time
              </li>
            </ul>
            <button
              onClick={onClick}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 py-3 font-bold text-black transition-all hover:from-yellow-500 hover:to-yellow-400"
            >
              <Zap className="h-5 w-5" />
              Upgrade to Premium
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-yellow-600/10 to-transparent ${className}`}
      >
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-black" />
            <div>
              <p className="font-bold text-black">Premium</p>
              <p className="text-sm text-black/70">Full access unlocked</p>
            </div>
            <Star className="ml-auto h-6 w-6 text-black/60" />
          </div>
        </div>
        <div className="p-6">
          <ul className="space-y-2 text-sm text-white">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Ad-free viewing
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Direct in-app downloads
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              4K Ultra HD quality
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Watch on 4 devices
            </li>
          </ul>
          <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-800 p-4">
            <div>
              <p className="text-sm text-gray-400">
                {status === 'cancelled' ? 'Ends' : 'Renews'}
              </p>
              <p className="font-semibold text-white">
                {expiresAt
                  ? new Date(expiresAt).toLocaleDateString()
                  : 'Monthly'}
              </p>
            </div>
            <p className="text-2xl font-bold text-yellow-500">Premium</p>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  if (!isPremium) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 px-3 py-1.5 text-sm font-medium text-yellow-500 transition-all hover:from-yellow-600/30 hover:to-yellow-500/30 ${className}`}
      >
        <Crown className="h-4 w-4" />
        Upgrade to Premium
      </button>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 px-3 py-1.5 text-sm font-bold text-black ${className}`}
    >
      <Crown className="h-4 w-4" />
      Premium
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Premium Status Indicator (for use in profile/settings)
// ─────────────────────────────────────────────────────────────────────────────

export function PremiumStatusIndicator() {
  const { isPremium, status, expiresAt, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="h-6 w-24 animate-pulse rounded-full bg-gray-700" />
    );
  }

  if (!isPremium) {
    return (
      <span className="text-sm text-gray-400">Free Tier</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-sm font-medium text-yellow-500">
        <Crown className="h-4 w-4" />
        Premium
      </span>
      {status === 'cancelled' && (
        <span className="text-xs text-orange-400">
          (ends {new Date(expiresAt!).toLocaleDateString()})
        </span>
      )}
    </div>
  );
}
