// app/browse/page.tsx
/**
 * =============================================================================
 * Browse / Catalog Page
 * =============================================================================
 * Features:
 * - Genre-based browsing
 * - Content rails
 * - Category navigation
 * - Featured content
 */

import { BrowseCatalog } from "@/components/BrowseCatalog";

export const metadata = {
  title: "Browse - MoviesNow",
  description: "Explore our catalog of movies and series",
};

export default function BrowsePage() {
  return <BrowseCatalog />;
}
