// app/settings/security/page.tsx
/**
 * =============================================================================
 * Security Settings Page
 * =============================================================================
 * Best Practices:
 * - Centralized security management
 * - Clear visual hierarchy
 * - Progressive disclosure
 * - Audit trail visibility
 */

import { SecuritySettingsPage } from "@/components/security/SecuritySettings";

export const metadata = {
  title: "Security Settings - MoviesNow",
  description: "Manage your account security and authentication settings",
};

export default function SecuritySettings() {
  return <SecuritySettingsPage />;
}
