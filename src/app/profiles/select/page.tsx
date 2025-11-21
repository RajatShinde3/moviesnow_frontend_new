// app/profiles/select/page.tsx
/**
 * =============================================================================
 * Profile Selection Page - "Who's Watching?"
 * =============================================================================
 * Dedicated route for profile selection
 * Typically shown after login or when switching profiles
 */

import { ProfileSelectorPage } from "@/components/ProfileSelectorModal";

export const metadata = {
  title: "Who's Watching? - MoviesNow",
  description: "Select your profile to continue watching",
};

export default function ProfileSelectPage() {
  return <ProfileSelectorPage />;
}
