/**
 * =============================================================================
 * useDownloads Hooks
 * =============================================================================
 * React Query hooks for download management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  downloadsService,
  DownloadRequest,
  DownloadStatus,
  DownloadQuality,
} from '../services/downloads';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const downloadKeys = {
  all: ['downloads'] as const,
  lists: () => [...downloadKeys.all, 'list'] as const,
  list: (filters?: any) => [...downloadKeys.lists(), filters] as const,
  details: () => [...downloadKeys.all, 'detail'] as const,
  detail: (id: string) => [...downloadKeys.details(), id] as const,
  quota: () => [...downloadKeys.all, 'quota'] as const,
  stats: () => [...downloadKeys.all, 'stats'] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Download List & Details
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to fetch user's downloads
 */
export function useDownloads(options?: {
  status?: DownloadStatus;
  quality?: DownloadQuality;
  page?: number;
  per_page?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: downloadKeys.list(options),
    queryFn: () => downloadsService.listDownloads(options),
    enabled: options?.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: (data) => {
      // Auto-refresh if there are active downloads
    //@ts-expect-error
      const hasActiveDownloads = data?.some(
    //@ts-expect-error
        (d) => d.status === 'pending' || d.status === 'processing' || d.status === 'downloading'
      );
      return hasActiveDownloads ? 5000 : false; // 5 seconds if active, otherwise don't auto-refresh
    },
  });
}

/**
 * Hook to fetch a specific download
 */
export function useDownload(downloadId: string, enabled = true) {
  return useQuery({
    queryKey: downloadKeys.detail(downloadId),
    queryFn: () => downloadsService.getDownload(downloadId),
    enabled: enabled && !!downloadId,
    refetchInterval: (data) => {
      // Auto-refresh if download is in progress
    //@ts-expect-error
      return data?.status === 'pending' || data?.status === 'processing' || data?.status === 'downloading'
        ? 3000
        : false;
    },
  });
}

/**
 * Hook to get download quota
 */
export function useDownloadQuota() {
  return useQuery({
    queryKey: downloadKeys.quota(),
    queryFn: () => downloadsService.getQuota(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

/**
 * Hook to get download statistics
 */
export function useDownloadStats() {
  return useQuery({
    queryKey: downloadKeys.stats(),
    queryFn: () => downloadsService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to request a new download
 */
export function useRequestDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DownloadRequest) => downloadsService.requestDownload(data),
    onSuccess: (download) => {
      queryClient.invalidateQueries({ queryKey: downloadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: downloadKeys.quota() });
      toast.success(
        `Download requested for ${download.content_name} (${download.quality})`,
        {
          description: 'Your download will be ready shortly',
        }
      );
    },
    onError: (error: any) => {
      if (error?.message?.includes('quota exceeded')) {
        toast.error('Download quota exceeded', {
          description: 'You have reached your daily download limit',
        });
      } else if (error?.message?.includes('concurrent')) {
        toast.error('Too many concurrent downloads', {
          description: 'Please wait for some downloads to complete',
        });
      } else {
        toast.error('Failed to request download', {
          description: error?.message || 'Please try again later',
        });
      }
    },
  });
}

/**
 * Hook to get download URL
 */
export function useGetDownloadUrl() {
  return useMutation({
    mutationFn: (downloadId: string) => downloadsService.getDownloadUrl(downloadId),
    onSuccess: (data) => {
      // Open download URL in new tab
      window.open(data.url, '_blank');
      toast.success('Download started', {
        description: `Downloading ${data.content_name}`,
      });
    },
    onError: (error: any) => {
      if (error?.message?.includes('not ready')) {
        toast.error('Download not ready yet', {
          description: 'Please wait a moment and try again',
        });
      } else if (error?.message?.includes('expired')) {
        toast.error('Download link expired', {
          description: 'Please request a new download',
        });
      } else {
        toast.error('Failed to get download URL', {
          description: error?.message || 'Please try again',
        });
      }
    },
  });
}

/**
 * Hook to cancel a download
 */
export function useCancelDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (downloadId: string) => downloadsService.cancelDownload(downloadId),
    onSuccess: (_, downloadId) => {
      queryClient.invalidateQueries({ queryKey: downloadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: downloadKeys.detail(downloadId) });
      queryClient.invalidateQueries({ queryKey: downloadKeys.quota() });
      toast.success('Download cancelled');
    },
    onError: (error: any) => {
      toast.error('Failed to cancel download', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to cleanup expired downloads
 */
export function useCleanupExpiredDownloads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => downloadsService.cleanupExpired(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: downloadKeys.lists() });
      toast.success('Expired downloads cleaned up');
    },
    onError: (error: any) => {
      toast.error('Failed to cleanup downloads', {
        description: error?.message || 'Please try again',
      });
    },
  });
}
