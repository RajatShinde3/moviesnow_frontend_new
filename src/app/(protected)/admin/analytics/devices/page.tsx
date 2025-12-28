"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Laptop,
  Chrome,
  Globe,
  Wifi,
  Activity,
} from "lucide-react";
import { api } from "@/lib/api/services";
import { PieChart, BarChart, StatCard } from "@/components/ui/data/Charts";

const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  tv: Tv,
  other: Laptop,
};

const CONNECTION_COLORS = {
  "4g": "#F59E0B",
  "5g": "#10B981",
  wifi: "#3B82F6",
  ethernet: "#8B5CF6",
  other: "#6B7280",
};

export default function DeviceAnalyticsPage() {
  const [dateRange, setDateRange] = useState<{
    start_date?: string;
    end_date?: string;
  }>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  // Fetch device analytics data
  const { data: deviceData, isLoading } = useQuery({
    queryKey: ["admin", "analytics", "devices", dateRange],
    queryFn: () => api.advancedAnalytics.deviceInsights(),
  });

  if (isLoading || !deviceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950 p-6">
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
  const totalDevices = deviceData.device_distribution.reduce((sum: number, d: any) => sum + d.count, 0);
  const mobileUsers =
    (deviceData.device_distribution.find((d: any) => d.device_type === "mobile")?.count || 0) +
    (deviceData.device_distribution.find((d: any) => d.device_type === "tablet")?.count || 0);
  const mobilePercentage = (mobileUsers / totalDevices) * 100;

  // Prepare chart data
  const deviceDistributionData = deviceData.device_distribution.map((d: any) => ({
    name: d.device_type.charAt(0).toUpperCase() + d.device_type.slice(1),
    value: d.count,
    percentage: d.percentage,
  }));

  const osDistributionData = deviceData.os_distribution.map((os: any) => ({
    name: os.version ? `${os.os} ${os.version}` : os.os,
    value: os.count,
  }));

  const browserDistributionData = deviceData.browser_distribution.map((browser: any) => ({
    name: browser.version ? `${browser.browser} ${browser.version}` : browser.browser,
    value: browser.count,
  }));

  const screenResolutionsData = deviceData.screen_resolutions
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10);

  const connectionTypesData = deviceData.connection_types.map((conn) => ({
    name: conn.type.toUpperCase(),
    value: conn.count,
    percentage: conn.percentage,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Device Analytics Dashboard
            </h1>
            <p className="text-slate-400">
              Analyze user devices, browsers, and connection patterns
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
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end_date: e.target.value }))
              }
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
            title="Total Devices"
            value={totalDevices.toLocaleString()}
            change={12.5}
            trend="up"
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard
            title="Mobile Users"
            value={`${mobilePercentage.toFixed(1)}%`}
            change={mobilePercentage > 50 ? 8.3 : -3.2}
            trend={mobilePercentage > 50 ? "up" : "down"}
            icon={<Smartphone className="w-5 h-5" />}
          />
          <StatCard
            title="Most Popular OS"
            value={deviceData.os_distribution[0]?.os || "N/A"}
            icon={<Globe className="w-5 h-5" />}
          />
          <StatCard
            title="Most Popular Browser"
            value={deviceData.browser_distribution[0]?.browser || "N/A"}
            icon={<Chrome className="w-5 h-5" />}
          />
        </motion.div>

        {/* Device Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Device Distribution</h2>
            <PieChart
              data={deviceDistributionData}
              dataKey="value"
              nameKey="name"
              colors={["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#6B7280"]}
              innerRadius={70}
              showPercentage
              height={300}
            />
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Device Breakdown</h2>
            <div className="space-y-4">
              {deviceData.device_distribution.map((device, index) => {
                const Icon =
                  DEVICE_ICONS[device.device_type as keyof typeof DEVICE_ICONS] || Monitor;
                const colors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#6B7280"];

                return (
                  <div
                    key={device.device_type}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${colors[index]}20`,
                          border: `1px solid ${colors[index]}30`,
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: colors[index] }} />
                      </div>
                      <div>
                        <div className="text-white font-medium capitalize">
                          {device.device_type}
                        </div>
                        <div className="text-xs text-slate-400">
                          {device.percentage.toFixed(1)}% of users
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">
                        {device.count.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* OS Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Operating System Distribution</h2>
          <BarChart
            data={osDistributionData.slice(0, 10)}
            dataKeys={[{ key: "value", name: "Users", color: "#3B82F6" }]}
            xAxisKey="name"
            height={350}
          />
        </motion.div>

        {/* Browser Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Browser Distribution</h2>
          <BarChart
            data={browserDistributionData.slice(0, 10)}
            dataKeys={[{ key: "value", name: "Users", color: "#10B981" }]}
            xAxisKey="name"
            height={350}
          />
        </motion.div>

        {/* Screen Resolutions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            Top 10 Screen Resolutions
          </h2>
          <div className="space-y-3">
            {screenResolutionsData.map((resolution, index) => {
              const percentage = (resolution.count / totalDevices) * 100;
              return (
                <div key={resolution.resolution} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono text-sm w-6">
                        #{index + 1}
                      </span>
                      <span className="text-white font-medium font-mono">
                        {resolution.resolution}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">
                        {resolution.count.toLocaleString()}
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
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Connection Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Connection Types</h2>
            <PieChart
              data={connectionTypesData}
              dataKey="value"
              nameKey="name"
              colors={Object.values(CONNECTION_COLORS)}
              innerRadius={60}
              showPercentage
              height={300}
            />
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Connection Insights</h2>
            <div className="space-y-4">
              {deviceData.connection_types.map((conn, index) => {
                const color =
                  CONNECTION_COLORS[conn.type as keyof typeof CONNECTION_COLORS] || "#6B7280";

                return (
                  <div
                    key={conn.type}
                    className="p-4 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Wifi className="w-5 h-5" style={{ color }} />
                        <span className="text-white font-medium uppercase">
                          {conn.type}
                        </span>
                      </div>
                      <span className="text-white font-bold">
                        {conn.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Average Quality</span>
                      <span className="text-white font-medium">
                        {conn.average_quality}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${conn.percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 backdrop-blur-sm border border-cyan-700/50 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">💡 Device Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="text-cyan-400 font-semibold mb-2">Mobile-First Strategy</h3>
              <p className="text-slate-300 text-sm">
                {mobilePercentage.toFixed(1)}% of users are on mobile/tablet. Ensure
                responsive design and touch-optimized interfaces are prioritized.
              </p>
            </div>
            {deviceData.screen_resolutions[0] && (
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">
                  Popular Resolution
                </h3>
                <p className="text-slate-300 text-sm">
                  Most users have {deviceData.screen_resolutions[0].resolution}{" "}
                  displays. Test your UI at this resolution for optimal experience.
                </p>
              </div>
            )}
            {deviceData.browser_distribution[0] && (
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h3 className="text-purple-400 font-semibold mb-2">
                  Browser Compatibility
                </h3>
                <p className="text-slate-300 text-sm">
                  {deviceData.browser_distribution[0].browser} is the most popular
                  browser. Ensure full compatibility and test features thoroughly.
                </p>
              </div>
            )}
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">
                Connection Optimization
              </h3>
              <p className="text-slate-300 text-sm">
                {deviceData.connection_types.find((c) => c.type === "wifi")
                  ? "WiFi users dominate. Implement adaptive quality for mobile networks."
                  : "Mixed connection types. Adaptive bitrate streaming is essential."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
