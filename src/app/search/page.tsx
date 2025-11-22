// app/search/page.tsx
/**
 * =============================================================================
 * Search Page
 * =============================================================================
 * Features:
 * - Full-text search
 * - Advanced filters
 * - Sort options
 * - Faceted navigation
 */

import { SearchPage } from "@/components/SearchPage";

export const metadata = {
  title: "Search - MoviesNow",
  description: "Search for movies, series, and more",
};

export default function Search() {
  return <SearchPage />;
}
