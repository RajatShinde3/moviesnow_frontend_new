// app/history/page.tsx
/**
 * =============================================================================
 * Watch History Page - Netflix-Style
 * =============================================================================
 * Features:
 * - Stream history with thumbnails
 * - Progress bars
 * - Filter by date range
 * - Search within history
 * - Export history
 * - Clear history options
 */

import { WatchHistoryPage } from "@/components/WatchHistory";

export const metadata = {
  title: "Watch History - MoviesNow",
  description: "View your complete viewing history and continue watching",
};

export default function HistoryPage() {
  return <WatchHistoryPage />;
}
