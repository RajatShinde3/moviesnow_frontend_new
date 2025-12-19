'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { PlanCard } from '@/components/billing/PlanCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Plan {
  id: string;
  slug: string;
  name: string;
  description?: string;
  pricing: {
    monthly: number;
    yearly?: number;
    currency: string;
    yearly_savings?: number;
  };
  features: {
    max_streams: number;
    max_quality: string;
    downloads: boolean;
    ads_free: boolean;
    spatial_audio: boolean;
    hdr: boolean;
    offline_limit: number | null;
  };
  features_list: string[];
  trial_days: number;
  badge?: string;
  is_featured: boolean;
}

interface SubscriptionStatus {
  is_premium: boolean;
  status: string;
  plan_slug?: string;
  can_upgrade: boolean;
  has_used_trial: boolean;
}

export default function SubscribePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [interval, setInterval] = React.useState<'monthly' | 'yearly'>('monthly');

  // Fetch available plans
  const { data: plans, isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await fetch('/api/v1/subscriptions/plans');
      if (!res.ok) throw new Error('Failed to fetch plans');
      return res.json();
    },
  });

  // Fetch current subscription status
  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const res = await fetch('/api/v1/subscriptions/status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch subscription');
      return res.json();
    },
    enabled: !!user,
  });

  // Create checkout session
  const checkoutMutation = useMutation({
    mutationFn: async ({ planSlug }: { planSlug: string }) => {
      const res = await fetch('/api/v1/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ plan_slug: planSlug }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Checkout failed');
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create checkout session');
    },
  });

  const handleSelectPlan = (planSlug: string, selectedInterval: 'monthly' | 'yearly') => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      router.push('/login?redirect=/subscribe');
      return;
    }

    // Adjust plan slug for yearly
    const finalPlanSlug = selectedInterval === 'yearly' ? `${planSlug}-yearly` : planSlug;

    checkoutMutation.mutate({ planSlug: finalPlanSlug });
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-gray-400">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Unlock unlimited entertainment with premium quality streaming
        </p>

        {/* Interval Toggle */}
        <div className="inline-flex rounded-lg bg-gray-800 p-1 mb-12">
          <button
            onClick={() => setInterval('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              interval === 'monthly'
                ? 'bg-white text-gray-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              interval === 'yearly'
                ? 'bg-white text-gray-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs text-green-400">Save up to 20%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans
            ?.filter((plan) => plan.slug !== 'free')
            ?.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                interval={interval}
                currentPlan={subscription?.plan_slug}
                isLoading={checkoutMutation.isPending}
                onSelect={handleSelectPlan}
              />
            ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="container mx-auto px-4 py-16 border-t border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">Compare Features</h2>
        <div className="max-w-4xl mx-auto bg-gray-900/50 rounded-2xl p-8">
          <div className="space-y-4">
            {[
              { feature: 'Ad-free viewing', free: false, premium: true },
              { feature: 'Direct downloads', free: false, premium: true },
              { feature: 'Video quality', free: '720p', premium: '4K Ultra HD' },
              { feature: 'Simultaneous devices', free: '1', premium: '4' },
              { feature: 'Offline viewing', free: false, premium: true },
              { feature: 'Early access', free: false, premium: true },
              { feature: 'HDR support', free: false, premium: true },
              { feature: 'Dolby Atmos', free: false, premium: true },
            ].map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800 last:border-0"
              >
                <div className="text-gray-300 font-medium">{row.feature}</div>
                <div className="text-center text-gray-500">
                  {typeof row.free === 'boolean' ? (
                    row.free ? (
                      '✓'
                    ) : (
                      '–'
                    )
                  ) : (
                    row.free
                  )}
                </div>
                <div className="text-center text-green-400 font-semibold">
                  {typeof row.premium === 'boolean' ? (
                    row.premium ? (
                      '✓'
                    ) : (
                      '–'
                    )
                  ) : (
                    row.premium
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              q: 'Can I cancel anytime?',
              a: "Yes! You can cancel your subscription at any time. You'll keep premium access until the end of your billing period.",
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards, debit cards, and digital wallets through our secure payment processor.',
            },
            {
              q: 'Is there a free trial?',
              a: "Yes! Premium plans include a free trial period. You won't be charged until the trial ends.",
            },
            {
              q: 'Can I switch plans?',
              a: 'Yes! You can upgrade or downgrade at any time. Changes take effect at the start of your next billing period.',
            },
          ].map((faq, index) => (
            <details
              key={index}
              className="group bg-gray-900/50 rounded-lg p-6 cursor-pointer"
            >
              <summary className="font-semibold text-white list-none flex items-center justify-between">
                {faq.q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-gray-400">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
