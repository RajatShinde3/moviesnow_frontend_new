/**
 * =============================================================================
 * 403 Forbidden Page
 * =============================================================================
 * Shown when user doesn't have permission to access a resource
 */

'use client';

import { useRouter } from 'next/navigation';
import { Shield, Home, ArrowLeft, Lock } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50 animate-pulse">
            <Shield className="h-16 w-16 text-white" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-500/20 rounded-full blur-3xl -z-10" />
        </div>

        {/* Error Code */}
        <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 mb-4">
          403
        </h1>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Access Forbidden
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          You don't have permission to access this resource. Please contact support if you believe this is an error.
        </p>

        {/* Reasons */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8 text-left max-w-md mx-auto">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-400" />
            Common Reasons
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0">•</span>
              <span>You're not logged in with the correct account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0">•</span>
              <span>Your subscription doesn't include this content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0">•</span>
              <span>Administrative privileges are required</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0">•</span>
              <span>Content is restricted in your region</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Go Home
          </button>
        </div>

        {/* Help Link */}
        <div className="mt-8">
          <p className="text-gray-500 text-sm">
            Need help?{' '}
            <button
              onClick={() => router.push('/support')}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
