// hooks/useAuditLogs.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuditLog, AuditStats, AuditFilters, ExportAuditRequest, ExportFormat } from '@/types/audit';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Hook for managing audit logs
 */
export function useAuditLogs(filters?: AuditFilters) {
  const queryClient = useQueryClient();

  // Fetch audit logs
  const {
    data: logs = [],
    isLoading: logsLoading,
    error: logsError,
  } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();

      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.actions) {
        filters.actions.forEach((a) => params.append('action', a));
      }
      if (filters?.resources) {
        filters.resources.forEach((r) => params.append('resource', r));
      }
      if (filters?.severities) {
        filters.severities.forEach((s) => params.append('severity', s));
      }
      if (filters?.status) {
        filters.status.forEach((s) => params.append('status', s));
      }
      if (filters?.searchQuery) params.append('search', filters.searchQuery);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`${API_BASE}/api/v1/audit/logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    },
  });

  // Fetch audit statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<AuditStats>({
    queryKey: ['audit-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/audit/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch audit stats');
      return response.json();
    },
  });

  // Export audit logs mutation
  const exportMutation = useMutation({
    mutationFn: async (request: ExportAuditRequest) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/audit/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to export audit logs');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.${request.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    },
  });

  return {
    // Data
    logs,
    stats,

    // Loading states
    isLoading: logsLoading || statsLoading,
    logsLoading,
    statsLoading,

    // Errors
    logsError,
    statsError,

    // Mutations
    exportLogs: exportMutation.mutate,

    // Mutation states
    isExporting: exportMutation.isPending,
    exportError: exportMutation.error,
  };
}
