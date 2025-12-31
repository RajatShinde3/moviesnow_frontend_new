'use client';

/**
 * Subscription Settings Page - ENHANCED ENTERPRISE GRADE
 * Premium design for managing subscription
 * Professional cards, animations, and visual hierarchy
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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

  // Calculate subscription statistics
  const subscriptionDays = React.useMemo(() => {
    if (!subscriptionDetails?.current_period_end) return 0;
    const endDate = new Date(subscriptionDetails.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [subscriptionDetails?.current_period_end]);

  return (
    <SettingsLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <PageHeader
          title="Subscription"
          description="Manage your subscription and billing settings"
          icon="crown"
        />
      </motion.div>

      {/* Statistics Overview - Premium Users Only */}
      {isPremium && subscriptionDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6"
        >
          {/* Days Remaining */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-5 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#10B981]/20 to-transparent" />

            <div className="relative flex items-start justify-between mb-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/10 p-2 border border-[#10B981]/30"
              >
                <Icon name="calendar" className="text-[#10B981]" size={18} />
              </motion.div>
            </div>

            <div className="relative">
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] bg-clip-text text-transparent mb-1"
              >
                {subscriptionDays}
              </motion.p>
              <p className="text-xs font-medium text-[#808080] uppercase tracking-wider">
                Days Remaining
              </p>
            </div>
          </motion.div>

          {/* Plan Interval */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-5 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F59E0B]/20 to-transparent" />

            <div className="relative flex items-start justify-between mb-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/10 p-2 border border-[#F59E0B]/30"
              >
                <Icon name="crown" className="text-[#F59E0B]" size={18} />
              </motion.div>
            </div>

            <div className="relative">
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] bg-clip-text text-transparent mb-1 capitalize"
              >
                {subscriptionDetails.interval}
              </motion.p>
              <p className="text-xs font-medium text-[#808080] uppercase tracking-wider">
                Billing Cycle
              </p>
            </div>
          </motion.div>

          {/* Current Price */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-5 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent" />

            <div className="relative flex items-start justify-between mb-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/10 p-2 border border-[#3B82F6]/30"
              >
                <Icon name="credit-card" className="text-[#3B82F6]" size={18} />
              </motion.div>
            </div>

            <div className="relative">
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5] bg-clip-text text-transparent mb-1"
              >
                ${subscriptionDetails.price}
              </motion.p>
              <p className="text-xs font-medium text-[#808080] uppercase tracking-wider">
                Per {subscriptionDetails.interval === 'yearly' ? 'Year' : 'Month'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Current Plan Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: isPremium ? 0.1 : 0 }}
        className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-8 mb-6 mt-8 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent" />

        <div className="relative flex items-start gap-5">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#2D2D2D] to-[#242424] p-3 border border-[#3A3A3A]/50 shadow-md shadow-black/10"
          >
            <Icon
              name={isPremium ? 'crown' : 'alert'}
              className={isPremium ? 'text-[#F59E0B]' : 'text-[#B0B0B0]'}
              size={24}
            />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#B0B0B0] bg-clip-text text-transparent">
                {isPremium ? subscriptionDetails?.plan_name || 'Premium' : 'Free Plan'}
              </h3>
              {status === 'active' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#10B981]/15 to-[#10B981]/10 border border-[#10B981]/40 px-3 py-1 text-xs font-semibold text-[#10B981] shadow-sm shadow-[#10B981]/10"
                >
                  <Icon name="check" size={12} />
                  Active
                </motion.span>
              )}
              {status === 'cancelled' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#EF4444]/15 to-[#EF4444]/10 border border-[#EF4444]/40 px-3 py-1 text-xs font-semibold text-[#EF4444] shadow-sm shadow-[#EF4444]/10"
                >
                  <Icon name="x" size={12} />
                  Cancelled
                </motion.span>
              )}
            </div>
            {isPremium && subscriptionDetails ? (
              <div className="space-y-2">
                <p className="text-base font-medium text-[#E5E5E5]">
                  {formatPrice(subscriptionDetails.price, subscriptionDetails.currency, subscriptionDetails.interval)}
                </p>
                {subscriptionDetails.current_period_end && (
                  <p className="text-sm text-[#808080]">
                    {status === 'cancelled' ? 'Access until' : 'Renews on'}{' '}
                    <span className="font-medium text-[#B0B0B0]">
                      {new Date(subscriptionDetails.current_period_end).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#B0B0B0] leading-relaxed">
                Upgrade to Premium for ad-free streaming and direct downloads
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Premium Benefits */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          <SettingCard
            title="Premium Benefits"
            description="Everything you get with Premium"
            icon="crown"
            className="mb-6"
          >
            <div className="space-y-4">
              {[
                {
                  title: 'Ad-Free Streaming',
                  description: 'Watch without interruptions',
                  delay: 0,
                },
                {
                  title: 'Direct Downloads',
                  description: 'One-click downloads, no redirects',
                  delay: 0.05,
                },
                {
                  title: 'All Quality Options',
                  description: '480p, 720p, and 1080p',
                  delay: 0.1,
                },
                {
                  title: 'Priority Support',
                  description: 'Get help faster',
                  delay: 0.15,
                },
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: benefit.delay }}
                  className="group flex items-start gap-3 py-3 px-4 -mx-4 rounded-xl hover:bg-gradient-to-r hover:from-[#242424]/30 hover:to-transparent transition-all duration-200"
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className="flex-shrink-0 rounded-lg bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/10 p-1.5 border border-[#10B981]/30 mt-0.5"
                  >
                    <Icon name="check" className="text-[#10B981]" size={14} />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-[#F0F0F0] group-hover:text-white transition-colors">
                      {benefit.title}
                    </p>
                    <p className="text-xs text-[#808080] mt-0.5 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-[#3A3A3A]/50">
              <div className="h-px bg-gradient-to-r from-transparent via-[#3A3A3A] to-transparent mb-6" />
              <Button variant="primary" onClick={handleUpgrade} className="w-full">
                <Icon name="crown" size={16} />
                Upgrade to Premium
              </Button>
            </div>
          </SettingCard>
        </motion.div>
      )}

      {/* Payment Method */}
      {isPremium && subscriptionDetails?.payment_method && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
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
        </motion.div>
      )}

      {/* Billing History */}
      {isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
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
        </motion.div>
      )}

      {/* Subscription Actions */}
      {isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          className="group relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-6 shadow-lg shadow-black/10 hover:border-[#4A4A4A]/80 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent" />

          <h3 className="relative text-sm font-semibold bg-gradient-to-br from-[#F0F0F0] to-[#B0B0B0] bg-clip-text text-transparent mb-4">
            Subscription Actions
          </h3>
          <div className="relative space-y-3">
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
        </motion.div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0F0F0F]/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowCancelConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative rounded-2xl border border-[#3A3A3A]/60 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#1F1F1F] p-8 max-w-md w-full shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E5E5E5]/[0.02] to-transparent" />

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EF4444]/20 to-transparent" />

            <div className="relative flex items-start gap-4 mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
                className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#EF4444]/20 to-[#EF4444]/10 p-3 border border-[#EF4444]/40 shadow-lg shadow-[#EF4444]/10"
              >
                <Icon name="alert" className="text-[#EF4444]" size={24} />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-br from-[#F0F0F0] to-[#B0B0B0] bg-clip-text text-transparent mb-2">
                  Cancel Subscription?
                </h3>
                <p className="text-sm text-[#B0B0B0] leading-relaxed">
                  You'll lose access to Premium features at the end of your billing period.
                </p>
              </div>
            </div>

            {/* Gradient divider */}
            <div className="relative h-px bg-gradient-to-r from-transparent via-[#3A3A3A] to-transparent mb-8" />

            <div className="relative flex gap-3">
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
          </motion.div>
        </motion.div>
      )}

      {/* Bottom Spacing */}
      <div className="h-12" />
    </SettingsLayout>
  );
}
