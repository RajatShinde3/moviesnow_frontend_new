// components/admin/VideoPreview.tsx
'use client';

import { RefObject } from 'react';
import { motion } from 'framer-motion';
import { VideoMetadata } from '@/types/sceneMarkers';

interface VideoPreviewProps {
  videoRef: RefObject<HTMLVideoElement>;
  videoUrl: string;
  metadata: VideoMetadata;
}

export function VideoPreview({ videoRef, videoUrl, metadata }: VideoPreviewProps) {
  return (
    <div className="bg-background-elevated rounded-lg p-4 border border-white/10">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          controls={false}
        />

        {/* Loading State */}
        {metadata.duration === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/60">Loading video...</p>
            </div>
          </div>
        )}

        {/* Time Overlay */}
        {metadata.duration > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/80 rounded-lg backdrop-blur-sm"
          >
            <span className="text-sm font-mono">
              {Math.floor(metadata.currentTime / 60)}:{(Math.floor(metadata.currentTime % 60)).toString().padStart(2, '0')} / {Math.floor(metadata.duration / 60)}:{(Math.floor(metadata.duration % 60)).toString().padStart(2, '0')}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
