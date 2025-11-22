// app/title/[slug]/page.tsx
/**
 * =============================================================================
 * Title Detail Page
 * =============================================================================
 * Features:
 * - Full title information
 * - Episodes list for series
 * - Cast and crew
 * - Reviews integration
 * - Similar titles
 * - Watchlist actions
 */

import { TitleDetail } from "@/components/TitleDetail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} - MoviesNow`,
    description: "Watch on MoviesNow",
  };
}

export default async function TitlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TitleDetail slug={slug} />;
}
