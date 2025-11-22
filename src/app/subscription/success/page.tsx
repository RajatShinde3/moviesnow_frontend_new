'use client';

/**
 * =============================================================================
 * Subscription Success Page
 * =============================================================================
 * Displayed after successful Stripe checkout
 */

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  Crown,
  Zap,
  Download,
  MonitorPlay,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

const PREMIUM_BENEFITS = [
  { icon: Zap, text: 'Ad-free viewing on all content' },
  { icon: Download, text: 'Direct in-app downloads' },
  { icon: MonitorPlay, text: '4K Ultra HD quality' },
  { icon: Sparkles, text: 'Watch on 4 devices simultaneously' },
];

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = React.useState(true);
  const [verified, setVerified] = React.useState(false);

  // Verify the checkout session
  React.useEffect(() => {
    async function verifySession() {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      try {
        // In a real app, you'd verify the session with your backend
        // For now, we'll just invalidate the subscription cache
        await queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
        setVerified(true);
      } catch (error) {
        console.error('Failed to verify session:', error);
      } finally {
        setIsVerifying(false);
      }
    }

    verifySession();
  }, [sessionId, queryClient]);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-yellow-500" />
          <p className="mt-4 text-white">Activating your Premium subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-16">
      <div className="mx-auto max-w-2xl px-4">
        {/* Success Card */}
        <div className="overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-8 py-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black/20">
              <CheckCircle className="h-12 w-12 text-black" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-black">
              Welcome to Premium!
            </h1>
            <p className="mt-2 text-black/70">
              Your subscription is now active
            </p>
          </div>

          {/* Benefits */}
          <div className="p-8">
            <h2 className="mb-6 text-center text-lg font-semibold text-white">
              You now have access to:
            </h2>

            <div className="space-y-4">
              {PREMIUM_BENEFITS.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-xl bg-gray-800 p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                    <benefit.icon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <span className="text-white">{benefit.text}</span>
                  <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>

            {/* Premium Badge */}
            <div className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 p-6">
              <Crown className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold text-white">Premium Member</span>
            </div>

            {/* CTAs */}
            <div className="mt-8 space-y-3">
              <Link
                href="/home"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 py-4 font-bold text-black transition-all hover:from-yellow-500 hover:to-yellow-400"
              >
                Start Watching
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/settings/subscription"
                className="block w-full rounded-xl border border-gray-700 py-4 text-center font-medium text-white transition-colors hover:bg-gray-800"
              >
                Manage Subscription
              </Link>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="border-t border-gray-800 bg-gray-900/50 px-8 py-6">
            <p className="text-center text-sm text-gray-400">
              A confirmation email has been sent to your registered email address.
              <br />
              Your subscription will automatically renew each month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
