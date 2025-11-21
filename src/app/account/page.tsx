// app/account/page.tsx
/**
 * =============================================================================
 * Account Settings Page
 * =============================================================================
 */

import { AccountSettingsPage } from "@/components/AccountSettings";

export const metadata = {
  title: "Account Settings - MoviesNow",
  description: "Manage your account, security, and preferences",
};

export default function AccountPage() {
  return <AccountSettingsPage />;
}
