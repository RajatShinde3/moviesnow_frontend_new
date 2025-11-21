// components/player/EnhancedVideoPlayer.tsx
/**
 * =============================================================================
 * Enhanced Video Player - Netflix-Quality Controls
 * =============================================================================
 * Additional features:
 * - Subtitle selector UI
 * - Audio track selector
 * - Playback speed control (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
 * - Advanced settings menu
 */

"use client";

import * as React from "react";
import { Settings, Subtitles, Languages, Gauge } from "lucide-react";

interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  url?: string;
}

interface AudioTrack {
  id: string;
  language: string;
  label: string;
}

interface PlayerSettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  // Subtitles
  subtitles: SubtitleTrack[];
  currentSubtitle: string | null;
  onSubtitleChange: (id: string | null) => void;
  // Audio tracks
  audioTracks: AudioTrack[];
  currentAudioTrack: string;
  onAudioTrackChange: (id: string) => void;
  // Playback speed
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
  // Quality
  qualities: string[];
  currentQuality: string;
  onQualityChange: (quality: string) => void;
}

export function PlayerSettingsMenu({
  isOpen,
  onClose,
  subtitles,
  currentSubtitle,
  onSubtitleChange,
  audioTracks,
  currentAudioTrack,
  onAudioTrackChange,
  playbackSpeed,
  onPlaybackSpeedChange,
  qualities,
  currentQuality,
  onQualityChange,
}: PlayerSettingsMenuProps) {
  const [activePanel, setActivePanel] = React.useState<
    "main" | "subtitles" | "audio" | "speed" | "quality"
  >("main");

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  if (!isOpen) return null;

  const renderMainMenu = () => (
    <div className="space-y-1">
      <button
        onClick={() => setActivePanel("subtitles")}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/10"
      >
        <div className="flex items-center gap-3">
          <Subtitles className="h-5 w-5" />
          <span>Subtitles</span>
        </div>
        <span className="text-sm text-white/60">
          {currentSubtitle
            ? subtitles.find((s) => s.id === currentSubtitle)?.label
            : "Off"}
        </span>
      </button>

      <button
        onClick={() => setActivePanel("audio")}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/10"
      >
        <div className="flex items-center gap-3">
          <Languages className="h-5 w-5" />
          <span>Audio</span>
        </div>
        <span className="text-sm text-white/60">
          {audioTracks.find((a) => a.id === currentAudioTrack)?.label}
        </span>
      </button>

      <button
        onClick={() => setActivePanel("speed")}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/10"
      >
        <div className="flex items-center gap-3">
          <Gauge className="h-5 w-5" />
          <span>Playback Speed</span>
        </div>
        <span className="text-sm text-white/60">
          {playbackSpeed === 1 ? "Normal" : `${playbackSpeed}x`}
        </span>
      </button>

      <button
        onClick={() => setActivePanel("quality")}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/10"
      >
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5" />
          <span>Quality</span>
        </div>
        <span className="text-sm text-white/60">{currentQuality}</span>
      </button>
    </div>
  );

  const renderSubtitlesMenu = () => (
    <div>
      <button
        onClick={() => setActivePanel("main")}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-white/10"
      >
        <span>←</span>
        <span>Back</span>
      </button>
      <div className="mt-1 space-y-1">
        <button
          onClick={() => {
            onSubtitleChange(null);
            setActivePanel("main");
          }}
          className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/10 ${
            !currentSubtitle ? "bg-white/20" : ""
          }`}
        >
          <span>Off</span>
          {!currentSubtitle && <span className="text-primary">✓</span>}
        </button>
        {subtitles.map((subtitle) => (
          <button
            key={subtitle.id}
            onClick={() => {
              onSubtitleChange(subtitle.id);
              setActivePanel("main");
            }}
            className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/10 ${
              currentSubtitle === subtitle.id ? "bg-white/20" : ""
            }`}
          >
            <span>{subtitle.label}</span>
            {currentSubtitle === subtitle.id && <span className="text-primary">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );

  const renderAudioMenu = () => (
    <div>
      <button
        onClick={() => setActivePanel("main")}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-white/10"
      >
        <span>←</span>
        <span>Back</span>
      </button>
      <div className="mt-1 space-y-1">
        {audioTracks.map((track) => (
          <button
            key={track.id}
            onClick={() => {
              onAudioTrackChange(track.id);
              setActivePanel("main");
            }}
            className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/10 ${
              currentAudioTrack === track.id ? "bg-white/20" : ""
            }`}
          >
            <span>{track.label}</span>
            {currentAudioTrack === track.id && <span className="text-primary">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );

  const renderSpeedMenu = () => (
    <div>
      <button
        onClick={() => setActivePanel("main")}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-white/10"
      >
        <span>←</span>
        <span>Back</span>
      </button>
      <div className="mt-1 space-y-1">
        {playbackSpeeds.map((speed) => (
          <button
            key={speed}
            onClick={() => {
              onPlaybackSpeedChange(speed);
              setActivePanel("main");
            }}
            className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/10 ${
              playbackSpeed === speed ? "bg-white/20" : ""
            }`}
          >
            <span>{speed === 1 ? "Normal" : `${speed}x`}</span>
            {playbackSpeed === speed && <span className="text-primary">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );

  const renderQualityMenu = () => (
    <div>
      <button
        onClick={() => setActivePanel("main")}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-white/10"
      >
        <span>←</span>
        <span>Back</span>
      </button>
      <div className="mt-1 space-y-1">
        <button
          onClick={() => {
            onQualityChange("Auto");
            setActivePanel("main");
          }}
          className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/10 ${
            currentQuality === "Auto" ? "bg-white/20" : ""
          }`}
        >
          <span>Auto</span>
          {currentQuality === "Auto" && <span className="text-primary">✓</span>}
        </button>
        {qualities.map((quality) => (
          <button
            key={quality}
            onClick={() => {
              onQualityChange(quality);
              setActivePanel("main");
            }}
            className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/10 ${
              currentQuality === quality ? "bg-white/20" : ""
            }`}
          >
            <span>{quality}</span>
            {currentQuality === quality && <span className="text-primary">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed bottom-20 right-4 z-50 w-80 overflow-hidden rounded-lg border border-white/10 bg-black/95 text-white shadow-2xl backdrop-blur-xl">
        {activePanel === "main" && renderMainMenu()}
        {activePanel === "subtitles" && renderSubtitlesMenu()}
        {activePanel === "audio" && renderAudioMenu()}
        {activePanel === "speed" && renderSpeedMenu()}
        {activePanel === "quality" && renderQualityMenu()}
      </div>
    </>
  );
}

// Hook to use enhanced player features
export function useEnhancedPlayerControls(videoRef: React.RefObject<HTMLVideoElement>) {
  const [subtitles, setSubtitles] = React.useState<SubtitleTrack[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = React.useState<string | null>(null);
  const [audioTracks, setAudioTracks] = React.useState<AudioTrack[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = React.useState<string>("default");
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);

  // Apply playback speed
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, videoRef]);

  // Apply subtitle track
  const handleSubtitleChange = React.useCallback(
    (subtitleId: string | null) => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      const tracks = video.textTracks;

      // Disable all tracks
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = "hidden";
      }

      // Enable selected track
      if (subtitleId) {
        const selectedTrack = Array.from(tracks).find(
          (track) => track.id === subtitleId || track.language === subtitleId
        );
        if (selectedTrack) {
          selectedTrack.mode = "showing";
        }
      }

      setCurrentSubtitle(subtitleId);
    },
    [videoRef]
  );

  // Load subtitle tracks from video element
  React.useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const loadTracks = () => {
      const tracks = video.textTracks;
      const subtitleList: SubtitleTrack[] = [];

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.kind === "subtitles" || track.kind === "captions") {
          subtitleList.push({
            id: track.id || track.language,
            language: track.language,
            label: track.label || track.language.toUpperCase(),
          });
        }
      }

      setSubtitles(subtitleList);
    };

    video.addEventListener("loadedmetadata", loadTracks);
    loadTracks(); // Try immediately

    return () => {
      video.removeEventListener("loadedmetadata", loadTracks);
    };
  }, [videoRef]);

  return {
    subtitles,
    currentSubtitle,
    onSubtitleChange: handleSubtitleChange,
    audioTracks,
    currentAudioTrack,
    onAudioTrackChange: setCurrentAudioTrack,
    playbackSpeed,
    onPlaybackSpeedChange: setPlaybackSpeed,
  };
}
