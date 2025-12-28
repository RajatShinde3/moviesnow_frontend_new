// app/(protected)/admin/monetization/page.tsx
/**
 * =============================================================================
 * Admin - Monetization Control Panel
 * =============================================================================
 * Manage ads configuration, download redirects, revenue tracking
 */

"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  Link as LinkIcon,
  Settings,
  Play,
  Download,
  Target,
  Award,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Zap,
  Clock,
  Users,
  Film,
  Globe,
  Sparkles,
  Crown,
} from "lucide-react";
import { fetchJson } from "@/lib/api/client";

interface AdConfig {
  id: string;
  name: string;
  type: "pre_roll" | "mid_roll" | "pause" | "download_redirect";
  provider: string;
  script_url?: string;
  redirect_url?: string;
  duration_seconds?: number;
  is_active: boolean;
  priority: number;
  created_at: string;
}

interface DownloadRedirect {
  id: string;
  name: string;
  redirect_url: string;
  countdown_seconds: number;
  is_active: boolean;
  total_redirects: number;
  created_at: string;
}

interface RevenueStats {
  total_revenue: number;
  revenue_today: number;
  revenue_this_month: number;
  total_ad_impressions: number;
  total_ad_clicks: number;
  total_download_redirects: number;
  ctr: number;
  avg_cpm: number;
}

