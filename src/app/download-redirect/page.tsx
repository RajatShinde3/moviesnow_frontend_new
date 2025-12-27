/**
 * =============================================================================
 * Download Redirect Page (Free Users)
 * =============================================================================
 * Countdown page that redirects free users through ad network before download
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, Clock, Zap, ExternalLink, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function DownloadRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bundleId = searchParams.get('bundle');
  const titleName = searchParams.get('title') || 'Content';
  const quality = searchParams.get('quality') || '1080p';
  const adUrl = searchParams.get('ad_url');

  const [countdown, setCountdown] = useState(30);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      handleRedirect();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleRedirect = () => {
    setIsRedirecting(true);

    if (adUrl) {
      // Redirect to ad network with bundle ID
      const redirectUrl = `${adUrl}?bundle=${bundleId}&return=${encodeURIComponent(window.location.origin + '/download')}`;
      window.location.href = redirectUrl;
    } else {
      toast.error('Ad URL not configured');
      router.push('/download');
    }
  };

  const handleUpgrade = () => {
    router.push('/subscribe?source=download_redirect');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
            <Download className="h-16 w-16 text-white" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Preparing Your Download
        </h1>

        {/* Content Info */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Title:</span>
            <span className="text-white font-bold">{titleName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Quality:</span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold border border-blue-500/30">
              {quality}
            </span>
          </div>
        </div>

        {/* Countdown */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Clock className="h-6 w-6 text-purple-400" />
            <span className="text-gray-400 text-lg">Please wait while we prepare your download</span>
          </div>

          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
            {countdown}s
          </div>

          <p className="text-gray-400 mb-6">
            {countdown > 0
              ? 'You will be redirected to our ad partner in a moment...'
              : 'Redirecting now...'}
          </p>

          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
              style={{ width: `${100 - (countdown / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <ExternalLink className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-blue-200">
              <p className="font-medium mb-2">Why am I seeing this?</p>
              <p className="text-blue-300/80 mb-3">
                Free users are redirected through our advertising partners to support the platform.
                After viewing the ad page, you'll receive your download link.
              </p>
              <p className="text-blue-300/80">
                Premium members get direct downloads with no waiting!
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown className="h-6 w-6 text-yellow-400" />
            <h3 className="font-bold text-white text-lg">Skip the Wait</h3>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Upgrade to Premium for instant downloads with no redirects or ads
          </p>
          <button
            onClick={handleUpgrade}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:scale-105 transition-transform shadow-lg"
          >
            Upgrade to Premium
          </button>
        </div>

        {/* What Happens Next */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 text-left max-w-md mx-auto">
          <h3 className="font-bold text-white mb-4 text-center">What Happens Next</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                1
              </div>
              <p>You'll be redirected to our ad partner's page</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                2
              </div>
              <p>View the ad page and wait for the countdown (usually 30-60 seconds)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                3
              </div>
              <p>Click "Get Download Link" when it appears</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                4
              </div>
              <p>Your download will start automatically!</p>
            </div>
          </div>
        </div>

        {/* Manual Redirect */}
        {countdown === 0 && !isRedirecting && (
          <div className="mt-6">
            <button
              onClick={handleRedirect}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 mx-auto"
            >
              <Zap className="h-5 w-5" />
              Continue to Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
