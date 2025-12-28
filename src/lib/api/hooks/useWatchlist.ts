/**
 * =============================================================================
 * useWatchlist Hooks
 * =============================================================================
 * React Query hooks for enhanced watchlist management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  watchlistService,
  AddToWatchlistRequest,
  UpdateWatchlistItemRequest,
  ReorderItem,
} from '../services/watchlist';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const watchlistKeys = {
  all: ['watchlist'] as const,
  lists: () => [...watchlistKeys.all, 'list'] as const,
  list: (profileId: string, filters?: any) =>
    [...watchlistKeys.lists(), profileId, filters] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to fetch watchlist
 */
export function useWatchlist(
  profileId: string,
  options?: {
    page?: number;
    per_page?: number;
    archived?: boolean;
    favorites_only?: boolean;
    sort_by?: 'created_at' | 'updated_at' | 'sort_index' | 'title_name';
    sort_order?: 'asc' | 'desc';
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: watchlistKeys.list(profileId, options),
    queryFn: () => watchlistService.getWatchlist(profileId, options),
    enabled: options?.enabled !== false && !!profileId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to add to watchlist
 */
export function useAddToWatchlist(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToWatchlistRequest) =>
      watchlistService.addToWatchlist(profileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
      toast.success('Added to watchlist', {
        description: `You can now track this title`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to add to watchlist', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to remove from watchlist
 */
export function useRemoveFromWatchlist(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ titleId, archiveOnly }: { titleId: string; archiveOnly?: boolean }) =>
      watchlistService.removeFromWatchlist(profileId, titleId, archiveOnly),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
      toast.success(
        variables.archiveOnly ? 'Archived successfully' : 'Removed from watchlist'
      );
    },
    onError: (error: any) => {
      toast.error('Failed to remove from watchlist', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to update watchlist item
 */
export function useUpdateWatchlistItem(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ titleId, data }: { titleId: string; data: UpdateWatchlistItemRequest }) =>
      watchlistService.updateWatchlistItem(profileId, titleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
      toast.success('Updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update item', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to reorder watchlist
 */
export function useReorderWatchlist(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reorderData: ReorderItem[]) =>
      watchlistService.reorderWatchlist(profileId, reorderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
      toast.success('Watchlist reordered');
    },
    onError: (error: any) => {
      toast.error('Failed to reorder watchlist', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to bulk upload watchlist
 */
export function useBulkUploadWatchlist(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      mergeStrategy,
    }: {
      file: File;
      mergeStrategy?: 'upsert' | 'skip_existing' | 'replace_all';
    }) => watchlistService.bulkUpload(profileId, file, mergeStrategy),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
      toast.success('Watchlist uploaded successfully', {
        description: `${data.added_count} added, ${data.updated_count} updated, ${data.skipped_count} skipped`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to upload watchlist', {
        description: error?.message || 'Please check your file and try again',
      });
    },
  });
}

/**
 * Hook to export watchlist
 */
export function useExportWatchlist(profileId: string) {
  return useMutation<any, Error, boolean>({
    mutationFn: (includeArchived = false) =>
      watchlistService.exportWatchlist(profileId, includeArchived),
    onSuccess: (data) => {
      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `moviesnow_watchlist_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Watchlist exported successfully', {
        description: `${data.total_items} items exported`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to export watchlist', {
        description: error?.message || 'Please try again',
      });
    },
  });
}
