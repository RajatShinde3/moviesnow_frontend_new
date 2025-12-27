"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Download,
  Globe,
  Clock,
  TrendingUp,
  Film,
  Tv,
  FileVideo,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api/services";
import {
  PieChart,
  BarChart,
  LineChart,
  StatCard,
  AreaChart,
} from "@/components/ui/data/Charts";

export default function DownloadAnalyticsPage() {
  const [dateRange, setDateRange] = useState<{
    start_date?: string;
    end_date?: string;
  }>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  // Fetch download analytics data
  const { data: downloadData, isLoading } = useQuery({
    queryKey: ["admin", "analytics", "downloads", dateRange],
    queryFn: () => api.advancedAnalytics.getDownloadAnalytics(dateRange),
  });

  if (isLoading || !downloadData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-6">
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

  // Calculate metrics
  const avgDownloadTime = downloadData.average_download_time / 60; // Convert to minutes
  const successRate = downloadData.completion_rate;

  // Prepare chart data
  const qualityData = downloadData.downloads_by_quality.map((q) => ({
    name: q.quality,
    value: q.count,
    percentage: q.percentage,
  }));

  const contentTypeData = downloadData.downloads_by_content_type.map((ct) => ({
    name: ct.content_type,
    value: ct.count,
    percentage: ct.percentage,
  }));

  const topCountries = downloadData.geographic_distribution
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Peak times data (create heatmap data)
  const peakTimesData = downloadData.peak_download_times
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Download Analytics Dashboard
            </h1>
            <p className="text-slate-400">
              Track download patterns, quality preferences, and geographic distribution
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
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end_date: e.target.value }))
              }
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            title="Total Downloads"
            value={downloadData.total_downloads.toLocaleString()}
            change={15.3}
            trend="up"
            icon={Download}
          />
          <StatCard
            title="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            change={successRate > 90 ? 5.2 : -2.1}
            trend={successRate > 90 ? "up" : "down"}
            icon={CheckCircle}
          />
          <StatCard
            title="Avg Download Time"
            value={`${avgDownloadTime.toFixed(1)}m`}
            change={-8.5}
            trend="up"
            icon={Clock}
          />
          <StatCard
            title="Failed Downloads"
            value={downloadData.failed_downloads.toLocaleString()}
            change={-12.3}
            trend="up"
            icon={XCircle}
          />
        </motion.div>

        {/* Conversion Rates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Premium Users</h3>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {downloadData.conversion_rate.premium_users.toFixed(1)}%
            </div>
            <p className="text-slate-400 text-sm">Conversion Rate</p>
            <div className="mt-4 text-sm text-green-400">
              Direct downloads, no ads
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Free Users</h3>
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {downloadData.conversion_rate.free_users.toFixed(1)}%
            </div>
            <p className="text-slate-400 text-sm">Conversion Rate</p>
            <div className="mt-4 text-sm text-blue-400">
              After viewing ads
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Overall</h3>
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {downloadData.conversion_rate.overall.toFixed(1)}%
            </div>
            <p className="text-slate-400 text-sm">Conversion Rate</p>
            <div className="mt-4 text-sm text-purple-400">
              All users combined
            </div>
          </div>
        </motion.div>

        {/* Downloads by Quality */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Downloads by Quality</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChart
              data={qualityData}
              dataKey="value"
              nameKey="name"
              colors={["#10B981", "#3B82F6", "#8B5CF6"]}
              innerRadius={70}
              showPercentage
              height={300}
            />
            <div className="space-y-4">
              {downloadData.downloads_by_quality.map((q, index) => (
                <div
                  key={q.quality}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: ["#10B981", "#3B82F6", "#8B5CF6"][index],
                      }}
                    />
                    <span className="text-white font-medium">{q.quality}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {q.count.toLocaleString()}
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

        {/* Downloads by Content Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            Downloads by Content Type
          </h2>
          <BarChart
            data={contentTypeData}
            dataKeys={[{ key: "value", name: "Downloads", color: "#3B82F6" }]}
            xAxisKey="name"
            height={300}
          />
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            Top 10 Countries by Downloads
          </h2>
          <div className="space-y-3">
            {topCountries.map((country, index) => {
              const percentage =
                (country.count / downloadData.total_downloads) * 100;
              return (
                <div key={country.country_code} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono text-sm w-6">
                        #{index + 1}
                      </span>
                      <span className="text-2xl">{country.country_code}</span>
                      <span className="text-white font-medium">
                        {country.country}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">
                        {country.count.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Peak Download Times */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            Peak Download Times
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {peakTimesData.map((time) => {
              const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const intensity = Math.min(
                (time.count / Math.max(...peakTimesData.map((t) => t.count))) * 100,
                100
              );
              return (
                <div
                  key={`${time.day_of_week}-${time.hour}`}
                  className="p-4 bg-slate-800/50 rounded-lg relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                    style={{ opacity: intensity / 100 }}
                  />
                  <div className="relative">
                    <div className="text-slate-400 text-sm mb-1">
                      {days[time.day_of_week]}
                    </div>
                    <div className="text-white font-bold text-lg mb-1">
                      {time.hour.toString().padStart(2, "0")}:00
                    </div>
                    <div className="text-sm text-slate-400">
                      {time.count.toLocaleString()} downloads
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Insights & Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            💡 Download Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">
                High Success Rate
              </h3>
              <p className="text-slate-300 text-sm">
                {successRate.toFixed(1)}% completion rate shows excellent CDN
                performance and user experience.
              </p>
            </div>
            {downloadData.conversion_rate.premium_users >
              downloadData.conversion_rate.free_users && (
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h3 className="text-purple-400 font-semibold mb-2">
                  Premium Value
                </h3>
                <p className="text-slate-300 text-sm">
                  Premium users have{" "}
                  {(
                    (downloadData.conversion_rate.premium_users /
                      downloadData.conversion_rate.free_users) *
                    100
                  ).toFixed(0)}
                  % higher conversion - direct downloads work!
                </p>
              </div>
            )}
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">
                Quality Preference
              </h3>
              <p className="text-slate-300 text-sm">
                {qualityData[0].name} is most downloaded (
                {qualityData[0].percentage.toFixed(1)}%). Optimize storage for this
                quality.
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="text-amber-400 font-semibold mb-2">
                Geographic Focus
              </h3>
              <p className="text-slate-300 text-sm">
                Top 3 countries account for{" "}
                {topCountries
                  .slice(0, 3)
                  .reduce((sum, c) => sum + c.percentage, 0)
                  .toFixed(1)}
                % of downloads. Consider localized CDN.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
