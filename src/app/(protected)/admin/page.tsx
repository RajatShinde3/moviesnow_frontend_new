// app/(protected)/admin/page.tsx
/**
 * =============================================================================
 * Admin Dashboard - Overview and quick stats
 * =============================================================================
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/lib/api/services";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Film,
  Download,
  TrendingUp,
  Plus,
  Upload,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => api.admin.getAnalyticsSummary(),
  });

  const stats = [
    {
      label: "Total Users",
      value: analytics?.total_users || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Today",
      value: analytics?.active_users_24h || 0,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Titles",
      value: analytics?.total_titles || 0,
      icon: Film,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Views (24h)",
      value: analytics?.total_views_24h || 0,
      icon: BarChart3,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Downloads (24h)",
      value: analytics?.total_downloads_24h || 0,
      icon: Download,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
  ];

  const quickActions = [
    {
      label: "Add Title",
      href: "/admin/titles/new",
      icon: Plus,
      variant: "default" as const,
    },
    {
      label: "Upload Media",
      href: "/admin/upload",
      icon: Upload,
      variant: "outline" as const,
    },
    {
      label: "View Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      variant: "outline" as const,
    },
    {
      label: "Manage Content",
      href: "/admin/titles",
      icon: Film,
      variant: "outline" as const,
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="mt-1 text-muted-foreground">
                Manage your streaming platform
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Button key={action.href} variant={action.variant} asChild>
                <Link href={action.href}>
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col justify-between rounded-lg border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className={`rounded-full p-2 ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold">
                  {isLoading ? "..." : stat.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Popular Titles */}
          {analytics?.popular_titles && analytics.popular_titles.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Popular Titles (24h)</h2>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Type
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium">
                        Views
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {analytics.popular_titles.map((item, index) => (
                      <tr key={item.title.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 text-sm">{index + 1}</td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/title/${item.title.slug || item.title.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {item.title.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground capitalize">
                          {item.title.type.toLowerCase()}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {item.view_count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Quick Links */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/titles"
              className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-primary"
            >
              <Film className="h-8 w-8 text-muted-foreground" />
              <div className="mt-4">
                <h3 className="font-semibold">Content Management</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage movies, series, and episodes
                </p>
              </div>
            </Link>

            <Link
              href="/admin/upload"
              className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-primary"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="mt-4">
                <h3 className="font-semibold">Media Upload</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload videos, posters, and subtitles
                </p>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-primary"
            >
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
              <div className="mt-4">
                <h3 className="font-semibold">Analytics</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  View detailed statistics and reports
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
