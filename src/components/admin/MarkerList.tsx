// components/admin/MarkerList.tsx
'use client';

import { motion } from 'framer-motion';
import { Play, Trash2 } from 'lucide-react';
import { SceneMarkers, MarkerType } from '@/types/sceneMarkers';

interface MarkerListProps {
  markers: SceneMarkers | null;
  currentTime: number;
  onUpdateMarker: (type: MarkerType, range: any) => void;
  onClearMarker: (type: MarkerType) => void;
  onJumpTo: (time: number) => void;
}

export function MarkerList({
  markers,
  currentTime,
  onClearMarker,
  onJumpTo
}: MarkerListProps) {
  if (!markers) return null;

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const markerEntries = Object.entries(markers).filter(
    ([key, value]) => value && typeof value === 'object' && 'start' in value
  );

  if (markerEntries.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        <p>No markers set yet</p>
      </div>
    );
  }

  return (
    <div className="bg-background-elevated rounded-lg p-4 border border-white/10">
      <h3 className="text-lg font-semibold mb-4">Active Markers</h3>
      <div className="space-y-2">
        {markerEntries.map(([key, range]: [string, any]) => (
          <motion.div
            key={key}
            layout
            className="flex items-center justify-between p-3 bg-background-hover rounded-lg hover:bg-white/5 transition-all"
          >
            <div className="flex-grow">
              <h4 className="font-medium capitalize">{key}</h4>
              <p className="text-sm text-white/60 font-mono">
                {formatTime(range.start)} - {formatTime(range.end)} ({formatTime(range.end - range.start)})
              </p>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => onJumpTo(range.start)}
                className="p-2 bg-accent-primary/20 text-accent-primary rounded-lg hover:bg-accent-primary/30 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Jump to start"
              >
                <Play className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => onClearMarker(key as MarkerType)}
                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Remove marker"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
