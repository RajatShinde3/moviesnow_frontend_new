/**
 * =============================================================================
 * Recommendations Page
 * =============================================================================
 * Personalized content recommendations with AI-powered suggestions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  TrendingUp,
  Heart,
  Clock,
  Star,
  Filter,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Play,
  Plus,
  Info,
} from 'lucide-react';
import {
  usePersonalizedRecommendations,
  useTrendingRecommendations,
  useRefreshRecommendations,
} from '@/lib/api/hooks/useRecommendations';

type RecommendationType = 'personalized' | 'trending' | 'based_on_history' | 'new_releases';

export default function RecommendationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RecommendationType>('personalized');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const { data: personalizedData, isLoading: loadingPersonalized, refetch: refetchPersonalized } =
    usePersonalizedRecommendations({ limit: 20 });

  const { data: trendingData, isLoading: loadingTrending } = useTrendingRecommendations({
    time_window: '7d',
    limit: 20,
  });

  const refreshRecommendations = useRefreshRecommendations();

  const handleRefresh = async () => {
    await refreshRecommendations.mutateAsync();
    await refetchPersonalized();
  };

  const isLoading = loadingPersonalized || loadingTrending;
  const recommendations =
    activeTab === 'personalized'
      ? personalizedData?.recommendations || []
      : activeTab === 'trending'
      ? trendingData?.recommendations || []
      : [];

  const filteredRecommendations =
    selectedGenre === 'all'
      ? recommendations
      : recommendations.filter((rec: any) => rec.genres?.includes(selectedGenre));

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Sparkles className="h-10 w-10 text-purple-400" />
                Recommendations
              </h1>
              <p className="text-gray-400">
                Discover your next favorite show with personalized suggestions
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshRecommendations.isPending}
              className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg font-bold transition-colors border border-purple-500/30 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshRecommendations.isPending ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>

          {/* Recommendation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Sparkles />}
              label="For You"
              value={personalizedData?.recommendations.length || 0}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={<TrendingUp />}
              label="Trending Now"
              value={trendingData?.recommendations.length || 0}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={<Heart />}
              label="Match Score"
              value={`${personalizedData?.avg_match_score || 0}%`}
              color="from-red-500 to-pink-500"
            />
            <StatCard
              icon={<Star />}
              label="Avg Rating"
              value={personalizedData?.avg_rating?.toFixed(1) || '0.0'}
              color="from-yellow-500 to-orange-500"
            />
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Tabs */}
            <div className="flex gap-2">
              {[
                { id: 'personalized' as const, label: 'For You', icon: Sparkles },
                { id: 'trending' as const, label: 'Trending', icon: TrendingUp },
                { id: 'based_on_history' as const, label: 'Based on History', icon: Clock },
                { id: 'new_releases' as const, label: 'New Releases', icon: Star },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Genre Filter */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Genres</option>
              <option value="Action">Action</option>
              <option value="Drama">Drama</option>
              <option value="Comedy">Comedy</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Horror">Horror</option>
              <option value="Romance">Romance</option>
              <option value="Thriller">Thriller</option>
              <option value="Fantasy">Fantasy</option>
            </select>
          </div>
        </div>

        {/* Recommendations Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-gray-800 rounded-xl mb-3" />
                <div className="h-5 bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredRecommendations.length > 0 ? (
          <>
            {/* Info Banner */}
            {activeTab === 'personalized' && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-purple-200">
                  <p className="font-medium mb-1">Personalized Just for You</p>
                  <p className="text-purple-300/80">
                    Based on your watch history, ratings, and preferences. Recommendations update
                    daily.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredRecommendations.map((recommendation: any) => (
                <RecommendationCard
                  key={recommendation.title_id || recommendation.id}
                  recommendation={recommendation}
                  onPlay={(id) => router.push(`/watch/${id}`)}
                  onViewDetails={(id) => router.push(`/title/${id}`)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-16 text-center">
            <Sparkles className="h-24 w-24 text-gray-700 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No Recommendations Yet</h2>
            <p className="text-gray-400 mb-6">
              {selectedGenre !== 'all'
                ? 'Try selecting a different genre'
                : 'Start watching content to get personalized recommendations'}
            </p>
            <button
              onClick={() => router.push('/browse')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
            >
              Browse Content
            </button>
          </div>
        )}

        {/* Why This? Section */}
        {activeTab === 'personalized' && filteredRecommendations.length > 0 && (
          <div className="mt-12 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">How Recommendations Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Watch History</h3>
                  <p className="text-sm text-gray-400">
                    Based on what you've watched and enjoyed
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Star className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Your Ratings</h3>
                  <p className="text-sm text-gray-400">
                    We learn from your reviews and ratings
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Similar Users</h3>
                  <p className="text-sm text-gray-400">
                    Find what others with similar tastes enjoy
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card Component
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
      <div className={`p-3 bg-gradient-to-br ${color} rounded-lg mb-3 w-fit text-white`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommendation Card Component
// ─────────────────────────────────────────────────────────────────────────────

function RecommendationCard({
  recommendation,
  onPlay,
  onViewDetails,
}: {
  recommendation: any;
  onPlay: (id: string) => void;
  onViewDetails: (id: string) => void;
}) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const titleId = recommendation.title_id || recommendation.id;
  const matchScore = recommendation.match_score || recommendation.score || 0;

  return (
    <div className="group relative transition-all transform hover:scale-105">
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-3 bg-gray-800">
        {recommendation.poster_url ? (
          <img
            src={recommendation.poster_url}
            alt={recommendation.name || recommendation.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <Play className="h-16 w-16" />
          </div>
        )}

        {/* Match Score Badge */}
        {matchScore > 0 && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {Math.round(matchScore * 100)}% Match
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => onPlay(titleId)}
            className="p-3 bg-white rounded-full hover:scale-110 transition-transform"
          >
            <Play className="h-6 w-6 text-black fill-black" />
          </button>
          <button
            onClick={() => onViewDetails(titleId)}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
          >
            <Info className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div>
        <h3 className="font-bold text-white line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
          {recommendation.name || recommendation.title}
        </h3>

        {recommendation.rating_average && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-white font-medium">
              {recommendation.rating_average.toFixed(1)}
            </span>
          </div>
        )}

        {/* Reason */}
        {recommendation.reason && (
          <p className="text-xs text-gray-400 mb-2 line-clamp-2">{recommendation.reason}</p>
        )}

        {/* Feedback Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
            className={`p-1.5 rounded-lg transition-colors ${
              feedback === 'like'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
            className={`p-1.5 rounded-lg transition-colors ${
              feedback === 'dislike'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
