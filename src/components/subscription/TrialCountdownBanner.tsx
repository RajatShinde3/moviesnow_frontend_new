'use client';

/**
 * =============================================================================
 * Trial Countdown Banner Component
 * =============================================================================
 * Displays a banner for users on trial showing:
 * - Days remaining in trial
 * - Countdown timer for last 24 hours
 * - Quick upgrade CTA
 */

import * as React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Crown, Clock, X, Sparkles } from 'lucide-react';

interface TrialCountdownBannerProps {
  onUpgrade?: () => void;
  dismissible?: boolean;
  className?: string;
}

export function TrialCountdownBanner({
  onUpgrade,
  dismissible = true,
  className = '',
}: TrialCountdownBannerProps) {
  const { status, expiresAt, isPremium, upgrade } = useSubscription();
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Check if dismissed in session storage
  React.useEffect(() => {
    const dismissed = sessionStorage.getItem('trial-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Calculate time remaining
  React.useEffect(() => {
    if (status !== 'trial' || !expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [status, expiresAt]);

  // Don't show if not on trial or dismissed
  if (status !== 'trial' || !isPremium || isDismissed || !timeLeft) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('trial-banner-dismissed', 'true');
  };

  const handleUpgrade = async () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      await upgrade();
    }
  };

  const isLastDay = timeLeft.days === 0;
  const isUrgent = timeLeft.days <= 1;

  // Format countdown display
  const formatCountdown = () => {
    if (timeLeft.days > 1) {
      return `${timeLeft.days} days left`;
    } else if (timeLeft.days === 1) {
      return `1 day, ${timeLeft.hours}h left`;
    } else {
      return `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
    }
  };

  return (
    <div
      className={`relative overflow-hidden ${
        isUrgent
          ? 'bg-gradient-to-r from-orange-600 to-red-600'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600'
      } ${className}`}
    >
      {/* Sparkle animation for urgent state */}
      {isUrgent && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-pulse absolute -left-10 top-0 h-full w-20 bg-white/10 rotate-12" />
        </div>
      )}

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              isUrgent ? 'bg-white/20' : 'bg-white/10'
            }`}
          >
            {isLastDay ? (
              <Clock className="h-4 w-4 text-white" />
            ) : (
              <Crown className="h-4 w-4 text-white" />
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm font-medium text-white">
              {isLastDay ? 'Trial ending today!' : 'Premium Trial'}
            </span>
            <span
              className={`text-sm ${
                isLastDay ? 'font-bold text-white' : 'text-white/80'
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatCountdown()}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUpgrade}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              isUrgent
                ? 'bg-white text-red-600 hover:bg-gray-100'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {isUrgent ? 'Upgrade Now' : 'Keep Premium'}
            </span>
            <span className="sm:hidden">Upgrade</span>
          </button>

          {dismissible && (
            <button
              onClick={handleDismiss}
              className="rounded-full p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrialCountdownBanner;
