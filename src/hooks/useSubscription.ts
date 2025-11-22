'use client';

/**
 * =============================================================================
 * useSubscription Hook - Re-exports from SubscriptionContext
 * =============================================================================
 * This file re-exports the useSubscription hook from SubscriptionContext
 * for backward compatibility. New code should import directly from Context.
 *
 * @deprecated Import from '@/contexts/SubscriptionContext' instead
 */

export { useSubscription } from '@/contexts/SubscriptionContext';
export type {
  SubscriptionContextValue,
  SubscriptionState,
  SubscriptionTier,
  PremiumFeature,
  VideoQuality,
} from '@/contexts/SubscriptionContext';

// Re-export SubscriptionStatus type for backward compatibility
export type { SubscriptionStatus } from '@/contexts/SubscriptionContext';
