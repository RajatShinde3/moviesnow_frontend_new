"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Users,
  Download,
  Wifi,
  Server,
  Cpu,
  HardDrive,
  Clock,
  AlertCircle,
  TrendingUp,
  Globe,
  Zap,
  Cloud,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api/services";
import { StatCard, LineChart } from "@/components/ui/data/Charts";

export default function RealTimeMetricsPage() {
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  // Fetch real-time metrics with auto-refresh
  const { data: metricsData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "analytics", "real-time"],
    queryFn: () => api.advancedAnalytics.realTimeMetrics(),
    refetchInterval: isAutoRefresh ? refreshInterval : false,
    refetchOnWindowFocus: true,
  });

  // Track previous values for change detection
  const [previousMetrics, setPreviousMetrics] = useState<typeof metricsData | null>(null);

  useEffect(() => {
    if (metricsData && previousMetrics) {
      // Detect changes and potentially show notifications
    }
    if (metricsData) {
      setPreviousMetrics(metricsData);
    }
  }, [metricsData]);

  if (isLoading || !metricsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const serverHealthStatus =
    metricsData.server_health.cpu < 70 &&
    metricsData.server_health.memory < 80 &&
    metricsData.server_health.disk < 85
      ? "healthy"
      : metricsData.server_health.cpu > 90 ||
          metricsData.server_health.memory > 90 ||
          metricsData.server_health.disk > 95
        ? "critical"
        : "warning";

  const cdnHealthy = metricsData.cdn_performance.hit_ratio > 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                Real-Time Metrics Dashboard
              </h1>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-3 h-3 bg-emerald-500 rounded-full"
              />
            </div>
            <p className="text-slate-400">
              Live platform health and performance monitoring • Updates every{" "}
              {refreshInterval / 1000}s
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isAutoRefresh
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {isAutoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
            </button>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Refresh Now
            </button>
          </div>
        </motion.div>

        {/* System Status Alert */}
        <AnimatePresence>
          {serverHealthStatus !== "healthy" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-xl border ${
                serverHealthStatus === "critical"
                  ? "bg-red-900/20 border-red-700"
                  : "bg-amber-900/20 border-amber-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle
                  className={`w-5 h-5 ${
                    serverHealthStatus === "critical"
                      ? "text-red-400"
                      : "text-amber-400"
                  }`}
                />
                <div>
                  <h3
                    className={`font-semibold ${
                      serverHealthStatus === "critical"
                        ? "text-red-300"
                        : "text-amber-300"
                    }`}
                  >
                    {serverHealthStatus === "critical"
                      ? "Critical Server Load"
                      : "High Server Load"}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {serverHealthStatus === "critical"
                      ? "Immediate action required - server resources critically low"
                      : "Server resources are running high - monitor closely"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Active Streams"
            value={metricsData.active_streams.toLocaleString()}
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard
            title="Active Downloads"
            value={metricsData.active_downloads.toLocaleString()}
            icon={<Download className="w-5 h-5" />}
          />
          <StatCard
            title="Concurrent Users"
            value={metricsData.concurrent_users.toLocaleString()}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Bandwidth Usage"
            value={`${metricsData.bandwidth_usage.toFixed(1)} Mbps`}
            icon={<Wifi className="w-5 h-5" />}
          />
        </motion.div>

        {/* Server Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5" />
              Server Health
            </h2>
            <div className="flex items-center gap-2">
              {serverHealthStatus === "healthy" ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle
                  className={`w-5 h-5 ${
                    serverHealthStatus === "critical"
                      ? "text-red-400"
                      : "text-amber-400"
                  }`}
                />
              )}
              <span
                className={`font-semibold ${
                  serverHealthStatus === "healthy"
                    ? "text-emerald-400"
                    : serverHealthStatus === "critical"
                      ? "text-red-400"
                      : "text-amber-400"
                }`}
              >
                {serverHealthStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CPU */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300 font-medium">CPU</span>
                </div>
                <span className="text-white font-bold">
                  {metricsData.server_health.cpu.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metricsData.server_health.cpu}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-3 rounded-full ${
                    metricsData.server_health.cpu > 90
                      ? "bg-red-500"
                      : metricsData.server_health.cpu > 70
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>

            {/* Memory */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300 font-medium">Memory</span>
                </div>
                <span className="text-white font-bold">
                  {metricsData.server_health.memory.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metricsData.server_health.memory}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-3 rounded-full ${
                    metricsData.server_health.memory > 90
                      ? "bg-red-500"
                      : metricsData.server_health.memory > 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>

            {/* Disk */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 font-medium">Disk</span>
                </div>
                <span className="text-white font-bold">
                  {metricsData.server_health.disk.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metricsData.server_health.disk}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-3 rounded-full ${
                    metricsData.server_health.disk > 95
                      ? "bg-red-500"
                      : metricsData.server_health.disk > 85
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>

            {/* Uptime */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300 font-medium">Uptime</span>
                </div>
                <span className="text-white font-bold">
                  {Math.floor(metricsData.server_health.uptime / 86400)}d
                </span>
              </div>
              <div className="text-sm text-slate-400">
                {Math.floor((metricsData.server_health.uptime % 86400) / 3600)}h{" "}
                {Math.floor((metricsData.server_health.uptime % 3600) / 60)}m
              </div>
            </div>
          </div>
        </motion.div>

        {/* CDN Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              CDN Performance
            </h2>
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                cdnHealthy
                  ? "bg-emerald-900/30 text-emerald-400"
                  : "bg-amber-900/30 text-amber-400"
              }`}
            >
              {cdnHealthy ? "Optimal" : "Needs Attention"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">Cache Hit Ratio</div>
              <div className="text-3xl font-bold text-white mb-2">
                {metricsData.cdn_performance.hit_ratio.toFixed(1)}%
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${metricsData.cdn_performance.hit_ratio}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">Cache Miss Ratio</div>
              <div className="text-3xl font-bold text-white mb-2">
                {metricsData.cdn_performance.miss_ratio.toFixed(1)}%
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-red-500 h-2 rounded-full"
                  style={{ width: `${metricsData.cdn_performance.miss_ratio}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">Cache Size</div>
              <div className="text-3xl font-bold text-white">
                {metricsData.cdn_performance.cache_size.toFixed(1)}
              </div>
              <div className="text-sm text-slate-400">GB</div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">Bandwidth Saved</div>
              <div className="text-3xl font-bold text-emerald-400">
                {metricsData.cdn_performance.bandwidth_saved.toFixed(1)}
              </div>
              <div className="text-sm text-slate-400">GB</div>
            </div>
          </div>
        </motion.div>

        {/* Error Rate & Buffer Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Error Rate</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-4xl font-bold text-white mb-2">
                  {metricsData.error_rate.toFixed(2)}%
                </div>
                <div className="text-sm text-slate-400">
                  {metricsData.error_rate < 0.5 ? "Excellent" : "Needs Improvement"}
                </div>
              </div>
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  metricsData.error_rate < 0.5
                    ? "bg-emerald-900/30"
                    : "bg-red-900/30"
                }`}
              >
                {metricsData.error_rate < 0.5 ? (
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-red-400" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Average Buffer Time
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-4xl font-bold text-white mb-2">
                  {metricsData.average_buffer_time.toFixed(1)}s
                </div>
                <div className="text-sm text-slate-400">
                  {metricsData.average_buffer_time < 2
                    ? "Fast"
                    : "Could be better"}
                </div>
              </div>
              <div className="w-24 h-24 rounded-full bg-blue-900/30 flex items-center justify-center">
                <Clock className="w-12 h-12 text-blue-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Users by Region */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Active Users by Region
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metricsData.active_users_by_region
              .sort((a: any, b: any) => b.count - a.count)
              .slice(0, 10)
              .map((region: any, index: number) => (
                <motion.div
                  key={region.region}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="p-4 bg-slate-800/50 rounded-lg text-center"
                >
                  <div className="text-2xl mb-2">{region.region}</div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {region.count.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">active users</div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Active Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Active Content Right Now
          </h2>
          <div className="space-y-3">
            {metricsData.active_content
              .sort(
                (a: any, b: any) =>
                  b.active_streams +
                  b.active_downloads -
                  (a.active_streams + a.active_downloads)
              )
              .slice(0, 5)
              .map((content: any, index: number) => {
                const total = content.active_streams + content.active_downloads;
                return (
                  <motion.div
                    key={content.title_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${
                            ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"][
                              index
                            ]
                          }, ${
                            ["#A78BFA", "#60A5FA", "#34D399", "#FBBF24", "#F87171"][
                              index
                            ]
                          })`,
                        }}
                      >
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {content.title_name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {content.active_streams} streams •{" "}
                          {content.active_downloads} downloads
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {total.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">total active</div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-slate-400"
        >
          Last updated: {new Date(metricsData.timestamp).toLocaleString()} •{" "}
          {isAutoRefresh && `Next refresh in ${refreshInterval / 1000}s`}
        </motion.div>
      </div>
    </div>
  );
}
