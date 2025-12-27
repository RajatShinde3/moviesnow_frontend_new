// components/admin/SceneMarkerTimeline.tsx
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  FastForward, Rewind, SkipForward as IntroIcon,
  RefreshCw, PlayCircle, Film, Eye, Sparkles
} from 'lucide-react';
import { SceneMarkers, MarkerType, MarkerRange, MarkerConfig } from '@/types/sceneMarkers';
import { MarkerHandle } from './MarkerHandle';

interface SceneMarkerTimelineProps {
  markers: SceneMarkers | null;
  duration: number;
  currentTime: number;
  onUpdateMarker: (type: MarkerType, range: MarkerRange) => void;
  onSeek: (time: number) => void;
  onJumpToMarker: (time: number) => void;
}

const MARKER_CONFIGS: Record<MarkerType, MarkerConfig> = {
  intro: {
    type: 'intro',
    label: 'Intro/Opening',
    color: '#3b82f6',
    icon: IntroIcon,
    description: 'Opening sequence/intro',
    skipByDefault: true,
    showInTimeline: true
  },
  recap: {
    type: 'recap',
    label: 'Recap',
    color: '#8b5cf6',
    icon: RefreshCw,
    description: 'Previously on...',
    skipByDefault: true,
    showInTimeline: true
  },
  opening: {
    type: 'opening',
    label: 'Opening Theme',
    color: '#ec4899',
    icon: PlayCircle,
    description: 'Anime opening song',
    skipByDefault: true,
    showInTimeline: true
  },
  ending: {
    type: 'ending',
    label: 'Ending Theme',
    color: '#f59e0b',
    icon: Film,
    description: 'Anime ending song',
    skipByDefault: false,
    showInTimeline: true
  },
  preview: {
    type: 'preview',
    label: 'Preview',
    color: '#10b981',
    icon: Eye,
    description: 'Next episode preview',
    skipByDefault: false,
    showInTimeline: true
  },
  credits: {
    type: 'credits',
    label: 'Credits',
    color: '#6b7280',
    icon: FastForward,
    description: 'End credits',
    skipByDefault: false,
    showInTimeline: true
  }
};

