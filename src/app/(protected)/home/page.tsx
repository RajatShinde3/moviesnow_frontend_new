// app/(protected)/home/page.tsx
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

export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const [homeData, trending, popular, newReleases, genres] = await Promise.all([
      api.discovery.getHome(),
      api.discovery.getTrending(20),
      api.discovery.getPopular(20),
      api.discovery.getNewReleases(20),
      api.discovery.getGenres(),
    ]);

    return { homeData, trending, popular, newReleases, genres };
  } catch (error) {
    console.error("Failed to fetch home data:", error);
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  if (!data) {
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
            titles={titles}
            viewAllHref={`/genre/${genreName.toLowerCase()}`}
          />
        ))}

        {/* Fallback genres if popular_by_genre is empty */}
        {(!homeData?.popular_by_genre || Object.keys(homeData.popular_by_genre).length === 0) &&
          genres?.slice(0, 5).map((genre) => (
            <GenreRow key={genre.id} genre={genre} />
          ))}
      </div>
    </div>
  );
}

// Client component for dynamic genre fetching
async function GenreRow({ genre }: { genre: { id: string; slug: string; name: string } }) {
  try {
    const titles = await api.discovery.getTitlesByGenre(genre.slug, { page_size: 20 });

    if (!titles?.items || titles.items.length === 0) return null;

    return (
      <TitleRow
        title={genre.name}
        titles={titles.items}
        viewAllHref={`/genre/${genre.slug}`}
      />
    );
  } catch (error) {
    return null;
  }
}
