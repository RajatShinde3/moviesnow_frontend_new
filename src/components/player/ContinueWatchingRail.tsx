/**
 * =============================================================================
 * ContinueWatchingRail Component
 * =============================================================================
 * Display continue watching content with progress indicators
 */

'use client';

import { Play, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContinueWatching, useMarkCompleted } from '@/lib/api/hooks/usePlayer';

interface ContinueWatchingRailProps {
  profileId: string;
  className?: string;
}

export default function ContinueWatchingRail({
  profileId,
  className = '',
}: ContinueWatchingRailProps) {
  const router = useRouter();
  const { data, isLoading } = useContinueWatching(profileId);
  const markCompleted = useMarkCompleted();

  const items = data?.items || [];

  const handlePlay = (item: any) => {
    const url = item.episode_id
      ? `/watch/${item.title_id}/episode/${item.episode_id}`
      : `/watch/${item.title_id}`;
    router.push(url);
  };

  const handleRemove = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    markCompleted.mutate({
      titleId: item.title_id,
      episodeId: item.episode_id,
    });
  };

  if (isLoading) {
    return <ContinueWatchingSkeleton />;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-2xl font-bold text-white px-4">Continue Watching</h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-4">
        {items.map((item) => (
          <ContinueWatchingCard
            key={`${item.title_id}-${item.episode_id || 'main'}`}
            item={item}
            onPlay={() => handlePlay(item)}
            onRemove={(e) => handleRemove(e, item)}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

interface ContinueWatchingCardProps {
  item: any;
  onPlay: () => void;
  onRemove: (e: React.MouseEvent) => void;
}

function ContinueWatchingCard({ item, onPlay, onRemove }: ContinueWatchingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const progressPercentage = item.progress_percentage || 0;
  const remainingMinutes = Math.ceil((item.duration_seconds - item.progress_seconds) / 60);

  return (
    <div
      className="flex-shrink-0 w-80 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPlay}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
        {/* Thumbnail */}
        {item.title?.backdrop_url || item.title?.poster_url ? (
          <img
            src={item.title.backdrop_url || item.title.poster_url}
            alt={item.title.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
          <div
            className="h-full bg-purple-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <button className="p-4 bg-white rounded-full hover:scale-110 transition-transform">
              <Play className="h-8 w-8 fill-black text-black" />
            </button>

            {/* Remove Button */}
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 p-2 bg-black/80 hover:bg-black rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        {/* Time Remaining Badge */}
        {remainingMinutes > 0 && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs text-white font-medium">
            {remainingMinutes}m left
          </div>
        )}
      </div>

      {/* Title Info */}
      <div>
        <h3 className="font-semibold text-white line-clamp-1 group-hover:text-purple-400 transition-colors">
          {item.title?.name}
        </h3>
        {item.episode_id && item.title?.current_episode && (
          <p className="text-sm text-gray-400 line-clamp-1">
            S{item.title.current_episode.season_number}:E
            {item.title.current_episode.episode_number} - {item.title.current_episode.title}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {Math.floor(progressPercentage)}% watched
        </p>
      </div>
    </div>
  );
}

function ContinueWatchingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-gray-800 rounded px-4" />
      <div className="flex gap-4 px-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-80 space-y-2">
            <div className="aspect-video bg-gray-800 rounded-lg" />
            <div className="h-4 bg-gray-800 rounded w-3/4" />
            <div className="h-3 bg-gray-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function useState<T>(initialValue: T): [T, (value: T) => void] {
  return [initialValue, () => {}] as any;
}
