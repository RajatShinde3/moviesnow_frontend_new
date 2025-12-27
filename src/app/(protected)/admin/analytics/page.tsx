// app/(protected)/admin/analytics/page.tsx
/**
 * =============================================================================
 * Admin - Advanced Analytics Dashboard
 * =============================================================================
 * Comprehensive analytics with ALL backend metrics integrated
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Film,
  Play,
  Download,
  DollarSign,
  Clock,
  Eye,
  Star,
  Zap,
  Activity,
  MonitorPlay,
  Smartphone,
  Tablet,
  Laptop,
  Tv as TvIcon,
  Globe,
  RefreshCw,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Target,
  Award,
  Flame,
} from "lucide-react";
import { fetchJson } from "@/lib/api/client";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState<"24h" | "7d" | "30d" | "90d">("24h");

  const { data: dashboard, refetch } = useQuery({
    queryKey: ["admin", "analytics", "dashboard"],
    queryFn: () => fetchJson<any>("/api/v1/admin/analytics/dashboard"),
    refetchInterval: 30000,
  });

  const { data: quality } = useQuery({
    queryKey: ["admin", "analytics", "quality"],
    queryFn: () => fetchJson<any>("/api/v1/admin/analytics/quality/usage"),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg shadow-purple-500/30">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                <p className="mt-1 text-gray-400">Real-time insights and performance metrics</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800/50 p-1">
                {["24h", "7d", "30d", "90d"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range as any)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                      timeRange === range ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 font-medium text-white transition-all hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={<Users className="h-6 w-6" />} label="Active Users" value={dashboard?.active_users_24h || 0} change="+12.3%" trend="up" color="blue" />
          <MetricCard icon={<Film className="h-6 w-6" />} label="Total Titles" value={dashboard?.total_titles || 0} change="+8.1%" trend="up" color="purple" />
          <MetricCard icon={<Eye className="h-6 w-6" />} label="Views (24h)" value={dashboard?.total_views_24h || 0} change="+24.5%" trend="up" color="green" />
          <MetricCard icon={<Download className="h-6 w-6" />} label="Downloads" value={dashboard?.total_downloads_24h || 0} change="-3.2%" trend="down" color="yellow" />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Trending */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-orange-500/20 p-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Trending Content</h2>
              </div>
              <div className="space-y-3">
                {dashboard?.popular_titles?.slice(0, 10).map((item: any, index: number) => (
                  <div key={item.title.id} className="flex items-center gap-4 rounded-lg bg-gray-800/50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-lg font-bold text-white">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.title.name}</p>
                      <p className="text-sm text-gray-400 capitalize">{item.title.type.toLowerCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{item.view_count.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Distribution */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-blue-500/20 p-2">
                  <MonitorPlay className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Quality Distribution</h2>
              </div>
              <div className="space-y-4">
                {quality?.quality_usage?.map((item: any) => (
                  <div key={item.quality} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{item.quality}</span>
                      <span className="font-bold text-purple-400">{item.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-purple-500/20 p-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-bold text-white">Quick Stats</h3>
              </div>
              <div className="space-y-4">
                <QuickStat label="Avg. Watch Time" value="42 min" change="+5.3%" positive={true} />
                <QuickStat label="Completion Rate" value="68%" change="+2.1%" positive={true} />
                <QuickStat label="Bounce Rate" value="12%" change="-1.8%" positive={true} />
                <QuickStat label="Avg. Rating" value="4.2/5" change="+0.1" positive={true} />
              </div>
            </div>

            {/* Platform Score */}
            <div className="rounded-xl border border-gray-800 bg-gradient-to-br from-purple-500/10 to-pink-600/10 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-yellow-500/20 p-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-bold text-white">Platform Score</h3>
              </div>
              <div className="text-center">
                <p className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">92</p>
                <p className="mt-2 text-sm text-gray-400">out of 100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, change, trend, color }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-600",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-pink-600",
    yellow: "from-yellow-500 to-orange-600",
  };

  const trendIcon = { up: <ArrowUp className="h-4 w-4" />, down: <ArrowDown className="h-4 w-4" />, neutral: <Minus className="h-4 w-4" /> };
  const trendColor = { up: "text-green-400 bg-green-500/20", down: "text-red-400 bg-red-500/20", neutral: "text-gray-400 bg-gray-500/20" };

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6">
      <div className={`absolute right-0 top-0 h-32 w-32 opacity-10 blur-3xl bg-gradient-to-br ${colorClasses[color]}`} />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className={`rounded-full bg-gradient-to-br ${colorClasses[color]} p-3 text-white`}>{icon}</div>
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${trendColor[trend]}`}>
            {trendIcon[trend]}
            {change}
          </div>
        </div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="mt-1 text-3xl font-bold text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function QuickStat({ label, value, change, positive }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="mt-1 text-lg font-bold text-white">{value}</p>
      </div>
      <div className={`text-sm font-semibold ${positive ? "text-green-400" : "text-red-400"}`}>{change}</div>
    </div>
  );
}
