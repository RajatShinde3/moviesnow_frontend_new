/**
 * =============================================================================
 * Login Modal
 * =============================================================================
 * Beautiful modal for prompting users to log in when attempting protected actions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, LogIn, UserPlus, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function LoginModal({
  isOpen,
  onClose,
  title = 'Sign In Required',
  message = 'Please sign in to continue enjoying MoviesNow',
}: LoginModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    router.push('/auth/login');
  };

  const handleSignup = () => {
    onClose();
    router.push('/auth/signup');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 border-b border-gray-800">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>

          <div className="relative flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">{title}</h2>
          </div>
          <p className="text-gray-400 relative">{message}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
          >
            <LogIn className="h-5 w-5" />
            Sign In to Your Account
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-gray-900 text-gray-500">or</span>
            </div>
          </div>

          {/* Signup Button */}
          <button
            onClick={handleSignup}
            className="w-full px-6 py-4 bg-gray-800 border border-gray-700 text-white rounded-xl font-medium hover:bg-gray-750 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            Create New Account
          </button>

          {/* Benefits List */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-sm font-medium text-gray-400 mb-3">With an account, you can:</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 flex-shrink-0 mt-0.5">✓</span>
                <span>Save titles to your watchlist</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 flex-shrink-0 mt-0.5">✓</span>
                <span>Track your watching progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 flex-shrink-0 mt-0.5">✓</span>
                <span>Get personalized recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 flex-shrink-0 mt-0.5">✓</span>
                <span>Download content for offline viewing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 flex-shrink-0 mt-0.5">✓</span>
                <span>Write reviews and rate titles</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing login modal state
export function useLoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{ title?: string; message?: string }>({});

  const openLoginModal = (title?: string, message?: string) => {
    setConfig({ title, message });
    setIsOpen(true);
  };

  const closeLoginModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    openLoginModal,
    closeLoginModal,
    config,
  };
}
