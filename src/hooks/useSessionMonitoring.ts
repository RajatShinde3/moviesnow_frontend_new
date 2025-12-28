// hooks/useSessionMonitoring.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import type {
  UserSession,
  SessionStats,
  SessionFilters,
  TerminateSessionRequest,
  BulkTerminateRequest,
  SessionUpdate,
  SessionAlert,
} from '@/types/session';
import { useWebSocket } from './useWebSocket';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Hook for managing and monitoring user sessions
 */
export function useSessionMonitoring(filters?: SessionFilters) {
  const queryClient = useQueryClient();
  const [alerts, setAlerts] = useState<SessionAlert[]>([]);

  // Fetch all active sessions
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useQuery<UserSession[]>({
    queryKey: ['sessions', filters],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();

      if (filters?.status) {
        filters.status.forEach(s => params.append('status', s));
      }
      if (filters?.deviceType) {
        filters.deviceType.forEach(d => params.append('deviceType', d));
      }
      if (filters?.searchQuery) {
        params.append('search', filters.searchQuery);
      }
      if (filters?.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters?.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }

      const response = await fetch(`${API_BASE}/api/v1/sessions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch session statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<SessionStats>({
    queryKey: ['session-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/sessions/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch session stats');
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch alerts
  const {
    data: alertsData = [],
    isLoading: alertsLoading,
  } = useQuery<SessionAlert[]>({
    queryKey: ['session-alerts'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/sessions/alerts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  useEffect(() => {
    setAlerts(alertsData);
  }, [alertsData]);

  // Terminate session mutation
  const terminateSessionMutation = useMutation({
    mutationFn: async (data: TerminateSessionRequest) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/sessions/${data.sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: data.reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to terminate session');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-stats'] });
    },
  });

  // Bulk terminate sessions mutation
  const bulkTerminateMutation = useMutation({
    mutationFn: async (data: BulkTerminateRequest) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/sessions/bulk-terminate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to terminate sessions');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-stats'] });
    },
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/sessions/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to acknowledge alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-alerts'] });
    },
  });

  // WebSocket for real-time updates
  const handleWebSocketMessage = useCallback((message: SessionUpdate) => {
    if (message.type === 'session_created' || message.type === 'session_updated') {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-stats'] });
    } else if (message.type === 'session_terminated') {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-stats'] });
    } else if (message.type === 'activity_logged') {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  }, [queryClient]);

  const { isConnected } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
    token: typeof window !== 'undefined' ? localStorage.getItem('access_token') || undefined : undefined,
  //@ts-expect-error
    onMessage: handleWebSocketMessage,
  });

  return {
    // Data
    sessions,
    stats,
    alerts,

    // Loading states
    isLoading: sessionsLoading || statsLoading,
    sessionsLoading,
    statsLoading,
    alertsLoading,

    // Errors
    sessionsError,
    statsError,

    // Mutations
    terminateSession: terminateSessionMutation.mutate,
    bulkTerminate: bulkTerminateMutation.mutate,
    acknowledgeAlert: acknowledgeAlertMutation.mutate,

    // Mutation states
    isTerminating: terminateSessionMutation.isPending,
    isBulkTerminating: bulkTerminateMutation.isPending,
    isAcknowledging: acknowledgeAlertMutation.isPending,

    // Mutation errors
    terminateError: terminateSessionMutation.error,
    bulkTerminateError: bulkTerminateMutation.error,
    acknowledgeError: acknowledgeAlertMutation.error,

    // WebSocket connection
    isConnected,
  };
}
