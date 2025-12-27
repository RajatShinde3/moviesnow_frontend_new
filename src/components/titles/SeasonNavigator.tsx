/**
 * =============================================================================
 * SeasonNavigator Component
 * =============================================================================
 * Advanced season and episode navigation with grid/list views
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Play, Clock, Check, Download, Grid3x3, List, Info, Star } from 'lucide-react';

interface Episode {
  id: string;
  episode_number: number;
  title: string;
  description: string;
  duration_minutes: number;
  release_date: string;
  thumbnail_url?: string;
  rating_average?: number;
  is_watched?: boolean;
  progress_seconds?: number;
  duration_seconds?: number;
}

interface Season {
  id: string;
  season_number: number;
  title?: string;
  episode_count: number;
  release_year?: number;
  episodes?: Episode[];
}

interface SeasonNavigatorProps {
  titleId: string;
  seasons: Season[];
  currentSeasonNumber?: number;
  currentEpisodeNumber?: number;
  onEpisodeClick?: (episodeId: string) => void;
}

export default function SeasonNavigator({
  titleId,
  seasons,
  currentSeasonNumber = 1,
  currentEpisodeNumber,
  onEpisodeClick,
}: SeasonNavigatorProps) {
  const router = useRouter();
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(currentSeasonNumber);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);

  const selectedSeason = seasons.find((s) => s.season_number === selectedSeasonNumber);

  const handleEpisodeClick = (episodeId: string) => {
    if (onEpisodeClick) {
      onEpisodeClick(episodeId);
    } else {
      router.push(`/watch/${titleId}?episode=${episodeId}`);
    }
  };

  const handleDownload = (episodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/download/${titleId}?episode=${episodeId}`);
  };

  return (
    <div className="space-y-6">
      {/* Season Selector & View Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Season Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSeasonNumber}
            onChange={(e) => setSelectedSeasonNumber(Number(e.target.value))}
            className="px-6 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.season_number}>
                Season {season.season_number}
                {season.title && `: ${season.title}`}
                {season.release_year && ` (${season.release_year})`}
              </option>
            ))}
          </select>

          {selectedSeason && (
            <span className="text-gray-400">
              {selectedSeason.episode_count} Episodes
            </span>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-all ${
              viewMode === 'grid'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid3x3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-all ${
              viewMode === 'list'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Episodes */}
      {selectedSeason?.episodes ? (
        viewMode === 'grid' ? (
          <GridView
            episodes={selectedSeason.episodes}
            currentEpisodeNumber={currentEpisodeNumber}
            onEpisodeClick={handleEpisodeClick}
            onDownload={handleDownload}
          />
        ) : (
          <ListView
            episodes={selectedSeason.episodes}
            currentEpisodeNumber={currentEpisodeNumber}
            expandedEpisode={expandedEpisode}
            onEpisodeClick={handleEpisodeClick}
            onDownload={handleDownload}
            onToggleExpand={setExpandedEpisode}
          />
        )
      ) : (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-12 text-center">
          <Info className="h-16 w-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No episodes available for this season</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Grid View Component
// ─────────────────────────────────────────────────────────────────────────────

function GridView({
  episodes,
  currentEpisodeNumber,
  onEpisodeClick,
  onDownload,
}: {
  episodes: Episode[];
  currentEpisodeNumber?: number;
  onEpisodeClick: (id: string) => void;
  onDownload: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {episodes.map((episode) => {
        const progressPercentage = episode.duration_seconds
          ? ((episode.progress_seconds || 0) / episode.duration_seconds) * 100
          : 0;
        const isCurrent = episode.episode_number === currentEpisodeNumber;

        return (
          <div
            key={episode.id}
            onClick={() => onEpisodeClick(episode.id)}
            className={`group relative bg-gray-900/50 backdrop-blur-sm rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-105 hover:border-purple-500 ${
              isCurrent ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-gray-800'
            }`}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video">
              {episode.thumbnail_url ? (
                <img
                  src={episode.thumbnail_url}
                  alt={episode.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <Play className="h-16 w-16 text-gray-700" />
                </div>
              )}

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="h-12 w-12 text-white fill-white" />
              </div>

              {/* Episode Number Badge */}
              <div className="absolute top-2 left-2 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-full text-sm font-bold text-white">
                {episode.episode_number}
              </div>

              {/* Watched Badge */}
              {episode.is_watched && (
                <div className="absolute top-2 right-2 p-2 bg-green-500 rounded-full">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Progress Bar */}
              {progressPercentage > 0 && progressPercentage < 95 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-white line-clamp-1 group-hover:text-purple-400 transition-colors">
                {episode.title}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{episode.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{episode.duration_minutes}m</span>
                </div>

                {episode.rating_average && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-medium">
                      {episode.rating_average.toFixed(1)}
                    </span>
                  </div>
                )}

                <button
                  onClick={(e) => onDownload(episode.id, e)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <Download className="h-4 w-4 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// List View Component
// ─────────────────────────────────────────────────────────────────────────────

function ListView({
  episodes,
  currentEpisodeNumber,
  expandedEpisode,
  onEpisodeClick,
  onDownload,
  onToggleExpand,
}: {
  episodes: Episode[];
  currentEpisodeNumber?: number;
  expandedEpisode: string | null;
  onEpisodeClick: (id: string) => void;
  onDownload: (id: string, e: React.MouseEvent) => void;
  onToggleExpand: (id: string | null) => void;
}) {
  return (
    <div className="space-y-2">
      {episodes.map((episode) => {
        const progressPercentage = episode.duration_seconds
          ? ((episode.progress_seconds || 0) / episode.duration_seconds) * 100
          : 0;
        const isCurrent = episode.episode_number === currentEpisodeNumber;
        const isExpanded = expandedEpisode === episode.id;

        return (
          <div
            key={episode.id}
            className={`bg-gray-900/50 backdrop-blur-sm rounded-xl border overflow-hidden transition-all ${
              isCurrent ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-gray-800'
            }`}
          >
            <div
              onClick={() => onEpisodeClick(episode.id)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden group">
                {episode.thumbnail_url ? (
                  <img
                    src={episode.thumbnail_url}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Play className="h-8 w-8 text-gray-700" />
                  </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-8 w-8 text-white fill-white" />
                </div>

                {/* Episode Number */}
                <div className="absolute top-1 left-1 px-2 py-0.5 bg-black/80 rounded text-xs font-bold text-white">
                  {episode.episode_number}
                </div>

                {/* Progress Bar */}
                {progressPercentage > 0 && progressPercentage < 95 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-bold text-white line-clamp-1 hover:text-purple-400 transition-colors">
                    {episode.title}
                  </h3>

                  {episode.is_watched && (
                    <div className="flex-shrink-0 p-1 bg-green-500 rounded-full">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <p
                  className={`text-sm text-gray-400 mb-3 ${
                    isExpanded ? '' : 'line-clamp-2'
                  }`}
                >
                  {episode.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{episode.duration_minutes}m</span>
                  </div>

                  {episode.release_date && (
                    <span>{format(new Date(episode.release_date), 'MMM d, yyyy')}</span>
                  )}

                  {episode.rating_average && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-medium">
                        {episode.rating_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(isExpanded ? null : episode.id);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Info className="h-5 w-5 text-gray-400 hover:text-white" />
                </button>

                <button
                  onClick={(e) => onDownload(episode.id, e)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Download className="h-5 w-5 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Expanded Info */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-800">
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Release Date: </span>
                    <span className="text-white">
                      {episode.release_date
                        ? format(new Date(episode.release_date), 'MMMM d, yyyy')
                        : 'N/A'}
                    </span>
                  </div>

                  {episode.rating_average && (
                    <div>
                      <span className="text-gray-400">Rating: </span>
                      <span className="text-white font-medium">
                        {episode.rating_average.toFixed(1)}/10
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => onEpisodeClick(episode.id)}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Watch Episode
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
