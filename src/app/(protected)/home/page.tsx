// app/(protected)/home/page.tsx
"use client";

/**
 * =============================================================================
 * Home Page - Netflix-style discovery with hero and content rows
 * =============================================================================
 */

import * as React from "react";
import { api } from "@/lib/api/services";
import { HeroSection } from "@/components/ui/HeroSection";
import { TitleRow } from "@/components/ui/TitleRow";
import { HeroSkeleton, TitleRowSkeleton } from "@/components/ui/Skeletons";
import { ContinueWatchingRow } from "@/components/home/ContinueWatchingRow";
import type { Title } from "@/lib/api/types";

export default function HomePage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchHomeData() {
      try {
        const [homeData, trending, popular, newReleases, genres] = await Promise.all([
          api.discovery.getHome(),
          api.discovery.getTrending(20),
          api.discovery.getPopular(20),
          api.discovery.getNewReleases(20),
          api.discovery.getGenres(),
        ]);

        setData({ homeData, trending, popular, newReleases, genres });
      } catch (error) {
        console.error("Failed to fetch home data:", error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHomeData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen space-y-8 p-4 sm:p-6 lg:p-8">
        <HeroSkeleton />
        <TitleRowSkeleton />
        <TitleRowSkeleton />
        <TitleRowSkeleton />
      </div>
    );
  }

  const { homeData, trending, popular, newReleases, genres } = data;

  // Get hero title (featured content)
  const heroTitle = trending?.[0] || popular?.[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {heroTitle && (
        <div className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
          <HeroSection title={heroTitle} />
        </div>
      )}

      {/* Content Rows */}
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Continue Watching */}
        <ContinueWatchingRow />

        {/* Trending Now */}
        {trending && trending.length > 0 && (
          <TitleRow
            title="Trending Now"
            titles={trending}
            viewAllHref="/browse?sort_by=popularity"
          />
        )}

        {/* New Releases */}
        {newReleases && newReleases.length > 0 && (
          <TitleRow
            title="New Releases"
            titles={newReleases}
            viewAllHref="/browse?sort_by=release_date&sort_order=desc"
          />
        )}

        {/* Popular */}
        {popular && popular.length > 0 && (
          <TitleRow
            title="Popular on MoviesNow"
            titles={popular}
            viewAllHref="/browse?sort_by=vote_average&sort_order=desc"
          />
        )}

        {/* Recommended */}
        {homeData?.recommended && homeData.recommended.length > 0 && (
          <TitleRow
            title="Recommended For You"
            titles={homeData.recommended}
          />
        )}

        {/* Genres */}
        {homeData?.popular_by_genre && Object.entries(homeData.popular_by_genre).map(([genreName, titles]) => (
          <TitleRow
            key={genreName}
            title={genreName}
            titles={titles as Title[]}
            viewAllHref={`/genre/${genreName.toLowerCase()}`}
          />
        ))}

        {/* Fallback genres if popular_by_genre is empty */}
        {(!homeData?.popular_by_genre || Object.keys(homeData.popular_by_genre).length === 0) &&
          genres?.slice(0, 5).map((genre: any) => (
            <GenreRow key={genre.id} genre={genre} />
          ))}
      </div>
    </div>
  );
}

// Client component for dynamic genre fetching
function GenreRow({ genre }: { genre: { id: string; slug: string; name: string } }) {
  const [titles, setTitles] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTitles() {
      try {
        const result = await api.discovery.getTitlesByGenre(genre.slug, { page_size: 20 });
        if (result?.items && result.items.length > 0) {
          setTitles(result.items);
        }
      } catch (error) {
        console.error(`Failed to fetch titles for genre ${genre.name}:`, error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTitles();
  }, [genre.slug, genre.name]);

  if (isLoading) return <TitleRowSkeleton />;
  if (titles.length === 0) return null;

  return (
    <TitleRow
      title={genre.name}
      titles={titles}
      viewAllHref={`/genre/${genre.slug}`}
    />
  );
}
