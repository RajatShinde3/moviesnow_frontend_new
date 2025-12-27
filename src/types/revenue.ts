// types/revenue.ts

/**
 * Revenue dashboard data
 */
export interface RevenueDashboard {
  overview: RevenueOverview;
  subscriptionMetrics: SubscriptionMetrics;
  revenueTimeline: RevenueTimeline[];
  planPerformance: PlanPerformance[];
  customerLifetime: CustomerLifetimeMetrics;
  churnAnalysis: ChurnAnalysis;
  forecasts: RevenueForecast;
  topCustomers: TopCustomer[];
  recentTransactions: Transaction[];
}

/**
 * Revenue overview metrics
 */
export interface RevenueOverview {
  mrr: number; // Monthly Recurring Revenue
  mrrGrowth: number; // Percentage
  arr: number; // Annual Recurring Revenue
  arrGrowth: number; // Percentage
  totalRevenue: number;
  revenueGrowth: number; // Percentage
  averageRevenuePerUser: number; // ARPU
  arpuGrowth: number; // Percentage
}

/**
 * Subscription metrics
 */
export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  trialSubscriptions: number;
  trialConversionRate: number; // Percentage
  subscriptionGrowthRate: number; // Percentage
  retentionRate: number; // Percentage
}

/**
 * Revenue timeline entry
 */
export interface RevenueTimeline {
  date: string; // ISO date
  mrr: number;
  arr: number;
  newRevenue: number;
  churnedRevenue: number;
  netRevenue: number;
  subscriptionCount: number;
}

/**
 * Plan performance data
 */
export interface PlanPerformance {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  activeSubscriptions: number;
  revenue: number;
  revenuePercentage: number;
  conversionRate: number;
  churnRate: number;
  averageLifetime: number; // days
  color: string;
}

/**
 * Customer lifetime metrics
 */
export interface CustomerLifetimeMetrics {
  ltv: number; // Customer Lifetime Value
  ltvGrowth: number; // Percentage
  averageLifespan: number; // months
  lifespanGrowth: number; // Percentage
  cac: number; // Customer Acquisition Cost
  cacGrowth: number; // Percentage
  ltvCacRatio: number;
}

/**
 * Churn analysis
 */
export interface ChurnAnalysis {
  monthlyChurnRate: number; // Percentage
  churnRateTrend: 'up' | 'down' | 'stable';
  churnedMrr: number;
  churnReasons: ChurnReason[];
  churnByPlan: Array<{
    planId: string;
    planName: string;
    churnRate: number;
    churnedCount: number;
  }>;
  churnTimeline: Array<{
    date: string;
    churnedCount: number;
    churnRate: number;
  }>;
}

/**
 * Churn reason
 */
export interface ChurnReason {
  reason: string;
  count: number;
  percentage: number;
}

/**
 * Revenue forecast
 */
export interface RevenueForecast {
  nextMonthMrr: number;
  nextMonthMrrConfidence: number; // 0-100
  nextQuarterArr: number;
  nextQuarterArrConfidence: number; // 0-100
  yearEndProjection: number;
  yearEndConfidence: number; // 0-100
  growthRate: number; // Percentage
}

/**
 * Top customer
 */
export interface TopCustomer {
  id: string;
  username: string;
  email: string;
  totalRevenue: number;
  subscriptionPlan: string;
  subscriptionStart: string;
  lifetimeMonths: number;
  renewalDate: string;
  status: 'active' | 'at_risk' | 'churned';
}

/**
 * Transaction
 */
export interface Transaction {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  planName: string;
  paymentMethod: string;
  invoiceUrl?: string;
}

/**
 * Transaction types
 */
export type TransactionType =
  | 'subscription_charge'
  | 'subscription_renewal'
  | 'upgrade'
  | 'downgrade'
  | 'refund'
  | 'trial_conversion';

/**
 * Transaction status
 */
export type TransactionStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';

/**
 * Revenue filters
 */
export interface RevenueFilters {
  startDate?: string;
  endDate?: string;
  planIds?: string[];
  includeTrials?: boolean;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

/**
 * Export revenue data request
 */
export interface ExportRevenueRequest {
  filters: RevenueFilters;
  format: 'csv' | 'excel' | 'pdf';
  includeCharts?: boolean;
}

/**
 * Metric card data for revenue dashboard
 */
export interface RevenueMetricCard {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * Status colors for transactions
 */
export const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
  succeeded: '#10b981',
  pending: '#f59e0b',
  failed: '#ef4444',
  refunded: '#6b7280',
};

/**
 * Status labels
 */
export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  succeeded: 'Succeeded',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
};

/**
 * Transaction type colors
 */
export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  subscription_charge: '#3b82f6',
  subscription_renewal: '#10b981',
  upgrade: '#8b5cf6',
  downgrade: '#f97316',
  refund: '#ef4444',
  trial_conversion: '#06b6d4',
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Format large number
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
};
