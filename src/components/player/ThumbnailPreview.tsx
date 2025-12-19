'use client';

/**
 * Thumbnail Preview Component
 * ============================
 * Shows thumbnail preview when hovering over the progress bar
 * Uses sprite sheet for performance (single image with multiple thumbnails)
 *
 * Best Practices:
 * - Lazy loads sprite sheet
 * - Calculates position from timestamp
 * - Smooth positioning with CSS transforms
 * - Accessible with ARIA labels
 */

import React, { useState, useEffect } from 'react';

interface ThumbnailPreviewProps {
  /** Timestamp in seconds to show thumbnail for */
  timestamp: number;
  /** Duration of video in seconds */
  duration: number;
  /** Sprite sheet URL (single image with multiple thumbnails) */
  spriteUrl?: string;
  /** Number of columns in sprite sheet */
  spriteColumns?: number;
  /** Number of rows in sprite sheet */
  spriteRows?: number;
  /** Width of each thumbnail in pixels */
  thumbnailWidth?: number;
  /** Height of each thumbnail in pixels */
  thumbnailHeight?: number;
  /** Position from left in pixels */
  positionX: number;
  /** Whether to show the preview */
  visible: boolean;
}

export function ThumbnailPreview({
  timestamp,
  duration,
  spriteUrl,
  spriteColumns = 10,
  spriteRows = 10,
  thumbnailWidth = 160,
  thumbnailHeight = 90,
  positionX,
  visible,
}: ThumbnailPreviewProps) {
  const [spriteLoaded, setSpriteLoaded] = useState(false);

  // Calculate which thumbnail to show from sprite sheet
  const totalThumbnails = spriteColumns * spriteRows;
  const thumbnailIndex = Math.floor((timestamp / duration) * totalThumbnails);
  const row = Math.floor(thumbnailIndex / spriteColumns);
  const col = thumbnailIndex % spriteColumns;

  // Calculate background position
  const backgroundPositionX = -col * thumbnailWidth;
  const backgroundPositionY = -row * thumbnailHeight;

  // Format timestamp for display
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Preload sprite sheet
  useEffect(() => {
    if (!spriteUrl) return;

    const img = new Image();
    img.onload = () => setSpriteLoaded(true);
    img.onerror = () => setSpriteLoaded(false);
    img.src = spriteUrl;
  }, [spriteUrl]);

  if (!visible || !spriteUrl) return null;

  // Calculate position (center on cursor, but keep within bounds)
  const previewLeft = Math.max(
    10,
    Math.min(positionX - thumbnailWidth / 2, window.innerWidth - thumbnailWidth - 10)
  );

  return (
    <div
      className="pointer-events-none absolute z-50 transition-opacity duration-150"
      style={{
        bottom: '100%',
        left: `${previewLeft}px`,
        marginBottom: '16px',
        opacity: spriteLoaded ? 1 : 0,
      }}
      role="tooltip"
      aria-label={`Preview at ${formatTime(timestamp)}`}
    >
      {/* Thumbnail Container */}
      <div className="relative rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
        {/* Sprite Sheet Background */}
        {spriteLoaded ? (
          <div
            className="bg-no-repeat"
            style={{
              width: `${thumbnailWidth}px`,
              height: `${thumbnailHeight}px`,
              backgroundImage: `url(${spriteUrl})`,
              backgroundPosition: `${backgroundPositionX}px ${backgroundPositionY}px`,
              backgroundSize: `${spriteColumns * thumbnailWidth}px ${spriteRows * thumbnailHeight}px`,
            }}
          />
        ) : (
          <div
            className="flex items-center justify-center bg-gray-800"
            style={{
              width: `${thumbnailWidth}px`,
              height: `${thumbnailHeight}px`,
            }}
          >
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}

        {/* Timestamp Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1">
          <p className="text-center text-xs font-semibold text-white">
            {formatTime(timestamp)}
          </p>
        </div>
      </div>

      {/* Pointer Arrow */}
      <div className="absolute left-1/2 top-full -translate-x-1/2">
        <div className="h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-white/20" />
      </div>
    </div>
  );
}
