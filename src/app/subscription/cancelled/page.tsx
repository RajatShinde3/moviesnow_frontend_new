'use client';

/**
 * =============================================================================
 * Subscription Cancelled Page
 * =============================================================================
 * Displayed when user cancels Stripe checkout
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  XCircle,
  Crown,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-16">
      <div className="mx-auto max-w-xl px-4">
        {/* Cancelled Card */}
        <div className="overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
          {/* Header */}
          <div className="bg-gray-800 px-8 py-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-700">
              <XCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-white">
              Checkout Cancelled
            </h1>
            <p className="mt-2 text-gray-400">
              Your subscription was not activated
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="rounded-xl bg-gray-800 p-6">
              <p className="text-center text-gray-300">
                No worries! You can continue using MoviesNow with our free tier,
                or upgrade to Premium anytime to unlock all features.
              </p>
            </div>

            {/* What you're missing */}
            <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-6">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-yellow-500" />
                <span className="font-semibold text-white">Premium Benefits</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  Ad-free viewing experience
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  Direct in-app downloads
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  4K Ultra HD quality
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  Watch on 4 devices simultaneously
                </li>
              </ul>
            </div>

            {/* CTAs */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => router.push('/subscribe')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 py-4 font-bold text-black transition-all hover:from-yellow-500 hover:to-yellow-400"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>

              <Link
                href="/home"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 py-4 font-medium text-white transition-colors hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
                Continue with Free Tier
              </Link>
            </div>
          </div>

          {/* Help */}
          <div className="border-t border-gray-800 bg-gray-900/50 px-8 py-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <HelpCircle className="h-4 w-4" />
              <span>
                Having issues?{' '}
                <Link href="/help" className="text-blue-400 hover:underline">
                  Contact Support
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
