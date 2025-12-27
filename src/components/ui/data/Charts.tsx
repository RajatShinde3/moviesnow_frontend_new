"use client";

/**
 * Chart Components - Beautiful, animated charts for analytics
 * Uses Recharts library with custom styling
 */

import React from "react";
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  AreaChart as RechartsAreaChart,
  Line,
  Bar,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

// Color palette
const COLORS = {
  primary: "#8B5CF6", // Purple
  secondary: "#3B82F6", // Blue
  success: "#10B981", // Green
  warning: "#F59E0B", // Amber
  error: "#EF4444", // Red
  purple: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"],
  blue: ["#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"],
  gradient: ["#8B5CF6", "#3B82F6"],
};

interface BaseChartProps {
  data: any[];
  height?: number;
  className?: string;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl"
      >
        <p className="text-sm font-medium text-slate-200 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="font-semibold text-white">{entry.value}</span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

/**
 * LineChart - Trend visualization
 * Perfect for: Time series data, analytics trends
 */
interface LineChartProps extends BaseChartProps {
  dataKeys: Array<{ key: string; name: string; color?: string }>;
  xAxisKey: string;
}

export function LineChart({
  data,
  dataKeys,
  xAxisKey,
  height = 300,
  className = "",
}: LineChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data}>
          <defs>
            {dataKeys.map((dataKey, index) => (
              <linearGradient
                key={dataKey.key}
                id={`gradient-${dataKey.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={dataKey.color || COLORS.gradient[index % 2]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={dataKey.color || COLORS.gradient[index % 2]}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey={xAxisKey}
            stroke="#94A3B8"
            tick={{ fill: "#94A3B8", fontSize: 12 }}
          />
          <YAxis stroke="#94A3B8" tick={{ fill: "#94A3B8", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
            formatter={(value) => <span className="text-slate-300">{value}</span>}
          />
          {dataKeys.map((dataKey, index) => (
            <Line
              key={dataKey.key}
              type="monotone"
              dataKey={dataKey.key}
              name={dataKey.name}
              stroke={dataKey.color || COLORS.gradient[index % 2]}
              strokeWidth={2}
              dot={{ fill: dataKey.color || COLORS.gradient[index % 2], r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={1000}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * BarChart - Comparison visualization
 * Perfect for: Comparing values, category analysis
 */
interface BarChartProps extends BaseChartProps {
  dataKeys: Array<{ key: string; name: string; color?: string }>;
  xAxisKey: string;
  stacked?: boolean;
}

export function BarChart({
  data,
  dataKeys,
  xAxisKey,
  stacked = false,
  height = 300,
  className = "",
}: BarChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey={xAxisKey}
            stroke="#94A3B8"
            tick={{ fill: "#94A3B8", fontSize: 12 }}
          />
          <YAxis stroke="#94A3B8" tick={{ fill: "#94A3B8", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="rect"
            formatter={(value) => <span className="text-slate-300">{value}</span>}
          />
          {dataKeys.map((dataKey, index) => (
            <Bar
              key={dataKey.key}
              dataKey={dataKey.key}
              name={dataKey.name}
              fill={dataKey.color || COLORS.purple[index % 4]}
              stackId={stacked ? "stack" : undefined}
              animationDuration={1000}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * PieChart - Distribution visualization
 * Perfect for: Percentages, part-to-whole relationships
 */
interface PieChartProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
  colors?: string[];
  innerRadius?: number;
  showPercentage?: boolean;
}

export function PieChart({
  data,
  dataKey,
  nameKey,
  colors = COLORS.purple,
  innerRadius = 0,
  showPercentage = true,
  height = 300,
  className = "",
}: PieChartProps) {
  const total = data.reduce((sum, entry) => sum + entry[dataKey], 0);

  const renderLabel = (entry: any) => {
    if (!showPercentage) return entry[nameKey];
    const percent = ((entry[dataKey] / total) * 100).toFixed(1);
    return `${entry[nameKey]} (${percent}%)`;
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={dataKey}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-slate-300">{value}</span>}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * AreaChart - Cumulative data visualization
 * Perfect for: Stacked data, volume over time
 */
interface AreaChartProps extends BaseChartProps {
  dataKeys: Array<{ key: string; name: string; color?: string }>;
  xAxisKey: string;
  stacked?: boolean;
}

export function AreaChart({
  data,
  dataKeys,
  xAxisKey,
  stacked = false,
  height = 300,
  className = "",
}: AreaChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data}>
          <defs>
            {dataKeys.map((dataKey, index) => (
              <linearGradient
                key={dataKey.key}
                id={`area-gradient-${dataKey.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={dataKey.color || COLORS.gradient[index % 2]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={dataKey.color || COLORS.gradient[index % 2]}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey={xAxisKey}
            stroke="#94A3B8"
            tick={{ fill: "#94A3B8", fontSize: 12 }}
          />
          <YAxis stroke="#94A3B8" tick={{ fill: "#94A3B8", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="rect"
            formatter={(value) => <span className="text-slate-300">{value}</span>}
          />
          {dataKeys.map((dataKey, index) => (
            <Area
              key={dataKey.key}
              type="monotone"
              dataKey={dataKey.key}
              name={dataKey.name}
              stroke={dataKey.color || COLORS.gradient[index % 2]}
              strokeWidth={2}
              fill={`url(#area-gradient-${dataKey.key})`}
              stackId={stacked ? "stack" : undefined}
              animationDuration={1000}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * StatCard - Metric display card with trend indicator
 * Perfect for: Dashboard KPIs, summary metrics
 */
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  sparklineData?: number[];
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon,
  trend,
  sparklineData,
  className = "",
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-400"
      : trend === "down"
      ? "text-red-400"
      : "text-slate-400";

  const trendBg =
    trend === "up"
      ? "bg-green-500/10"
      : trend === "down"
      ? "bg-red-500/10"
      : "bg-slate-500/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        {icon && (
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-sm font-medium ${trendColor} ${trendBg} px-2 py-1 rounded`}>
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-slate-500">{changeLabel}</span>
        </div>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={sparklineData.map((val, i) => ({ value: val }))}>
              <defs>
                <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={COLORS.primary}
                strokeWidth={2}
                fill="url(#sparkline-gradient)"
                animationDuration={1000}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

export default { LineChart, BarChart, PieChart, AreaChart, StatCard };
