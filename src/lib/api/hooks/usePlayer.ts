/**
 * =============================================================================
 * usePlayer Hooks
 * =============================================================================
 * React Query hooks for video player functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { playerService } from '../services/player';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const playerKeys = {
  all: ['player'] as const,
  playbackInfo: (titleId: string, episodeId?: string) =>
    [...playerKeys.all, 'info', titleId, episodeId] as const,
  progress: (titleId: string, episodeId?: string) =>
    [...playerKeys.all, 'progress', titleId, episodeId] as const,
  sessions: () => [...playerKeys.all, 'sessions'] as const,
  activeSessions: () => [...playerKeys.sessions(), 'active'] as const,
  continueWatching: (profileId: string) =>
    [...playerKeys.all, 'continue-watching', profileId] as const,
  stats: (sessionId: string) => [...playerKeys.all, 'stats', sessionId] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to get playback information
 */
export function usePlaybackInfo(titleId: string, episodeId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: playerKeys.playbackInfo(titleId, episodeId),
    queryFn: () => playerService.getPlaybackInfo(titleId, episodeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!titleId,
  });
}

/**
 * Hook to start playback session
 */
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title_id: string;
      episode_id?: string;
      quality: string;
      device_info?: any;
    }) => playerService.startSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.activeSessions() });
    },
    onError: (error: any) => {
      toast.error('Failed to start playback', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to send heartbeat (use with interval)
 */
export function useHeartbeat() {
  return useMutation({
    mutationFn: ({ sessionId, currentTime }: { sessionId: string; currentTime: number }) =>
      playerService.heartbeat(sessionId, currentTime),
    // Silent - no toast notifications for heartbeats
  });
}

/**
 * Hook to end playback session
 */
export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, finalTime }: { sessionId: string; finalTime: number }) =>
      playerService.endSession(sessionId, finalTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.activeSessions() });
    },
  });
}

/**
 * Hook to update watch progress
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title_id: string;
      episode_id?: string;
      progress_seconds: number;
      duration_seconds: number;
    }) => playerService.updateProgress(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: playerKeys.progress(variables.title_id, variables.episode_id)
      });
      queryClient.invalidateQueries({ queryKey: playerKeys.continueWatching('') });
    },
    // Silent - progress updates happen frequently
  });
}

/**
 * Hook to get watch progress
 */
export function useProgress(titleId: string, episodeId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: playerKeys.progress(titleId, episodeId),
    queryFn: () => playerService.getProgress(titleId, episodeId),
    staleTime: 30 * 1000, // 30 seconds
    enabled: options?.enabled !== false && !!titleId,
  });
}

/**
 * Hook to get active sessions
 */
export function useActiveSessions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: playerKeys.activeSessions(),
    queryFn: () => playerService.getActiveSessions(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refresh every minute
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to get playback stats
 */
export function usePlaybackStats(sessionId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: playerKeys.stats(sessionId),
    queryFn: () => playerService.getStats(sessionId),
    staleTime: 10 * 1000,
    enabled: options?.enabled !== false && !!sessionId,
  });
}

/**
 * Hook to report playback metrics
 */
export function useReportMetrics() {
  return useMutation({
    mutationFn: ({ sessionId, metrics }: {
      sessionId: string;
      metrics: any;
    }) => playerService.reportMetrics(sessionId, metrics),
    // Silent - metrics reported frequently
  });
}

/**
 * Hook to get continue watching list
 */
export function useContinueWatching(profileId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: playerKeys.continueWatching(profileId),
    queryFn: () => playerService.getContinueWatching(profileId),
    staleTime: 60 * 1000, // 1 minute
    enabled: options?.enabled !== false && !!profileId,
  });
}

/**
 * Hook to mark as completed
 */
export function useMarkCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ titleId, episodeId }: { titleId: string; episodeId?: string }) =>
      playerService.markCompleted(titleId, episodeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: playerKeys.progress(variables.titleId, variables.episodeId)
      });
      queryClient.invalidateQueries({ queryKey: playerKeys.continueWatching('') });
      toast.success('Marked as completed');
    },
  });
}
