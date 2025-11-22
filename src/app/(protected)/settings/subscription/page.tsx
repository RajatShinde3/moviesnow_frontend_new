'use client';

/**
 * =============================================================================
 * Subscription Settings Page
 * =============================================================================
 * Allows users to view and manage their subscription:
 * - View current plan status
 * - Upgrade to premium
 * - Cancel/reactivate subscription
 * - View billing history
 */

import * as React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PremiumBadge } from '@/components/PremiumBadge';
import { BillingHistory } from '@/components/subscription/BillingHistory';
import { Crown, CreditCard, Calendar, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionSettingsPage() {
  const router = useRouter();
  const {
    isPremium,
    status,
    expiresAt,
    isLoading,
    upgrade,
    cancel,
    reactivate,
  } = useSubscription();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await upgrade();
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await cancel();
      setShowCancelConfirm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await reactivate();
    } catch (err: any) {
      setError(err.message || 'Failed to reactivate subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        <p className="mt-1 text-gray-400">
          Manage your subscription and billing
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isPremium
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-500'
                  : 'bg-gray-700'
              }`}
            >
              <Crown
                className={`h-6 w-6 ${isPremium ? 'text-black' : 'text-gray-400'}`}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isPremium ? 'Premium' : 'Free'} Plan
              </h2>
              <p className="text-sm text-gray-400">
                {isPremium
                  ? status === 'cancelled'
                    ? 'Cancelled - Access until period ends'
                    : 'Full access to all features'
                  : 'Basic access with ads'}
              </p>
            </div>
          </div>

          {isPremium && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                status === 'cancelled'
                  ? 'bg-orange-500/20 text-orange-400'
                  : status === 'trial'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-green-500/20 text-green-400'
              }`}
            >
              {status === 'cancelled'
                ? 'Cancelled'
                : status === 'trial'
                ? 'Trial'
                : 'Active'}
            </span>
          )}
        </div>

        {/* Expiration Info */}
        {isPremium && expiresAt && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>
              {status === 'cancelled' ? 'Access ends' : 'Renews'} on{' '}
              {new Date(expiresAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {isPremium ? (
            <>
              <FeatureItem enabled>Ad-free viewing</FeatureItem>
              <FeatureItem enabled>Direct downloads</FeatureItem>
              <FeatureItem enabled>4K Ultra HD quality</FeatureItem>
              <FeatureItem enabled>Watch on 4 devices</FeatureItem>
              <FeatureItem enabled>Offline viewing</FeatureItem>
              <FeatureItem enabled>Early access</FeatureItem>
            </>
          ) : (
            <>
              <FeatureItem enabled={false}>Ad-free viewing</FeatureItem>
              <FeatureItem enabled={false}>Direct downloads</FeatureItem>
              <FeatureItem enabled={false}>4K quality</FeatureItem>
              <FeatureItem enabled>720p quality</FeatureItem>
              <FeatureItem enabled>1 device</FeatureItem>
              <FeatureItem enabled>Watch with ads</FeatureItem>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {!isPremium && (
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 px-6 py-2.5 font-semibold text-black transition-all hover:from-yellow-500 hover:to-yellow-400 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
              Upgrade to Premium
            </button>
          )}

          {isPremium && status !== 'cancelled' && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={isProcessing}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 transition-all hover:border-gray-500 hover:text-white disabled:opacity-50"
            >
              Cancel Subscription
            </button>
          )}

          {isPremium && status === 'cancelled' && (
            <button
              onClick={handleReactivate}
              disabled={isProcessing}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-all hover:bg-green-500 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Reactivate Subscription
            </button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white">
              Cancel Subscription?
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              You'll keep premium access until{' '}
              {expiresAt
                ? new Date(expiresAt).toLocaleDateString()
                : 'the end of your billing period'}
              . After that, you'll be downgraded to the free plan.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-lg border border-gray-600 py-2 text-gray-300 hover:border-gray-500 hover:text-white"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2 font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Section (Premium only) */}
      {isPremium && (
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <CreditCard className="h-5 w-5" />
            Billing
          </h2>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Plan</span>
              <span className="text-white">Premium Monthly</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price</span>
              <span className="text-white">$9.99/month</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Payment Method</span>
              <span className="text-white">•••• 4242</span>
            </div>
          </div>

          <button className="mt-4 text-sm text-yellow-500 hover:text-yellow-400">
            Manage payment method
          </button>
        </div>
      )}

      {/* Billing History (Premium only) */}
      {isPremium && <BillingHistory className="mt-6" />}

      {/* Upgrade CTA (Free users) */}
      {!isPremium && (
        <div className="rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-600/10 to-yellow-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">
                Upgrade to Premium
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Get ad-free viewing, 4K quality, direct downloads, and more for
                just $9.99/month. Try free for 7 days!
              </p>
              <button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="mt-4 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-50"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureItem({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {enabled ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-gray-500" />
      )}
      <span className={enabled ? 'text-gray-300' : 'text-gray-500'}>
        {children}
      </span>
    </div>
  );
}
