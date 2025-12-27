/**
 * =============================================================================
 * useBundles Hooks
 * =============================================================================
 * React Query hooks for bundle management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bundleService, CreateBundleRequest, UpdateBundleRequest } from '../services/bundles';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const bundleKeys = {
  all: ['bundles'] as const,
  lists: () => [...bundleKeys.all, 'list'] as const,
  list: (filters: any) => [...bundleKeys.lists(), filters] as const,
  details: () => [...bundleKeys.all, 'detail'] as const,
  detail: (id: string) => [...bundleKeys.details(), id] as const,
  title: (titleId: string) => [...bundleKeys.all, 'title', titleId] as const,
  season: (titleId: string, seasonId: string) =>
    [...bundleKeys.all, 'season', titleId, seasonId] as const,
  stats: (bundleId: string) => [...bundleKeys.all, 'stats', bundleId] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List all bundles (admin)
 */
export function useBundles(options?: {
  title_id?: string;
  quality?: string;
  format?: string;
  is_premium_only?: boolean;
  page?: number;
  per_page?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: bundleKeys.list(options),
    queryFn: () => bundleService.listBundles(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false,
  });
}

/**
 * Get bundle by ID
 */
export function useBundle(bundleId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bundleKeys.detail(bundleId),
    queryFn: () => bundleService.getBundleById(bundleId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!bundleId,
  });
}

/**
 * Get bundles for a title (public)
 */
export function useTitleBundles(titleId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bundleKeys.title(titleId),
    queryFn: () => bundleService.getTitleBundles(titleId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!titleId,
  });
}

/**
 * Get bundles for a season (public)
 */
export function useSeasonBundles(
  titleId: string,
  seasonId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: bundleKeys.season(titleId, seasonId),
    queryFn: () => bundleService.getSeasonBundles(titleId, seasonId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!titleId && !!seasonId,
  });
}

/**
 * Get bundle download statistics (admin)
 */
export function useBundleStats(bundleId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bundleKeys.stats(bundleId),
    queryFn: () => bundleService.getBundleStats(bundleId),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    enabled: options?.enabled !== false && !!bundleId,
  });
}

/**
 * Create bundle (admin)
 */
export function useCreateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBundleRequest) => bundleService.createBundle(data),
    onSuccess: (newBundle) => {
      queryClient.invalidateQueries({ queryKey: bundleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bundleKeys.title(newBundle.title_id) });
      if (newBundle.season_id) {
        queryClient.invalidateQueries({
          queryKey: bundleKeys.season(newBundle.title_id, newBundle.season_id),
        });
      }
      toast.success('Bundle created successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to create bundle', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Update bundle (admin)
 */
export function useUpdateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bundleId, data }: { bundleId: string; data: UpdateBundleRequest }) =>
      bundleService.updateBundle(bundleId, data),
    onSuccess: (updatedBundle, variables) => {
      queryClient.invalidateQueries({ queryKey: bundleKeys.detail(variables.bundleId) });
      queryClient.invalidateQueries({ queryKey: bundleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bundleKeys.title(updatedBundle.title_id) });
      toast.success('Bundle updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update bundle', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Delete bundle (admin)
 */
export function useDeleteBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bundleId: string) => bundleService.deleteBundle(bundleId),
    onSuccess: (_, bundleId) => {
      queryClient.invalidateQueries({ queryKey: bundleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bundleKeys.all });
      toast.success('Bundle deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete bundle', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Generate download link for bundle
 */
export function useGenerateDownloadLink() {
  return useMutation({
    mutationFn: (bundleId: string) => bundleService.generateDownloadLink(bundleId),
    onSuccess: () => {
      toast.success('Download link generated!');
    },
    onError: (error: any) => {
      toast.error('Failed to generate download link', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Generate custom bundle (admin)
 */
export function useGenerateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => bundleService.generateBundle(data),
    onSuccess: (newBundle) => {
      queryClient.invalidateQueries({ queryKey: bundleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bundleKeys.title(newBundle.title_id) });
      toast.success('Bundle generated successfully!', {
        description: 'Your custom bundle is ready for download',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to generate bundle', {
        description: error?.message || 'Please check your configuration and try again',
      });
    },
  });
}

/**
 * Bulk create bundles (admin)
 */
export function useBulkCreateBundles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ titleId, configs }: { titleId: string; configs: CreateBundleRequest[] }) =>
      bundleService.bulkCreateBundles(titleId, configs),
    onSuccess: (bundles, variables) => {
      queryClient.invalidateQueries({ queryKey: bundleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bundleKeys.title(variables.titleId) });
      toast.success(`${bundles.length} bundles created successfully!`);
    },
    onError: (error: any) => {
      toast.error('Failed to create bundles', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Track bundle download
 */
export function useTrackDownload() {
  return useMutation({
    mutationFn: ({ bundleId, metadata }: { bundleId: string; metadata?: any }) =>
      bundleService.trackDownload(bundleId, metadata),
    // Silent - no toast for tracking
  });
}
