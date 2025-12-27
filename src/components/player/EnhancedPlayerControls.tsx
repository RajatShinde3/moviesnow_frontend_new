/**
 * =============================================================================
 * Enhanced Player Controls
 * =============================================================================
 * Advanced controls for video playback: PiP, playback speed, gestures
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  PictureInPicture2,
  Gauge,
  Zap,
  Check,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

interface EnhancedPlayerControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
}

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function EnhancedPlayerControls({
  videoRef,
  isPlaying,
  currentTime,
  duration,
  onSeek,
  onTogglePlay,
}: EnhancedPlayerControlsProps) {
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedIndicator, setShowSpeedIndicator] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [seekIndicator, setSeekIndicator] = useState<{ time: number; direction: 'forward' | 'backward' } | null>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check PiP support on mount
  useEffect(() => {
    if (typeof document !== 'undefined' && document.pictureInPictureEnabled) {
      setIsPiPSupported(true);
    }
  }, []);

  // Listen for PiP events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => setIsPiPActive(true);
    const handleLeavePiP = () => setIsPiPActive(false);

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [videoRef]);

  // Close speed menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
    };

    if (showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSpeedMenu]);

  // Touch gesture handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setTouchStartX(e.touches[0].clientX);
        setTouchStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && touchStartX !== null && touchStartY !== null) {
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Horizontal swipe for seeking (must be more horizontal than vertical)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          const seekAmount = (deltaX / container.clientWidth) * 60; // Max 60s seek
          const direction = deltaX > 0 ? 'forward' : 'backward';
          setSeekIndicator({ time: Math.abs(seekAmount), direction });
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX !== null && touchStartY !== null) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Horizontal swipe for seeking
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          const seekAmount = (deltaX / container.clientWidth) * 60; // Max 60s seek
          const newTime = Math.max(0, Math.min(duration, currentTime + seekAmount));
          onSeek(newTime);
        }

        // Double tap to skip forward/backward
        // (This would require tracking tap timing - simplified for now)
      }

      setTouchStartX(null);
      setTouchStartY(null);
      setSeekIndicator(null);
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStartX, touchStartY, currentTime, duration, onSeek]);

  // Toggle Picture-in-Picture
  const togglePiP = async () => {
    if (!videoRef.current || !isPiPSupported) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  // Change playback speed
  const changePlaybackRate = (rate: number) => {
    if (!videoRef.current) return;

    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);

    // Show indicator briefly
    setShowSpeedIndicator(true);
    setTimeout(() => setShowSpeedIndicator(false), 2000);
  };

  // Quick skip (10s forward/backward)
  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    onSeek(newTime);

    // Show seek indicator
    setSeekIndicator({
      time: Math.abs(seconds),
      direction: seconds > 0 ? 'forward' : 'backward',
    });
    setTimeout(() => setSeekIndicator(null), 1000);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Touch Gesture Seek Indicator */}
      {seekIndicator && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-sm rounded-2xl px-8 py-6 z-50 animate-in fade-in zoom-in duration-200">
          <div className="flex flex-col items-center gap-3">
            {seekIndicator.direction === 'forward' ? (
              <RotateCw className="h-12 w-12 text-white" />
            ) : (
              <RotateCcw className="h-12 w-12 text-white" />
            )}
            <span className="text-white font-bold text-xl">
              {Math.round(seekIndicator.time)}s
            </span>
          </div>
        </div>
      )}

      {/* Playback Speed Indicator */}
      {showSpeedIndicator && playbackRate !== 1 && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 z-40 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 text-white">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="font-medium">{playbackRate}x</span>
          </div>
        </div>
      )}

      {/* Enhanced Controls Bar */}
      <div className="flex items-center gap-2">
        {/* Skip Backward 10s */}
        <button
          onClick={() => skip(-10)}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors group relative"
          title="Skip backward 10s"
        >
          <RotateCcw className="h-5 w-5 text-white" />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            10s
          </span>
        </button>

        {/* Skip Forward 10s */}
        <button
          onClick={() => skip(10)}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors group relative"
          title="Skip forward 10s"
        >
          <RotateCw className="h-5 w-5 text-white" />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            10s
          </span>
        </button>

        {/* Playback Speed */}
        <div className="relative" ref={speedMenuRef}>
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className={`p-2 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1 ${showSpeedMenu ? 'bg-white/20' : ''}`}
            title="Playback speed"
          >
            <Gauge className="h-5 w-5 text-white" />
            {playbackRate !== 1 && (
              <span className="text-xs font-medium text-white">{playbackRate}x</span>
            )}
          </button>

          {/* Speed Menu */}
          {showSpeedMenu && (
            <div className="absolute bottom-full mb-2 left-0 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-bottom duration-200">
              <div className="py-1 min-w-[120px]">
                <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-700">
                  Playback Speed
                </div>
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                      playbackRate === rate
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <span>
                      {rate}x {rate === 1 && '(Normal)'}
                    </span>
                    {playbackRate === rate && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Picture-in-Picture */}
        {isPiPSupported && (
          <button
            onClick={togglePiP}
            className={`p-2 hover:bg-white/20 rounded-lg transition-colors ${isPiPActive ? 'bg-purple-500/30 text-purple-400' : ''}`}
            title="Picture-in-picture"
          >
            <PictureInPicture2 className="h-5 w-5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
