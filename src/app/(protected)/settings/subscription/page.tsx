'use client';

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * Enterprise-Grade Subscription Settings Page
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * Premium Features:
 * - Advanced glassmorphism design with backdrop blur
 * - Smooth Framer Motion animations and micro-interactions
 * - Professional skeleton loading states
 * - Responsive layouts with automatic adaptation
 * - Gradient accents with dynamic color schemes
 * - Accessibility-first approach
 * - Performance optimized with React Query
 * - Beautiful card animations with spring physics
 */

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PremiumBadge } from '@/components/PremiumBadge';
import { BillingHistory } from '@/components/subscription/BillingHistory';
import { TrialCountdownBanner } from '@/components/subscription/TrialCountdownBanner';
import {
  Crown,
  CreditCard,
  Calendar,
  AlertCircle,
  Check,
  X,
  Loader2,
  ExternalLink,
  Sparkles,
  Zap,
  Shield,
  Download,
  Play,
  Tv,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';

// ═════════════════════════════════════════════════════════════════════════════
// Type Definitions
// ═════════════════════════════════════════════════════════════════════════════

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
}

// ═════════════════════════════════════════════════════════════════════════════
// Animation Variants
// ═════════════════════════════════════════════════════════════════════════════

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════

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

  // Fetch subscription details (plan info, payment method) from API
  const { data: subscriptionDetails } = useQuery<SubscriptionDetails>({
    queryKey: ['subscription-details'],
    queryFn: async () => {
      const response = await fetch('/api/v1/subscriptions/payment-method', {
        credentials: 'include',
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: isPremium,
    staleTime: 5 * 60 * 1000,
  });

  // Update payment method mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/v1/subscriptions/update-payment-method', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to open billing portal');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
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

  // ───────────────────────────────────────────────────────────────────────────
  // Loading State
  // ───────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
          <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-muted/70 rounded animate-pulse" />
          <div className="rounded-3xl border bg-card/80 p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-muted animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-48 bg-muted/70 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Main Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8"
      >
        {/* Trial Countdown Banner */}
        <AnimatePresence>
          {status === 'trial' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TrialCountdownBanner className="rounded-xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 p-3 shadow-lg shadow-yellow-500/30"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Crown className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Subscription & Billing
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage your subscription plan and billing information
          </p>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-sm p-4 shadow-lg"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="flex-1 text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Plan Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/20"
        >
          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 5,
              ease: "easeInOut",
            }}
          />

          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl",
                    isPremium
                      ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 shadow-yellow-500/40'
                      : 'bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-500/20'
                  )}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Crown
                    className={cn(
                      "h-8 w-8",
                      isPremium ? 'text-white' : 'text-gray-300'
                    )}
                  />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {isPremium ? 'Premium' : 'Free'} Plan
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {isPremium
                      ? status === 'cancelled'
                        ? 'Cancelled - Access until period ends'
                        : 'Full access to all features'
                      : 'Basic access with ads'}
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isPremium && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-semibold ring-2",
                      status === 'cancelled'
                        ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 ring-orange-500/30'
                        : status === 'trial'
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 ring-blue-500/30'
                        : 'bg-green-500/20 text-green-600 dark:text-green-400 ring-green-500/30'
                    )}
                  >
                    {status === 'cancelled'
                      ? 'Cancelled'
                      : status === 'trial'
                      ? 'Trial'
                      : 'Active'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Expiration Info */}
            {isPremium && expiresAt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mb-6 text-sm text-muted-foreground"
              >
                <Calendar className="h-4 w-4" />
                <span>
                  {status === 'cancelled' ? 'Access ends' : 'Renews'} on{' '}
                  {new Date(expiresAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </motion.div>
            )}

            {/* Features Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {isPremium ? (
                <>
                  <FeatureItem enabled icon={<Zap className="h-4 w-4" />}>Ad-free viewing</FeatureItem>
                  <FeatureItem enabled icon={<Download className="h-4 w-4" />}>Direct downloads</FeatureItem>
                  <FeatureItem enabled icon={<Tv className="h-4 w-4" />}>4K Ultra HD quality</FeatureItem>
                  <FeatureItem enabled icon={<Play className="h-4 w-4" />}>Watch on 4 devices</FeatureItem>
                  <FeatureItem enabled icon={<Shield className="h-4 w-4" />}>Offline viewing</FeatureItem>
                  <FeatureItem enabled icon={<Sparkles className="h-4 w-4" />}>Early access</FeatureItem>
                </>
              ) : (
                <>
                  <FeatureItem enabled={false} icon={<Zap className="h-4 w-4" />}>Ad-free viewing</FeatureItem>
                  <FeatureItem enabled={false} icon={<Download className="h-4 w-4" />}>Direct downloads</FeatureItem>
                  <FeatureItem enabled={false} icon={<Tv className="h-4 w-4" />}>4K quality</FeatureItem>
                  <FeatureItem enabled icon={<Play className="h-4 w-4" />}>720p quality</FeatureItem>
                  <FeatureItem enabled icon={<Shield className="h-4 w-4" />}>1 device</FeatureItem>
                  <FeatureItem enabled icon={<AlertTriangle className="h-4 w-4" />}>Watch with ads</FeatureItem>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {!isPremium && (
                <motion.button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-yellow-500/40 transition-all hover:shadow-yellow-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Crown className="h-5 w-5" />
                  )}
                  Upgrade to Premium
                </motion.button>
              )}

              {isPremium && status !== 'cancelled' && (
                <motion.button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isProcessing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl border-2 border-border px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-destructive/50 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel Subscription
                </motion.button>
              )}

              {isPremium && status === 'cancelled' && (
                <motion.button
                  onClick={handleReactivate}
                  disabled={isProcessing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/40 transition-all hover:shadow-green-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  Reactivate Subscription
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={() => !isProcessing && setShowCancelConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-xl p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-2.5 text-white shadow-lg">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Cancel Subscription?
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  You'll keep premium access until{' '}
                  {expiresAt
                    ? new Date(expiresAt).toLocaleDateString()
                    : 'the end of your billing period'}
                  . After that, you'll be downgraded to the free plan.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={isProcessing}
                    className="flex-1 rounded-xl border-2 border-border py-2.5 font-medium transition-all hover:bg-accent disabled:opacity-50"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isProcessing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-2.5 font-semibold text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 disabled:opacity-50"
                  >
                    {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Yes, Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Billing Section (Premium only) */}
        {isPremium && (
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm p-6 shadow-lg"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
              <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-2 text-white shadow-md">
                <CreditCard className="h-5 w-5" />
              </div>
              Billing Information
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-foreground">
                  {subscriptionDetails?.plan_name || 'Premium Monthly'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold text-foreground">
                  {subscriptionDetails
                    ? formatPrice(
                        subscriptionDetails.price,
                        subscriptionDetails.currency,
                        subscriptionDetails.interval
                      )
                    : '$9.99/month'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium text-foreground">
                  {subscriptionDetails?.payment_method ? (
                    <>
                      {subscriptionDetails.payment_method.brand.charAt(0).toUpperCase() +
                        subscriptionDetails.payment_method.brand.slice(1)}{' '}
                      •••• {subscriptionDetails.payment_method.last4}
                      <span className="ml-2 text-muted-foreground text-xs">
                        ({subscriptionDetails.payment_method.exp_month}/
                        {subscriptionDetails.payment_method.exp_year})
                      </span>
                    </>
                  ) : (
                    'No payment method'
                  )}
                </span>
              </div>
            </div>

            <motion.button
              onClick={() => updatePaymentMutation.mutate()}
              disabled={updatePaymentMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
            >
              {updatePaymentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Manage payment method
            </motion.button>
            {updatePaymentMutation.isError && (
              <p className="mt-2 text-xs text-destructive">
                Failed to open billing portal. Please try again.
              </p>
            )}
          </motion.div>
        )}

        {/* Billing History (Premium only) */}
        {isPremium && (
          <motion.div variants={itemVariants}>
            <BillingHistory className="mt-0" />
          </motion.div>
        )}

        {/* Upgrade CTA (Free users) */}
        {!isPremium && (
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            initial="rest"
            className="relative overflow-hidden rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/20 via-yellow-600/10 to-orange-500/20 backdrop-blur-sm p-8 shadow-xl"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />

            <div className="relative flex items-start gap-4">
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/40"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Crown className="h-7 w-7 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Upgrade to Premium Today
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get ad-free viewing, 4K quality, direct downloads, and more for
                  just $9.99/month. Try free for 7 days!
                </p>
                <motion.button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-yellow-500/40 hover:shadow-yellow-500/60 disabled:opacity-50 transition-all"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Start Free Trial'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Feature Item Component
// ═════════════════════════════════════════════════════════════════════════════

function FeatureItem({
  enabled,
  children,
  icon,
}: {
  enabled: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
        enabled
          ? "bg-green-500/10 text-green-600 dark:text-green-400"
          : "bg-muted/50 text-muted-foreground"
      )}
    >
      {enabled ? (
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 flex-shrink-0" />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="font-medium">{children}</span>
    </motion.div>
  );
}
