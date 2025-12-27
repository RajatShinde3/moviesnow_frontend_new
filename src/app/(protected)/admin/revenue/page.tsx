// app/(protected)/admin/revenue/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useRevenue } from '@/hooks/useRevenue';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RevenueFilters, ExportFormat, TransactionStatus } from '@/types/revenue';
import { formatCurrency, formatPercentage, TRANSACTION_STATUS_COLORS, TRANSACTION_STATUS_LABELS } from '@/types/revenue';

export default function RevenueDashboardPage() {
  const [filters, setFilters] = useState<RevenueFilters>({
    groupBy: 'month',
  });
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const { dashboard, isLoading, exportData, isExporting } = useRevenue({
    ...filters,
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  const handleExport = (format: ExportFormat) => {
    exportData({
      filters: { ...filters, startDate: dateRange.start, endDate: dateRange.end },
      format,
      includeCharts: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-dark via-background to-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-dark via-background to-background-dark flex items-center justify-center">
        <p className="text-white/60">No revenue data available</p>
      </div>
    );
  }

  const { overview, subscriptionMetrics, revenueTimeline, planPerformance, customerLifetime, churnAnalysis, forecasts, topCustomers, recentTransactions } = dashboard;

  // Prepare chart data
  const mrrChartData = revenueTimeline.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mrr: item.mrr,
    arr: item.arr / 12, // Normalize for comparison
  }));

  const revenueBreakdownData = revenueTimeline.slice(-30).map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    new: item.newRevenue,
    churned: item.churnedRevenue,
    net: item.netRevenue,
  }));

  const planDistributionData = planPerformance.map((plan) => ({
    name: plan.name,
    value: plan.revenue,
    color: plan.color,
  }));

  const churnTimelineData = churnAnalysis.churnTimeline.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    rate: item.churnRate,
    count: item.churnedCount,
  }));

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
                Revenue Dashboard
              </motion.h1>
              <motion.p
                className="text-white/60 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Monitor revenue, subscriptions, and financial metrics in real-time
              </motion.p>
            </div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg hover:shadow-accent-primary/20 transition-all">
                  <Download className="w-5 h-5" />
                  <span className="font-semibold">Export</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-background-elevated border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors first:rounded-t-xl"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-green-400" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors last:rounded-b-xl"
                  >
                    <FileText className="w-5 h-5 text-red-400" />
                    <span>PDF Report</span>
                  </button>
                </div>
              </div>
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
          {/* MRR */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:border-green-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              {overview.mrrGrowth >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-green-400" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-400" />
              )}
            </div>
            <h3 className="text-3xl font-bold mb-1">{formatCurrency(overview.mrr)}</h3>
            <p className="text-sm text-white/60 mb-2">Monthly Recurring Revenue</p>
            <div className={`flex items-center gap-1 text-sm ${overview.mrrGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {overview.mrrGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">{formatPercentage(overview.mrrGrowth)}</span>
              <span className="text-white/40">vs last month</span>
            </div>
          </div>

          {/* ARR */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              {overview.arrGrowth >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-blue-400" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-400" />
              )}
            </div>
            <h3 className="text-3xl font-bold mb-1">{formatCurrency(overview.arr)}</h3>
            <p className="text-sm text-white/60 mb-2">Annual Recurring Revenue</p>
            <div className={`flex items-center gap-1 text-sm ${overview.arrGrowth >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {overview.arrGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">{formatPercentage(overview.arrGrowth)}</span>
              <span className="text-white/40">vs last year</span>
            </div>
          </div>

          {/* ARPU */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              {overview.arpuGrowth >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-purple-400" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-400" />
              )}
            </div>
            <h3 className="text-3xl font-bold mb-1">{formatCurrency(overview.averageRevenuePerUser)}</h3>
            <p className="text-sm text-white/60 mb-2">Average Revenue Per User</p>
            <div className={`flex items-center gap-1 text-sm ${overview.arpuGrowth >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
              {overview.arpuGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">{formatPercentage(overview.arpuGrowth)}</span>
              <span className="text-white/40">vs last month</span>
            </div>
          </div>

          {/* LTV */}
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 hover:border-orange-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-500/20">
                <Award className="w-6 h-6 text-orange-400" />
              </div>
              {customerLifetime.ltvGrowth >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-orange-400" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-400" />
              )}
            </div>
            <h3 className="text-3xl font-bold mb-1">{formatCurrency(customerLifetime.ltv)}</h3>
            <p className="text-sm text-white/60 mb-2">Customer Lifetime Value</p>
            <div className={`flex items-center gap-1 text-sm ${customerLifetime.ltvGrowth >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
              {customerLifetime.ltvGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">{formatPercentage(customerLifetime.ltvGrowth)}</span>
              <span className="text-white/40">LTV:CAC {customerLifetime.ltvCacRatio.toFixed(1)}x</span>
            </div>
          </div>
        </motion.div>

        {/* MRR Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover border border-white/10"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-primary" />
            MRR & ARR Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mrrChartData}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend />
              <Area type="monotone" dataKey="mrr" stroke="#10b981" fillOpacity={1} fill="url(#colorMrr)" name="MRR" />
              <Area type="monotone" dataKey="arr" stroke="#3b82f6" fillOpacity={1} fill="url(#colorArr)" name="ARR (normalized)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-primary" />
              Revenue Breakdown (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Legend />
                <Bar dataKey="new" fill="#10b981" name="New Revenue" />
                <Bar dataKey="churned" fill="#ef4444" name="Churned Revenue" />
                <Bar dataKey="net" fill="#3b82f6" name="Net Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Plan Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent-primary" />
              Revenue by Plan
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Churn Rate Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Churn Rate Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={churnTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'rate' ? `${value.toFixed(2)}%` : value,
                    name === 'rate' ? 'Churn Rate' : 'Churned Count',
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} name="Churn Rate %" />
                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} name="Churned Customers" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Subscription Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-primary" />
              Subscription Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white/80">Active Subscriptions</span>
                </div>
                <span className="text-xl font-bold">{subscriptionMetrics.activeSubscriptions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-white/80">New This Month</span>
                </div>
                <span className="text-xl font-bold text-blue-400">+{subscriptionMetrics.newSubscriptions}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-white/80">Trial Conversion</span>
                </div>
                <span className="text-xl font-bold text-purple-400">{subscriptionMetrics.trialConversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-white/80">Retention Rate</span>
                </div>
                <span className="text-xl font-bold text-green-400">{subscriptionMetrics.retentionRate.toFixed(1)}%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover border border-white/10"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent-primary" />
            Recent Transactions
          </h3>
          <div className="space-y-2">
            {recentTransactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20">
                      <CreditCard className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {transaction.username}
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${TRANSACTION_STATUS_COLORS[transaction.status]}20`,
                            color: TRANSACTION_STATUS_COLORS[transaction.status],
                          }}
                        >
                          {TRANSACTION_STATUS_LABELS[transaction.status]}
                        </span>
                      </h4>
                      <p className="text-sm text-white/60 mt-1">
                        {transaction.planName} • {transaction.type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{formatCurrency(transaction.amount)}</p>
                    <p className="text-xs text-white/40 mt-1">{transaction.paymentMethod}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
