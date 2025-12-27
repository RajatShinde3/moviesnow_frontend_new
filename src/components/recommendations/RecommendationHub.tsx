/**
 * =============================================================================
 * RecommendationHub Component
 * =============================================================================
 * Integrates multiple content rails for complete homepage experience
 */

'use client';

import { Sparkles } from 'lucide-react';
import { useHomeRails } from '@/lib/api/hooks/useRecommendations';
import { TitleItem } from '@/lib/api/services/recommendations';
import ContentRail from './ContentRail';

interface RecommendationHubProps {
  profileId: string;
  onItemClick?: (item: TitleItem) => void;
  onAddToWatchlist?: (item: TitleItem) => void;
  className?: string;
}

export default function RecommendationHub({
  profileId,
  onItemClick,
  onAddToWatchlist,
  className = '',
}: RecommendationHubProps) {
  const { data, isLoading, error } = useHomeRails(profileId);

  if (error) {
    return (
      <div className={`p-4 bg-red-500/10 border border-red-500/30 rounded-lg ${className}`}>
        <p className="text-red-400">Failed to load recommendations</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={className}>
        <RecommendationHubSkeleton />
      </div>
    );
  }

  const rails = data?.rails || [];

  if (rails.length === 0) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <Sparkles className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No recommendations available yet</p>
        <p className="text-sm text-gray-500 mt-2">Start watching content to get personalized recommendations</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
          <p className="text-sm text-gray-400">
            Based on your watch history and preferences
          </p>
        </div>
      </div>

      {/* Rails */}
      <div className="space-y-8">
        {rails.map((rail, index) => (
          <ContentRail
            key={`${rail.rail_id}-${index}`}
            title={rail.title}
            items={rail.items}
            onItemClick={onItemClick}
            onAddToWatchlist={onAddToWatchlist}
          />
        ))}
      </div>

      {/* Footer Info */}
      {data && (
        <div className="px-4 py-6 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-gray-500">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                <span>Personalized recommendations</span>
              </div>
              <span>•</span>
              <span>{rails.length} content rails</span>
              <span>•</span>
              <span>Updated every 5 minutes</span>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors duration-200"
            >
              Refresh Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function RecommendationHubSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 px-4">
        <div className="h-10 w-10 bg-gray-800 rounded-lg" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-800 rounded" />
          <div className="h-4 w-64 bg-gray-800 rounded" />
        </div>
      </div>

      {/* Rails Skeleton */}
      {[1, 2, 3].map((railIndex) => (
        <div key={railIndex} className="space-y-4">
          {/* Rail Title */}
          <div className="h-6 w-56 bg-gray-800 rounded px-4" />

          {/* Rail Content */}
          <div className="flex gap-4 px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0 w-48 space-y-2">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg" />
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
