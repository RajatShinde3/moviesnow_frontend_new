/**
 * =============================================================================
 * Watch Progress Tracker
 * =============================================================================
 * Circular progress indicator with episode/time tracking
 */

'use client';

import { useEffect, useState } from 'react';
import { Play, CheckCircle, Clock } from 'lucide-react';

interface WatchProgressTrackerProps {
  currentTime: number; // in seconds
  duration: number; // in seconds
  episodeNumber?: number;
  totalEpisodes?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WatchProgressTracker({
  currentTime,
  duration,
  episodeNumber,
  totalEpisodes,
  showDetails = true,
  size = 'md',
  className = '',
}: WatchProgressTrackerProps) {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const calculatedProgress = duration > 0 ? (currentTime / duration) * 100 : 0;
    setProgress(Math.min(100, calculatedProgress));
    setIsCompleted(calculatedProgress >= 95); // Mark as completed at 95%
  }, [currentTime, duration]);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const timeRemaining = duration - currentTime;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Circular Progress */}
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background Circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-gray-800"
          />

          {/* Progress Circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="url(#progress-gradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />

          <defs>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Icon/Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isCompleted ? (
            <CheckCircle className={`${iconSizes[size]} text-green-400`} />
          ) : (
            <div className="text-center">
              <div className="text-white font-bold text-lg">{Math.round(progress)}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="flex-1 min-w-0">
          <div className="space-y-1">
            {/* Episode Info */}
            {episodeNumber !== undefined && totalEpisodes !== undefined && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Play className="h-4 w-4" />
                <span>
                  Episode {episodeNumber} of {totalEpisodes}
                </span>
              </div>
            )}

            {/* Time Info */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Time Remaining */}
            {!isCompleted && timeRemaining > 0 && (
              <div className="text-xs text-gray-500">
                {formatTime(timeRemaining)} remaining
              </div>
            )}

            {/* Completion Status */}
            {isCompleted && (
              <div className="flex items-center gap-1.5 text-sm text-green-400 font-medium">
                <CheckCircle className="h-4 w-4" />
                <span>Completed</span>
              </div>
            )}
          </div>

          {/* Progress Bar (alternative view) */}
          <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for cards
export function CompactProgressIndicator({
  progress,
  className = '',
}: {
  progress: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      {progress >= 95 && (
        <div className="absolute -top-1 right-0">
          <CheckCircle className="h-4 w-4 text-green-400" />
        </div>
      )}
    </div>
  );
}
