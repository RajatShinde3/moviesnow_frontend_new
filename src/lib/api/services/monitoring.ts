/**
 * =============================================================================
 * Operational Monitoring Service
 * =============================================================================
 * API service for system health monitoring, metrics, and alerts
 */

import { apiClient } from '../client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: Record<string, any>;
}

export interface HealthStatusResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptime_seconds: number;
  checks: {
    application: HealthCheck;
    database: HealthCheck;
    dependencies: HealthCheck;
    resources: HealthCheck;
  };
  circuit_breakers: {
    total_count: number;
    open_count: number;
    half_open_count: number;
    closed_count: number;
    breakers: Record<string, CircuitBreakerStatus>;
  };
}

export interface CircuitBreakerStatus {
  state: 'closed' | 'open' | 'half_open';
  failure_count: number;
  last_failure_time?: string;
  next_attempt_time?: string;
}

export interface MetricsResponse {
  timestamp: string;
  metrics_summary: {
    http_requests_total: number;
    http_requests_per_second: number;
    avg_response_time_ms: number;
    error_rate_percent: number;
    active_connections: number;
  };
  business_kpis: {
    active_users: number;
    total_streams: number;
    total_downloads: number;
    revenue_today: number;
    cdn_bandwidth_gb: number;
  };
}

export interface PerformanceResponse {
  timestamp: string;
  window_minutes: number;
  system_performance: {
    cpu: {
      avg: number;
      max: number;
      min: number;
    };
    memory: {
      avg: number;
      max: number;
      min: number;
      total_mb: number;
      available_mb: number;
    };
    disk: {
      usage_percent: number;
      total_gb: number;
      available_gb: number;
    };
  };
  memory_profile: {
    total_allocated_mb: number;
    heap_size_mb: number;
    objects_tracked: number;
  };
  metrics_summary: {
    requests_per_minute: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    p99_latency_ms: number;
  };
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  details?: Record<string, any>;
}

export interface DashboardDataResponse {
  timestamp: string;
  system_status: 'healthy' | 'warning' | 'critical';
  health: HealthStatusResponse;
  performance: any;
  metrics: any;
  business_kpis: any;
  alerts: Alert[];
}

export interface SystemStatusResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime_seconds: number;
  details: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Monitoring Service
// ─────────────────────────────────────────────────────────────────────────────

export const monitoringService = {
  /**
   * Get comprehensive health status
   */
  async getHealth(): Promise<HealthStatusResponse> {
    const response = await apiClient.get('/monitoring/health');
    return response.data;
  },

  /**
   * Get liveness probe status
   */
  async getLiveness(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get('/monitoring/health/liveness');
    return response.data;
  },

  /**
   * Get readiness probe status
   */
  async getReadiness(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get('/monitoring/health/readiness');
    return response.data;
  },

  /**
   * Get startup probe status
   */
  async getStartup(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get('/monitoring/health/startup');
    return response.data;
  },

  /**
   * Get Prometheus metrics (text format)
   */
  async getPrometheusMetrics(): Promise<string> {
    const response = await apiClient.get('/monitoring/metrics', {
      headers: { Accept: 'text/plain' },
    });
    return response.data;
  },

  /**
   * Get metrics summary
   */
  async getMetricsSummary(): Promise<MetricsResponse> {
    const response = await apiClient.get('/monitoring/metrics/summary');
    return response.data;
  },

  /**
   * Get performance report
   */
  async getPerformanceReport(windowMinutes: number = 30): Promise<PerformanceResponse> {
    const response = await apiClient.get('/monitoring/performance', {
      params: { window_minutes: windowMinutes },
    });
    return response.data;
  },

  /**
   * Force garbage collection (admin only)
   */
  async forceGarbageCollection(): Promise<{
    objects_collected: number;
    memory_freed_mb: number;
    duration_ms: number;
  }> {
    const response = await apiClient.post('/monitoring/performance/gc');
    return response.data;
  },

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(): Promise<DashboardDataResponse> {
    const response = await apiClient.get('/monitoring/dashboard');
    return response.data;
  },

  /**
   * Get system status (simplified)
   */
  async getSystemStatus(): Promise<SystemStatusResponse> {
    const response = await apiClient.get('/monitoring/status');
    return response.data;
  },

  /**
   * Get circuit breaker status
   */
  async getCircuitBreakers(): Promise<{
    timestamp: string;
    circuit_breakers: Record<string, CircuitBreakerStatus>;
  }> {
    const response = await apiClient.get('/monitoring/circuit-breakers');
    return response.data;
  },

  /**
   * Reset circuit breaker
   */
  async resetCircuitBreaker(circuitName: string): Promise<{
    message: string;
    timestamp: string;
    status: string;
  }> {
    const response = await apiClient.post(`/monitoring/circuit-breakers/${circuitName}/reset`);
    return response.data;
  },

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<Alert[]> {
    const response = await apiClient.get('/monitoring/alerts');
    return response.data;
  },

  /**
   * Start maintenance mode
   */
  async startMaintenanceMode(): Promise<{
    message: string;
    timestamp: string;
    started_by: string;
  }> {
    const response = await apiClient.post('/monitoring/maintenance/start');
    return response.data;
  },

  /**
   * Stop maintenance mode
   */
  async stopMaintenanceMode(): Promise<{
    message: string;
    timestamp: string;
    stopped_by: string;
  }> {
    const response = await apiClient.post('/monitoring/maintenance/stop');
    return response.data;
  },
};
