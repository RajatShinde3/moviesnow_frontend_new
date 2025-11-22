// components/billing/PlanSelector.tsx
/**
 * =============================================================================
 * Plan Selector Component - Subscription Plans
 * =============================================================================
 * Best Practices:
 * - Clear pricing display
 * - Feature comparison
 * - Recommended plan highlighting
 * - Mobile responsive
 * - Accessible design
 * - Clear CTAs
 */

"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  Check,
  Star,
  Zap,
  Crown,
  Sparkles,
  Users,
  Monitor,
  Download,
  Hd,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_streams: number;
  max_downloads: number;
  video_quality: string;
  recommended?: boolean;
  tier: "basic" | "standard" | "premium";
}

/**
 * Main Plan Selector Component
 */
export function PlanSelector() {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = React.useState<"monthly" | "yearly">("monthly");

  // Fetch available plans
  const { data: plansData, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await fetch("/api/v1/subscriptions/plans");
      if (!response.ok) {
        // Return mock data if endpoint not ready
        return {
          plans: [
            {
              id: "basic",
              name: "Basic",
              description: "Perfect for casual viewers",
              price_monthly: 8.99,
              price_yearly: 89.99,
              features: [
                "Watch on 1 device at a time",
                "720p HD quality",
                "Limited downloads",
                "Cancel anytime",
              ],
              max_streams: 1,
              max_downloads: 5,
              video_quality: "720p HD",
              tier: "basic",
            },
            {
              id: "standard",
              name: "Standard",
              description: "Great for families",
              price_monthly: 13.99,
              price_yearly: 139.99,
              features: [
                "Watch on 2 devices simultaneously",
                "1080p Full HD quality",
                "Unlimited downloads",
                "Cancel anytime",
                "Ad-free experience",
              ],
              max_streams: 2,
              max_downloads: 100,
              video_quality: "1080p Full HD",
              recommended: true,
              tier: "standard",
            },
            {
              id: "premium",
              name: "Premium",
              description: "Best viewing experience",
              price_monthly: 17.99,
              price_yearly: 179.99,
              features: [
                "Watch on 4 devices simultaneously",
                "4K Ultra HD + HDR quality",
                "Unlimited downloads",
                "Cancel anytime",
                "Ad-free experience",
                "Early access to new releases",
              ],
              max_streams: 4,
              max_downloads: -1,
              video_quality: "4K Ultra HD + HDR",
              tier: "premium",
            },
          ],
        };
      }
      return response.json();
    },
  });

  const plans = plansData?.plans || [];

  // Create subscription mutation
  const subscribeMutation = useMutation({
    mutationFn: async ({ planId, interval }: { planId: string; interval: string }) => {
      const response = await fetch("/api/v1/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          plan_id: planId,
          billing_interval: interval,
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
  });

  const handleSelectPlan = (planId: string) => {
    subscribeMutation.mutate({ planId, interval: billingInterval });
  };

  const yearlyDiscount = 17; // ~2 months free

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
            Choose the right plan for you
          </h1>
          <p className="text-xl text-gray-400">
            Watch unlimited movies and TV shows. Cancel anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex items-center gap-4 rounded-full bg-gray-900 p-1">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={cn(
                "rounded-full px-6 py-2 font-semibold transition-colors",
                billingInterval === "monthly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("yearly")}
              className={cn(
                "rounded-full px-6 py-2 font-semibold transition-colors",
                billingInterval === "yearly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Yearly
              <span className="ml-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                Save {yearlyDiscount}%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[600px] animate-pulse rounded-2xl bg-gray-900" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan: Plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingInterval={billingInterval}
                onSelect={() => handleSelectPlan(plan.id)}
                isLoading={subscribeMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 rounded-2xl bg-gray-900 p-8">
          <h2 className="mb-6 text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQItem
              question="Can I switch plans?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, debit cards, and PayPal."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Absolutely. Cancel anytime with no hidden fees. Your access continues until the end of your billing period."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="We offer a 7-day free trial on all plans. No credit card required."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Plan Card Component
 */
function PlanCard({
  plan,
  billingInterval,
  onSelect,
  isLoading,
}: {
  plan: Plan;
  billingInterval: "monthly" | "yearly";
  onSelect: () => void;
  isLoading: boolean;
}) {
  const price =
    billingInterval === "monthly" ? plan.price_monthly : plan.price_yearly / 12;

  const tierIcons = {
    basic: <Zap className="h-6 w-6" />,
    standard: <Star className="h-6 w-6" />,
    premium: <Crown className="h-6 w-6" />,
  };

  const tierColors = {
    basic: "from-blue-600 to-blue-800",
    standard: "from-purple-600 to-purple-800",
    premium: "from-yellow-500 to-yellow-700",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gray-900 p-8 transition-all hover:scale-105",
        plan.recommended && "ring-2 ring-blue-500"
      )}
    >
      {/* Recommended Badge */}
      {plan.recommended && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          <Sparkles className="h-3 w-3" />
          Recommended
        </div>
      )}

      {/* Plan Icon */}
      <div
        className={cn(
          "mb-4 inline-flex rounded-full bg-gradient-to-br p-3 text-white",
          tierColors[plan.tier]
        )}
      >
        {tierIcons[plan.tier]}
      </div>

      {/* Plan Name */}
      <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
      <p className="mb-6 text-gray-400">{plan.description}</p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">${price.toFixed(2)}</span>
          <span className="text-gray-400">/month</span>
        </div>
        {billingInterval === "yearly" && (
          <p className="mt-1 text-sm text-green-400">
            ${plan.price_yearly.toFixed(2)} billed yearly
          </p>
        )}
      </div>

      {/* Subscribe Button */}
      <button
        onClick={onSelect}
        disabled={isLoading}
        className={cn(
          "mb-6 w-full rounded-lg py-3 font-semibold text-white transition-colors",
          plan.recommended
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-800 hover:bg-gray-700",
          isLoading && "cursor-not-allowed opacity-50"
        )}
      >
        {isLoading ? "Processing..." : "Get Started"}
      </button>

      {/* Features */}
      <div className="space-y-3">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
            <span className="text-sm text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-6 space-y-2 border-t border-gray-800 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Monitor className="h-4 w-4" />
          <span>{plan.max_streams} {plan.max_streams === 1 ? 'screen' : 'screens'} at once</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Hd className="h-4 w-4" />
          <span>{plan.video_quality}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Download className="h-4 w-4" />
          <span>
            {plan.max_downloads === -1 ? 'Unlimited' : plan.max_downloads} downloads
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * FAQ Item Component
 */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-gray-800 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-semibold text-white">{question}</span>
        <span className="text-gray-400">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <p className="mt-2 text-gray-400">{answer}</p>}
    </div>
  );
}
