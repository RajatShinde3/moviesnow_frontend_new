// app/settings/analytics/page.tsx
/**
 * =============================================================================
 * User Analytics Dashboard Page
 * =============================================================================
 * Features:
 * - Watch time statistics
 * - Genre preferences
 * - Activity history
 * - Top titles watched
 */

import { UserAnalytics } from "@/components/UserAnalytics";

export const metadata = {
  title: "My Analytics - MoviesNow",
  description: "View your watching statistics and preferences",
};

export default function UserAnalyticsPage() {
  return <UserAnalytics />;
}
