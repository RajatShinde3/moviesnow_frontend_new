/**
 * =============================================================================
 * 429 Rate Limit Page
 * =============================================================================
 * Shown when user exceeds rate limits
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Home, RefreshCw, Zap, AlertTriangle } from 'lucide-react';

export default function RateLimitPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
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
  }, []);

  const handleRetry = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50">
            <Zap className="h-16 w-16 text-white" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
        </div>

        {/* Error Code */}
        <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
          429
        </h1>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Whoa, Slow Down!
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          You've made too many requests in a short time. Please wait a moment before trying again.
        </p>

        {/* Countdown */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-yellow-400" />
            <span className="text-gray-400">Please wait</span>
          </div>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 mb-2">
            {countdown}s
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000"
              style={{ width: `${100 - (countdown / 60) * 100}%` }}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8 text-left max-w-md mx-auto">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            To Avoid Rate Limits
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 flex-shrink-0">•</span>
              <span>Wait a few moments between requests</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 flex-shrink-0">•</span>
              <span>Avoid refreshing the page repeatedly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 flex-shrink-0">•</span>
              <span>Don't use automated scripts or bots</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 flex-shrink-0">•</span>
              <span>Consider upgrading for higher limits</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Go Home
          </button>
          <button
            onClick={handleRetry}
            disabled={countdown > 0}
            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <RefreshCw className={`h-5 w-5 ${countdown > 0 ? '' : 'animate-spin'}`} />
            {countdown > 0 ? `Retry in ${countdown}s` : 'Retry Now'}
          </button>
        </div>

        {/* Help */}
        <div className="mt-8">
          <p className="text-gray-500 text-sm">
            Still having issues?{' '}
            <button
              onClick={() => router.push('/support')}
              className="text-yellow-400 hover:text-yellow-300 underline"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
