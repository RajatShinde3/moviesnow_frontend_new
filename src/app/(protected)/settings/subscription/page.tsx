'use client';

/**
 * Subscription Settings Page
 * Professional eye-comfortable design for managing subscription
 * - View current plan and status
 * - Upgrade to premium
 * - Cancel or reactivate subscription
 * - Update payment method
 * - View billing history
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import {
  SettingsLayout,
  PageHeader,
  SettingCard,
  Button,
  SettingItem,
} from '@/components/settings';
import { Icon } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

// ══════════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════════

interface PaymentMethod {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

interface SubscriptionDetails {
  plan_name: string;
  plan_slug: string;
  price: number;
  currency: string;
  interval: string;
  payment_method: PaymentMethod | null;
  current_period_end?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export default function SubscriptionSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isPremium, status, expiresAt, isLoading, upgrade, cancel, reactivate } = useSubscription();

  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

  // Fetch subscription details
  const { data: subscriptionDetails } = useQuery<SubscriptionDetails>({
    queryKey: ['subscription-details'],
    queryFn: async () => {
      return await fetchJson<SubscriptionDetails>('/api/v1/subscriptions/details', {
        method: 'GET',
      });
    },
    enabled: isPremium,
  });

  // Update payment method mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async () => {
      return await fetchJson<{ portal_url?: string }>('/api/v1/subscriptions/update-payment-method', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      if (data?.portal_url) {
        window.location.href = data.portal_url;
      }
    },
    onError: () => {
      toast.error('Failed to open payment portal');
    },
  });

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
    return `${formatted}/${interval === 'yearly' ? 'year' : 'month'}`;
  };

  const handleUpgrade = async () => {
    try {
      await upgrade();
    } catch (err: any) {
      toast.error(err.message || 'Failed to start checkout');
    }
  };

  const handleCancel = async () => {
    try {
      await cancel();
      setShowCancelConfirm(false);
      toast.success('Subscription cancelled');
      queryClient.invalidateQueries({ queryKey: ['subscription-details'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel subscription');
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivate();
      toast.success('Subscription reactivated');
      queryClient.invalidateQueries({ queryKey: ['subscription-details'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to reactivate subscription');
    }
  };

  if (isLoading) {
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
        title="Subscription"
        description="Manage your subscription and billing settings"
        icon="crown"
      />

      {/* Current Plan Status */}
      <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6 mb-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[#242424] p-2.5 border border-[#3A3A3A]">
            <Icon
              name={isPremium ? 'crown' : 'alert'}
              className={isPremium ? 'text-[#F59E0B]' : 'text-[#B0B0B0]'}
              size={20}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-[#F0F0F0]">
                {isPremium ? subscriptionDetails?.plan_name || 'Premium' : 'Free Plan'}
              </h3>
              {status === 'active' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 text-xs font-medium text-[#10B981]">
                  <Icon name="check" size={12} />
                  Active
                </span>
              )}
              {status === 'cancelled' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 px-2 py-0.5 text-xs font-medium text-[#EF4444]">
                  <Icon name="x" size={12} />
                  Cancelled
                </span>
              )}
            </div>
            {isPremium && subscriptionDetails ? (
              <div className="space-y-1">
                <p className="text-sm text-[#B0B0B0]">
                  {formatPrice(subscriptionDetails.price, subscriptionDetails.currency, subscriptionDetails.interval)}
                </p>
                {subscriptionDetails.current_period_end && (
                  <p className="text-xs text-[#808080]">
                    {status === 'cancelled' ? 'Access until' : 'Renews on'}{' '}
                    {new Date(subscriptionDetails.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#B0B0B0]">
                Upgrade to Premium for ad-free streaming and direct downloads
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Premium Benefits */}
      {!isPremium && (
        <SettingCard
          title="Premium Benefits"
          description="Everything you get with Premium"
          icon="crown"
          className="mb-6"
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="check" className="text-[#10B981] mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-[#F0F0F0]">Ad-Free Streaming</p>
                <p className="text-xs text-[#808080]">Watch without interruptions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="check" className="text-[#10B981] mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-[#F0F0F0]">Direct Downloads</p>
                <p className="text-xs text-[#808080]">One-click downloads, no redirects</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="check" className="text-[#10B981] mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-[#F0F0F0]">All Quality Options</p>
                <p className="text-xs text-[#808080]">480p, 720p, and 1080p</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="check" className="text-[#10B981] mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-[#F0F0F0]">Priority Support</p>
                <p className="text-xs text-[#808080]">Get help faster</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#3A3A3A]">
            <Button variant="primary" onClick={handleUpgrade} className="w-full">
              <Icon name="crown" size={16} />
              Upgrade to Premium
            </Button>
          </div>
        </SettingCard>
      )}

      {/* Payment Method */}
      {isPremium && subscriptionDetails?.payment_method && (
        <SettingCard
          title="Payment Method"
          description="Manage your payment information"
          icon="credit-card"
          className="mb-6"
        >
          <SettingItem
            icon="credit-card"
            label={`${subscriptionDetails.payment_method.brand} •••• ${subscriptionDetails.payment_method.last4}`}
            description={`Expires ${subscriptionDetails.payment_method.exp_month}/${subscriptionDetails.payment_method.exp_year}`}
            action={
              <Button
                variant="ghost"
                onClick={() => updatePaymentMutation.mutate()}
                isLoading={updatePaymentMutation.isPending}
              >
                Update
              </Button>
            }
          />
        </SettingCard>
      )}

      {/* Billing History */}
      {isPremium && (
        <SettingCard
          title="Billing History"
          description="View your past invoices and payments"
          icon="invoice"
          className="mb-6"
        >
          <SettingItem
            icon="invoice"
            label="View Billing History"
            description="Download invoices and view payment history"
            action={
              <Link href="/settings/billing/history">
                <Button variant="ghost">View History</Button>
              </Link>
            }
          />
        </SettingCard>
      )}

      {/* Subscription Actions */}
      {isPremium && (
        <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6">
          <h3 className="text-sm font-semibold text-[#F0F0F0] mb-4">Subscription Actions</h3>
          <div className="space-y-3">
            {status === 'active' && (
              <Button
                variant="danger"
                onClick={() => setShowCancelConfirm(true)}
                className="w-full"
              >
                Cancel Subscription
              </Button>
            )}
            {status === 'cancelled' && (
              <Button
                variant="primary"
                onClick={handleReactivate}
                className="w-full"
              >
                Reactivate Subscription
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-[#0F0F0F]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6 max-w-md w-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="rounded-lg bg-[#EF4444]/10 p-2.5 border border-[#EF4444]/30">
                <Icon name="alert" className="text-[#EF4444]" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F0F0F0] mb-1">
                  Cancel Subscription?
                </h3>
                <p className="text-sm text-[#B0B0B0]">
                  You'll lose access to Premium features at the end of your billing period.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button
                variant="danger"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
