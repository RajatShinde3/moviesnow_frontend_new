/**
 * =============================================================================
 * Episode Selection Modal
 * =============================================================================
 * UI for selecting specific episodes when creating/downloading bundles
 */

'use client';

import { useState, useMemo } from 'react';
import { X, Check, CheckSquare, Square, Download, Play, Clock } from 'lucide-react';

interface Episode {
  id: string;
  episode_number: number;
  season_number: number;
  title: string;
  description?: string;
  duration_minutes?: number;
  thumbnail_url?: string;
  file_size_bytes?: number;
}

interface EpisodeSelectionModalProps {
  episodes: Episode[];
  titleName: string;
  onConfirm: (selectedEpisodeIds: string[]) => void;
  onCancel: () => void;
  maxSelection?: number;
  preSelectedIds?: string[];
  isLoading?: boolean;
}

export default function EpisodeSelectionModal({
  episodes,
  titleName,
  onConfirm,
  onCancel,
  maxSelection,
  preSelectedIds = [],
  isLoading = false,
}: EpisodeSelectionModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(preSelectedIds));
  const [seasonFilter, setSeasonFilter] = useState<number | 'all'>('all');

  // Group episodes by season
  const episodesBySeason = useMemo(() => {
    const grouped = new Map<number, Episode[]>();
    episodes.forEach((ep) => {
      if (!grouped.has(ep.season_number)) {
        grouped.set(ep.season_number, []);
      }
      grouped.get(ep.season_number)!.push(ep);
    });
    return grouped;
  }, [episodes]);

  const seasons = Array.from(episodesBySeason.keys()).sort((a, b) => a - b);

  const filteredEpisodes =
    seasonFilter === 'all'
      ? episodes
      : episodesBySeason.get(seasonFilter) || [];

  const toggleEpisode = (episodeId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(episodeId)) {
        newSet.delete(episodeId);
      } else {
        if (maxSelection && newSet.size >= maxSelection) {
          return prev; // Don't add if max reached
        }
        newSet.add(episodeId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredEpisodes.length) {
      // Deselect all in current view
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        filteredEpisodes.forEach((ep) => newSet.delete(ep.id));
        return newSet;
      });
    } else {
      // Select all in current view
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        filteredEpisodes.forEach((ep) => {
          if (!maxSelection || newSet.size < maxSelection) {
            newSet.add(ep.id);
          }
        });
        return newSet;
      });
    }
  };

  const toggleSeason = (seasonNumber: number) => {
    const seasonEpisodes = episodesBySeason.get(seasonNumber) || [];
    const allSelected = seasonEpisodes.every((ep) => selectedIds.has(ep.id));

    if (allSelected) {
      // Deselect all in season
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        seasonEpisodes.forEach((ep) => newSet.delete(ep.id));
        return newSet;
      });
    } else {
      // Select all in season
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        seasonEpisodes.forEach((ep) => {
          if (!maxSelection || newSet.size < maxSelection) {
            newSet.add(ep.id);
          }
        });
        return newSet;
      });
    }
  };

  const totalSize = useMemo(() => {
    return episodes
      .filter((ep) => selectedIds.has(ep.id))
      .reduce((sum, ep) => sum + (ep.file_size_bytes || 0), 0);
  }, [episodes, selectedIds]);

  const totalDuration = useMemo(() => {
    return episodes
      .filter((ep) => selectedIds.has(ep.id))
      .reduce((sum, ep) => sum + (ep.duration_minutes || 0), 0);
  }, [episodes, selectedIds]);

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Select Episodes</h2>
            <p className="text-gray-400">{titleName}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-800">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-400">Selected</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {selectedIds.size} / {episodes.length}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-400">Total Size</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatBytes(totalSize)}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Duration</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex gap-2">
            <button
              onClick={() => setSeasonFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                seasonFilter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All Seasons
            </button>
            {seasons.map((seasonNum) => (
              <button
                key={seasonNum}
                onClick={() => setSeasonFilter(seasonNum)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  seasonFilter === seasonNum
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Season {seasonNum}
              </button>
            ))}
          </div>

          <button
            onClick={toggleAll}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {selectedIds.size === filteredEpisodes.length ? (
              <>
                <Square className="h-4 w-4" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4" />
                Select All
              </>
            )}
          </button>
        </div>

        {/* Episodes List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-800/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : episodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Play className="h-16 w-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg font-medium">No episodes found</p>
              <p className="text-gray-500 text-sm mt-2">This bundle doesn't have any episodes</p>
            </div>
          ) : (
            seasons.map((seasonNum) => {
              if (seasonFilter !== 'all' && seasonFilter !== seasonNum) return null;

              const seasonEps = episodesBySeason.get(seasonNum) || [];
              const allSelected = seasonEps.every((ep) => selectedIds.has(ep.id));

              return (
                <div key={seasonNum} className="mb-6 last:mb-0">
                  {/* Season Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">Season {seasonNum}</h3>
                    <button
                      onClick={() => toggleSeason(seasonNum)}
                      className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                    >
                      {allSelected ? 'Deselect Season' : 'Select Season'}
                    </button>
                  </div>

                  {/* Episodes */}
                  <div className="space-y-2">
                    {seasonEps.map((episode) => (
                      <EpisodeCard
                        key={episode.id}
                        episode={episode}
                        isSelected={selectedIds.has(episode.id)}
                        onToggle={() => toggleEpisode(episode.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            {maxSelection && (
              <span>
                Maximum {maxSelection} episodes can be selected
                {selectedIds.size >= maxSelection && (
                  <span className="ml-2 text-yellow-400">(Limit reached)</span>
                )}
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.size === 0 || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              {isLoading ? 'Loading...' : `Download ${selectedIds.size} Episode${selectedIds.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Episode Card Component
// ─────────────────────────────────────────────────────────────────────────────

function EpisodeCard({
  episode,
  isSelected,
  onToggle,
}: {
  episode: Episode;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-purple-500/10 border-purple-500'
          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
      }`}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0">
        {isSelected ? (
          <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 bg-gray-700 rounded border-2 border-gray-600" />
        )}
      </div>

      {/* Thumbnail */}
      {episode.thumbnail_url && (
        <div className="w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={episode.thumbnail_url}
            alt={episode.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-gray-700 rounded text-xs font-bold text-gray-300">
            E{episode.episode_number}
          </span>
          <h4 className="font-bold text-white line-clamp-1">{episode.title}</h4>
        </div>
        {episode.description && (
          <p className="text-sm text-gray-400 line-clamp-1">{episode.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {episode.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{episode.duration_minutes}m</span>
            </div>
          )}
          {episode.file_size_bytes && (
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{formatBytes(episode.file_size_bytes)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
