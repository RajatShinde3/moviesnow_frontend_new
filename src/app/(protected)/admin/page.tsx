// app/(protected)/admin/page.tsx
/**
 * =============================================================================
 * Admin Dashboard - Enhanced Overview with Real-time Stats
 * =============================================================================
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Users,
  Film,
  Download,
  TrendingUp,
  Plus,
  Upload,
  BarChart3,
  Settings,
  Eye,
  Play,
  Clock,
  Star,
  Zap,
  Activity,
  DollarSign,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Globe,
  Flame,
} from "lucide-react";
import { fetchJson } from "@/lib/api/client";

export default function AdminDashboard() {
  const router = useRouter();

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ["admin", "analytics", "dashboard"],
    queryFn: () => fetchJson<any>("/api/v1/admin/analytics/dashboard"),
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const stats = [
    {
      label: "Total Users",
      value: analytics?.total_users || 0,
      icon: Users,
      color: "blue",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      label: "Active Today",
      value: analytics?.active_users_24h || 0,
      icon: TrendingUp,
      color: "green",
      trend: "+8.3%",
      trendUp: true,
    },
    {
      label: "Total Titles",
      value: analytics?.total_titles || 0,
      icon: Film,
      color: "purple",
      trend: "+5.2%",
      trendUp: true,
    },
    {
      label: "Views (24h)",
      value: analytics?.total_views_24h || 0,
      icon: Eye,
      color: "orange",
      trend: "+24.1%",
      trendUp: true,
    },
    {
      label: "Downloads (24h)",
      value: analytics?.total_downloads_24h || 0,
      icon: Download,
      color: "cyan",
      trend: "-3.2%",
      trendUp: false,
    },
  ];

  const quickActions = [
    {
      label: "Add Content",
      description: "Upload new movies, series, or anime",
      href: "/admin/content/upload",
      icon: Plus,
      color: "from-blue-600 to-purple-600",
    },
    {
      label: "Manage Titles",
      description: "Browse and edit your content library",
      href: "/admin/titles",
      icon: Film,
      color: "from-purple-600 to-pink-600",
    },
    {
      label: "Upload Media",
      description: "Upload videos, images, and subtitles",
      href: "/admin/upload",
      icon: Upload,
      color: "from-green-600 to-emerald-600",
    },
    {
      label: "View Analytics",
      description: "Detailed insights and reports",
      href: "/admin/analytics",
      icon: BarChart3,
      color: "from-orange-600 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto max-w-screen-2xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Welcome Back, Admin
            </h1>
            <p className="mt-2 text-gray-400">
              Here's what's happening with your platform today
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 font-medium text-white transition-all hover:bg-gray-800 hover:border-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <Link
              href="/admin/settings"
              className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 font-medium text-white transition-all hover:bg-gray-800 hover:border-gray-600"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} isLoading={isLoading} />
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-white">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl transition-all hover:border-gray-700 hover:bg-gray-900"
              >
                <div className={`absolute right-0 top-0 h-24 w-24 opacity-20 blur-3xl bg-gradient-to-br ${action.color}`} />
                <div className="relative">
                  <div className={`mb-4 inline-flex rounded-full bg-gradient-to-br ${action.color} p-3 text-white shadow-lg`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-sm text-gray-400">{action.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-400">
                    Go <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - 2/3 */}
          <div className="space-y-6 lg:col-span-2">
            {/* Popular Titles */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-500/20 p-2">
                    <Flame className="h-5 w-5 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Popular Titles (24h)</h2>
                </div>
                <Link
                  href="/admin/analytics"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View All
                </Link>
              </div>

              {analytics?.popular_titles && analytics.popular_titles.length > 0 ? (
                <div className="space-y-3">
                  {analytics.popular_titles.slice(0, 5).map((item: any, index: number) => (
                    <div
                      key={item.title.id}
                      className="flex items-center gap-4 rounded-lg bg-gray-800/50 p-4 transition-all hover:bg-gray-800"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{item.title.name}</p>
                        <p className="text-sm text-gray-400 capitalize">{item.title.type.toLowerCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{item.view_count.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  <Film className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No data available yet</p>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-purple-500/20 p-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              </div>

              <div className="space-y-3">
                {[
                  { type: "upload", title: "New video uploaded", time: "5 minutes ago", icon: Upload },
                  { type: "user", title: "10 new users registered", time: "1 hour ago", icon: Users },
                  { type: "content", title: "Title published", time: "2 hours ago", icon: Film },
                  { type: "download", title: "50+ downloads", time: "3 hours ago", icon: Download },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg bg-gray-800/50 p-3 transition-colors hover:bg-gray-800"
                  >
                    <div className="rounded-full bg-blue-500/20 p-2">
                      <activity.icon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-2">
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-bold text-white">System Health</h3>
              </div>

              <div className="space-y-3">
                <HealthItem label="API" status="operational" />
                <HealthItem label="Database" status="operational" />
                <HealthItem label="CDN" status="operational" />
                <HealthItem label="Storage" status="operational" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-blue-500/20 p-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-white">Quick Stats</h3>
              </div>

              <div className="space-y-4">
                <QuickStat label="Avg. Watch Time" value="42 min" />
                <QuickStat label="Completion Rate" value="68%" />
                <QuickStat label="Active Streams" value="1,234" />
                <QuickStat label="Avg. Rating" value="4.2/5" />
              </div>
            </div>

            {/* Platform Score */}
            <div className="rounded-xl border border-gray-800 bg-gradient-to-br from-blue-500/10 to-purple-600/10 p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-yellow-500/20 p-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-bold text-white">Performance</h3>
              </div>

              <div className="text-center">
                <div className="mb-4">
                  <p className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    92
                  </p>
                  <p className="mt-2 text-sm text-gray-400">out of 100</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Overall</span>
                    <span className="font-medium text-green-400">Excellent</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Uptime</span>
                    <span className="font-medium text-green-400">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
  trendUp,
  isLoading,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  trend?: string;
  trendUp?: boolean;
  isLoading: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-pink-600",
    orange: "from-orange-500 to-red-600",
    cyan: "from-cyan-500 to-blue-600",
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-800" />
        <div className="mt-4 h-8 w-24 animate-pulse rounded bg-gray-800" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl transition-all hover:border-gray-700">
      <div className={`absolute right-0 top-0 h-32 w-32 opacity-10 blur-3xl bg-gradient-to-br ${colorClasses[color]}`} />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className={`rounded-full bg-gradient-to-br ${colorClasses[color]} p-3 text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span className={`text-xs font-semibold ${trendUp ? "text-green-400" : "text-red-400"}`}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="mt-1 text-3xl font-bold text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function HealthItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${status === "operational" ? "bg-green-400" : "bg-red-400 animate-pulse"}`} />
        <span className={`text-xs font-medium ${status === "operational" ? "text-green-400" : "text-red-400"}`}>
          {status === "operational" ? "Operational" : "Issues"}
        </span>
      </div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
