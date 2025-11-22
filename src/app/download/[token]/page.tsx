'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Download,
  Clock,
  Crown,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PremiumUpgradeModal } from '@/components/subscription/PremiumUpgradeModal';

export default function DownloadRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [timeRemaining, setTimeRemaining] = React.useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [adsWatched, setAdsWatched] = React.useState(0);

  // Fetch download info
  const { data, isLoading, error } = useQuery({
    queryKey: ['download-redirect', token],
    queryFn: async () => {
      const response = await fetch(`/api/v1/downloads/verify/${token}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Invalid download link');
      return response.json();
    },
  });

  // Complete download mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/downloads/complete/${token}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to get download link');
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to external download site
      window.location.href = data.external_url;
    },
  });

  // Initialize timer when data loads
  React.useEffect(() => {
    if (data && timeRemaining === null) {
      setTimeRemaining(data.timer_seconds);
    }
  }, [data, timeRemaining]);

  // Countdown timer
  React.useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Simulate ad watching (in production, integrate with actual ad SDK)
  React.useEffect(() => {
    if (!data?.show_ads || adsWatched >= data.ad_count) return;

    const adTimer = setTimeout(() => {
      setAdsWatched((prev) => prev + 1);
    }, 5000); // Simulate 5 second ads

    return () => clearTimeout(adTimer);
  }, [data, adsWatched]);

  const canDownload = timeRemaining === 0 && (!data?.show_ads || adsWatched >= data?.ad_count);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-xl font-bold text-white">Invalid Download Link</h1>
        <p className="mt-2 text-gray-400">This link has expired or is invalid.</p>
        <button
          onClick={() => router.push('/home')}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Ad Banner Area */}
      {data?.show_ads && adsWatched < data.ad_count && (
        <div className="bg-gray-800 p-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex h-24 items-center justify-center rounded-lg bg-gray-700">
              <p className="text-gray-400">
                Ad {adsWatched + 1} of {data.ad_count} - Loading...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Download Card */}
        <div className="overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
            <Download className="mx-auto h-16 w-16 text-white" />
            <h1 className="mt-4 text-2xl font-bold text-white">
              {data?.title_name}
            </h1>
            <p className="mt-1 text-white/80">Quality: {data?.quality}</p>
          </div>

          {/* Timer Section */}
          <div className="p-8">
            {!canDownload ? (
              <div className="text-center">
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gray-800">
                  <div className="text-center">
                    <Clock className="mx-auto h-8 w-8 text-blue-500" />
                    <span className="mt-2 block text-4xl font-bold text-white">
                      {timeRemaining}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-gray-400">
                  Please wait while we prepare your download
                </p>

                {data?.show_ads && (
                  <p className="mt-2 text-sm text-gray-500">
                    Ads remaining: {data.ad_count - adsWatched}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => completeMutation.mutate()}
                  disabled={completeMutation.isPending}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-green-600 to-green-500 py-4 text-lg font-bold text-white transition-all hover:from-green-500 hover:to-green-400 disabled:opacity-50"
                >
                  {completeMutation.isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="h-6 w-6" />
                      Continue to Download
                    </>
                  )}
                </button>
                <p className="mt-3 text-sm text-gray-500">
                  You will be redirected to our download partner
                </p>
              </div>
            )}
          </div>

          {/* Premium Upsell */}
          <div className="border-t border-gray-800 bg-gray-900/50 p-6">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 p-4 transition-all hover:from-yellow-600/30 hover:to-yellow-500/30"
            >
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-500" />
                <div className="text-left">
                  <p className="font-semibold text-white">Skip the wait!</p>
                  <p className="text-sm text-gray-400">
                    Upgrade to Premium for instant downloads
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-yellow-500 px-4 py-1 text-sm font-bold text-black">
                $9.99/mo
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Premium Modal */}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="download"
      />
    </div>
  );
}
