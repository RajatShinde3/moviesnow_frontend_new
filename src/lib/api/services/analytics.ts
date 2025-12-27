/**
 * =============================================================================
 * Admin Analytics Service
 * =============================================================================
 * API service for platform analytics and insights
 */

import { apiClient } from '../client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  total_users: number;
  active_users: number;
  total_titles: number;
  total_streams: number;
  total_downloads: number;
  revenue_total: number;
  revenue_monthly: number;
  storage_used_gb: number;
  bandwidth_used_gb: number;
}

export interface UserAnalytics {
  new_users_today: number;
  new_users_week: number;
  new_users_month: number;
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  churn_rate: number;
  retention_rate: number;
  avg_session_duration: number;
  top_countries: Array<{ country: string; count: number }>;
  user_growth_chart: Array<{ date: string; count: number }>;
}

export interface ContentAnalytics {
  total_titles: number;
  total_movies: number;
  total_series: number;
  total_episodes: number;
  most_watched: Array<{
    title_id: string;
    title: string;
    type: string;
    views: number;
    avg_completion_rate: number;
  }>;
  trending_titles: Array<{
    title_id: string;
    title: string;
    trend_score: number;
  }>;
  genre_distribution: Array<{ genre: string; count: number }>;
  content_upload_chart: Array<{ date: string; count: number }>;
}

export interface RevenueAnalytics {
  total_revenue: number;
  revenue_this_month: number;
  revenue_last_month: number;
  revenue_growth: number;
  subscription_breakdown: Array<{
    tier: string;
    count: number;
    revenue: number;
  }>;
  revenue_chart: Array<{ date: string; amount: number }>;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churn_revenue: number;
}

export interface StreamingAnalytics {
  total_streams: number;
  streams_today: number;
  streams_week: number;
  streams_month: number;
  avg_watch_time: number;
  peak_concurrent_users: number;
  bandwidth_used_gb: number;
  cdn_performance: {
    avg_latency_ms: number;
    cache_hit_rate: number;
    error_rate: number;
  };
  quality_distribution: Array<{ quality: string; percentage: number }>;
  device_breakdown: Array<{ device: string; count: number }>;
}

export interface DownloadAnalytics {
  total_downloads: number;
  downloads_today: number;
  downloads_week: number;
  downloads_month: number;
  storage_used_gb: number;
  most_downloaded: Array<{
    title_id: string;
    title: string;
    download_count: number;
  }>;
  format_breakdown: Array<{ format: string; count: number }>;
  quality_breakdown: Array<{ quality: string; count: number }>;
}

export interface PerformanceMetrics {
  api_response_time_avg: number;
  api_error_rate: number;
  db_query_time_avg: number;
  cache_hit_rate: number;
  cdn_bandwidth_gb: number;
  storage_usage_gb: number;
  cpu_usage_percent: number;
  memory_usage_percent: number;
}

export interface EngagementMetrics {
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  avg_sessions_per_user: number;
  avg_session_duration: number;
  bounce_rate: number;
  avg_titles_per_user: number;
  watchlist_additions_rate: number;
  review_submission_rate: number;
}

export interface SubscriptionAnalytics {
  total_subscriptions: number;
  active_subscriptions: number;
  new_subscriptions_month: number;
  cancelled_subscriptions_month: number;
  conversion_rate: number;
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost
  subscription_tiers: Array<{
    tier: string;
    count: number;
    percentage: number;
  }>;
}

