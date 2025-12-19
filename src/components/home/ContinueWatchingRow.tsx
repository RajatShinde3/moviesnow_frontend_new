'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Play, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Progress {
  id: string;
  title_id: string;
  episode_id?: string;
  progress_seconds: number;
  total_duration_seconds: number;
  progress_percentage: number;
  last_watched: string;
  title: {
    id: string;
    title: string;
    slug: string;
    poster_url?: string;
    backdrop_url?: string;
    type: 'MOVIE' | 'SERIES';
  };
  episode?: {
    id: string;
    episode_number: number;
    season_number: number;
    title?: string;
  };
}

interface ContinueWatchingRowProps {
  userId?: string;
}

export function ContinueWatchingRow({ userId }: ContinueWatchingRowProps) {
  const router = useRouter();

  const { data: progressItems, isLoading } = useQuery<Progress[]>({
    queryKey: ['continue-watching', userId],
    queryFn: async () => {
      const res = await fetch('/api/v1/users/me/progress?in_progress=true&limit=10', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch progress');
      const data = await res.json();
      return data.items || data;
    },
    enabled: !!userId,
  });

  const handleRemove = async (progressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/v1/users/me/progress/${progressId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      // Refresh the list
      // queryClient.invalidateQueries(['continue-watching']);
    } catch (error) {
      console.error('Failed to remove from continue watching:', error);
    }
  };

  const handlePlay = (item: Progress) => {
    const baseUrl = `/watch/${item.title.slug}`;
    if (item.episode_id) {
      router.push(`${baseUrl}?episode=${item.episode_id}`);
    } else {
      router.push(baseUrl);
    }
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Continue Watching</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="aspect-video bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!progressItems || progressItems.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-4">Continue Watching</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {progressItems.map((item) => (
          <div
            key={item.id}
            className="group relative cursor-pointer"
            onClick={() => handlePlay(item)}
          >
            {/* Thumbnail with Progress Bar */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
              {/* Backdrop Image */}
              {item.title.backdrop_url ? (
                <img
                  src={item.title.backdrop_url}
                  alt={item.title.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <span className="text-4xl">🎬</span>
                </div>
              )}

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white rounded-full p-3">
                  <Play className="h-6 w-6 text-black fill-black" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div
                  className="h-full bg-red-600 transition-all"
                  style={{ width: `${item.progress_percentage}%` }}
                />
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => handleRemove(item.id, e)}
                className="absolute top-2 right-2 bg-black/80 hover:bg-black rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove from continue watching"
              >
                <X className="h-4 w-4 text-white" />
              </button>

              {/* Episode Badge (for TV shows) */}
              {item.episode && (
                <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-xs font-semibold text-white">
                  S{item.episode.season_number}E{item.episode.episode_number}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="mt-2">
              <h3 className="text-white font-medium line-clamp-1 group-hover:text-blue-400 transition-colors">
                {item.title.title}
              </h3>
              {item.episode?.title && (
                <p className="text-sm text-gray-400 line-clamp-1">
                  {item.episode.title}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(item.progress_percentage)}% complete
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
