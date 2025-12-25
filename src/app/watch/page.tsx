"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Loader2,
  Check,
  ChevronDown,
  Download,
  Share2,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";

// ============================================================================
// ULTRA-PREMIUM VIDEO PLAYER PAGE
// ============================================================================

interface VideoMetadata {
  title: string;
  episode?: string;
  duration: number;
  currentTime: number;
  qualities: Array<{ label: string; value: string }>;
  subtitles: Array<{ label: string; value: string }>;
}

export default function WatchPage() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(100);
  const [showControls, setShowControls] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [selectedQuality, setSelectedQuality] = React.useState("1080p");
  const [showQualityMenu, setShowQualityMenu] = React.useState(false);
  const [buffering, setBuffering] = React.useState(false);
  const [isPremium, setIsPremium] = React.useState(false);
  const [adCountdown, setAdCountdown] = React.useState(0);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Auto-hide controls after 3 seconds
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = (currentTime / duration) * 100;

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player Container */}
      <div
        ref={containerRef}
        className="relative w-full h-screen bg-black overflow-hidden"
        onMouseMove={resetControlsTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video Element */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full bg-black">
            {/* Placeholder for video - Replace with actual <video> element */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              <Image
                src="https://ui-avatars.com/api/?name=Dune+Part+Two&size=1200&background=1a1a2e&color=fff&bold=true&font-size=0.15"
                alt="Video Placeholder"
                fill
                className="object-cover opacity-40"
                unoptimized
              />
              {buffering && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-16 h-16 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Click to Play/Pause Overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
            >
              <AnimatePresence>
                {!isPlaying && !showControls && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-4 border-white hover:bg-white/30 flex items-center justify-center transition-all shadow-2xl"
                  >
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Ad Countdown Overlay (Free Users) */}
            {!isPremium && adCountdown > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40"
              >
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-8 border-white/20 border-t-red-600 animate-spin mx-auto mb-6" />
                  <p className="text-white text-2xl font-bold mb-2">Ad will finish in</p>
                  <p className="text-6xl font-black text-red-600 mb-4">{adCountdown}</p>
                  <p className="text-gray-400 text-lg">
                    Upgrade to Premium for ad-free experience
                  </p>
                </div>
              </motion.div>
            )}

            {/* Top Gradient */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/50 to-transparent pointer-events-none z-10" />

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />

            {/* Top Bar */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  className="absolute top-0 left-0 right-0 p-6 z-20 flex items-center justify-between"
                >
                  <div>
                    <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Dune: Part Two</h1>
                    <p className="text-gray-300 text-sm">2024 • PG-13 • 2h 46m • Action, Sci-Fi</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Controls */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="absolute bottom-0 left-0 right-0 z-20"
                >
                  {/* Progress Bar */}
                  <div className="px-6 pb-4">
                    <div className="relative group/progress">
                      <div className="h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all">
                        <motion.div
                          className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full relative"
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                        </motion.div>
                      </div>
                      {/* Time Tooltip */}
                      <div className="absolute -top-10 left-0 hidden group-hover/progress:block px-3 py-1 bg-white/90 backdrop-blur-sm rounded text-black text-xs font-semibold">
                        {formatTime(currentTime)}
                      </div>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="px-6 pb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Play/Pause */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-all shadow-xl"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-black" fill="black" />
                        ) : (
                          <Play className="w-6 h-6 text-black ml-0.5" fill="black" />
                        )}
                      </motion.button>

                      {/* Skip Back */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all"
                      >
                        <SkipBack className="w-5 h-5 text-white" />
                      </motion.button>

                      {/* Skip Forward */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all"
                      >
                        <SkipForward className="w-5 h-5 text-white" />
                      </motion.button>

                      {/* Volume */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={toggleMute}
                          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-5 h-5 text-white" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-white" />
                          )}
                        </motion.button>

                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-24 accent-red-600 cursor-pointer"
                        />
                      </div>

                      {/* Time Display */}
                      <div className="text-white text-sm font-semibold hidden md:block">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quality Selector */}
                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowQualityMenu(!showQualityMenu)}
                          className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-semibold text-sm flex items-center gap-2 transition-all"
                        >
                          <Settings className="w-4 h-4" />
                          <span>{selectedQuality}</span>
                          <ChevronDown className="w-4 h-4" />
                        </motion.button>

                        <AnimatePresence>
                          {showQualityMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute bottom-full mb-2 right-0 w-40 bg-black/95 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden shadow-2xl"
                            >
                              {["Auto", "1080p", "720p", "480p"].map((quality) => (
                                <button
                                  key={quality}
                                  onClick={() => {
                                    setSelectedQuality(quality);
                                    setShowQualityMenu(false);
                                  }}
                                  className="w-full px-4 py-2.5 text-left hover:bg-white/10 text-white text-sm font-medium transition-colors flex items-center justify-between"
                                >
                                  <span>{quality}</span>
                                  {selectedQuality === quality && (
                                    <Check className="w-4 h-4 text-red-600" />
                                  )}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Fullscreen */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleFullscreen}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all"
                      >
                        {isFullscreen ? (
                          <Minimize className="w-5 h-5 text-white" />
                        ) : (
                          <Maximize className="w-5 h-5 text-white" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Below Player Content */}
      <div className="bg-black px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Title & Actions */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Dune: Part Two</h2>
              <p className="text-gray-400 text-lg mb-4">
                Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">86%</span>
                  </div>
                  <span className="text-white font-semibold">Match</span>
                </div>
                <span className="text-gray-400">2024</span>
                <span className="px-3 py-1 border border-white/50 text-white text-sm font-bold rounded">PG-13</span>
                <span className="text-gray-400">2h 46m</span>
                <span className="px-3 py-1 bg-white/10 text-white text-sm font-bold rounded">HD</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full border-2 border-white/50 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all"
              >
                <ThumbsUp className="w-6 h-6 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full border-2 border-white/50 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all"
              >
                <Download className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Cast & Crew */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-3">Cast</h3>
              <p className="text-gray-400">
                Timothée Chalamet, Zendaya, Rebecca Ferguson, Josh Brolin, Austin Butler
              </p>
            </div>
            <div>
              <h3 className="text-white text-xl font-bold mb-3">Genres</h3>
              <p className="text-gray-400">Action, Adventure, Science Fiction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