export interface TimeSeriesData {
  metric: string;
  data_points: Array<{
    timestamp: string;
    value: number;
  }>;
  aggregation: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics Service
// ─────────────────────────────────────────────────────────────────────────────

export const analyticsService = {
  /**
   * Get comprehensive analytics summary
   */
  async getSummary(): Promise<AnalyticsSummary> {
    const response = await apiClient.get('/admin/analytics/summary');
    return response.data;
  },

  /**
   * Get detailed user analytics
   */
  async getUserAnalytics(options?: {
    start_date?: string;
    end_date?: string;
  }): Promise<UserAnalytics> {
    const params = new URLSearchParams();
    if (options?.start_date) params.append('start_date', options.start_date);
    if (options?.end_date) params.append('end_date', options.end_date);

    const response = await apiClient.get(`/admin/analytics/users?${params.toString()}`);
    return response.data;
  },

  /**
   * Get content analytics
   */
  async getContentAnalytics(options?: {
    type?: 'movie' | 'series' | 'anime' | 'documentary';
    limit?: number;
  }): Promise<ContentAnalytics> {
    const params = new URLSearchParams();
    if (options?.type) params.append('type', options.type);
    if (options?.limit) params.append('limit', String(options.limit));

    const response = await apiClient.get(`/admin/analytics/content?${params.toString()}`);
    return response.data;
  },

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(options?: {
    start_date?: string;
    end_date?: string;
  }): Promise<RevenueAnalytics> {
    const params = new URLSearchParams();
    if (options?.start_date) params.append('start_date', options.start_date);
    if (options?.end_date) params.append('end_date', options.end_date);

    const response = await apiClient.get(`/admin/analytics/revenue?${params.toString()}`);
    return response.data;
  },

  /**
   * Get streaming analytics
   */
  async getStreamingAnalytics(options?: {
    period?: 'day' | 'week' | 'month';
  }): Promise<StreamingAnalytics> {
    const params = new URLSearchParams();
    if (options?.period) params.append('period', options.period);

    const response = await apiClient.get(`/admin/analytics/streaming?${params.toString()}`);
    return response.data;
  },

  /**
   * Get download analytics
   */
  async getDownloadAnalytics(options?: {
    period?: 'day' | 'week' | 'month';
  }): Promise<DownloadAnalytics> {
    const params = new URLSearchParams();
    if (options?.period) params.append('period', options.period);

    const response = await apiClient.get(`/admin/analytics/downloads?${params.toString()}`);
    return response.data;
  },

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await apiClient.get('/admin/analytics/performance');
    return response.data;
  },

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(options?: {
    start_date?: string;
    end_date?: string;
  }): Promise<EngagementMetrics> {
    const params = new URLSearchParams();
    if (options?.start_date) params.append('start_date', options.start_date);
    if (options?.end_date) params.append('end_date', options.end_date);

    const response = await apiClient.get(`/admin/analytics/engagement?${params.toString()}`);
    return response.data;
  },

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<SubscriptionAnalytics> {
    const response = await apiClient.get('/admin/analytics/subscriptions');
    return response.data;
  },

  /**
   * Get time series data for specific metric
   */
  async getTimeSeriesData(
    metric: string,
    options: {
      start_date: string;
      end_date: string;
      aggregation?: 'hourly' | 'daily' | 'weekly' | 'monthly';
    }
  ): Promise<TimeSeriesData> {
    const params = new URLSearchParams();
    params.append('metric', metric);
    params.append('start_date', options.start_date);
    params.append('end_date', options.end_date);
    if (options.aggregation) params.append('aggregation', options.aggregation);

    const response = await apiClient.get(`/admin/analytics/timeseries?${params.toString()}`);
    return response.data;
  },

  /**
   * Export analytics report
   */
  async exportReport(options: {
    format: 'csv' | 'pdf' | 'xlsx';
    report_type: 'summary' | 'users' | 'content' | 'revenue' | 'streaming';
    start_date?: string;
    end_date?: string;
  }): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', options.format);
    params.append('report_type', options.report_type);
    if (options.start_date) params.append('start_date', options.start_date);
    if (options.end_date) params.append('end_date', options.end_date);

    const response = await apiClient.get(`/admin/analytics/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get real-time dashboard data
   */
  async getRealtimeDashboard(): Promise<{
    current_viewers: number;
    active_downloads: number;
    api_requests_per_minute: number;
    bandwidth_mbps: number;
    recent_signups: number;
    recent_subscriptions: number;
    alerts: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      timestamp: string;
    }>;
  }> {
    const response = await apiClient.get('/admin/analytics/realtime');
    return response.data;
  },
};
