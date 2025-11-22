// app/admin/page.tsx
/**
 * =============================================================================
 * Admin Dashboard - Overview
 * =============================================================================
 * Best Practices:
 * - Role-based access control
 * - Real-time metrics
 * - Quick actions
 * - Responsive grid layout
 * - Data visualization
 */

import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "Admin Dashboard - MoviesNow",
  description: "Manage your platform content, users, and analytics",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