export function SceneMarkerTimeline({
  markers,
  duration,
  currentTime,
  onUpdateMarker,
  onSeek,
  onJumpToMarker
}: SceneMarkerTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState<MarkerType | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, visible: false });

  // Convert time to position
  const timeToPosition = useCallback((time: number): number => {
    if (duration === 0) return 0;
    return (time / duration) * 100;
  }, [duration]);

  // Convert position to time
  const positionToTime = useCallback((x: number): number => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  }, [duration]);

  // Handle timeline click
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = positionToTime(x);
    onSeek(time);
  }, [positionToTime, onSeek]);

  // Handle playhead drag
  const handlePlayheadDrag = useCallback((e: MouseEvent) => {
    if (!isDraggingPlayhead || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = positionToTime(x);
    onSeek(time);
  }, [isDraggingPlayhead, positionToTime, onSeek]);

  // Start playhead drag
  const startPlayheadDrag = useCallback(() => {
    setIsDraggingPlayhead(true);
  }, []);

  // End playhead drag
  const endPlayheadDrag = useCallback(() => {
    setIsDraggingPlayhead(false);
  }, []);

  // Handle mouse move for tooltip
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = positionToTime(x);
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    setTooltipPosition({
      x: e.clientX - rect.left,
      y: -40,
      visible: true
    });
  }, [positionToTime]);

  const handleMouseLeave = useCallback(() => {
    setTooltipPosition(prev => ({ ...prev, visible: false }));
  }, []);

  // Attach drag listeners
  useEffect(() => {
    if (isDraggingPlayhead) {
      document.addEventListener('mousemove', handlePlayheadDrag);
      document.addEventListener('mouseup', endPlayheadDrag);
      return () => {
        document.removeEventListener('mousemove', handlePlayheadDrag);
        document.removeEventListener('mouseup', endPlayheadDrag);
      };
    }
  }, [isDraggingPlayhead, handlePlayheadDrag, endPlayheadDrag]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Render marker ranges
  const renderMarkerRanges = () => {
    if (!markers) return null;

    return Object.entries(MARKER_CONFIGS).map(([key, config]) => {
      const markerType = key as MarkerType;
      const range = markers[markerType];
      if (!range || !config.showInTimeline) return null;

      const startPos = timeToPosition(range.start);
      const endPos = timeToPosition(range.end);
      const width = endPos - startPos;
      const isHovered = hoveredMarker === markerType;

      return (
        <motion.div
          key={markerType}
          className="absolute h-full rounded-lg cursor-pointer overflow-hidden"
          style={{
            left: `${startPos}%`,
            width: `${width}%`,
            backgroundColor: `${config.color}30`,
            borderTop: `3px solid ${config.color}`,
            borderBottom: `3px solid ${config.color}`,
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          whileHover={{
            backgroundColor: `${config.color}50`,
            scale: 1.02,
            zIndex: 10
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => {
            e.stopPropagation();
            onJumpToMarker(range.start);
          }}
          onMouseEnter={() => setHoveredMarker(markerType)}
          onMouseLeave={() => setHoveredMarker(null)}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent, ${config.color}40, transparent)`
            }}
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          {/* Label */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm border"
                  style={{
                    backgroundColor: `${config.color}90`,
                    borderColor: config.color
                  }}
                >
                  {config.label}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glow effect on hover */}
          {isHovered && (
            <motion.div
              className="absolute inset-0"
              style={{
                boxShadow: `0 0 20px ${config.color}80, inset 0 0 20px ${config.color}40`
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </motion.div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Timeline */}
      <div className="bg-gradient-to-br from-background-elevated to-background-hover rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-primary" />
            Timeline Editor
          </h3>
          <div className="text-sm text-white/60 font-mono">
            Duration: {formatTime(duration)}
          </div>
        </div>

        <div
          ref={timelineRef}
          className="relative h-20 bg-black/30 rounded-xl cursor-pointer overflow-hidden border border-white/5 shadow-inner"
          onClick={handleTimelineClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-white/10"
                style={{ left: `${(i / 20) * 100}%` }}
              />
            ))}
          </div>

          {/* Marker Ranges */}
          <div className="absolute inset-0">
            {renderMarkerRanges()}
          </div>

          {/* Progress Fill */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 pointer-events-none"
            style={{ width: `${timeToPosition(currentTime)}%` }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          />

          {/* Playhead */}
          <motion.div
            className="absolute top-0 h-full w-1 bg-accent-primary z-20 cursor-grab active:cursor-grabbing"
            style={{ left: `${timeToPosition(currentTime)}%` }}
            onMouseDown={startPlayheadDrag}
            drag="x"
            dragConstraints={timelineRef}
            dragElastic={0}
            whileHover={{ scaleX: 1.5 }}
          >
            {/* Top Handle */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-4 h-4 bg-accent-primary rounded-full shadow-lg shadow-accent-primary/50 border-2 border-white cursor-grab active:cursor-grabbing"
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="absolute inset-0 rounded-full bg-accent-primary animate-ping opacity-75" />
            </motion.div>

            {/* Bottom Handle */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-4 h-4 bg-accent-primary rounded-full shadow-lg shadow-accent-primary/50 border-2 border-white cursor-grab active:cursor-grabbing"
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="absolute inset-0 rounded-full bg-accent-primary animate-ping opacity-75" />
            </motion.div>

            {/* Time Label */}
            <motion.div
              className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-accent-primary text-white text-xs font-mono font-semibold rounded-lg shadow-lg whitespace-nowrap"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {formatTime(currentTime)}
            </motion.div>
          </motion.div>

          {/* Hover Tooltip */}
          <AnimatePresence>
            {tooltipPosition.visible && !isDraggingPlayhead && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-mono rounded pointer-events-none border border-white/20"
                style={{
                  left: tooltipPosition.x,
                  top: tooltipPosition.y,
                  transform: 'translateX(-50%)'
                }}
              >
                {formatTime(positionToTime(tooltipPosition.x))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Time Markers */}
        <div className="flex justify-between text-xs text-white/40 mt-3 font-mono px-1">
          {[0, 0.25, 0.5, 0.75, 1].map((percentage) => {
            const time = duration * percentage;
            return (
              <motion.span
                key={percentage}
                whileHover={{ scale: 1.2, color: '#fff' }}
                className="cursor-pointer"
                onClick={() => onSeek(time)}
              >
                {formatTime(time)}
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* Marker Handles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(MARKER_CONFIGS).map(([key, config]) => {
          const markerType = key as MarkerType;
          const range = markers?.[markerType];

          return (
            <MarkerHandle
              key={markerType}
              config={config}
              range={range}
              currentTime={currentTime}
              onUpdate={(newRange) => onUpdateMarker(markerType, newRange)}
            />
          );
        })}
      </div>

      {/* Legend */}
      <motion.div
        className="bg-background-elevated rounded-xl p-4 border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="text-sm font-semibold mb-3 text-white/80">Marker Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(MARKER_CONFIGS).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-white/60">{config.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
