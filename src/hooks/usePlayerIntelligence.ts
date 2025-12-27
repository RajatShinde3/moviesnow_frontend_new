// hooks/usePlayerIntelligence.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import type {
  PlayerIntelligence,
  PlayerIntelligenceSettings,
  PlayerAnalyticsDashboard,
  PlayerEvent,
  VideoQuality,
} from '@/types/playerIntelligence';
import { useWebSocket } from './useWebSocket';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Hook for player intelligence and adaptive streaming
 */
export function usePlayerIntelligence(sessionId?: string) {
  const queryClient = useQueryClient();

  // Fetch player intelligence data
  const {
    data: intelligence,
    isLoading,
    error,
  } = useQuery<PlayerIntelligence>({
    queryKey: ['player-intelligence', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID required');
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/player/intelligence/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch player intelligence');
      return response.json();
    },
    enabled: !!sessionId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch player settings
  const {
    data: settings,
    isLoading: settingsLoading,
  } = useQuery<PlayerIntelligenceSettings>({
    queryKey: ['player-settings'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/player/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch player settings');
      return response.json();
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<PlayerIntelligenceSettings>) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/player/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update settings');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-settings'] });
    },
  });

  // Change quality mutation
  const changeQualityMutation = useMutation({
    mutationFn: async ({ sessionId, quality }: { sessionId: string; quality: VideoQuality }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/v1/player/quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId, quality }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to change quality');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-intelligence'] });
    },
  });

  // WebSocket for real-time updates
  const handleWebSocketMessage = useCallback((event: PlayerEvent) => {
    if (event.sessionId === sessionId) {
      queryClient.invalidateQueries({ queryKey: ['player-intelligence', sessionId] });
    }
  }, [sessionId, queryClient]);

  const { isConnected } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
    token: typeof window !== 'undefined' ? localStorage.getItem('access_token') || undefined : undefined,
    onMessage: handleWebSocketMessage,
  });

  return {
    // Data
    intelligence,
    settings,

    // Loading states
    isLoading: isLoading || settingsLoading,

    // Errors
    error,

    // Mutations
    updateSettings: updateSettingsMutation.mutate,
    changeQuality: changeQualityMutation.mutate,

    // Mutation states
    isUpdatingSettings: updateSettingsMutation.isPending,
    isChangingQuality: changeQualityMutation.isPending,

    // Mutation errors
    updateError: updateSettingsMutation.error,
    changeQualityError: changeQualityMutation.error,

    // WebSocket
    isConnected,
  };
}

/**
 * Hook for player analytics dashboard
 */
export function usePlayerAnalytics(filters?: { startDate?: string; endDate?: string }) {
  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery<PlayerAnalyticsDashboard>({
    queryKey: ['player-analytics', filters],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();

      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`${API_BASE}/api/v1/player/analytics?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch player analytics');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    analytics,
    isLoading,
    error,
  };
}