export default function MonetizationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"ads" | "redirects" | "revenue">("ads");
  const [isAddingAd, setIsAddingAd] = React.useState(false);
  const [isAddingRedirect, setIsAddingRedirect] = React.useState(false);

  const { data: adConfigs, isLoading: loadingAds, refetch: refetchAds } = useQuery({
    queryKey: ["admin", "monetization", "ads"],
    queryFn: () => fetchJson<AdConfig[]>("/api/v1/admin/monetization/ads"),
  });

  const { data: redirects, isLoading: loadingRedirects, refetch: refetchRedirects } = useQuery({
    queryKey: ["admin", "monetization", "redirects"],
    queryFn: () => fetchJson<DownloadRedirect[]>("/api/v1/admin/monetization/download-redirects"),
  });

  const { data: revenue, refetch: refetchRevenue } = useQuery({
    queryKey: ["admin", "monetization", "revenue"],
    queryFn: () => fetchJson<RevenueStats>("/api/v1/admin/monetization/revenue/stats"),
    refetchInterval: 60000, // Refresh every minute
  });

  const stats = [
    {
      label: "Total Revenue",
      value: `$${revenue?.total_revenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "green",
      trend: "+18.2%",
      trendUp: true,
    },
    {
      label: "Revenue Today",
      value: `$${revenue?.revenue_today?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "blue",
      trend: "+24.1%",
      trendUp: true,
    },
    {
      label: "Ad Impressions",
      value: revenue?.total_ad_impressions?.toLocaleString() || 0,
      icon: Eye,
      color: "purple",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      label: "Download Redirects",
      value: revenue?.total_download_redirects?.toLocaleString() || 0,
      icon: Download,
      color: "orange",
      trend: "+8.3%",
      trendUp: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 shadow-lg shadow-green-500/30">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Monetization Control</h1>
                <p className="mt-1 text-gray-400">Manage ads, redirects, and revenue tracking</p>
              </div>
            </div>

            <button
              onClick={() => {
                refetchAds();
                refetchRedirects();
                refetchRevenue();
              }}
              className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 font-medium text-white transition-all hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh All
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 p-1">
          <button
            onClick={() => setActiveTab("ads")}
            className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "ads" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Play className="h-4 w-4" />
            Ad Configurations
          </button>
          <button
            onClick={() => setActiveTab("redirects")}
            className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "redirects" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            Download Redirects
          </button>
          <button
            onClick={() => setActiveTab("revenue")}
            className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "revenue" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Revenue Analytics
          </button>
        </div>

        {/* Content */}
        {activeTab === "ads" && (
          <AdsTab
            adConfigs={adConfigs || []}
            isLoading={loadingAds}
            isAddingAd={isAddingAd}
            setIsAddingAd={setIsAddingAd}
            refetch={refetchAds}
          />
        )}

        {activeTab === "redirects" && (
          <RedirectsTab
            redirects={redirects || []}
            isLoading={loadingRedirects}
            isAddingRedirect={isAddingRedirect}
            setIsAddingRedirect={setIsAddingRedirect}
            refetch={refetchRedirects}
          />
        )}

        {activeTab === "revenue" && (
          <RevenueTab revenue={revenue} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Ads Tab
// ============================================================================

function AdsTab({
  adConfigs,
  isLoading,
  isAddingAd,
  setIsAddingAd,
  refetch,
}: {
  adConfigs: AdConfig[];
  isLoading: boolean;
  isAddingAd: boolean;
  setIsAddingAd: (value: boolean) => void;
  refetch: () => void;
}) {
  const queryClient = useQueryClient();

  const toggleAdMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await fetchJson(`/api/v1/admin/monetization/ads/${id}/toggle`, {
        method: "PATCH",
        json: { is_active },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "ads"] });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetchJson(`/api/v1/admin/monetization/ads/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "ads"] });
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Ad Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Ad Configurations</h2>
          <p className="text-sm text-gray-400">Manage streaming ads and download redirect ads</p>
        </div>
        <button
          onClick={() => setIsAddingAd(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4" />
          Add Ad Configuration
        </button>
      </div>

      {/* Ad List */}
      <div className="grid gap-4 lg:grid-cols-2">
        {adConfigs.map((ad) => (
          <div
            key={ad.id}
            className="group rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl transition-all hover:border-gray-700"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${ad.is_active ? "bg-green-500/20" : "bg-gray-700/50"}`}>
                  {ad.type === "download_redirect" ? (
                    <Download className={`h-5 w-5 ${ad.is_active ? "text-green-400" : "text-gray-500"}`} />
                  ) : (
                    <Play className={`h-5 w-5 ${ad.is_active ? "text-green-400" : "text-gray-500"}`} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{ad.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">{ad.type.replace("_", " ")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAdMutation.mutate({ id: ad.id, is_active: !ad.is_active })}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  title={ad.is_active ? "Deactivate" : "Activate"}
                >
                  {ad.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => deleteAdMutation.mutate(ad.id)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Provider</span>
                <span className="font-medium text-white">{ad.provider}</span>
              </div>
              {ad.duration_seconds && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="font-medium text-white">{ad.duration_seconds}s</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Priority</span>
                <span className="font-medium text-white">#{ad.priority}</span>
              </div>
              {ad.redirect_url && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-800/50 p-2">
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-blue-400" />
                  <span className="truncate text-xs text-gray-400">{ad.redirect_url}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {adConfigs.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 py-12 text-center">
          <Play className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-3 text-gray-400">No ad configurations yet</p>
          <button
            onClick={() => setIsAddingAd(true)}
            className="mt-4 text-sm text-purple-400 hover:text-purple-300"
          >
            Create your first ad configuration
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Redirects Tab
// ============================================================================

function RedirectsTab({
  redirects,
  isLoading,
  isAddingRedirect,
  setIsAddingRedirect,
  refetch,
}: {
  redirects: DownloadRedirect[];
  isLoading: boolean;
  isAddingRedirect: boolean;
  setIsAddingRedirect: (value: boolean) => void;
  refetch: () => void;
}) {
  const queryClient = useQueryClient();

  const toggleRedirectMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await fetchJson(`/api/v1/admin/monetization/download-redirects/${id}/toggle`, {
        method: "PATCH",
        json: { is_active },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "redirects"] });
    },
  });

  const deleteRedirectMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetchJson(`/api/v1/admin/monetization/download-redirects/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "monetization", "redirects"] });
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Redirect Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Download Redirects</h2>
          <p className="text-sm text-gray-400">Manage external ad redirects for free user downloads</p>
        </div>
        <button
          onClick={() => setIsAddingRedirect(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4" />
          Add Download Redirect
        </button>
      </div>

      {/* Redirect List */}
      <div className="grid gap-4 lg:grid-cols-2">
        {redirects.map((redirect) => (
          <div
            key={redirect.id}
            className="group rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl transition-all hover:border-gray-700"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${redirect.is_active ? "bg-blue-500/20" : "bg-gray-700/50"}`}>
                  <LinkIcon className={`h-5 w-5 ${redirect.is_active ? "text-blue-400" : "text-gray-500"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{redirect.name}</h3>
                  <p className="text-sm text-gray-400">{redirect.total_redirects.toLocaleString()} redirects</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRedirectMutation.mutate({ id: redirect.id, is_active: !redirect.is_active })}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  title={redirect.is_active ? "Deactivate" : "Activate"}
                >
                  {redirect.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => deleteRedirectMutation.mutate(redirect.id)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Countdown</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="font-medium text-white">{redirect.countdown_seconds}s</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-800/50 p-3">
                <ExternalLink className="h-4 w-4 flex-shrink-0 text-blue-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-gray-400">{redirect.redirect_url}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${redirect.is_active ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
              <span className={`text-xs font-medium ${redirect.is_active ? "text-green-400" : "text-gray-500"}`}>
                {redirect.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {redirects.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 py-12 text-center">
          <LinkIcon className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-3 text-gray-400">No download redirects configured</p>
          <button
            onClick={() => setIsAddingRedirect(true)}
            className="mt-4 text-sm text-blue-400 hover:text-blue-300"
          >
            Create your first download redirect
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Revenue Tab
// ============================================================================

function RevenueTab({ revenue }: { revenue?: RevenueStats }) {
  const metrics = [
    { label: "Total Revenue", value: `$${revenue?.total_revenue?.toLocaleString() || 0}`, color: "green" },
    { label: "Revenue Today", value: `$${revenue?.revenue_today?.toLocaleString() || 0}`, color: "blue" },
    { label: "Revenue This Month", value: `$${revenue?.revenue_this_month?.toLocaleString() || 0}`, color: "purple" },
    { label: "Total Ad Impressions", value: revenue?.total_ad_impressions?.toLocaleString() || 0, color: "orange" },
    { label: "Total Ad Clicks", value: revenue?.total_ad_clicks?.toLocaleString() || 0, color: "cyan" },
    { label: "Download Redirects", value: revenue?.total_download_redirects?.toLocaleString() || 0, color: "pink" },
    { label: "Click-Through Rate", value: `${revenue?.ctr?.toFixed(2) || 0}%`, color: "yellow" },
    { label: "Average CPM", value: `$${revenue?.avg_cpm?.toFixed(2) || 0}`, color: "indigo" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Revenue Analytics</h2>
        <p className="text-sm text-gray-400">Track earnings and performance metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <p className="text-sm text-gray-400">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Performance Score */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gradient-to-br from-green-500/10 to-emerald-600/10 p-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-full bg-yellow-500/20 p-3">
              <Award className="h-6 w-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Revenue Performance</h3>
          </div>
          <p className="mb-6 text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            87
          </p>
          <p className="text-sm text-gray-400">Out of 100</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-purple-500/20 p-2">
              <Target className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-bold text-white">Performance Breakdown</h3>
          </div>
          <div className="space-y-4">
            <PerformanceBar label="Ad Fill Rate" percentage={92} color="green" />
            <PerformanceBar label="Viewability" percentage={85} color="blue" />
            <PerformanceBar label="Engagement" percentage={78} color="purple" />
            <PerformanceBar label="Redirect Success" percentage={94} color="orange" />
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
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  trend?: string;
  trendUp?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    green: "from-green-500 to-emerald-600",
    blue: "from-blue-500 to-cyan-600",
    purple: "from-purple-500 to-pink-600",
    orange: "from-orange-500 to-red-600",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-xl">
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
        <p className="mt-1 text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function PerformanceBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  const colorClasses: Record<string, string> = {
    green: "from-green-600 to-emerald-600",
    blue: "from-blue-600 to-cyan-600",
    purple: "from-purple-600 to-pink-600",
    orange: "from-orange-600 to-red-600",
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-bold text-white">{percentage}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
