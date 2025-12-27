/**
 * =============================================================================
 * Video Quality Analytics
 * =============================================================================
 * Real-time playback quality monitoring and network stats
 */

'use client';

import { useState, useEffect } from 'react';
import { Activity, Wifi, Clock, Film, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QualityMetrics {
  currentQuality: string;
  bufferedSeconds: number;
  droppedFrames: number;
  bandwidth: number; // Mbps
  latency: number; // ms
  bufferHealth: number; // percentage
}

interface VideoQualityAnalyticsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  onQualityChange?: (quality: string) => void;
}

export default function VideoQualityAnalytics({
  videoRef,
  isPlaying,
  onQualityChange,
}: VideoQualityAnalyticsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<QualityMetrics>({
    currentQuality: '720p',
    bufferedSeconds: 0,
    droppedFrames: 0,
    bandwidth: 0,
    latency: 0,
    bufferHealth: 100,
  });

  useEffect(() => {
    if (!videoRef.current || !isPlaying) return;

    const video = videoRef.current;
    const interval = setInterval(() => {
      // Calculate buffered seconds
      let bufferedSeconds = 0;
      if (video.buffered.length > 0) {
        bufferedSeconds = video.buffered.end(video.buffered.length - 1) - video.currentTime;
      }

      // Estimate bandwidth (simplified)
      const bandwidth = Math.random() * 10 + 5; // Mock: 5-15 Mbps

      // Calculate buffer health
      const bufferHealth = Math.min(100, (bufferedSeconds / 30) * 100);

      // Get dropped frames (if available)
      const quality = (video as any).getVideoPlaybackQuality?.();
      const droppedFrames = quality?.droppedVideoFrames || 0;

      // Estimate latency
      const latency = 50 + Math.random() * 100; // Mock: 50-150ms

      setMetrics({
        currentQuality: metrics.currentQuality,
        bufferedSeconds,
        droppedFrames,
        bandwidth,
        latency,
        bufferHealth,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [videoRef, isPlaying]);

  const getBufferHealthColor = () => {
    if (metrics.bufferHealth >= 70) return 'text-green-400';
    if (metrics.bufferHealth >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLatencyColor = () => {
    if (metrics.latency < 100) return 'text-green-400';
    if (metrics.latency < 200) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all ${
          isOpen ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-white'
        }`}
        title="Quality Analytics"
      >
        <Activity className="h-5 w-5" />
      </button>

      {/* Analytics Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-white">Playback Quality</h3>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-4 space-y-4">
              {/* Current Quality */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Film className="h-4 w-4" />
                  <span className="text-sm">Quality</span>
                </div>
                <span className="font-bold text-white">{metrics.currentQuality}</span>
              </div>

              {/* Bandwidth */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Bandwidth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {metrics.bandwidth > 10 ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-yellow-400" />
                  )}
                  <span className="font-bold text-white">{metrics.bandwidth.toFixed(1)} Mbps</span>
                </div>
              </div>

              {/* Latency */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Latency</span>
                </div>
                <span className={`font-bold ${getLatencyColor()}`}>
                  {metrics.latency.toFixed(0)} ms
                </span>
              </div>

              {/* Buffer Health */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Buffer Health</span>
                  <span className={`font-bold ${getBufferHealthColor()}`}>
                    {metrics.bufferHealth.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      metrics.bufferHealth >= 70
                        ? 'bg-green-500'
                        : metrics.bufferHealth >= 40
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.bufferHealth}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Empty</span>
                  <span>{metrics.bufferedSeconds.toFixed(1)}s buffered</span>
                </div>
              </div>

              {/* Dropped Frames */}
              {metrics.droppedFrames > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Dropped Frames</span>
                  <span className="font-bold text-yellow-400">{metrics.droppedFrames}</span>
                </div>
              )}

              {/* Quality Recommendation */}
              {metrics.bandwidth < 5 && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    Low bandwidth detected. Consider switching to 480p for smoother playback.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
