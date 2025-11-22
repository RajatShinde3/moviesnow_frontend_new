// app/settings/page.tsx
/**
 * =============================================================================
 * Main Settings Page
 * =============================================================================
 * Features:
 * - Account settings
 * - Playback preferences
 * - Notification settings
 * - Privacy settings
 * - Language & region
 */

import { SettingsPage } from "@/components/SettingsPage";

export const metadata = {
  title: "Settings - MoviesNow",
  description: "Manage your account settings and preferences",
};

export default function Settings() {
  return <SettingsPage />;
}
