'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🌟 ULTRA STREAMING HOME PAGE — BEST OF BEST
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * The ULTIMATE streaming experience featuring:
 * ✨ Video hover previews
 * ✨ Toast notifications
 * ✨ Keyboard shortcuts
 * ✨ Beautiful empty states
 * ✨ Premium loading skeletons
 * ✨ Scroll reveal animations
 * ✨ Advanced micro-interactions
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api/services';
import { CinematicHero } from '@/components/streaming/CinematicHero';
import { ContentRail } from '@/components/streaming/ContentRail';
import { UltraPremiumCard } from '@/components/streaming/UltraPremiumCard';
import { BeautifulEmptyState } from '@/components/streaming/BeautifulEmptyState';
import { HeroSkeleton, RailSkeleton, FullPageSkeleton } from '@/components/streaming/PremiumLoadingSkeletons';
import { KeyboardShortcutsModal } from '@/components/streaming/KeyboardShortcutsModal';
import { toast } from '@/components/streaming/ToastProvider';
import { colors, animation } from '@/lib/design-system';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function UltraStreamingHomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch trending titles for hero
  const { data: trending, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ['trending'],
    queryFn: () => api.discovery.getTrending(20),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Fetch popular titles
  const { data: popular, isLoading: popularLoading } = useQuery({
    queryKey: ['popular'],
    queryFn: () => api.discovery.getPopular(20),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch new releases
  const { data: newReleases, isLoading: newReleasesLoading } = useQuery({
    queryKey: ['new-releases'],
    queryFn: () => api.discovery.getNewReleases(20),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch genres for category rails
  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: () => api.discovery.getGenres(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch watchlist to check if items are already added
  const { data: watchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.watchlist.get(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Create set of watchlist IDs for quick lookup
  const watchlistIds = React.useMemo(() => {
    return new Set(watchlist?.map(item => item.title_id) || []);
  }, [watchlist]);

  // Select hero title (first trending item)
  const heroTitle = trending?.[0];

  // Handle play
  const handlePlay = (titleId: string, titleName: string) => {
    toast.success(`Playing ${titleName}`, {
      description: 'Enjoy your show!',
      icon: '▶️',
    });
    // Navigate to watch page
    router.push(`/watch/${titleId}`);
  };

  // Handle add to watchlist
  const handleAddToList = async (titleId: string, titleName: string) => {
    try {
      await api.watchlist.add(titleId);

      // Invalidate watchlist query to refetch
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });

      toast.success(`Added to your list`, {
        description: titleName,
        icon: '✅',
      });
    } catch (error) {
      console.error('Failed to add to list:', error);
      toast.error('Failed to add to list', {
        description: 'Please try again',
      });
    }
  };

  // Handle remove from watchlist
  const handleRemoveFromList = async (titleId: string, titleName: string) => {
    try {
      // Find the watchlist item ID
      const watchlistItem = watchlist?.find(item => item.title_id === titleId);
      if (watchlistItem) {
        await api.watchlist.remove(watchlistItem.id);

        // Invalidate watchlist query to refetch
        queryClient.invalidateQueries({ queryKey: ['watchlist'] });

        toast.info(`Removed from your list`, {
          description: titleName,
        });
      }
    } catch (error) {
      console.error('Failed to remove from list:', error);
      toast.error('Failed to remove from list');
    }
  };

  // Show full page loading skeleton on initial load
  if (trendingLoading && !trending) {
    return <FullPageSkeleton />;
  }

  // Show error state with beautiful empty component
  if (trendingError) {
    return (
      <div className="min-h-screen" style={{ background: colors.bg.primary }}>
        <BeautifulEmptyState
          type="generic"
          title="Oops! Something went wrong"
          description="We couldn't load the content. Please try again."
          actionLabel="Retry"
          onAction={() => queryClient.invalidateQueries({ queryKey: ['trending'] })}
        />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen" style={{ background: colors.bg.primary }}>
        {/* Hero Section */}
        {heroTitle ? (
          <CinematicHero
            title={heroTitle}
            onPlay={() => handlePlay(heroTitle.id, heroTitle.name)}
            onAddToList={() => handleAddToList(heroTitle.id, heroTitle.name)}
          />
        ) : (
          <div className="px-4 sm:px-6 lg:px-8">
            <HeroSkeleton />
          </div>
        )}

        {/* Content Rails Container */}
        <motion.div
          className="space-y-8 py-8 lg:space-y-12 lg:py-12"
          initial="initial"
          animate="animate"
          variants={animation.variants.staggerContainer}
        >
          {/* Trending Now */}
          {trending && trending.length > 0 ? (
            <ContentRail
              title="🔥 Trending Now"
              viewAllHref="/browse?sort_by=popularity&sort_order=desc"
            >
              {trending.map((title, index) => (
                <UltraPremiumCard
                  key={title.id}
                  title={title}
                  index={index}
                  isInWatchlist={watchlistIds.has(title.id)}
                  onPlay={() => handlePlay(title.id, title.name)}
                  onAddToList={() => handleAddToList(title.id, title.name)}
                  onRemoveFromList={() => handleRemoveFromList(title.id, title.name)}
                  size="md"
                />
              ))}
            </ContentRail>
          ) : !trendingLoading ? (
            <BeautifulEmptyState type="trending" />
          ) : (
            <RailSkeleton />
          )}

          {/* New Releases */}
          {newReleases && newReleases.length > 0 ? (
            <ContentRail
              title="✨ New Releases"
              viewAllHref="/browse?sort_by=release_date&sort_order=desc"
            >
              {newReleases.map((title, index) => (
                <UltraPremiumCard
                  key={title.id}
                  title={title}
                  index={index}
                  isInWatchlist={watchlistIds.has(title.id)}
                  onPlay={() => handlePlay(title.id, title.name)}
                  onAddToList={() => handleAddToList(title.id, title.name)}
                  onRemoveFromList={() => handleRemoveFromList(title.id, title.name)}
                  size="md"
                />
              ))}
            </ContentRail>
          ) : newReleasesLoading ? (
            <RailSkeleton />
          ) : null}

          {/* Popular on MoviesNow */}
          {popular && popular.length > 0 ? (
            <ContentRail
              title="⭐ Popular on MoviesNow"
              viewAllHref="/browse?sort_by=rating&sort_order=desc"
            >
              {popular.map((title, index) => (
                <UltraPremiumCard
                  key={title.id}
                  title={title}
                  index={index}
                  isInWatchlist={watchlistIds.has(title.id)}
                  onPlay={() => handlePlay(title.id, title.name)}
                  onAddToList={() => handleAddToList(title.id, title.name)}
                  onRemoveFromList={() => handleRemoveFromList(title.id, title.name)}
                  size="md"
                />
              ))}
            </ContentRail>
          ) : popularLoading ? (
            <RailSkeleton />
          ) : null}

          {/* Genre-based Rails */}
          {genres?.slice(0, 5).map((genre, genreIndex) => (
            <GenreRail
              key={genre.id}
              genreSlug={genre.slug}
              genreName={genre.name}
              genreIndex={genreIndex}
              watchlistIds={watchlistIds}
              onPlay={handlePlay}
              onAddToList={handleAddToList}
              onRemoveFromList={handleRemoveFromList}
            />
          ))}
        </motion.div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal />
    </>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENRE RAIL SUB-COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface GenreRailProps {
  genreSlug: string;
  genreName: string;
  genreIndex: number;
  watchlistIds: Set<string>;
  onPlay: (id: string, name: string) => void;
  onAddToList: (id: string, name: string) => void;
  onRemoveFromList: (id: string, name: string) => void;
}

function GenreRail({
  genreSlug,
  genreName,
  genreIndex,
  watchlistIds,
  onPlay,
  onAddToList,
  onRemoveFromList,
}: GenreRailProps) {
  const { data: titles, isLoading } = useQuery({
    queryKey: ['genre', genreSlug],
    queryFn: () =>
      api.discovery.getTitlesByGenre(genreSlug, {
        page: 1,
        page_size: 20,
        sort_by: 'popularity',
        sort_order: 'desc',
      }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return <RailSkeleton />;
  }

  if (!titles?.items || titles.items.length === 0) {
    return null;
  }

  // Genre emoji mapping
  const genreEmojis: Record<string, string> = {
    action: '💥',
    comedy: '😂',
    drama: '🎭',
    horror: '👻',
    romance: '💕',
    'sci-fi': '🚀',
    thriller: '🔪',
    animation: '🎨',
    documentary: '📺',
    fantasy: '🧙',
  };

  const emoji = genreEmojis[genreSlug.toLowerCase()] || '🎬';

  return (
    <ContentRail title={`${emoji} ${genreName}`} viewAllHref={`/genre/${genreSlug}`}>
      {titles.items.map((title, index) => (
        <UltraPremiumCard
          key={title.id}
          title={title}
          index={genreIndex * 20 + index} // Stagger based on rail position
          isInWatchlist={watchlistIds.has(title.id)}
          onPlay={() => onPlay(title.id, title.name)}
          onAddToList={() => onAddToList(title.id, title.name)}
          onRemoveFromList={() => onRemoveFromList(title.id, title.name)}
          size="md"
        />
      ))}
    </ContentRail>
  );
}
