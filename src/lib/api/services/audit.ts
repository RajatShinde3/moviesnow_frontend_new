/**
 * =============================================================================
 * Audit Logs Service
 * =============================================================================
 * API service for viewing system audit logs and admin actions
 */

import { fetchJson } from '../client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  source: string;
  action: string;
  actor?: string;
  timestamp: string;
  meta?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface AuditLogsResponse {
  items: AuditLogEntry[];
  page: number;
  page_size: number;
  total: number;
}

export interface AuditStats {
  total_entries: number;
  entries_by_source: Record<string, number>;
  entries_by_action: Record<string, number>;
  unique_actors: number;
  time_range: {
    earliest: string;
    latest: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Service
// ─────────────────────────────────────────────────────────────────────────────

export const auditService = {
  /**
   * Get audit logs with pagination and filters
   */
  async getAuditLogs(params?: {
    page?: number;
    page_size?: number;
    source?: string;
    actor?: string;
  }): Promise<AuditLogsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.page_size) queryParams.append('page_size', String(params.page_size));
    if (params?.source) queryParams.append('source', params.source);
    if (params?.actor) queryParams.append('actor', params.actor);

    const response: any = await fetchJson<any>(`/debug/audit-logs?${queryParams.toString()}`);
    return response as any;
  },

  /**
   * Get audit log statistics
   */
  async getAuditStats(): Promise<AuditStats> {
    // Fetch recent logs and calculate stats client-side
    const response: any = await fetchJson<any>('/debug/audit-logs', {
      searchParams: { page: 1, page_size: 1000 },
    });

    const items: AuditLogEntry[] = response.data.items || [];

    const sourceCount = items.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const actionCount = items.reduce((acc, item) => {
      acc[item.action] = (acc[item.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueActors = new Set(items.map((item) => item.actor).filter(Boolean)).size;

    const timestamps = items.map((item) => new Date(item.timestamp).getTime());
    const earliest = timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : '';
    const latest = timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : '';

    return {
      total_entries: response.data.total || 0,
      entries_by_source: sourceCount,
      entries_by_action: actionCount,
      unique_actors: uniqueActors,
      time_range: {
        earliest,
        latest,
      },
    };
  },

  /**
   * Export audit logs as CSV
   */
  async exportAuditLogs(params?: {
    source?: string;
    actor?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params?.source) queryParams.append('source', params.source);
    if (params?.actor) queryParams.append('actor', params.actor);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const response: any = await fetchJson<any>(`/debug/audit-logs/export?${queryParams.toString()}`);
    return response as any;
  },
};
