"use client";

/**
 * =============================================================================
 * System Health & Monitoring Dashboard
 * =============================================================================
 * Real-time operational monitoring with health checks, metrics, and alerts
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Clock,
  Server,
  Zap,
  TrendingUp,
  Users,
  Download,
  DollarSign,
  Database,
  Cloud,
  RefreshCcw,
  Power,
  Shield,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { monitoringService } from "@/lib/api/services/monitoring";
import type {
  HealthStatusResponse,
  Alert,
  CircuitBreakerStatus,
} from "@/lib/api/services/monitoring";

export default function SystemHealthPage() {
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    health: true,
    performance: true,
    metrics: true,
    alerts: true,
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Queries
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["monitoring", "dashboard"],
    queryFn: () => monitoringService.getDashboardData(),
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30s
  });

  const { data: circuitBreakers } = useQuery({
    queryKey: ["monitoring", "circuit-breakers"],
    queryFn: () => monitoringService.getCircuitBreakers(),
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: alerts } = useQuery({
    queryKey: ["monitoring", "alerts"],
    queryFn: () => monitoringService.getActiveAlerts(),
    refetchInterval: autoRefresh ? 15000 : false, // Alerts refresh faster
  });

  // Mutations
  const resetCircuitMutation = useMutation({
    mutationFn: (circuitName: string) =>
      monitoringService.resetCircuitBreaker(circuitName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "circuit-breakers"] });
      queryClient.invalidateQueries({ queryKey: ["monitoring", "dashboard"] });
    },
  });

  const forceGCMutation = useMutation({
    mutationFn: () => monitoringService.forceGarbageCollection(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "dashboard"] });
    },
  });

  const maintenanceModeMutation = useMutation<
    { message: string; timestamp: string; started_by?: string; stopped_by?: string },
    Error,
    boolean
  >({
    mutationFn: (start: boolean) =>
      start
        ? monitoringService.startMaintenanceMode()
        : monitoringService.stopMaintenanceMode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring"] });
    },
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "closed":
        return "text-emerald-400";
      case "degraded":
      case "warning":
      case "half_open":
        return "text-amber-400";
      case "unhealthy":
      case "critical":
      case "open":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "closed":
        return CheckCircle2;
      case "degraded":
      case "warning":
      case "half_open":
        return AlertTriangle;
      case "unhealthy":
      case "critical":
      case "open":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Activity className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-300">Loading system health data...</p>
        </motion.div>
      </div>
    );
  }

  const systemStatus = dashboardData?.system_status || "unknown";
  const health = dashboardData?.health;
  const performance = dashboardData?.performance;
  const metrics = dashboardData?.metrics;
  const businessKpis = dashboardData?.business_kpis;

  const StatusIcon = getStatusIcon(systemStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Activity className="w-10 h-10 text-cyan-400" />
              System Health & Monitoring
            </h1>
            <p className="text-slate-400 mt-2">
              Real-time operational metrics and health status
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                autoRefresh
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-slate-700/50 text-slate-300 border border-slate-600/30"
              }`}
            >
              <RefreshCcw
                className={`w-4 h-4 inline mr-2 ${autoRefresh ? "animate-spin" : ""}`}
              />
              Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </button>

            <button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["monitoring"] })
              }
              className="px-4 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-300 hover:bg-slate-600/50 transition-all"
            >
              <RefreshCcw className="w-4 h-4 inline mr-2" />
              Refresh Now
            </button>
          </div>
        </motion.div>

        {/* System Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1 md:col-span-2 flex items-center gap-6">
              <div
                className={`w-20 h-20 rounded-full ${getStatusColor(
                  systemStatus
                )} bg-gradient-to-br from-current/20 to-current/5 flex items-center justify-center`}
              >
                <StatusIcon className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white capitalize">
                  {systemStatus}
                </h2>
                <p className="text-slate-400">Overall System Status</p>
                <p className="text-sm text-slate-500 mt-1">
                  {health?.service} • v{health?.version} • {health?.environment}
                </p>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <Clock className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-2xl font-bold text-white">
                {health?.uptime_seconds ? formatUptime(health.uptime_seconds) : "N/A"}
              </p>
              <p className="text-slate-400 text-sm">System Uptime</p>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <AlertTriangle
                className={`w-8 h-8 mb-2 ${
                  alerts && alerts.length > 0 ? "text-amber-400" : "text-emerald-400"
                }`}
              />
              <p className="text-2xl font-bold text-white">{alerts?.length || 0}</p>
              <p className="text-slate-400 text-sm">Active Alerts</p>
            </div>
          </div>
        </motion.div>

        {/* Active Alerts */}
        {alerts && alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                Active Alerts
              </h3>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`backdrop-blur-sm bg-white/5 border rounded-xl p-4 ${
                    alert.severity === "critical"
                      ? "border-red-500/50"
                      : alert.severity === "warning"
                      ? "border-amber-500/50"
                      : "border-blue-500/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 mt-1 ${
                          alert.severity === "critical"
                            ? "text-red-400"
                            : alert.severity === "warning"
                            ? "text-amber-400"
                            : "text-blue-400"
                        }`}
                      />
                      <div>
                        <h4 className="font-semibold text-white">{alert.title}</h4>
                        <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>Source: {alert.source}</span>
                          <span>•</span>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        alert.severity === "critical"
                          ? "bg-red-500/20 text-red-300"
                          : alert.severity === "warning"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Health Checks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div
            className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
            onClick={() => toggleSection("health")}
          >
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              Health Checks
            </h3>
            {expandedSections.health ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>

          {expandedSections.health && health && (
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(health.checks).map(([key, check]) => {
                const Icon = getStatusIcon(check.status);
                return (
                  <div
                    key={key}
                    className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white capitalize">
                        {key.replace("_", " ")}
                      </h4>
                      <Icon className={`w-5 h-5 ${getStatusColor(check.status)}`} />
                    </div>
                    <p
                      className={`text-sm font-medium capitalize ${getStatusColor(
                        check.status
                      )}`}
                    >
                      {check.status}
                    </p>
                    {check.message && (
                      <p className="text-xs text-slate-400 mt-2">{check.message}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div
            className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
            onClick={() => toggleSection("performance")}
          >
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-purple-400" />
              System Performance
            </h3>
            {expandedSections.performance ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>

          {expandedSections.performance && performance?.system_performance && (
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <Cpu className="w-8 h-8 text-purple-400 mb-3" />
                <p className="text-3xl font-bold text-white">
                  {performance.system_performance.cpu.avg.toFixed(1)}%
                </p>
                <p className="text-slate-400 text-sm mb-2">CPU Usage (Avg)</p>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${performance.system_performance.cpu.avg}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>Min: {performance.system_performance.cpu.min.toFixed(1)}%</span>
                  <span>Max: {performance.system_performance.cpu.max.toFixed(1)}%</span>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <MemoryStick className="w-8 h-8 text-blue-400 mb-3" />
                <p className="text-3xl font-bold text-white">
                  {performance.system_performance.memory.avg.toFixed(1)}%
                </p>
                <p className="text-slate-400 text-sm mb-2">Memory Usage (Avg)</p>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                    style={{ width: `${performance.system_performance.memory.avg}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>
                    {performance.system_performance.memory.available_mb.toFixed(0)} MB
                    available
                  </span>
                  <span>
                    {performance.system_performance.memory.total_mb.toFixed(0)} MB total
                  </span>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <HardDrive className="w-8 h-8 text-amber-400 mb-3" />
                <p className="text-3xl font-bold text-white">
                  {performance.system_performance.disk.usage_percent.toFixed(1)}%
                </p>
                <p className="text-slate-400 text-sm mb-2">Disk Usage</p>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                    style={{
                      width: `${performance.system_performance.disk.usage_percent}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>
                    {performance.system_performance.disk.available_gb.toFixed(1)} GB
                    available
                  </span>
                  <span>
                    {performance.system_performance.disk.total_gb.toFixed(1)} GB total
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Business KPIs */}
        {businessKpis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              Business KPIs
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <Users className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {businessKpis.active_users?.toLocaleString() || 0}
                </p>
                <p className="text-slate-400 text-sm">Active Users</p>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <Activity className="w-6 h-6 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {businessKpis.total_streams?.toLocaleString() || 0}
                </p>
                <p className="text-slate-400 text-sm">Total Streams</p>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <Download className="w-6 h-6 text-cyan-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {businessKpis.total_downloads?.toLocaleString() || 0}
                </p>
                <p className="text-slate-400 text-sm">Total Downloads</p>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <DollarSign className="w-6 h-6 text-emerald-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  ${businessKpis.revenue_today?.toFixed(2) || "0.00"}
                </p>
                <p className="text-slate-400 text-sm">Revenue Today</p>
              </div>

              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <Cloud className="w-6 h-6 text-amber-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {businessKpis.cdn_bandwidth_gb?.toFixed(2) || "0.00"} GB
                </p>
                <p className="text-slate-400 text-sm">CDN Bandwidth</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Circuit Breakers */}
        {circuitBreakers && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <Zap className="w-6 h-6 text-amber-400" />
              Circuit Breakers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(circuitBreakers.circuit_breakers).map(([name, cb]) => (
                <div
                  key={name}
                  className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">{name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        cb.state
                      )} bg-current/20`}
                    >
                      {cb.state.toUpperCase().replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Failures: {cb.failure_count}</span>
                    {cb.state !== "closed" && (
                      <button
                        onClick={() => resetCircuitMutation.mutate(name)}
                        disabled={resetCircuitMutation.isPending}
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                      >
                        <RefreshCcw className="w-3 h-3 inline mr-1" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            <Server className="w-6 h-6 text-red-400" />
            Admin Actions
          </h3>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => forceGCMutation.mutate()}
              disabled={forceGCMutation.isPending}
              className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Force Garbage Collection
            </button>

            <button
              onClick={() => maintenanceModeMutation.mutate(true)}
              disabled={maintenanceModeMutation.isPending}
              className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-all disabled:opacity-50"
            >
              <Power className="w-4 h-4 inline mr-2" />
              Start Maintenance Mode
            </button>

            <button
              onClick={() => maintenanceModeMutation.mutate(false)}
              disabled={maintenanceModeMutation.isPending}
              className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all disabled:opacity-50"
            >
              <Power className="w-4 h-4 inline mr-2" />
              Stop Maintenance Mode
            </button>
          </div>

          {(forceGCMutation.isSuccess || maintenanceModeMutation.isSuccess) && (
            <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              <p className="text-emerald-300 text-sm">Action completed successfully!</p>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-slate-500 text-sm pb-8"
        >
          Last updated: {new Date(dashboardData?.timestamp || "").toLocaleString()}
        </motion.div>
      </div>
    </div>
  );
}
