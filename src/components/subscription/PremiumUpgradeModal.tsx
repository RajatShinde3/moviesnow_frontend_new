'use client';

import * as React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  X,
  Crown,
  Zap,
  Download,
  MonitorPlay,
  Sparkles,
  Loader2,
  Check
} from 'lucide-react';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'ad' | 'download' | 'quality' | 'general';
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  trial_days: number;
  feature_list: string[];
  highlight?: boolean;
  badge_text?: string;
}

const TRIGGER_MESSAGES = {
  ad: "Tired of ads? Go Premium!",
  download: "Want instant downloads without waiting?",
  quality: "Unlock 4K Ultra HD quality!",
  general: "Upgrade to Premium"
};

const FEATURE_ICONS: Record<string, React.ElementType> = {
  'Ad-free viewing': Zap,
  'Direct downloads': Download,
  '4K Ultra HD quality': MonitorPlay,
  'Watch on 4 devices': Sparkles,
};

export function PremiumUpgradeModal({
  isOpen,
  onClose,
  trigger = 'general'
}: PremiumUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<string>('premium');

  // Fetch plans from API
  const { data: plans, isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await fetch('/api/v1/subscriptions/plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      return response.json();
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planSlug: string) => {
      const response = await fetch('/api/v1/subscriptions/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_slug: planSlug }),
      });
      if (!response.ok) throw new Error('Failed to create checkout');
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.checkout_url;
    },
  });

  // Get premium plans (excluding free)
  const premiumPlans = React.useMemo(() => {
    return (plans || []).filter(p => p.price > 0);
  }, [plans]);

  // Get currently selected plan details
  const currentPlan = premiumPlans.find(p => p.id === selectedPlan) || premiumPlans[0];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 to-black shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-yellow-600 to-yellow-500 px-6 py-8 text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-black/60 hover:bg-black/10 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>

          <Crown className="mx-auto h-16 w-16 text-black" />
          <h2 className="mt-4 text-2xl font-bold text-black">
            {TRIGGER_MESSAGES[trigger]}
          </h2>
          <p className="mt-2 text-black/70">
            Unlock the ultimate streaming experience
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {plansLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Plan Selector (if multiple plans) */}
              {premiumPlans.length > 1 && (
                <div className="mb-6 grid grid-cols-2 gap-3">
                  {premiumPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                        selectedPlan === plan.id
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {plan.badge_text && (
                        <span className="absolute -top-2 right-2 rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-black">
                          {plan.badge_text}
                        </span>
                      )}
                      <p className="font-semibold text-white">{plan.name}</p>
                      <p className="mt-1 text-sm text-gray-400">
                        {formatPrice(plan.price, plan.currency)}/{plan.interval === 'yearly' ? 'year' : 'mo'}
                      </p>
                      {plan.trial_days > 0 && (
                        <p className="mt-1 text-xs text-yellow-500">
                          {plan.trial_days}-day free trial
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Features */}
              <div className="space-y-3">
                {currentPlan?.feature_list?.map((feature, index) => {
                  const IconComponent = Object.entries(FEATURE_ICONS).find(
                    ([key]) => feature.toLowerCase().includes(key.toLowerCase())
                  )?.[1] || Check;

                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20">
                        <IconComponent className="h-4 w-4 text-yellow-500" />
                      </div>
                      <span className="text-sm text-white">{feature}</span>
                    </div>
                  );
                })}
              </div>

              {/* Price Display */}
              {currentPlan && (
                <div className="mt-6 rounded-xl bg-gray-800 p-6 text-center">
                  <p className="text-gray-400">{currentPlan.name}</p>
                  <div className="mt-2 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(currentPlan.price, currentPlan.currency)}
                    </span>
                    <span className="text-gray-400">
                      /{currentPlan.interval === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {currentPlan.trial_days > 0 && (
                    <p className="mt-2 text-sm text-yellow-500">
                      Start with {currentPlan.trial_days}-day free trial
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Cancel anytime</p>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => checkoutMutation.mutate(selectedPlan)}
                disabled={checkoutMutation.isPending || !currentPlan}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 py-4 font-bold text-black transition-all hover:from-yellow-500 hover:to-yellow-400 disabled:opacity-50"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5" />
                    {currentPlan?.trial_days > 0 ? 'Start Free Trial' : 'Upgrade to Premium'}
                  </>
                )}
              </button>

              {checkoutMutation.isError && (
                <p className="mt-3 text-center text-sm text-red-400">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                onClick={onClose}
                className="mt-4 w-full py-2 text-center text-gray-500 hover:text-gray-400"
              >
                Maybe later
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
