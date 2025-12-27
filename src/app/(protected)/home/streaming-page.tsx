'use client';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🏠 MODERN STREAMING HOME PAGE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * World-class streaming experience combining:
 * • Cinematic hero banner
 * • Horizontal content rails
 * • Premium content cards
 * • Smooth animations
 * • Lazy loading
 * • Responsive design
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api/services';
import { CinematicHero } from '@/components/streaming/CinematicHero';
import { ContentRail } from '@/components/streaming/ContentRail';
import { PremiumCard } from '@/components/streaming/PremiumCard';
import { colors, animation } from '@/lib/design-system';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function StreamingHomePage() {
  const router = useRouter();

  // Fetch trending titles for hero
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => api.discovery.getTrending(20),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch popular titles
  const { data: popular } = useQuery({
    queryKey: ['popular'],
    queryFn: () => api.discovery.getPopular(20),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch new releases
  const { data: newReleases } = useQuery({
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

  // Select hero title (first trending item)
  const heroTitle = trending?.[0];

  // Handle play
  const handlePlay = (titleId: string) => {
    // Navigate to watch page
    router.push(`/watch/${titleId}`);
  };

  // Handle add to list
  const handleAddToList = async (titleId: string) => {
    try {
      await api.watchlist.add(titleId);
      toast.success('Added to your watchlist', {
        description: 'You can find it in My List',
      });
    } catch (error) {
      console.error('Failed to add to list:', error);
      toast.error('Failed to add to watchlist', {
        description: 'Please try again later',
      });
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: colors.bg.primary }}
    >
      {/* Hero Section */}
      {heroTitle && (
        <CinematicHero
          title={heroTitle}
          onPlay={() => handlePlay(heroTitle.id)}
          onAddToList={() => handleAddToList(heroTitle.id)}
        />
      )}

      {/* Loading Skeleton for Hero */}
      {trendingLoading && !heroTitle && (
        <div
          className="animate-pulse"
          style={{
            height: '600px',
            background: colors.bg.secondary,
          }}
        />
      )}

      {/* Content Rails Container */}
      <motion.div
        className="space-y-8 py-8 lg:space-y-12 lg:py-12"
        initial="initial"
        animate="animate"
        variants={animation.variants.staggerContainer}
      >
        {/* Trending Now */}
        {trending && trending.length > 0 && (
          <ContentRail
            title="Trending Now"
            viewAllHref="/browse?sort_by=popularity&sort_order=desc"
          >
            {trending.map((title) => (
              <PremiumCard
                key={title.id}
                title={title}
                onPlay={() => handlePlay(title.id)}
                onAddToList={() => handleAddToList(title.id)}
                size="md"
              />
            ))}
          </ContentRail>
        )}

        {/* New Releases */}
        {newReleases && newReleases.length > 0 && (
          <ContentRail
            title="New Releases"
            viewAllHref="/browse?sort_by=release_date&sort_order=desc"
          >
            {newReleases.map((title) => (
              <PremiumCard
                key={title.id}
                title={title}
                onPlay={() => handlePlay(title.id)}
                onAddToList={() => handleAddToList(title.id)}
                size="md"
              />
            ))}
          </ContentRail>
        )}

        {/* Popular on MoviesNow */}
        {popular && popular.length > 0 && (
          <ContentRail
            title="Popular on MoviesNow"
            viewAllHref="/browse?sort_by=rating&sort_order=desc"
          >
            {popular.map((title) => (
              <PremiumCard
                key={title.id}
                title={title}
                onPlay={() => handlePlay(title.id)}
                onAddToList={() => handleAddToList(title.id)}
                size="md"
              />
            ))}
          </ContentRail>
        )}

        {/* Genre-based Rails */}
        {genres?.slice(0, 5).map((genre) => (
          <GenreRail
            key={genre.id}
            genreSlug={genre.slug}
            genreName={genre.name}
            onPlay={handlePlay}
            onAddToList={handleAddToList}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENRE RAIL SUB-COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface GenreRailProps {
  genreSlug: string;
  genreName: string;
  onPlay: (titleId: string) => void;
  onAddToList: (titleId: string) => void;
}

function GenreRail({ genreSlug, genreName, onPlay, onAddToList }: GenreRailProps) {
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
    return (
      <div className="space-y-4 px-4 sm:px-6 lg:px-8">
        <div
          className="h-6 w-48 animate-pulse rounded"
          style={{ background: colors.bg.secondary }}
        />
        <div className="flex gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 w-44 flex-shrink-0 animate-pulse rounded-lg"
              style={{ background: colors.bg.secondary }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!titles?.items || titles.items.length === 0) {
    return null;
  }

  return (
    <ContentRail title={genreName} viewAllHref={`/genre/${genreSlug}`}>
      {titles.items.map((title) => (
        <PremiumCard
          key={title.id}
          title={title}
          onPlay={() => onPlay(title.id)}
          onAddToList={() => onAddToList(title.id)}
          size="md"
        />
      ))}
    </ContentRail>
  );
}
