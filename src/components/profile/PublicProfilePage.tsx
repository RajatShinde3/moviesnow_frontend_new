/**
 * =============================================================================
 * PublicProfilePage Component
 * =============================================================================
 * Public-facing user profile with watch activity, reviews, and favorites
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Star,
  Film,
  Heart,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  Eye,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  title_id: string;
  title_name: string;
  title_poster_url?: string;
  rating: number;
  review_text: string;
  created_at: string;
  likes_count: number;
}

interface FavoriteTitle {
  id: string;
  name: string;
  poster_url?: string;
  rating_average: number;
  type: string;
}

interface WatchStats {
  total_watch_time_minutes: number;
  titles_completed: number;
  episodes_watched: number;
  favorite_genre?: string;
  watching_streak_days?: number;
}

interface PublicProfile {
  user_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  member_since: string;
  is_premium: boolean;
  stats: WatchStats;
  recent_reviews: Review[];
  favorite_titles: FavoriteTitle[];
  is_following?: boolean;
  followers_count: number;
  following_count: number;
}

interface PublicProfilePageProps {
  userId: string;
  currentUserId?: string; // For following functionality
}

export default function PublicProfilePage({ userId, currentUserId }: PublicProfilePageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites' | 'stats'>('reviews');
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock data - replace with actual API call
  const { data: profile, isLoading } = useQuery<PublicProfile>({
    queryKey: ['public-profile', userId],
    queryFn: async () => {
      // Replace with actual API call
      return {
        user_id: userId,
        username: 'moviefan123',
        display_name: 'Movie Enthusiast',
        avatar_url: 'https://via.placeholder.com/200',
        bio: 'Passionate about cinema and storytelling. Always looking for hidden gems and underrated masterpieces.',
        member_since: '2023-01-15T00:00:00Z',
        is_premium: true,
        followers_count: 1234,
        following_count: 567,
        is_following: false,
        stats: {
          total_watch_time_minutes: 12450,
          titles_completed: 156,
          episodes_watched: 892,
          favorite_genre: 'Sci-Fi',
          watching_streak_days: 42,
        },
        recent_reviews: [],
        favorite_titles: [],
      };
    },
  });

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        // Unfollow
        await api.social.unfollowUser(userId);
        setIsFollowing(false);
      } else {
        // Follow
        await api.social.followUser(userId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Failed to update follow status:', error);
      // Revert on error
      setIsFollowing(isFollowing);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <User className="h-24 w-24 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">Profile not found</p>
        </div>
      </div>
    );
  }

  const watchTimeHours = Math.floor(profile.stats.total_watch_time_minutes / 60);
  const isOwnProfile = currentUserId === userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-purple-900/30 via-gray-900 to-black border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-purple-500 shadow-2xl shadow-purple-500/50">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="h-20 w-20 text-white" />
                  </div>
                )}
              </div>

              {/* Premium Badge */}
              {profile.is_premium && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  PREMIUM
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-black text-white mb-2">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-gray-400 mb-1">@{profile.username}</p>

              {profile.bio && <p className="text-gray-300 mb-4 max-w-2xl">{profile.bio}</p>}

              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(new Date(profile.member_since), 'MMMM yyyy')}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-bold text-white">{profile.followers_count}</span>
                  <span>Followers</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-bold text-white">{profile.following_count}</span>
                  <span>Following</span>
                </div>
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && currentUserId && (
                <div className="flex gap-3">
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-bold transition-all transform hover:scale-105 ${
                      isFollowing || profile.is_following
                        ? 'bg-gray-800 text-white border-2 border-gray-700'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    }`}
                  >
                    {isFollowing || profile.is_following ? 'Following' : 'Follow'}
                  </button>
                </div>
              )}

              {isOwnProfile && (
                <button
                  onClick={() => router.push('/settings')}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-5xl mx-auto px-8 -mt-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            label="Watch Time"
            value={`${watchTimeHours}h`}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<Film className="h-6 w-6" />}
            label="Completed"
            value={profile.stats.titles_completed}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<Eye className="h-6 w-6" />}
            label="Episodes"
            value={profile.stats.episodes_watched}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Streak"
            value={`${profile.stats.watching_streak_days || 0} days`}
            color="from-orange-500 to-red-500"
          />
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-5xl mx-auto px-8 pb-12">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-800">
          {[
            { id: 'reviews' as const, label: 'Reviews', icon: MessageSquare },
            { id: 'favorites' as const, label: 'Favorites', icon: Heart },
            { id: 'stats' as const, label: 'Stats', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'reviews' && <ReviewsTab reviews={profile.recent_reviews} />}
        {activeTab === 'favorites' && (
          <FavoritesTab favorites={profile.favorite_titles} onTitleClick={(id) => router.push(`/title/${id}`)} />
        )}
        {activeTab === 'stats' && <StatsTab stats={profile.stats} />}
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
// Reviews Tab
// ─────────────────────────────────────────────────────────────────────────────

function ReviewsTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-16 text-center">
        <MessageSquare className="h-24 w-24 text-gray-700 mx-auto mb-6" />
        <p className="text-gray-400">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 hover:border-purple-500 transition-colors"
        >
          <div className="flex items-start gap-4">
            {/* Poster */}
            {review.title_poster_url && (
              <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={review.title_poster_url}
                  alt={review.title_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-white">{review.title_name}</h3>
                <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-300 mb-3">{review.review_text}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{format(new Date(review.created_at), 'MMM d, yyyy')}</span>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{review.likes_count} likes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Favorites Tab
// ─────────────────────────────────────────────────────────────────────────────

function FavoritesTab({
  favorites,
  onTitleClick,
}: {
  favorites: FavoriteTitle[];
  onTitleClick: (id: string) => void;
}) {
  if (favorites.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-16 text-center">
        <Heart className="h-24 w-24 text-gray-700 mx-auto mb-6" />
        <p className="text-gray-400">No favorites yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {favorites.map((title) => (
        <div
          key={title.id}
          onClick={() => onTitleClick(title.id)}
          className="group cursor-pointer transition-all transform hover:scale-105"
        >
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-3">
            {title.poster_url ? (
              <img
                src={title.poster_url}
                alt={title.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <Film className="h-16 w-16 text-gray-600" />
              </div>
            )}

            {/* Heart Badge */}
            <div className="absolute top-2 right-2 p-2 bg-red-500 rounded-full">
              <Heart className="h-4 w-4 text-white fill-white" />
            </div>
          </div>

          <h3 className="font-bold text-white line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
            {title.name}
          </h3>

          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-white font-medium">
              {title.rating_average.toFixed(1)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats Tab
// ─────────────────────────────────────────────────────────────────────────────

function StatsTab({ stats }: { stats: WatchStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Watch Time Breakdown */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-400" />
            Watch Time
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Hours</span>
              <span className="text-white font-bold">
                {Math.floor(stats.total_watch_time_minutes / 60)}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Minutes</span>
              <span className="text-white font-bold">
                {stats.total_watch_time_minutes.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Days Worth</span>
              <span className="text-white font-bold">
                {(stats.total_watch_time_minutes / 1440).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Completion Stats */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Film className="h-6 w-6 text-green-400" />
            Completion
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Titles Completed</span>
              <span className="text-white font-bold">{stats.titles_completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Episodes Watched</span>
              <span className="text-white font-bold">{stats.episodes_watched}</span>
            </div>
            {stats.favorite_genre && (
              <div className="flex justify-between">
                <span className="text-gray-400">Favorite Genre</span>
                <span className="text-white font-bold">{stats.favorite_genre}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Streak */}
      {stats.watching_streak_days && stats.watching_streak_days > 0 && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-xl border border-orange-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {stats.watching_streak_days} Day Streak 🔥
              </h3>
              <p className="text-gray-300">Keep watching to maintain your streak!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
