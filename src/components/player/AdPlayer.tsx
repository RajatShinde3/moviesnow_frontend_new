'use client';

import * as React from 'react';
import { Volume2, VolumeX, Crown } from 'lucide-react';

interface AdPlayerProps {
  adConfig: {
    provider: string;
    ad_unit_id?: string;
    duration_seconds: number;
    skip_after_seconds: number;
    custom_video_url?: string;
    custom_click_url?: string;
  };
  onAdComplete: () => void;
  onSkip: () => void;
  onUpgradeClick: () => void;
}

export function AdPlayer({
  adConfig,
  onAdComplete,
  onSkip,
  onUpgradeClick,
}: AdPlayerProps) {
  const [timeRemaining, setTimeRemaining] = React.useState(adConfig.duration_seconds);
  const [canSkip, setCanSkip] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, adConfig.skip_after_seconds * 1000);

    const countdown = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          onAdComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(skipTimer);
      clearInterval(countdown);
    };
  }, [adConfig.skip_after_seconds, onAdComplete]);

  const handleAdClick = () => {
    if (adConfig.custom_click_url) {
      window.open(adConfig.custom_click_url, '_blank');
    }
  };

  const skipTimeRemaining = Math.max(0, adConfig.skip_after_seconds - (adConfig.duration_seconds - timeRemaining));

  return (
    <div className="absolute inset-0 z-50 bg-black">
      {/* Ad Video */}
      {adConfig.custom_video_url ? (
        <video
          ref={videoRef}
          src={adConfig.custom_video_url}
          autoPlay
          muted={isMuted}
          onClick={handleAdClick}
          className="h-full w-full cursor-pointer object-contain"
        />
      ) : (
        // Google AdSense container
        <div className="flex h-full w-full items-center justify-center">
          <div id={`ad-container-${adConfig.ad_unit_id}`} className="h-full w-full">
            {/* AdSense will inject ad here */}
            <p className="text-center text-gray-500">Loading ad...</p>
          </div>
        </div>
      )}

      {/* Ad Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top bar */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black">
              AD
            </span>
            <span className="text-sm text-white">
              {canSkip ? 'Skip available' : `Skip in ${skipTimeRemaining}s`}
            </span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            {/* Skip button */}
            <button
              onClick={onSkip}
              disabled={!canSkip}
              className={`rounded-lg px-6 py-2 font-semibold transition-all ${
                canSkip
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canSkip ? 'Skip Ad' : `Wait ${skipTimeRemaining}s`}
            </button>

            {/* Upgrade prompt */}
            <button
              onClick={onUpgradeClick}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 px-4 py-2 font-semibold text-black hover:from-yellow-500 hover:to-yellow-400"
            >
              <Crown className="h-4 w-4" />
              Remove Ads
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full bg-yellow-500 transition-all duration-1000"
              style={{
                width: `${((adConfig.duration_seconds - timeRemaining) / adConfig.duration_seconds) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
