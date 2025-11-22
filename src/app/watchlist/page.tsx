// app/watchlist/page.tsx
/**
 * =============================================================================
 * Watchlist Page
 * =============================================================================
 * Features:
 * - Browse watchlist items
 * - Search and filter
 * - Bulk operations
 * - Export/import
 * - Reordering
 */

import { Watchlist } from "@/components/Watchlist";

export const metadata = {
  title: "My Watchlist - MoviesNow",
  description: "Your saved titles to watch later",
};

export default function WatchlistPage() {
  return <Watchlist />;
}
