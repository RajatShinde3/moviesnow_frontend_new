// components/player/VideoPlayerWithAds.tsx
/**
 * =============================================================================
 * Video Player with Ad Integration - Premium-aware streaming player
 * =============================================================================
 * Features:
 * - All base VideoPlayer features
 * - Ad breaks for free users (pre-roll, mid-roll)
 * - Premium upgrade prompts
 * - Quality restrictions based on subscription
 * - Seamless ad-to-content transitions
 */

"use client";

import * as React from "react";
import Hls from "hls.js";
import { api } from "@/lib/api/services";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  Crown,
} from "lucide-react";
import type { PlaybackSession, SceneMarker } from "@/lib/api/types";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAdSchedule, type AdBreak } from "@/hooks/useAdSchedule";
import { AdPlayer } from "./AdPlayer";
import { PremiumUpgradeModal } from "@/components/subscription/PremiumUpgradeModal";

interface VideoPlayerWithAdsProps {
  titleId?: string;
  episodeId?: string;
  quality?: "480p" | "720p" | "1080p" | "4K";
  autoPlay?: boolean;
  onEnded?: () => void;
}

export function VideoPlayerWithAds({
  titleId,
  episodeId,
  quality: requestedQuality = "720p",
  autoPlay = false,
  onEnded,
}: VideoPlayerWithAdsProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const hlsRef = React.useRef<Hls | null>(null);
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Subscription state
  const { isPremium, getMaxQuality, shouldShowAds } = useSubscription();

  // Determine actual quality based on subscription
  const effectiveQuality = React.useMemo(() => {
    const maxQuality = getMaxQuality();
    const qualityOrder = ["480p", "720p", "1080p", "4K"] as const;
    const requestedIndex = qualityOrder.indexOf(requestedQuality as typeof qualityOrder[number]);
    const maxIndex = qualityOrder.indexOf(maxQuality as typeof qualityOrder[number]);

    if (requestedIndex <= maxIndex) {
      return requestedQuality;
    }
    return maxQuality;
  }, [requestedQuality, getMaxQuality]);

  // Player state
  const [session, setSession] = React.useState<PlaybackSession | null>(null);
  const [markers, setMarkers] = React.useState<SceneMarker[]>([]);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [buffered, setBuffered] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showSkipIntro, setShowSkipIntro] = React.useState(false);
  const [selectedQuality, setSelectedQuality] = React.useState(effectiveQuality);

  // Ad state
  const [showAd, setShowAd] = React.useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [pendingAdBreak, setPendingAdBreak] = React.useState<AdBreak | null>(null);

  // Ad schedule hook
  const {
    adSchedule,
    adConfig,
    shouldShowAd,
    markAdAsShown,
    resetAds,
  } = useAdSchedule({
    titleId: titleId || "",
    durationSeconds: duration,
    enabled: shouldShowAds() && !!titleId,
  });

  // Check for ad breaks during playback
  React.useEffect(() => {
    if (isPremium || !shouldShowAds()) return;

    const adBreak = shouldShowAd(currentTime);
    if (adBreak && !showAd) {
      // Pause video and show ad
      videoRef.current?.pause();
      setPendingAdBreak(adBreak);
      setShowAd(true);
    }
  }, [currentTime, isPremium, shouldShowAd, shouldShowAds, showAd]);

  // Handle ad completion
  const handleAdComplete = React.useCallback(() => {
    if (pendingAdBreak) {
      markAdAsShown(pendingAdBreak);
    }
    setShowAd(false);
    setPendingAdBreak(null);
    // Resume video playback
    videoRef.current?.play();
  }, [pendingAdBreak, markAdAsShown]);

  // Handle ad skip
  const handleAdSkip = React.useCallback(() => {
    if (pendingAdBreak) {
      markAdAsShown(pendingAdBreak);
    }
    setShowAd(false);
    setPendingAdBreak(null);
    videoRef.current?.play();
  }, [pendingAdBreak, markAdAsShown]);

  // Initialize playback session
  React.useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        setLoading(true);
        setError(null);
        resetAds(); // Reset ads for new session

        const sessionData = await api.playback.startSession({
          title_id: titleId,
          episode_id: episodeId,
          quality: selectedQuality,
          protocol: "HLS",
        });

        if (!mounted) return;

        setSession(sessionData ?? null);

        if (episodeId && sessionData) {
          const markersData = await api.playback.getMarkers(episodeId);
          if (mounted) {
            setMarkers(markersData || []);
          }
        }
      } catch (err: any) {
        console.error("Failed to start playback session:", err);
        if (mounted) {
          setError(err?.message || "Failed to load video");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    return () => {
      mounted = false;
    };
  }, [titleId, episodeId, selectedQuality, resetAds]);

  // Initialize HLS.js
  React.useEffect(() => {
    if (!session?.manifest_url || !videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });

      hlsRef.current = hls;

      hls.loadSource(session.manifest_url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // For free users, check if we need pre-roll ad
        if (shouldShowAds() && !isPremium) {
          const preRoll = adSchedule?.ad_breaks.find(b => b.type === 'pre_roll');
          if (preRoll) {
            setPendingAdBreak(preRoll);
            setShowAd(true);
            return; // Don't autoplay until ad is done
          }
        }

        if (autoPlay) {
          video.play().catch(console.error);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS fatal error:", data);
          setError("Playback error occurred");
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = session.manifest_url;
      if (autoPlay && (!shouldShowAds() || isPremium)) {
        video.play().catch(console.error);
      }
    } else {
      setError("HLS not supported in this browser");
    }
  }, [session, autoPlay, isPremium, shouldShowAds, adSchedule]);

  // Progress tracking & heartbeat
  React.useEffect(() => {
    if (!session) return;

    progressIntervalRef.current = setInterval(async () => {
      if (videoRef.current && session.session_id) {
        const currentTime = videoRef.current.currentTime;

        try {
          await api.playback.heartbeat(session.session_id, {
            current_time_seconds: currentTime,
            buffer_health: videoRef.current.buffered.length > 0
              ? videoRef.current.buffered.end(0) - currentTime
              : 0,
          });
        } catch (error) {
          console.error("Heartbeat failed:", error);
        }
      }
    }, 30000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [session]);

  // Check for intro/credits markers
  React.useEffect(() => {
    const introMarker = markers.find((m) => m.type === "INTRO");
    if (!introMarker) return;

    const checkIntro = () => {
      if (
        currentTime >= introMarker.start_time_seconds &&
        currentTime <= introMarker.end_time_seconds
      ) {
        setShowSkipIntro(true);
      } else {
        setShowSkipIntro(false);
      }
    };

    checkIntro();
  }, [currentTime, markers]);

  // Video event handlers
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      setBuffered(videoRef.current.buffered.end(0));
    }
  };
  const handleEnded = async () => {
    setIsPlaying(false);
    if (session?.session_id) {
      await api.playback.endSession(session.session_id, currentTime);
    }
    onEnded?.();
  };

  // Control handlers
  const togglePlayPause = React.useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  const toggleMute = React.useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const skipIntro = () => {
    const introMarker = markers.find((m) => m.type === "INTRO");
    if (introMarker && videoRef.current) {
      videoRef.current.currentTime = introMarker.end_time_seconds;
      setShowSkipIntro(false);
    }
  };

  const toggleFullscreen = React.useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Fullscreen change listener
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current || showAd) return; // Disable shortcuts during ads

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlayPause();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 10));
          break;
        case "ArrowRight":
          e.preventDefault();
          handleSeek(Math.min(duration, currentTime + 10));
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, currentTime, duration, volume, showAd, togglePlayPause, toggleMute, toggleFullscreen]);

  // Format time
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-lg font-medium">Failed to load video</p>
          <p className="mt-2 text-sm text-white/70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden bg-black"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="h-full w-full"
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onProgress={handleProgress}
        onEnded={handleEnded}
        playsInline
      />

      {/* Ad Overlay */}
      {showAd && adConfig && (
        <AdPlayer
          adConfig={{
            provider: adConfig.provider || "google_adsense",
            ad_unit_id: adConfig.ad_unit_id,
            duration_seconds: adConfig.duration_seconds || 30,
            skip_after_seconds: pendingAdBreak?.skippable_after || 5,
            custom_video_url: adConfig.custom_video_url,
            custom_click_url: adConfig.custom_click_url,
          }}
          onAdComplete={handleAdComplete}
          onSkip={handleAdSkip}
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />
      )}

      {/* Loading Spinner */}
      {loading && !showAd && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      )}

      {/* Skip Intro Button */}
      {showSkipIntro && !showAd && (
        <button
          onClick={skipIntro}
          className="absolute bottom-24 right-8 rounded-md bg-white/90 px-4 py-2 font-medium text-black transition-opacity hover:bg-white"
        >
          <SkipForward className="mr-2 inline h-4 w-4" />
          Skip Intro
        </button>
      )}

      {/* Premium Badge (for free users) */}
      {!isPremium && !showAd && (
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-600/80 to-yellow-500/80 px-3 py-1 text-xs font-semibold text-black backdrop-blur-sm transition-all hover:from-yellow-500 hover:to-yellow-400"
        >
          <Crown className="h-3 w-3" />
          Go Ad-Free
        </button>
      )}

      {/* Controls */}
      {!showAd && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/30 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              style={{
                background: `linear-gradient(to right, rgb(var(--primary)) 0%, rgb(var(--primary)) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`,
              }}
            />
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between text-white">
            {/* Left Controls */}
            <div className="flex items-center gap-4">
              <button onClick={togglePlayPause} className="hover:text-primary">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" fill="currentColor" />}
              </button>

              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="hover:text-primary">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
              <button className="hover:text-primary">
                <Settings className="h-5 w-5" />
              </button>
              <button onClick={toggleFullscreen} className="hover:text-primary">
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Center Play Button (when paused) */}
      {!isPlaying && !loading && !showAd && (
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="rounded-full bg-white/90 p-6 transition-transform hover:scale-110">
            <Play className="h-12 w-12 text-black" fill="currentColor" />
          </div>
        </button>
      )}

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="ad"
      />
    </div>
  );
}
