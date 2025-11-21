// app/home/page.tsx
/**
 * =============================================================================
 * Authenticated Home Page - Netflix-Style Dynamic Content
 * =============================================================================
 * Features:
 * - Continue watching carousel
 * - Trending titles
 * - Top 10 by region
 * - Personalized recommendations
 * - New releases
 * - Browse by genre
 */

import { HomePage } from "@/components/HomePage";

export const metadata = {
  title: "Home - MoviesNow",
  description: "Watch unlimited movies and TV shows",
};

export default function HomeRoute() {
  return <HomePage />;
}
