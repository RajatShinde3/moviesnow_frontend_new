/**
 * =============================================================================
 * Anime Arc Detail Page
 * =============================================================================
 * Detailed view of anime story arcs with episodes, filler tracking, and progression
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Play,
  BookOpen,
  Clock,
  TrendingUp,
  Star,
  Check,
  Plus,
  ChevronRight,
  Film,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface AnimeArc {
  id: string;
  title_id: string;
  title_name: string;
  arc_name: string;
  arc_number: number;
  description: string;
  start_episode: number;
  end_episode: number;
  total_episodes: number;
  filler_count: number;
  canon_count: number;
  average_rating: number;
  thumbnail_url?: string;
  is_filler_arc: boolean;
  tags: string[];
}

interface ArcEpisode {
  id: string;
  episode_number: number;
  title: string;
  description?: string;
  duration_minutes: number;
  thumbnail_url?: string;
  is_filler: boolean;
  is_watched: boolean;
  rating: number;
  air_date: string;
}

// Mock data (replace with actual API calls)
const MOCK_ARC: AnimeArc = {
  id: 'arc_1',
  title_id: 'anime_1',
  title_name: 'One Piece',
  arc_name: 'Wano Country Arc',
  arc_number: 21,
  description:
    'The Straw Hats arrive in Wano Country to help liberate it from the tyrannical rule of Kaido and Orochi. This epic arc features intense battles, deep character development, and shocking revelations about the world of One Piece.',
  start_episode: 890,
  end_episode: 1085,
  total_episodes: 196,
  filler_count: 15,
  canon_count: 181,
  average_rating: 4.8,
  is_filler_arc: false,
  tags: ['Action', 'Adventure', 'Drama', 'Epic Battles', 'Character Development'],
};

const MOCK_EPISODES: ArcEpisode[] = Array.from({ length: 20 }, (_, i) => ({
  id: `ep_${890 + i}`,
  episode_number: 890 + i,
  title: i % 10 === 0 ? `The Beginning of the End - Episode ${890 + i}` : `Episode ${890 + i}`,
  description: 'An exciting episode full of action and adventure',
  duration_minutes: 24,
  is_filler: i % 15 === 0,
  is_watched: i < 5,
  rating: 4.5 + Math.random() * 0.5,
  air_date: `2024-01-${String(i + 1).padStart(2, '0')}`,
}));

export default function AnimeArcDetailPage() {
  const params = useParams();
  const router = useRouter();
  const arcId = params.id as string;

  const [showFillers, setShowFillers] = useState(true);
  const [sortBy, setSortBy] = useState<'episode' | 'rating'>('episode');

  // Mock API calls (replace with actual API)
  const { data: arc, isLoading: arcLoading } = useQuery({
    queryKey: ['anime-arc', arcId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_ARC;
    },
  });

  const { data: episodes, isLoading: episodesLoading } = useQuery({
    queryKey: ['anime-arc-episodes', arcId, showFillers, sortBy],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = showFillers ? MOCK_EPISODES : MOCK_EPISODES.filter((ep) => !ep.is_filler);
      if (sortBy === 'rating') {
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
      }
      return filtered;
    },
  });

  const progress = arc
    ? ((episodes?.filter((ep) => ep.is_watched).length || 0) / (arc.canon_count || 1)) * 100
    : 0;

  if (arcLoading) {
    return <ArcDetailSkeleton />;
  }

  if (!arc) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Arc Not Found</h2>
          <p className="text-gray-400 mt-2">The requested anime arc could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        {arc.thumbnail_url && (
          <img
            src={arc.thumbnail_url}
            alt={arc.arc_name}
            className="w-full h-full object-cover"
          />
        )}

        <div className="relative z-20 h-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <span
                onClick={() => router.push(`/anime/${arc.title_id}`)}
                className="hover:text-white cursor-pointer"
              >
                {arc.title_name}
              </span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">Arc {arc.arc_number}</span>
            </div>

            {/* Arc Title */}
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">{arc.arc_name}</h1>

            {/* Arc Metadata */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-bold">{arc.average_rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Film className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">
                  {arc.total_episodes} episodes ({arc.start_episode}-{arc.end_episode})
                </span>
              </div>
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-400" />
                <span className="text-white font-medium">{arc.canon_count} canon</span>
              </div>
              {arc.filler_count > 0 && (
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  <span className="text-white font-medium">{arc.filler_count} filler</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg mb-6 line-clamp-3">{arc.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {arc.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-800/70 backdrop-blur-sm rounded-full text-sm text-gray-300 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => router.push(`/watch?episode=${arc.start_episode}`)}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                Start Watching
              </button>
              <button className="px-6 py-3 bg-gray-800/70 backdrop-blur-sm border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add to List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span className="text-white font-bold">Your Progress</span>
              </div>
              <span className="text-purple-400 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-white">Episodes</h2>

          <div className="flex items-center gap-3">
            {/* Filler Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFillers}
                onChange={(e) => setShowFillers(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-gray-400 text-sm">Show Filler Episodes</span>
            </label>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'episode' | 'rating')}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="episode">Sort by Episode</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>

        {/* Episodes List */}
        {episodesLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <EpisodeCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {episodes?.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Episode Card Component
// ─────────────────────────────────────────────────────────────────────────────

function EpisodeCard({ episode }: { episode: ArcEpisode }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/watch?episode=${episode.episode_number}`)}
      className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500 transition-all cursor-pointer"
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative w-40 aspect-video flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden">
          {episode.is_watched && (
            <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
          {episode.is_filler && (
            <div className="absolute top-2 right-2 bg-orange-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white z-10">
              FILLER
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Play className="h-10 w-10 text-white/80 group-hover:text-white group-hover:scale-110 transition-all" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-purple-400 font-bold text-sm">
                  Episode {episode.episode_number}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-gray-400">{episode.rating.toFixed(1)}</span>
                </div>
              </div>
              <h3 className="text-white font-bold line-clamp-1 group-hover:text-purple-400 transition-colors">
                {episode.title}
              </h3>
            </div>
          </div>

          {episode.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{episode.description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{episode.duration_minutes}m</span>
            </div>
            <span>{new Date(episode.air_date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Components
// ─────────────────────────────────────────────────────────────────────────────

function EpisodeCardSkeleton() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-40 aspect-video bg-gray-800 rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-800 rounded w-32" />
          <div className="h-5 bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

function ArcDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="h-[60vh] bg-gray-900 animate-pulse" />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="h-20 bg-gray-900 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <EpisodeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
