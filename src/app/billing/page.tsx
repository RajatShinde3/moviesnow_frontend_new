// app/billing/page.tsx
/**
 * =============================================================================
 * Billing Management Page
 * =============================================================================
 * Features:
 * - Current subscription details
 * - Payment method management
 * - Billing history
 * - Invoice downloads
 * - Plan upgrades/downgrades
 */

import { BillingManagement } from "@/components/billing/BillingManagement";

export const metadata = {
  title: "Billing & Subscription - MoviesNow",
  description: "Manage your subscription and billing",
};

export default function BillingPage() {
  return <BillingManagement />;
}
