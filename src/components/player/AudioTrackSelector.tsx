'use client';

/**
 * Audio Track Selector Component
 * ================================
 * Allows users to select different audio tracks (languages, commentary, etc.)
 *
 * Best Practices:
 * - Shows all available audio tracks
 * - Indicates current selection
 * - Smooth track switching
 * - Accessible keyboard navigation
 * - Visual feedback for selection
 */

import React from 'react';
import { Check, Volume2 } from 'lucide-react';

export interface AudioTrack {
  id: string;
  label: string;
  language: string;
  languageCode: string;
  type?: 'main' | 'commentary' | 'description';
  channels?: number;
}

interface AudioTrackSelectorProps {
  /** Available audio tracks */
  tracks: AudioTrack[];
  /** Currently selected track ID */
  selectedTrackId: string;
  /** Callback when track is selected */
  onSelectTrack: (trackId: string) => void;
  /** Whether the selector is open */
  isOpen: boolean;
  /** Callback to close the selector */
  onClose: () => void;
}

export function AudioTrackSelector({
  tracks,
  selectedTrackId,
  onSelectTrack,
  isOpen,
  onClose,
}: AudioTrackSelectorProps) {
  const handleSelectTrack = (trackId: string) => {
    onSelectTrack(trackId);
    onClose();
  };

  const getTrackIcon = (type?: string) => {
    switch (type) {
      case 'commentary':
        return '💬';
      case 'description':
        return '🔊';
      default:
        return '🎵';
    }
  };

  const getChannelLabel = (channels?: number) => {
    if (!channels) return '';
    switch (channels) {
      case 2:
        return 'Stereo';
      case 6:
        return '5.1 Surround';
      case 8:
        return '7.1 Surround';
      default:
        return `${channels} channels`;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Selector Menu */}
      <div
        className="absolute bottom-full right-0 z-50 mb-2 w-80 rounded-lg border border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl"
        role="menu"
        aria-label="Audio track selector"
      >
        {/* Header */}
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-white" />
            <h3 className="text-sm font-semibold text-white">Audio Tracks</h3>
          </div>
        </div>

        {/* Track List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {tracks.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">No audio tracks available</p>
            </div>
          ) : (
            tracks.map((track) => {
              const isSelected = track.id === selectedTrackId;

              return (
                <button
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  role="menuitem"
                  aria-current={isSelected ? 'true' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" role="img" aria-label={track.type || 'audio'}>
                      {getTrackIcon(track.type)}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{track.label}</p>
                      <p className="mt-0.5 text-xs opacity-75">
                        {track.language}
                        {track.channels && ` • ${getChannelLabel(track.channels)}`}
                        {track.type === 'commentary' && ' • Commentary'}
                        {track.type === 'description' && ' • Audio Description'}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Tip */}
        <div className="border-t border-white/10 px-4 py-2">
          <p className="text-xs text-gray-500">
            Switch between available audio languages and tracks
          </p>
        </div>
      </div>
    </>
  );
}
