// app/subscribe/page.tsx
/**
 * =============================================================================
 * Subscription Plans Page
 * =============================================================================
 * Features:
 * - Plan comparison
 * - Feature breakdown
 * - Pricing options
 * - Payment integration
 */

import { PlanSelector } from "@/components/billing/PlanSelector";

export const metadata = {
  title: "Choose Your Plan - MoviesNow",
  description: "Select the perfect plan for your streaming needs",
};

export default function SubscribePage() {
  return <PlanSelector />;
}
