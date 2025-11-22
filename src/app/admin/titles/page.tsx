// app/admin/titles/page.tsx
/**
 * =============================================================================
 * Admin Title Management Page
 * =============================================================================
 * Features:
 * - Title listing with search and filters
 * - CRUD operations
 * - Bulk actions
 * - Status management
 */

import { TitleManager } from "@/components/admin/TitleManager";

export const metadata = {
  title: "Content Library - Admin - MoviesNow",
  description: "Manage titles, episodes, and metadata",
};

export default function AdminTitlesPage() {
  return <TitleManager />;
}
