/**
 * =============================================================================
 * Mini Player (Picture-in-Picture Style)
 * =============================================================================
 * Floating mini player for multitasking while browsing
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface MiniPlayerProps {
  videoUrl: string;
  title: string;
  episodeInfo?: string;
  onClose: () => void;
  onExpand: () => void;
  initialPosition?: { x: number; y: number };
}

export default function MiniPlayer({
  videoUrl,
  title,
  episodeInfo,
  onClose,
  onExpand,
  initialPosition = { x: 20, y: 20 },
}: MiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Draggable functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition((prev) => ({
        x: Math.max(0, Math.min(window.innerWidth - 400, prev.x + e.movementX)),
        y: Math.max(0, Math.min(window.innerHeight - 250, prev.y + e.movementY)),
      }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed z-[9999] w-[400px] rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Video Container */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            muted={isMuted}
            loop
            className="w-full h-full object-cover"
          />

          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 opacity-0 hover:opacity-100 transition-opacity">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between">
              <div className="flex-1 pr-2">
                <h3 className="text-white font-bold text-sm line-clamp-1">{title}</h3>
                {episodeInfo && (
                  <p className="text-gray-300 text-xs mt-0.5">{episodeInfo}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 text-white" />
                  ) : (
                    <Play className="h-4 w-4 text-white" />
                  )}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-white" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>

              <button
                onClick={onExpand}
                className="p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
                title="Expand to fullscreen"
              >
                <Maximize2 className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 hover:opacity-100">
          <div className="w-full h-full bg-purple-500" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for managing mini player state
export function useMiniPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [titleInfo, setTitleInfo] = useState({ title: '', episodeInfo: '' });

  const openMiniPlayer = (url: string, title: string, episodeInfo?: string) => {
    setVideoUrl(url);
    setTitleInfo({ title, episodeInfo: episodeInfo || '' });
    setIsOpen(true);
  };

  const closeMiniPlayer = () => {
    setIsOpen(false);
    setVideoUrl('');
  };

  return {
    isOpen,
    videoUrl,
    titleInfo,
    openMiniPlayer,
    closeMiniPlayer,
  };
}
