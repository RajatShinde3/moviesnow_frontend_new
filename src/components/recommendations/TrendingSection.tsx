/**
 * =============================================================================
 * TrendingSection Component
 * =============================================================================
 * Displays trending content with time window selection
 */

'use client';

import { useState } from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import { useTrending } from '@/lib/api/hooks/useRecommendations';
import { TitleItem } from '@/lib/api/services/recommendations';
import ContentRail from './ContentRail';

interface TrendingSectionProps {
  onItemClick?: (item: TitleItem) => void;
  onAddToWatchlist?: (item: TitleItem) => void;
  className?: string;
}

type TimeWindow = '6h' | '24h' | '72h' | '168h';

const TIME_WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: '6h', label: 'Last 6 Hours' },
  { value: '24h', label: 'Today' },
  { value: '72h', label: 'This Week' },
  { value: '168h', label: 'This Month' },
];

export default function TrendingSection({
  onItemClick,
  onAddToWatchlist,
  className = '',
}: TrendingSectionProps) {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('24h');

  const { data, isLoading, error } = useTrending({
    window: timeWindow,
    region: 'US',
  });

  if (error) {
    return (
      <div className={`p-4 bg-red-500/10 border border-red-500/30 rounded-lg ${className}`}>
        <p className="text-red-400">Failed to load trending content</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={className}>
        <TrendingSectionSkeleton />
      </div>
    );
  }

  const items = data?.items || [];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Time Window Selector */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
            <p className="text-sm text-gray-400">
              {data?.total_items || 0} trending titles
            </p>
          </div>
        </div>

        {/* Time Window Selector */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <div className="flex gap-2">
            {TIME_WINDOWS.map((window) => (
              <button
                key={window.value}
                onClick={() => setTimeWindow(window.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  timeWindow === window.value
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {window.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Rail */}
      <ContentRail
        title=""
        items={items}
        onItemClick={onItemClick}
        onAddToWatchlist={onAddToWatchlist}
      />

      {/* Stats Footer */}
      {data && (
        <div className="px-4 flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Updated every 2 minutes</span>
          </div>
          <span>•</span>
          <span>Region: {data.region}</span>
          <span>•</span>
          <span>Window: {TIME_WINDOWS.find((w) => w.value === timeWindow)?.label}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function TrendingSectionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-800 rounded-lg" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-800 rounded" />
            <div className="h-4 w-24 bg-gray-800 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Content Rail Skeleton */}
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
  );
}
