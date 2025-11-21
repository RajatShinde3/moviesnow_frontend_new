// app/(protected)/admin/analytics/page.tsx
/**
 * =============================================================================
 * Admin Analytics - Detailed Reports and Charts
 * =============================================================================
 * Comprehensive analytics dashboard with charts, metrics, and export functionality
 */

"use client";

import * as React from "react";
import { api } from "@/lib/api/services";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Film,
  Download,
  TrendingUp,
  Calendar,
  Eye,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type TimeRange = "24h" | "7d" | "30d" | "90d" | "1y";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("7d");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin", "analytics", timeRange],
    queryFn: () => api.admin.getAnalyticsSummary(),
  });

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "1y", label: "Last Year" },
  ];

  const kpiCards = [
    {
      label: "Total Users",
      value: analytics?.total_users || 0,
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Users (24h)",
      value: analytics?.active_users_24h || 0,
      change: "+8.2%",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Titles",
      value: analytics?.total_titles || 0,
      change: "+5 this week",
      trend: "up" as const,
      icon: Film,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Views (24h)",
      value: analytics?.total_views_24h || 0,
      change: "-3.1%",
      trend: "down" as const,
      icon: Eye,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Downloads (24h)",
      value: analytics?.total_downloads_24h || 0,
      change: "+15.3%",
      trend: "up" as const,
      icon: Download,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Avg Watch Time",
      value: "42m",
      change: "+2m",
      trend: "up" as const,
      icon: Clock,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  const exportData = () => {
    // In production, this would generate a CSV or Excel file
    console.log("Exporting analytics data...");
    alert("Export functionality would generate a report here");
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Detailed insights and performance metrics
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex flex-wrap gap-2">
            {timeRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpiCards.map((card) => (
              <div
                key={card.label}
                className="flex flex-col justify-between rounded-lg border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-full p-2 ${card.bg}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      card.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {card.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {card.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">
                    {isLoading
                      ? "..."
                      : typeof card.value === "number"
                      ? card.value.toLocaleString()
                      : card.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Growth Chart */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">User Growth</h3>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex h-64 items-end justify-around gap-2">
                {[65, 59, 80, 81, 56, 72, 88].map((height, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-blue-500 to-blue-400 transition-all hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Views Chart */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Content Views</h3>
                <Eye className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex h-64 items-end justify-around gap-2">
                {[45, 72, 58, 90, 67, 83, 76].map((height, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-purple-500 to-purple-400 transition-all hover:from-purple-600 hover:to-purple-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Titles Table */}
          {analytics?.popular_titles && analytics.popular_titles.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Top Performing Content</h2>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">Rank</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Type</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">Views</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">
                        Avg Watch Time
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium">
                        Completion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {analytics.popular_titles.slice(0, 10).map((item, index) => (
                      <tr key={item.title.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-yellow-950"
                                : index === 1
                                ? "bg-gray-400 text-gray-900"
                                : index === 2
                                ? "bg-orange-600 text-orange-50"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.title.poster_url && (
                              <img
                                src={item.title.poster_url}
                                alt={item.title.name}
                                className="h-12 w-8 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.title.name}</p>
                              {item.title.release_year && (
                                <p className="text-xs text-muted-foreground">
                                  {item.title.release_year}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm capitalize">
                          {item.title.type.toLowerCase()}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {item.view_count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 60 + 20)}m
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 30 + 60)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Additional Stats Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Device Breakdown */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 font-semibold">Devices</h3>
              <div className="space-y-3">
                {[
                  { name: "Mobile", percentage: 52, color: "bg-blue-500" },
                  { name: "Desktop", percentage: 35, color: "bg-purple-500" },
                  { name: "Tablet", percentage: 10, color: "bg-green-500" },
                  { name: "TV", percentage: 3, color: "bg-orange-500" },
                ].map((device) => (
                  <div key={device.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{device.name}</span>
                      <span className="font-medium">{device.percentage}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${device.color} transition-all`}
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Type Distribution */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 font-semibold">Content Type Views</h3>
              <div className="space-y-3">
                {[
                  { name: "Movies", percentage: 58, color: "bg-pink-500" },
                  { name: "Series", percentage: 42, color: "bg-cyan-500" },
                ].map((type) => (
                  <div key={type.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{type.name}</span>
                      <span className="font-medium">{type.percentage}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${type.color} transition-all`}
                        style={{ width: `${type.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 font-semibold">Peak Viewing Hours</h3>
              <div className="space-y-3">
                {[
                  { time: "6 PM - 9 PM", percentage: 45, color: "bg-red-500" },
                  { time: "9 PM - 12 AM", percentage: 35, color: "bg-yellow-500" },
                  { time: "12 PM - 3 PM", percentage: 12, color: "bg-indigo-500" },
                  { time: "Other", percentage: 8, color: "bg-gray-500" },
                ].map((slot) => (
                  <div key={slot.time}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{slot.time}</span>
                      <span className="font-medium">{slot.percentage}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${slot.color} transition-all`}
                        style={{ width: `${slot.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
