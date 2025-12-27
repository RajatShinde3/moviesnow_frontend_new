/**
 * =============================================================================
 * Maintenance Page
 * =============================================================================
 * Shown during scheduled maintenance or system updates
 */

'use client';

import { useState, useEffect } from 'react';
import { Construction, Clock, Twitter, Mail, CheckCircle } from 'lucide-react';

export default function MaintenancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estimated completion time (replace with actual)
  const estimatedCompletion = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeRemaining = () => {
    const diff = estimatedCompletion.getTime() - currentTime.getTime();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = getTimeRemaining();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center">
        {/* Animated Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50 animate-pulse">
            <Construction className="h-16 w-16 text-white" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -z-10" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          We'll Be Right Back
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          MoviesNow is currently undergoing scheduled maintenance to improve your streaming experience. We'll be back online soon!
        </p>

        {/* Countdown */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="h-6 w-6 text-blue-400" />
            <span className="text-gray-400 text-lg">Estimated Time Remaining</span>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
                {hours.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-500 text-sm font-medium">Hours</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
                {minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-500 text-sm font-medium">Minutes</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
                {seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-500 text-sm font-medium">Seconds</div>
            </div>
          </div>
        </div>

        {/* What's Being Improved */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-8 text-left max-w-2xl mx-auto">
          <h3 className="font-bold text-white mb-6 text-center text-xl">
            What We're Working On
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-white mb-1">Performance Upgrades</h4>
                <p className="text-sm text-gray-400">Faster streaming and smoother playback</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-white mb-1">New Features</h4>
                <p className="text-sm text-gray-400">Exciting updates coming your way</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-white mb-1">Security Updates</h4>
                <p className="text-sm text-gray-400">Enhanced protection for your account</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-white mb-1">Bug Fixes</h4>
                <p className="text-sm text-gray-400">Resolving issues for better experience</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stay Updated */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8 max-w-md mx-auto">
          <h3 className="font-bold text-white mb-4">Stay Updated</h3>
          <p className="text-gray-400 text-sm mb-4">
            Follow us for real-time updates on the maintenance progress
          </p>
          <div className="flex gap-3 justify-center">
            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter
            </button>
            <button className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </button>
          </div>
        </div>

        {/* Thank You Message */}
        <p className="text-gray-500 text-sm">
          Thank you for your patience! We appreciate your understanding.
        </p>
      </div>
    </div>
  );
}
