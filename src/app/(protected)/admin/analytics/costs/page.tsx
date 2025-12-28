"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  HardDrive,
  Wifi,
  Cpu,
  Database,
  Mail,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api/services";
import { LineChart, BarChart, PieChart, StatCard } from "@/components/ui/data/Charts";

const SERVICE_ICONS = {
  S3: HardDrive,
  CloudFront: Wifi,
  EC2: Cpu,
  RDS: Database,
  SES: Mail,
  Other: AlertCircle,
};

const PRIORITY_COLORS = {
  high: "red",
  medium: "amber",
  low: "blue",
};

export default function CostAnalyticsPage() {
  const [dateRange, setDateRange] = useState<{
    start_date?: string;
    end_date?: string;
  }>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  // Fetch cost analytics data
  const { data: costData, isLoading } = useQuery({
    queryKey: ["admin", "analytics", "costs", dateRange],
    queryFn: () => api.advancedAnalytics.costAnalyticsDashboard(),
  });

  if (isLoading || !costData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 p-6">
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
  const totalCostGrowth =
    costData.total_cost > 0
      ? ((costData.projected_monthly_cost - costData.total_cost) / costData.total_cost) * 100
      : 0;

  const potentialSavings = costData.optimization_recommendations.reduce(
    (sum: number, rec: any) => sum + rec.potential_savings,
    0
  );

  // Prepare chart data
  const costTrendsData = costData.cost_trends.map((trend: any) => ({
    date: new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Storage: trend.storage,
    Bandwidth: trend.bandwidth,
    Compute: trend.compute,
    CDN: trend.cdn,
    Total: trend.total,
  }));

  const serviceBreakdownData = costData.cost_by_service.map((service: any) => ({
    name: service.service,
    value: service.cost,
    percentage: service.percentage,
  }));

  const costCategoriesData = [
    { name: "Storage", value: costData.storage_cost, color: "#10B981" },
    { name: "Bandwidth", value: costData.bandwidth_cost, color: "#3B82F6" },
    { name: "Compute", value: costData.compute_cost, color: "#8B5CF6" },
    { name: "CDN", value: costData.cdn_cost, color: "#F59E0B" },
    { name: "Other", value: costData.other_costs, color: "#6B7280" },
  ].filter((cat) => cat.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Cost Analytics Dashboard
            </h1>
            <p className="text-slate-400">
              Track infrastructure costs and identify optimization opportunities
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
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end_date: e.target.value }))
              }
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            title="Total Cost"
            value={`$${costData.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={totalCostGrowth}
            trend={totalCostGrowth > 0 ? "down" : "up"}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatCard
            title="Projected Monthly"
            value={`$${costData.projected_monthly_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            title="Cost per User"
            value={`$${costData.cost_per_user.toFixed(2)}`}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatCard
            title="Potential Savings"
            value={`$${potentialSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={potentialSavings > 0 ? 15 : 0}
            trend="up"
            icon={<Lightbulb className="w-5 h-5" />}
          />
        </motion.div>

        {/* Cost Breakdown Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-white">
                ${costData.storage_cost.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-slate-400">Storage (S3)</p>
            <p className="text-xs text-green-400 mt-1">
              ${costData.cost_per_gb.toFixed(4)}/GB
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Wifi className="w-6 h-6 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                ${costData.bandwidth_cost.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-slate-400">Bandwidth</p>
            <p className="text-xs text-blue-400 mt-1">Data Transfer</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Cpu className="w-6 h-6 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                ${costData.compute_cost.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-slate-400">Compute (EC2)</p>
            <p className="text-xs text-purple-400 mt-1">
              ${costData.cost_per_hour.toFixed(4)}/hr
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-sm border border-amber-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Wifi className="w-6 h-6 text-amber-400" />
              <span className="text-2xl font-bold text-white">
                ${costData.cdn_cost.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-slate-400">CDN (CloudFront)</p>
            <p className="text-xs text-amber-400 mt-1">Edge Distribution</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900/20 to-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-6 h-6 text-slate-400" />
              <span className="text-2xl font-bold text-white">
                ${costData.other_costs.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-slate-400">Other Services</p>
            <p className="text-xs text-slate-500 mt-1">RDS, SES, etc.</p>
          </div>
        </motion.div>

        {/* Cost Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Cost Trends (30 Days)</h2>
          <LineChart
            data={costTrendsData}
            dataKeys={[
              { key: "Storage", name: "Storage", color: "#10B981" },
              { key: "Bandwidth", name: "Bandwidth", color: "#3B82F6" },
              { key: "Compute", name: "Compute", color: "#8B5CF6" },
              { key: "CDN", name: "CDN", color: "#F59E0B" },
            ]}
            xAxisKey="date"
            height={350}
          />
        </motion.div>

        {/* Cost by Service */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Cost by Service</h2>
            <PieChart
              data={serviceBreakdownData}
              dataKey="value"
              nameKey="name"
              colors={["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#6B7280", "#EC4899"]}
              innerRadius={70}
              showPercentage
              height={300}
            />
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Service Breakdown</h2>
            <div className="space-y-3">
              {costData.cost_by_service.map((service: any, index: number) => {
                const Icon = SERVICE_ICONS[service.service as keyof typeof SERVICE_ICONS] || AlertCircle;
                const colors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#6B7280", "#EC4899"];

                return (
                  <div
                    key={service.service}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${colors[index]}20`, border: `1px solid ${colors[index]}30` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: colors[index] }} />
                      </div>
                      <div>
                        <div className="text-white font-medium">{service.service}</div>
                        <div className="text-xs text-slate-400">
                          {service.percentage.toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">
                        ${service.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Optimization Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm border border-emerald-700/50 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Cost Optimization Recommendations
            </h2>
          </div>

          {costData.optimization_recommendations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No optimization recommendations at this time.</p>
              <p className="text-sm text-slate-500 mt-2">Your infrastructure is well-optimized!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {costData.optimization_recommendations
                .sort((a: any, b: any) => {
                  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((rec: any, index: number) => {
                  const priorityColor = PRIORITY_COLORS[rec.priority as keyof typeof PRIORITY_COLORS];

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`p-5 bg-slate-800/50 border border-${priorityColor}-700/30 rounded-lg`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 bg-${priorityColor}-500/20 border border-${priorityColor}-500/30 text-${priorityColor}-400 text-xs font-medium rounded-full uppercase`}
                          >
                            {rec.priority} Priority
                          </span>
                          <span className="text-sm font-medium text-slate-300">
                            {rec.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold text-lg">
                            ${rec.potential_savings.toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-400">Potential Savings</div>
                        </div>
                      </div>
                      <p className="text-white leading-relaxed">{rec.recommendation}</p>
                    </motion.div>
                  );
                })}
            </div>
          )}

          {/* Total Potential Savings */}
          {potentialSavings > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Total Potential Savings
                  </h3>
                  <p className="text-sm text-slate-400">
                    By implementing all recommendations
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-emerald-400">
                    ${potentialSavings.toFixed(2)}
                  </div>
                  <div className="text-sm text-emerald-300">
                    {((potentialSavings / costData.total_cost) * 100).toFixed(1)}% reduction
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Cost Efficiency Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">💡 Cost Efficiency Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">Storage Efficiency</h3>
              <p className="text-slate-300 text-sm">
                Average cost per GB: ${costData.cost_per_gb.toFixed(4)}. Consider
                implementing lifecycle policies to archive old content to Glacier.
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="text-cyan-400 font-semibold mb-2">Bandwidth Optimization</h3>
              <p className="text-slate-300 text-sm">
                CDN cache optimization can reduce bandwidth costs by 40-60%. Review
                cache-control headers and TTL settings.
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="text-purple-400 font-semibold mb-2">Compute Efficiency</h3>
              <p className="text-slate-300 text-sm">
                Cost per hour: ${costData.cost_per_hour.toFixed(4)}. Consider using
                spot instances or reserved capacity for 30-70% savings.
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">Cost per User</h3>
              <p className="text-slate-300 text-sm">
                At ${costData.cost_per_user.toFixed(2)} per user, you're {costData.cost_per_user < 1 ? "below" : "above"} industry
                average. {costData.cost_per_user < 1 ? "Great job!" : "Consider optimization."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
