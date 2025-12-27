/**
 * =============================================================================
 * Quality Selector Component
 * =============================================================================
 * Advanced quality selection with fallback indication and smart defaults
 */

'use client';

import { useState } from 'react';
import { Settings, Check, Wifi, WifiOff, Sparkles } from 'lucide-react';

export interface QualityOption {
  quality: '480p' | '720p' | '1080p' | '4k' | 'auto';
  label: string;
  bitrate?: number;
  width?: number;
  height?: number;
  isAvailable: boolean;
  isRecommended?: boolean;
}

interface QualitySelectorProps {
  availableQualities: QualityOption[];
  currentQuality: string;
  onQualityChange: (quality: string) => void;
  networkSpeed?: 'slow' | 'medium' | 'fast';
  showBitrate?: boolean;
}

export default function QualitySelector({
  availableQualities,
  currentQuality,
  onQualityChange,
  networkSpeed = 'medium',
  showBitrate = true,
}: QualitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (quality: string) => {
    onQualityChange(quality);
    setIsOpen(false);
  };

  const currentOption = availableQualities.find((q) => q.quality === currentQuality);
  const networkIcon = getNetworkIcon(networkSpeed);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
        title="Quality Settings"
      >
        <Settings className="h-6 w-6 text-white group-hover:rotate-45 transition-transform duration-300" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[280px]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Video Quality</h3>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  {networkIcon}
                  <span>{networkSpeed.charAt(0).toUpperCase() + networkSpeed.slice(1)} Network</span>
                </div>
              </div>
            </div>

            {/* Quality Options */}
            <div className="py-2">
              {availableQualities.map((option) => (
                <button
                  key={option.quality}
                  onClick={() => option.isAvailable && handleSelect(option.quality)}
                  disabled={!option.isAvailable}
                  className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                    option.isAvailable
                      ? 'hover:bg-white/10 cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  } ${
                    currentQuality === option.quality
                      ? 'bg-purple-500/20 border-l-4 border-purple-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Quality Label */}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{option.label}</span>
                        {option.isRecommended && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Recommended
                          </span>
                        )}
                        {!option.isAvailable && (
                          <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
                            Unavailable
                          </span>
                        )}
                      </div>

                      {/* Additional Info */}
                      {showBitrate && option.bitrate && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {option.width && option.height && (
                            <span>{option.width}×{option.height} • </span>
                          )}
                          {formatBitrate(option.bitrate)}
                        </div>
                      )}

                      {/* Fallback Info */}
                      {!option.isAvailable && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          Not available for this content
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Checkmark */}
                  {currentQuality === option.quality && option.isAvailable && (
                    <Check className="h-5 w-5 text-purple-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Footer Info */}
            <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50">
              <p className="text-xs text-gray-400">
                {currentOption?.quality === 'auto'
                  ? 'Quality adjusts automatically based on your connection'
                  : `Streaming in ${currentOption?.label || currentQuality}`}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact Quality Badge (Shows current quality in player controls)
// ─────────────────────────────────────────────────────────────────────────────

export function QualityBadge({
  quality,
  onClick,
}: {
  quality: string;
  onClick?: () => void;
}) {
  const getQualityColor = (q: string) => {
    const colors = {
      '4k': 'from-purple-500 to-purple-600',
      '1080p': 'from-blue-500 to-blue-600',
      '720p': 'from-green-500 to-green-600',
      '480p': 'from-yellow-500 to-orange-500',
      auto: 'from-gray-500 to-gray-600',
    };
    return colors[q as keyof typeof colors] || colors.auto;
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-lg font-bold text-white text-xs bg-gradient-to-r ${getQualityColor(
        quality
      )} hover:scale-110 transition-transform shadow-lg`}
    >
      {quality === 'auto' ? 'AUTO' : quality.toUpperCase()}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quality Change Notification (Toast-style notification on quality change)
// ─────────────────────────────────────────────────────────────────────────────

export function QualityChangeNotification({
  fromQuality,
  toQuality,
  reason,
  onDismiss,
}: {
  fromQuality: string;
  toQuality: string;
  reason?: 'manual' | 'network' | 'buffering';
  onDismiss: () => void;
}) {
  const reasonText = {
    manual: 'Quality changed manually',
    network: 'Quality adjusted for your network',
    buffering: 'Quality reduced to prevent buffering',
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-gray-800 rounded-xl px-6 py-3 shadow-2xl animate-slideDown z-50">
      <div className="flex items-center gap-3">
        <Settings className="h-5 w-5 text-blue-400" />
        <div>
          <p className="text-sm font-medium text-white">
            {fromQuality} → {toQuality}
          </p>
          {reason && (
            <p className="text-xs text-gray-400">{reasonText[reason]}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 p-1 hover:bg-white/10 rounded transition-colors"
        >
          <span className="text-gray-400 text-xs">×</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Network Speed Indicator
// ─────────────────────────────────────────────────────────────────────────────

export function NetworkSpeedIndicator({
  speed,
  bitrate,
}: {
  speed: 'slow' | 'medium' | 'fast';
  bitrate?: number;
}) {
  const getSpeedColor = () => {
    return {
      slow: 'text-red-400',
      medium: 'text-yellow-400',
      fast: 'text-green-400',
    }[speed];
  };

  const getSpeedLabel = () => {
    return {
      slow: 'Slow Connection',
      medium: 'Good Connection',
      fast: 'Fast Connection',
    }[speed];
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {getNetworkIcon(speed)}
      <span className={getSpeedColor()}>{getSpeedLabel()}</span>
      {bitrate && <span className="text-gray-500">• {formatBitrate(bitrate)}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function getNetworkIcon(speed: 'slow' | 'medium' | 'fast') {
  const icons = {
    slow: <WifiOff className="h-4 w-4 text-red-400" />,
    medium: <Wifi className="h-4 w-4 text-yellow-400" />,
    fast: <Wifi className="h-4 w-4 text-green-400" />,
  };
  return icons[speed];
}

function formatBitrate(bitrate: number): string {
  if (bitrate >= 1000000) {
    return `${(bitrate / 1000000).toFixed(1)} Mbps`;
  } else if (bitrate >= 1000) {
    return `${(bitrate / 1000).toFixed(0)} Kbps`;
  }
  return `${bitrate} bps`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Example Quality Options (Default set)
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_QUALITY_OPTIONS: QualityOption[] = [
  {
    quality: 'auto',
    label: 'Auto',
    isAvailable: true,
    isRecommended: true,
  },
  {
    quality: '4k',
    label: '4K Ultra HD',
    width: 3840,
    height: 2160,
    bitrate: 25000000,
    isAvailable: false, // Typically unavailable unless premium
  },
  {
    quality: '1080p',
    label: 'Full HD',
    width: 1920,
    height: 1080,
    bitrate: 8000000,
    isAvailable: true,
  },
  {
    quality: '720p',
    label: 'HD',
    width: 1280,
    height: 720,
    bitrate: 5000000,
    isAvailable: true,
  },
  {
    quality: '480p',
    label: 'SD',
    width: 854,
    height: 480,
    bitrate: 2500000,
    isAvailable: true,
  },
];
