/**
 * =============================================================================
 * Scene Markers UI Component
 * =============================================================================
 * Skip Intro, Skip Recap, Skip Credits buttons with scene marker support
 */

'use client';

import { useState, useEffect } from 'react';
import { SkipForward, X } from 'lucide-react';

export interface SceneMarker {
  type: 'intro' | 'recap' | 'credits' | 'preview';
  start_time_seconds: number;
  end_time_seconds: number;
  label?: string;
}

interface SceneMarkersUIProps {
  markers: SceneMarker[];
  currentTime: number;
  onSkip: (time: number) => void;
  autoSkipEnabled?: boolean;
}

export default function SceneMarkersUI({
  markers,
  currentTime,
  onSkip,
  autoSkipEnabled = false,
}: SceneMarkersUIProps) {
  const [activeMarker, setActiveMarker] = useState<SceneMarker | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [autoSkipCountdown, setAutoSkipCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Find active marker based on current time
    const marker = markers.find(
      (m) =>
        currentTime >= m.start_time_seconds &&
        currentTime <= m.end_time_seconds
    );

    if (marker && marker !== activeMarker) {
      setActiveMarker(marker);
      setIsDismissed(false);

      // Start auto-skip countdown if enabled
      if (autoSkipEnabled) {
        setAutoSkipCountdown(5);
      }
    } else if (!marker) {
      setActiveMarker(null);
      setIsDismissed(false);
      setAutoSkipCountdown(null);
    }
  }, [currentTime, markers, autoSkipEnabled]);

  // Auto-skip countdown
  useEffect(() => {
    if (autoSkipCountdown === null || autoSkipCountdown <= 0) return;

    const timer = setInterval(() => {
      setAutoSkipCountdown((prev) => {
        if (prev === null || prev <= 1) {
          // Auto-skip when countdown reaches 0
          if (activeMarker) {
            handleSkip();
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoSkipCountdown, activeMarker]);

  const handleSkip = () => {
    if (activeMarker) {
      onSkip(activeMarker.end_time_seconds);
      setActiveMarker(null);
      setIsDismissed(true);
      setAutoSkipCountdown(null);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setAutoSkipCountdown(null);
  };

  if (!activeMarker || isDismissed) return null;

  const markerConfig = getMarkerConfig(activeMarker.type);

  return (
    <div className="absolute bottom-24 right-8 animate-slideIn">
      <div
        className={`bg-black/90 backdrop-blur-md border-2 rounded-xl p-4 min-w-[280px] shadow-2xl ${markerConfig.borderColor}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div className={`p-2 rounded-lg ${markerConfig.bgColor}`}>
              {markerConfig.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">{markerConfig.title}</h3>
              <p className="text-sm text-gray-300 mb-3">
                {activeMarker.label || markerConfig.description}
              </p>

              {/* Skip Button */}
              <button
                onClick={handleSkip}
                className={`px-4 py-2 rounded-lg font-bold text-white transition-all transform hover:scale-105 flex items-center gap-2 ${markerConfig.buttonColor}`}
              >
                <SkipForward className="h-4 w-4" />
                {markerConfig.buttonText}
                {autoSkipCountdown !== null && autoSkipCountdown > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {autoSkipCountdown}s
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Progress Bar (shows when marker is active) */}
        <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${markerConfig.progressColor}`}
            style={{
              width: `${
                ((currentTime - activeMarker.start_time_seconds) /
                  (activeMarker.end_time_seconds - activeMarker.start_time_seconds)) *
                100
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function getMarkerConfig(type: SceneMarker['type']) {
  const configs = {
    intro: {
      title: 'Opening Credits',
      description: 'Skip the intro sequence',
      buttonText: 'Skip Intro',
      icon: <SkipForward className="h-5 w-5 text-white" />,
      borderColor: 'border-blue-500/50',
      bgColor: 'bg-blue-500/20',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
      progressColor: 'bg-blue-500',
    },
    recap: {
      title: 'Previously On...',
      description: 'Skip the recap from last episode',
      buttonText: 'Skip Recap',
      icon: <SkipForward className="h-5 w-5 text-white" />,
      borderColor: 'border-purple-500/50',
      bgColor: 'bg-purple-500/20',
      buttonColor: 'bg-purple-500 hover:bg-purple-600',
      progressColor: 'bg-purple-500',
    },
    credits: {
      title: 'Ending Credits',
      description: 'Skip to next episode or finish',
      buttonText: 'Skip Credits',
      icon: <SkipForward className="h-5 w-5 text-white" />,
      borderColor: 'border-green-500/50',
      bgColor: 'bg-green-500/20',
      buttonColor: 'bg-green-500 hover:bg-green-600',
      progressColor: 'bg-green-500',
    },
    preview: {
      title: 'Next Episode Preview',
      description: 'Skip the preview',
      buttonText: 'Skip Preview',
      icon: <SkipForward className="h-5 w-5 text-white" />,
      borderColor: 'border-yellow-500/50',
      bgColor: 'bg-yellow-500/20',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
      progressColor: 'bg-yellow-500',
    },
  };

  return configs[type];
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact Skip Button (Alternative Minimal UI)
// ─────────────────────────────────────────────────────────────────────────────

export function CompactSkipButton({
  marker,
  onSkip,
}: {
  marker: SceneMarker;
  onSkip: () => void;
}) {
  const config = getMarkerConfig(marker.type);

  return (
    <button
      onClick={onSkip}
      className={`absolute bottom-24 right-8 px-6 py-3 rounded-full font-bold text-white shadow-2xl transition-all transform hover:scale-110 animate-slideIn flex items-center gap-2 ${config.buttonColor}`}
    >
      <SkipForward className="h-5 w-5" />
      {config.buttonText}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene Markers Timeline (Visual Timeline Display)
// ─────────────────────────────────────────────────────────────────────────────

export function SceneMarkersTimeline({
  markers,
  duration,
  currentTime,
}: {
  markers: SceneMarker[];
  duration: number;
  currentTime: number;
}) {
  if (duration === 0 || markers.length === 0) return null;

  return (
    <div className="absolute bottom-16 left-0 right-0 px-16">
      <div className="relative h-1">
        {markers.map((marker, index) => {
          const startPercent = (marker.start_time_seconds / duration) * 100;
          const widthPercent =
            ((marker.end_time_seconds - marker.start_time_seconds) / duration) * 100;
          const config = getMarkerConfig(marker.type);

          return (
            <div
              key={index}
              className={`absolute h-2 rounded-full ${config.progressColor} opacity-60 hover:opacity-100 transition-opacity`}
              style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
                top: '-2px',
              }}
              title={`${config.title}: ${formatTime(marker.start_time_seconds)} - ${formatTime(
                marker.end_time_seconds
              )}`}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Format Time
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
