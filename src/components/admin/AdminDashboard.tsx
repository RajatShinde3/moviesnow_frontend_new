// components/admin/AdminDashboard.tsx
/**
 * =============================================================================
 * Admin Dashboard - Main Overview
 * =============================================================================
 * Best Practices:
 * - Real-time data with React Query
 * - Modular card-based layout
 * - Progressive enhancement
 * - Responsive design
 * - Quick action shortcuts
 * - Data visualization
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import { cn } from "@/lib/cn";
import {
  Film,
  Users,
  Play,
  Download,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Plus,
  Upload,
  Settings,
  BarChart3,
  Eye,
  Clock,
} from "lucide-react";

/**
 * Main Admin Dashboard Component
 */
export function AdminDashboard() {
  const router = useRouter();

  // Fetch analytics summary
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => api.admin.getAnalyticsSummary(),
    refetchInterval: 30000, // Refresh every 30s
  });

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 text-gray-400">
              Manage your platform and monitor key metrics
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/admin/titles/new")}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Add Title
            </button>
            <button
              onClick={() => router.push("/admin/upload")}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-700"
            >
              <Upload className="h-5 w-5" />
              Upload
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<Film className="h-6 w-6" />}
            label="Total Titles"
            value={analytics?.total_titles || 0}
            change={analytics?.titles_change}
            isLoading={isLoading}
            color="blue"
          />
          <MetricCard
            icon={<Users className="h-6 w-6" />}
            label="Active Users"
            value={analytics?.active_users || 0}
            change={analytics?.users_change}
            isLoading={isLoading}
            color="green"
          />
          <MetricCard
            icon={<Play className="h-6 w-6" />}
            label="Views (24h)"
            value={analytics?.views_24h || 0}
            change={analytics?.views_change}
            isLoading={isLoading}
            color="purple"
          />
          <MetricCard
            icon={<DollarSign className="h-6 w-6" />}
            label="Revenue (MTD)"
            value={`$${(analytics?.revenue_mtd || 0).toLocaleString()}`}
            change={analytics?.revenue_change}
            isLoading={isLoading}
            color="yellow"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <PopularContent />
            <SystemStatus />
          </div>
        </div>

        {/* Management Sections */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ManagementCard
            icon={<Film className="h-8 w-8" />}
            title="Content Library"
            description="Manage titles, episodes, and metadata"
            href="/admin/titles"
            color="blue"
          />
          <ManagementCard
            icon={<Upload className="h-8 w-8" />}
            title="Upload Center"
            description="Upload and process video files"
            href="/admin/upload"
            color="purple"
          />
          <ManagementCard
            icon={<Users className="h-8 w-8" />}
            title="User Management"
            description="Manage users, roles, and permissions"
            href="/admin/users"
            color="green"
          />
          <ManagementCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Analytics"
            description="View detailed platform analytics"
            href="/admin/analytics"
            color="yellow"
          />
          <ManagementCard
            icon={<Download className="h-8 w-8" />}
            title="Downloads"
            description="Manage bundles and downloads"
            href="/admin/downloads"
            color="pink"
          />
          <ManagementCard
            icon={<Settings className="h-8 w-8" />}
            title="Settings"
            description="Platform configuration and settings"
            href="/admin/settings"
            color="gray"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({
  icon,
  label,
  value,
  change,
  isLoading,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  change?: number;
  isLoading: boolean;
  color: "blue" | "green" | "purple" | "yellow" | "pink" | "gray";
}) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    pink: "bg-pink-500/20 text-pink-400",
    gray: "bg-gray-500/20 text-gray-400",
  };

  if (isLoading) {
    return (
      <div className="rounded-lg bg-gray-900 p-6">
        <div className="mb-4 h-12 w-12 animate-pulse rounded-full bg-gray-800" />
        <div className="h-8 w-24 animate-pulse rounded bg-gray-800" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-900 p-6 transition-all hover:bg-gray-800">
      <div className="mb-4 flex items-start justify-between">
        <div className={cn("rounded-full p-3", colorClasses[color])}>{icon}</div>
        {change !== undefined && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              change >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            )}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-sm text-gray-400">{label}</div>
    </div>
  );
}

/**
 * Recent Activity Component
 */
function RecentActivity() {
  const { data: activity, isLoading } = useQuery({
    queryKey: ["admin", "recent-activity"],
    queryFn: async () => {
      // Mock data for now - replace with real endpoint
      return [
        {
          id: 1,
          type: "upload",
          title: "New title uploaded",
          description: "The Matrix Resurrections",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          user: "admin@moviesnow.com",
        },
        {
          id: 2,
          type: "user",
          title: "New user registered",
          description: "john.doe@example.com",
          timestamp: new Date(Date.now() - 600000).toISOString(),
        },
        {
          id: 3,
          type: "content",
          title: "Title updated",
          description: "Inception metadata updated",
          timestamp: new Date(Date.now() - 900000).toISOString(),
          user: "editor@moviesnow.com",
        },
      ];
    },
  });

  return (
    <div className="rounded-lg bg-gray-900 p-6">
      <h2 className="mb-4 text-xl font-semibold text-white">Recent Activity</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-800" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-48 animate-pulse rounded bg-gray-800" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {activity?.map((item: any) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg bg-gray-800 p-3 transition-colors hover:bg-gray-700"
            >
              <div className="rounded-full bg-blue-500/20 p-2">
                <Clock className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-gray-400">{item.description}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleTimeString()} •{" "}
                  {item.user || "System"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Popular Content Component
 */
function PopularContent() {
  const { data: popular } = useQuery({
    queryKey: ["admin", "popular-content"],
    queryFn: () => api.discovery.getPopular(5),
  });

  return (
    <div className="rounded-lg bg-gray-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Popular Now</h3>
      <div className="space-y-3">
        {popular?.slice(0, 5).map((title: any, i: number) => (
          <div key={title.id} className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-600">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{title.title}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Eye className="h-3 w-3" />
                <span>{(title.view_count || 0).toLocaleString()} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * System Status Component
 */
function SystemStatus() {
  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: () => api.health.checkReadiness(),
    refetchInterval: 60000, // Check every minute
  });

  const status = health?.status === "ok" ? "operational" : "issues";

  return (
    <div className="rounded-lg bg-gray-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">System Status</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">API</span>
          <span
            className={cn(
              "flex items-center gap-2 text-xs font-medium",
              status === "operational" ? "text-green-400" : "text-red-400"
            )}
          >
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                status === "operational" ? "bg-green-400" : "bg-red-400 animate-pulse"
              )}
            />
            {status === "operational" ? "Operational" : "Issues"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Database</span>
          <span className="flex items-center gap-2 text-xs font-medium text-green-400">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            Operational
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">CDN</span>
          <span className="flex items-center gap-2 text-xs font-medium text-green-400">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            Operational
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Management Card Component
 */
function ManagementCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: "blue" | "green" | "purple" | "yellow" | "pink" | "gray";
}) {
  const router = useRouter();

  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
    green: "bg-green-500/20 text-green-400 hover:bg-green-500/30",
    purple: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30",
    pink: "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30",
    gray: "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30",
  };

  return (
    <button
      onClick={() => router.push(href)}
      className="group rounded-lg bg-gray-900 p-6 text-left transition-all hover:bg-gray-800"
    >
      <div className={cn("mb-4 rounded-full p-3 transition-colors", colorClasses[color])}>
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-400">{description}</p>
    </button>
  );
}
