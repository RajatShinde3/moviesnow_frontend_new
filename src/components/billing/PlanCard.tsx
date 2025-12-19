'use client';

import * as React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

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

interface PlanCardProps {
  plan: Plan;
  interval: 'monthly' | 'yearly';
  currentPlan?: string;
  isLoading?: boolean;
  onSelect: (planSlug: string, interval: 'monthly' | 'yearly') => void;
}

export function PlanCard({
  plan,
  interval,
  currentPlan,
  isLoading = false,
  onSelect,
}: PlanCardProps) {
  const price = interval === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;
  const isCurrent = currentPlan === plan.slug;
  const isFree = plan.slug === 'free';

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border-2 p-8 transition-all',
        plan.is_featured
          ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-purple-500/10 shadow-2xl scale-105'
          : 'border-gray-700 bg-gray-900/50 hover:border-gray-600',
        isCurrent && 'ring-2 ring-green-500'
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
            <Sparkles className="h-3 w-3" />
            {plan.badge}
          </div>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4">
          <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
            Current Plan
          </span>
        </div>
      )}

      {/* Plan Name */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
        {plan.description && (
          <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
        )}
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-white">
            ${price?.toFixed(2) || '0.00'}
          </span>
          <span className="text-gray-400">
            /{interval === 'monthly' ? 'month' : 'year'}
          </span>
        </div>
        {interval === 'yearly' && plan.pricing.yearly_savings && (
          <p className="mt-2 text-sm text-green-400">
            Save {plan.pricing.yearly_savings}% vs monthly
          </p>
        )}
        {plan.trial_days > 0 && !isCurrent && (
          <p className="mt-2 text-sm font-medium text-blue-400">
            {plan.trial_days}-day free trial
          </p>
        )}
      </div>

      {/* Features */}
      <div className="mb-8 flex-1 space-y-3">
        {plan.features_list.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 flex-shrink-0 text-green-400 mt-0.5" />
            <span className="text-sm text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onSelect(plan.slug, interval)}
        disabled={isLoading || isCurrent || isFree}
        className={cn(
          'w-full rounded-lg px-6 py-3 font-semibold transition-all',
          plan.is_featured
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg'
            : 'bg-white text-gray-900 hover:bg-gray-100',
          isCurrent && 'bg-gray-700 text-gray-400 cursor-not-allowed',
          isFree && 'bg-gray-800 text-gray-500 cursor-not-allowed',
          isLoading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : isCurrent ? (
          'Current Plan'
        ) : isFree ? (
          'Current Plan'
        ) : (
          `Select ${plan.name}`
        )}
      </button>
    </div>
  );
}
