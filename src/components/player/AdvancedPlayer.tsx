/**
 * =============================================================================
 * AdvancedPlayer Component
 * =============================================================================
 * Advanced video player with session management, progress tracking, and quality selection
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipForward,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import {
  usePlaybackInfo,
  useStartSession,
  useHeartbeat,
  useEndSession,
  useUpdateProgress,
  useProgress,
} from '@/lib/api/hooks/usePlayer';
import { StreamVariant, SceneMarker } from '@/lib/api/services/player';

interface AdvancedPlayerProps {
  titleId: string;
  episodeId?: string;
  onEnded?: () => void;
  onNext?: () => void;
  autoPlay?: boolean;
}

export default function AdvancedPlayer({
  titleId,
  episodeId,
  onEnded,
  onNext,
  autoPlay = false,
}: AdvancedPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [skipMarker, setSkipMarker] = useState<SceneMarker | null>(null);

  const { data: playbackInfo } = usePlaybackInfo(titleId, episodeId);
  const { data: progress } = useProgress(titleId, episodeId);
  const startSession = useStartSession();
  const heartbeat = useHeartbeat();
  const endSession = useEndSession();
  const updateProgress = useUpdateProgress();

  const variants = playbackInfo?.variants || [];
  const markers = playbackInfo?.markers || [];
  const continueFrom = progress?.progress_seconds || playbackInfo?.continue_from;

  // Auto-hide controls
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    setShowControls(true);

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Initialize player and session
  useEffect(() => {
    if (!playbackInfo || !videoRef.current) return;

    const quality = selectedQuality === 'auto' ? '1080p' : selectedQuality;
    const variant = variants.find((v) => v.quality === quality) || variants[0];

    if (variant) {
      videoRef.current.src = variant.url;

      startSession.mutate(
        {
          title_id: titleId,
          episode_id: episodeId,
          quality: variant.quality,
          device_info: {
            device_type: 'web',
            browser: navigator.userAgent,
          },
        },
        {
          onSuccess: (session) => {
            setSessionId(session.id);
          },
        }
      );

      if (continueFrom && continueFrom > 10) {
        videoRef.current.currentTime = continueFrom;
      }

      if (autoPlay) {
        videoRef.current.play();
      }
    }
  }, [playbackInfo, selectedQuality]);

  // Heartbeat
  useEffect(() => {
    if (!sessionId) return;

    heartbeatIntervalRef.current = setInterval(() => {
      if (videoRef.current && isPlaying) {
        heartbeat.mutate({
          sessionId,
          currentTime: videoRef.current.currentTime,
        });
      }
    }, 30000);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [sessionId, isPlaying]);

  // Progress saving
  useEffect(() => {
    if (!titleId) return;

    progressIntervalRef.current = setInterval(() => {
      if (videoRef.current && isPlaying && duration > 0) {
        updateProgress.mutate({
          title_id: titleId,
          episode_id: episodeId,
          progress_seconds: Math.floor(videoRef.current.currentTime),
          duration_seconds: Math.floor(duration),
        });
      }
    }, 10000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [titleId, episodeId, isPlaying, duration]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (sessionId && videoRef.current) {
        endSession.mutate({
          sessionId,
          finalTime: videoRef.current.currentTime,
        });
      }
    };
  }, [sessionId]);

  // Skip markers
  useEffect(() => {
    if (!markers.length) return;

    const marker = markers.find(
      (m) =>
        currentTime >= m.time_seconds &&
        currentTime < m.time_seconds + (m.duration_seconds || 0)
    );

    setSkipMarker(marker || null);
  }, [currentTime, markers]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  };

  const handleQualityChange = (quality: string) => {
    const currentTime = videoRef.current?.currentTime || 0;
    setSelectedQuality(quality);
    setShowSettings(false);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        if (isPlaying) {
          videoRef.current.play();
        }
      }
    }, 100);
  };

  const handleSkip = () => {
    if (!skipMarker || !videoRef.current) return;
    videoRef.current.currentTime =
      skipMarker.time_seconds + (skipMarker.duration_seconds || 0);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getSkipLabel = (type: string) => {
    if (type.includes('intro')) return 'Skip Intro';
    if (type.includes('recap')) return 'Skip Recap';
    if (type.includes('credits')) return 'Skip Credits';
    return 'Skip';
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden aspect-video"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onLoadedData={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onProgress={(e) => {
          const video = e.currentTarget;
          if (video.buffered.length > 0) {
            setBuffered(video.buffered.end(video.buffered.length - 1));
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-16 w-16 text-white animate-spin" />
        </div>
      )}

      {skipMarker && (
        <div className="absolute bottom-24 right-8 z-20">
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-white/90 hover:bg-white text-black rounded-lg font-bold flex items-center gap-2 transition-all shadow-xl"
          >
            {getSkipLabel(skipMarker.type)}
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
      )}

      {playbackInfo?.next_episode && currentTime > duration - 30 && (
        <div className="absolute bottom-24 right-8 z-20">
          <button
            onClick={onNext}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-xl"
          >
            Next Episode
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="relative h-1.5 bg-gray-700 rounded-full group/progress">
            <div
              className="absolute h-full bg-gray-600 rounded-full"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
            <div
              className="absolute h-full bg-purple-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handlePlayPause} className="p-2 hover:bg-white/20 rounded-full">
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white fill-white" />
              ) : (
                <Play className="h-8 w-8 text-white fill-white" />
              )}
            </button>

            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (videoRef.current) videoRef.current.muted = !isMuted;
              }}
              className="p-2 hover:bg-white/20 rounded-full"
            >
              {isMuted ? (
                <VolumeX className="h-6 w-6 text-white" />
              ) : (
                <Volume2 className="h-6 w-6 text-white" />
              )}
            </button>

            <div className="ml-4">
              <p className="text-white font-semibold">{playbackInfo?.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/20 rounded-full"
              >
                <Settings className="h-6 w-6 text-white" />
              </button>

              {showSettings && (
                <div className="absolute bottom-12 right-0 bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 min-w-[200px] shadow-2xl border border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-400">Quality</p>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-1 hover:bg-gray-800 rounded"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleQualityChange('auto')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
                        selectedQuality === 'auto'
                          ? 'bg-purple-500 text-white'
                          : 'text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <span>Auto</span>
                      {selectedQuality === 'auto' && <Check className="h-4 w-4" />}
                    </button>

                    {variants.map((variant) => (
                      <button
                        key={variant.quality}
                        onClick={() => handleQualityChange(variant.quality)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
                          selectedQuality === variant.quality
                            ? 'bg-purple-500 text-white'
                            : 'text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        <span>{variant.quality}</span>
                        {selectedQuality === variant.quality && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (!containerRef.current) return;
                if (!document.fullscreenElement) {
                  containerRef.current.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
              }}
              className="p-2 hover:bg-white/20 rounded-full"
            >
              <Maximize className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
