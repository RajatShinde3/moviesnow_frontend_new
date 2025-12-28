/**
 * =============================================================================
 * Webhook Management Service
 * =============================================================================
 * API service for webhook event monitoring and audit logs
 */

import { fetchJson } from '../client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WebhookEvent {
  id: string;
  source: 'cdn' | 'email' | 'encoding' | 'payments';
  action: string;
  timestamp: string;
  actor?: string;
  meta?: {
    headers?: Record<string, string>;
    body?: Record<string, any>;
  };
  event_id?: string;
  status?: 'success' | 'failed' | 'pending';
}

export interface WebhookStats {
  total_events: number;
  events_by_source: Record<string, number>;
  events_last_24h: number;
  events_last_7d: number;
  failure_rate: number;
  avg_processing_time_ms?: number;
}

export interface WebhookConfiguration {
  source: string;
  endpoint: string;
  secret_configured: boolean;
  enabled: boolean;
  dedup_ttl_seconds: number;
  last_event?: string;
  event_count_30d: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Webhook Service
// ─────────────────────────────────────────────────────────────────────────────

export const webhooksService = {
  /**
   * Get audit logs filtered by webhook source
   */
  async getWebhookEvents(params?: {
    source?: 'cdn' | 'email' | 'encoding' | 'payments';
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    events: WebhookEvent[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('action', 'webhook');
    if (params?.source) queryParams.append('source', params.source);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.per_page) queryParams.append('per_page', String(params.per_page));

    const response: any = await fetchJson<any>(`/debug/audit-logs?${queryParams.toString()}`);
    return response as any;
  },

  /**
   * Get webhook statistics
   */
  async getWebhookStats(days: number = 30): Promise<WebhookStats> {
    // This would aggregate from audit logs
    // For now, we'll fetch recent events and calculate stats client-side
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const response: any = await fetchJson<any>('/debug/audit-logs', {
      searchParams: {
        action: 'webhook',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        per_page: 1000,
      },
    });

    const events = response.data.events || [];
    const now = Date.now();
    const last24h = events.filter(
      (e: WebhookEvent) => now - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000
    );
    const last7d = events.filter(
      (e: WebhookEvent) => now - new Date(e.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    );

    const eventsBySource = events.reduce((acc: Record<string, number>, event: WebhookEvent) => {
      acc[event.source] = (acc[event.source] || 0) + 1;
      return acc;
    }, {});

    return {
      total_events: events.length,
      events_by_source: eventsBySource,
      events_last_24h: last24h.length,
      events_last_7d: last7d.length,
      failure_rate: 0, // Would calculate from event statuses if available
    };
  },

  /**
   * Get webhook configurations
   */
  async getWebhookConfigurations(): Promise<WebhookConfiguration[]> {
    // Synthetic data based on known webhook endpoints
    // In production, this might come from backend config endpoint
    return [
      {
        source: 'cdn',
        endpoint: '/webhooks/cdn/invalidation-callback',
        secret_configured: true,
        enabled: true,
        dedup_ttl_seconds: 600,
        event_count_30d: 0,
      },
      {
        source: 'email',
        endpoint: '/webhooks/email-events',
        secret_configured: true,
        enabled: true,
        dedup_ttl_seconds: 600,
        event_count_30d: 0,
      },
      {
        source: 'encoding',
        endpoint: '/webhooks/encoding-status',
        secret_configured: true,
        enabled: true,
        dedup_ttl_seconds: 600,
        event_count_30d: 0,
      },
      {
        source: 'payments',
        endpoint: '/webhooks/payments',
        secret_configured: true,
        enabled: true,
        dedup_ttl_seconds: 600,
        event_count_30d: 0,
      },
    ];
  },

  /**
   * Test webhook endpoint (send test event)
   */
  async testWebhook(source: string): Promise<{ success: boolean; message: string }> {
    try {
      const response: any = await fetchJson<any>(`/webhooks/${source}/test`, {
        method: 'POST',
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
        }),
      });
      return { success: true, message: 'Test webhook sent successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to send test webhook' };
    }
  },
};
