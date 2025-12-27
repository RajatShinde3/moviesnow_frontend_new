// app/(protected)/admin/player-intelligence/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Wifi,
  TrendingUp,
  Activity,
  Zap,
  Users,
  BarChart,
  Settings,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Signal,
  Gauge,
} from 'lucide-react';
import { usePlayerAnalytics } from '@/hooks/usePlayerIntelligence';
import { LineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { VideoQuality } from '@/types/playerIntelligence';
import { QUALITY_LEVELS, METRIC_COLORS, getQoERating, formatBandwidth, formatDuration } from '@/types/playerIntelligence';

export default function PlayerIntelligencePage() {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const { analytics, isLoading } = usePlayerAnalytics({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  if (isLoading || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-dark via-background to-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent" />
      </div>
    );
  }

  const { overview, qualityDistribution, deviceDistribution, errorRate, topErrors, bandwidthTrends, qoeOverTime } = analytics;

  // Prepare chart data
  const qualityChartData = Object.entries(qualityDistribution).map(([quality, count]) => ({
    quality,
    count,
    label: QUALITY_LEVELS[quality as VideoQuality]?.label || quality,
  }));

  const deviceChartData = Object.entries(deviceDistribution).map(([device, count]) => ({
    device,
    count,
  }));

  const qoeRating = getQoERating(overview.averageQoE);
  const qoeColor = METRIC_COLORS[qoeRating];

  // Color palette for charts
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-dark via-background to-background-dark">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background-dark/80 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Player Intelligence
              </motion.h1>
              <motion.p
                className="text-white/60 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Advanced streaming analytics and adaptive quality monitoring
              </motion.p>
            </div>

            <motion.div
              className="p-4 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border border-accent-primary/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Play className="w-8 h-8 text-accent-primary" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Total Sessions */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Play className="w-6 h-6 text-blue-400" />
              </div>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{overview.totalSessions.toLocaleString()}</h3>
            <p className="text-sm text-white/60 mb-2">Total Sessions</p>
            <div className="flex items-center gap-1 text-sm text-blue-400">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">Active streaming</span>
            </div>
          </div>

          {/* Quality of Experience */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:border-green-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <Sparkles className="w-6 h-6 text-green-400" />
              </div>
              <Gauge className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-3xl font-bold mb-1" style={{ color: qoeColor }}>
              {overview.averageQoE.toFixed(1)}
            </h3>
            <p className="text-sm text-white/60 mb-2">Quality of Experience</p>
            <div className="flex items-center gap-1 text-sm" style={{ color: qoeColor }}>
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold capitalize">{qoeRating}</span>
            </div>
          </div>

          {/* Startup Time */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{overview.averageStartupTime.toFixed(0)}ms</h3>
            <p className="text-sm text-white/60 mb-2">Avg Startup Time</p>
            <div className="flex items-center gap-1 text-sm text-purple-400">
              <Zap className="w-4 h-4" />
              <span className="font-semibold">Fast playback</span>
            </div>
          </div>

          {/* Buffering Time */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 hover:border-orange-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-500/20">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
              {overview.totalBufferingTime > 300 ? (
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>
            <h3 className="text-3xl font-bold mb-1">{formatDuration(overview.totalBufferingTime)}</h3>
            <p className="text-sm text-white/60 mb-2">Total Buffering</p>
            <div className="flex items-center gap-1 text-sm text-white/50">
              <span>Across all sessions</span>
            </div>
          </div>
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bandwidth Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-accent-primary" />
              Bandwidth Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={bandwidthTrends}>
                <defs>
                  <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="timestamp"
                  stroke="rgba(255,255,255,0.6)"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(value) => formatBandwidth(value)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'bandwidth' ? formatBandwidth(value) : `${value}ms`,
                    name === 'bandwidth' ? 'Bandwidth' : 'Latency',
                  ]}
                />
                <Legend />
                <Area type="monotone" dataKey="bandwidth" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBandwidth)" name="Bandwidth" />
                <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} name="Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* QoE Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-primary" />
              Quality of Experience
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={qoeOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="timestamp"
                  stroke="rgba(255,255,255,0.6)"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis stroke="rgba(255,255,255,0.6)" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [value.toFixed(1), 'QoE Score']}
                />
                <Line type="monotone" dataKey="qoe" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quality Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-accent-primary" />
              Quality Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qualityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {qualityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Sessions']} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Device Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-primary" />
              Device Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={deviceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="device" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [value.toLocaleString(), 'Sessions']}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                  {deviceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Error Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Error Analysis
            </h3>
            <div
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor: errorRate > 5 ? '#ef444420' : '#10b98120',
                color: errorRate > 5 ? '#ef4444' : '#10b981',
              }}
            >
              <span className="font-semibold">{errorRate.toFixed(2)}% Error Rate</span>
            </div>
          </div>

          {topErrors.length > 0 ? (
            <div className="space-y-3">
              {topErrors.map((error, index) => (
                <div
                  key={error.errorCode}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20 text-red-400 font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold font-mono text-sm">{error.errorCode}</h4>
                        <p className="text-xs text-white/60 mt-1">{error.count.toLocaleString()} occurrences</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/20">
                        <span className="text-sm font-semibold text-red-400">{error.percentage.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h4 className="text-xl font-semibold mb-2 text-green-100">No Errors Detected</h4>
              <p className="text-white/60">All streaming sessions are running smoothly</p>
            </div>
          )}
        </motion.div>

        {/* Performance Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-primary" />
            Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <Signal className="w-6 h-6 text-blue-400 mb-2" />
              <h4 className="font-semibold mb-1">Adaptive Streaming</h4>
              <p className="text-sm text-white/70">
                {(Object.values(qualityDistribution).reduce((sum, count) => sum + count, 0) > 0 &&
                  ((qualityDistribution['auto'] || 0) / Object.values(qualityDistribution).reduce((sum, count) => sum + count, 0) * 100).toFixed(0))}% of users using auto quality
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <Zap className="w-6 h-6 text-green-400 mb-2" />
              <h4 className="font-semibold mb-1">Fast Startup</h4>
              <p className="text-sm text-white/70">
                {overview.averageStartupTime < 1000 ? 'Excellent' : overview.averageStartupTime < 2000 ? 'Good' : 'Needs improvement'} - {overview.averageStartupTime.toFixed(0)}ms average
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <Activity className="w-6 h-6 text-purple-400 mb-2" />
              <h4 className="font-semibold mb-1">Smooth Playback</h4>
              <p className="text-sm text-white/70">
                Low buffering ratio ensuring uninterrupted viewing experience
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
