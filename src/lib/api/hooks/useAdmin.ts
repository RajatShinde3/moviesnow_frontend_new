/**
 * =============================================================================
 * useAdmin Hooks
 * =============================================================================
 * React Query hooks for admin functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  users: (filters?: any) => [...adminKeys.all, 'users', filters] as const,
  analytics: {
    content: (titleId: string) => [...adminKeys.all, 'analytics', 'content', titleId] as const,
    users: (days: number) => [...adminKeys.all, 'analytics', 'users', days] as const,
    revenue: (days: number) => [...adminKeys.all, 'analytics', 'revenue', days] as const,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to get admin stats
 */
export function useAdminStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminService.getStats(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to create title
 */
export function useCreateTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => adminService.createTitle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast.success('Title created successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to create title', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to update title
 */
export function useUpdateTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ titleId, data }: { titleId: string; data: any }) =>
      adminService.updateTitle(titleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast.success('Title updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update title', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to delete title
 */
export function useDeleteTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (titleId: string) => adminService.deleteTitle(titleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast.success('Title deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete title', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to create episode
 */
export function useCreateEpisode() {
  return useMutation({
    mutationFn: ({ titleId, data }: { titleId: string; data: any }) =>
      adminService.createEpisode(titleId, data),
    onSuccess: () => {
      toast.success('Episode created successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to create episode', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to upload media asset
 */
export function useUploadMediaAsset() {
  return useMutation({
    mutationFn: ({
      titleId,
      episodeId,
      data,
    }: {
      titleId: string;
      episodeId: string | null;
      data: any;
    }) => adminService.uploadMediaAsset(titleId, episodeId, data),
    onSuccess: () => {
      toast.success('Media asset uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to upload media asset', {
        description: error?.message || 'Please check file format and try again',
      });
    },
  });
}

/**
 * Hook to upload file
 */
export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: any }) =>
      adminService.uploadFile(file, type),
    onError: (error: any) => {
      toast.error('Failed to upload file', {
        description: error?.message || 'Please check file size and format',
      });
    },
  });
}

/**
 * Hook to list users
 */
export function useAdminUsers(options?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: adminKeys.users(options),
    queryFn: () => adminService.listUsers(options),
    staleTime: 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to toggle user status
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) =>
      adminService.toggleUserStatus(userId, active),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success(variables.active ? 'User activated' : 'User banned');
    },
    onError: () => {
      toast.error('Failed to update user status');
    },
  });
}

/**
 * Hook to toggle admin access
 */
export function useToggleAdminAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      adminService.toggleAdminAccess(userId, isAdmin),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success(
        variables.isAdmin ? 'Admin access granted' : 'Admin access revoked'
      );
    },
    onError: () => {
      toast.error('Failed to update admin access');
    },
  });
}

/**
 * Hook to get content analytics
 */
export function useContentAnalytics(titleId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.analytics.content(titleId),
    queryFn: () => adminService.getContentAnalytics(titleId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!titleId,
  });
}

/**
 * Hook to get user analytics
 */
export function useUserAnalytics(days = 30, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.analytics.users(days),
    queryFn: () => adminService.getUserAnalytics(days),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to get revenue analytics
 */
export function useRevenueAnalytics(days = 30, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.analytics.revenue(days),
    queryFn: () => adminService.getRevenueAnalytics(days),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to bulk import titles
 */
export function useBulkImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (titles: any[]) => adminService.bulkImport(titles),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      toast.success(`Imported ${result.success} titles successfully`, {
        description: result.failed > 0 ? `${result.failed} failed` : undefined,
      });
    },
    onError: (error: any) => {
      toast.error('Bulk import failed', {
        description: error?.message || 'Please check your data format',
      });
    },
  });
}
