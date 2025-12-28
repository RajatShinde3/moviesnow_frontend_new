"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Wifi,
  Download,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
} from "lucide-react";
import { api } from "@/lib/api/services";
import { PieChart, BarChart, LineChart, StatCard } from "@/components/ui/data/Charts";

export default function QualityAnalyticsPage() {
  const [dateRange, setDateRange] = useState<{
    start_date?: string;
    end_date?: string;
  }>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  // Fetch quality analytics data
  const { data: qualityData, isLoading } = useQuery({
    queryKey: ["admin", "analytics", "quality", dateRange],
    queryFn: () => api.advancedAnalytics.qualityUsage(),
  });

  if (isLoading || !qualityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-slate-800 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  // Calculate metrics from data
  const totalViews = qualityData.quality_distribution.reduce(
    (sum: number, q: any) => sum + q.total_views,
    0
  );
  const mostPopularQuality = qualityData.user_preferences.most_selected;
  const upgradeRate = qualityData.user_preferences.upgrade_rate;
  const downgradeRate = qualityData.user_preferences.downgrade_rate;

  // Prepare chart data
  const qualityDistributionData = qualityData.quality_distribution.map((q: any) => ({
    name: q.quality,
    value: q.count,
    percentage: q.percentage,
  }));

  const bandwidthData = qualityData.bandwidth_by_quality.map((q: any) => ({
    quality: q.quality,
    bandwidth: q.bandwidth,
    cost: q.cost,
  }));

  const contentTypeData = qualityData.quality_by_content_type.map((ct: any) => ({
    name: ct.content_type,
    ...ct.quality_breakdown,
  }));

  const deviceData = qualityData.quality_by_device.map((d: any) => ({
    name: d.device_type,
    ...d.quality_breakdown,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Quality Analytics Dashboard
            </h1>
            <p className="text-slate-400">
              Analyze streaming quality preferences and performance metrics
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex gap-3">
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start_date: e.target.value }))
              }
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end_date: e.target.value }))
              }
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Views"
            value={totalViews.toLocaleString()}
            change={12.5}
            trend="up"
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard
            title="Most Popular Quality"
            value={mostPopularQuality}
            icon={<Wifi className="w-5 h-5" />}
          />
          <StatCard
            title="Quality Upgrade Rate"
            value={`${upgradeRate.toFixed(1)}%`}
            change={upgradeRate}
            trend={upgradeRate > 0 ? "up" : "down"}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            title="Quality Downgrade Rate"
            value={`${downgradeRate.toFixed(1)}%`}
            change={-downgradeRate}
            trend={downgradeRate > 0 ? "down" : "up"}
            icon={<TrendingDown className="w-5 h-5" />}
          />
        </motion.div>

        {/* Quality Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Quality Distribution</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-4">
                Views by Quality
              </h3>
              <PieChart
                data={qualityDistributionData}
                dataKey="value"
                nameKey="name"
                colors={["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B"]}
                innerRadius={60}
                showPercentage
                height={300}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-400 mb-4">
                Quality Breakdown
              </h3>
              {qualityData.quality_distribution.map((q: any, index: number) => (
                <div
                  key={q.quality}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B"][index],
                      }}
                    />
                    <span className="text-white font-medium">{q.quality}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {q.total_views.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">
                      {q.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bandwidth & Cost Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            Bandwidth & Cost Analysis
          </h2>
          <BarChart
            data={bandwidthData}
            dataKeys={[
              { key: "bandwidth", name: "Bandwidth (GB)", color: "#3B82F6" },
              { key: "cost", name: "Cost ($)", color: "#10B981" },
            ]}
            xAxisKey="quality"
            height={350}
          />
        </motion.div>

        {/* Quality by Content Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            Quality Preferences by Content Type
          </h2>
          <BarChart
            data={contentTypeData}
            dataKeys={[
              { key: "480p", name: "480p", color: "#10B981" },
              { key: "720p", name: "720p", color: "#3B82F6" },
              { key: "1080p", name: "1080p", color: "#8B5CF6" },
              { key: "4K", name: "4K", color: "#F59E0B" },
            ]}
            xAxisKey="name"
            stacked
            height={350}
          />
        </motion.div>

        {/* Quality by Device */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            Quality Preferences by Device
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart
              data={deviceData}
              dataKeys={[
                { key: "480p", name: "480p", color: "#10B981" },
                { key: "720p", name: "720p", color: "#3B82F6" },
                { key: "1080p", name: "1080p", color: "#8B5CF6" },
                { key: "4K", name: "4K", color: "#F59E0B" },
              ]}
              xAxisKey="name"
              stacked
              height={300}
            />
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-400 mb-4">
                Device Insights
              </h3>
              {qualityData.quality_by_device.map((device: any) => {
                const icon =
                  device.device_type === "desktop"
                    ? Monitor
                    : device.device_type === "mobile"
                      ? Smartphone
                      : device.device_type === "tablet"
                        ? Tablet
                        : Tv;
                const Icon = icon;
                const topQuality = Object.entries(device.quality_breakdown).sort(
                  ([, a]: [string, any], [, b]: [string, any]) => (b as number) - (a as number)
                )[0];

                return (
                  <div
                    key={device.device_type}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-white font-medium capitalize">
                          {device.device_type}
                        </div>
                        <div className="text-sm text-slate-400">
                          Prefers {topQuality[0]}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">
                        {((topQuality[1] as number) / 100).toFixed(0)}% of users
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            💡 Optimization Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upgradeRate > 10 && (
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h3 className="text-green-400 font-semibold mb-2">
                  High Quality Demand
                </h3>
                <p className="text-slate-300 text-sm">
                  {upgradeRate.toFixed(1)}% upgrade rate indicates users want higher
                  quality. Consider promoting premium tiers.
                </p>
              </div>
            )}
            {downgradeRate > 5 && (
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h3 className="text-amber-400 font-semibold mb-2">
                  Network Issues Detected
                </h3>
                <p className="text-slate-300 text-sm">
                  {downgradeRate.toFixed(1)}% downgrade rate suggests buffering
                  issues. Check CDN performance.
                </p>
              </div>
            )}
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">
                Bandwidth Optimization
              </h3>
              <p className="text-slate-300 text-sm">
                {mostPopularQuality} is most popular. Optimize caching for this
                quality tier.
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="text-purple-400 font-semibold mb-2">Cost Savings</h3>
              <p className="text-slate-300 text-sm">
                Monitor 4K usage closely - it costs{" "}
                {(
                  (bandwidthData.find((b: any) => b.quality === "4K")?.cost || 0) /
                    (bandwidthData.find((b: any) => b.quality === "1080p")?.cost || 1)
                ).toFixed(1)}
                x more than 1080p.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
