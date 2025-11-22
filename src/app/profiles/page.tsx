// app/profiles/page.tsx
/**
 * =============================================================================
 * Profile Management Page
 * =============================================================================
 * Features:
 * - Create/edit/delete profiles
 * - Profile avatars
 * - Kids mode
 * - Language preferences
 */

import { ProfileManager } from "@/components/ProfileManager";

export const metadata = {
  title: "Manage Profiles - MoviesNow",
  description: "Create and manage your profiles",
};

export default function ProfilesPage() {
  return <ProfileManager />;
}
