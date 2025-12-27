// hooks/useRevenue.ts
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import type { RevenueDashboard, RevenueFilters, ExportRevenueRequest } from '@/types/revenue';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Hook for managing revenue data and analytics
 */
export function useRevenue(filters?: RevenueFilters) {
  // Fetch revenue dashboard data
  const {
    data: dashboard,
    isLoading,
    error,
  } = useQuery<RevenueDashboard>({
    queryKey: ['revenue-dashboard', filters],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();

      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.planIds) {
        filters.planIds.forEach((id) => params.append('planId', id));
      }
      if (filters?.includeTrials !== undefined) {
        params.append('includeTrials', filters.includeTrials.toString());
      }
      if (filters?.groupBy) params.append('groupBy', filters.groupBy);

      const response = await fetch(`${API_BASE}/api/v1/revenue/dashboard?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch revenue data');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Export revenue data mutation
  const exportMutation = useMutation({
    mutationFn: async (request: ExportRevenueRequest) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/revenue/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to export revenue data');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${new Date().toISOString()}.${request.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    },
  });

  return {
    // Data
    dashboard,

    // Loading states
    isLoading,

    // Errors
    error,

    // Mutations
    exportData: exportMutation.mutate,

    // Mutation states
    isExporting: exportMutation.isPending,
    exportError: exportMutation.error,
  };
}
