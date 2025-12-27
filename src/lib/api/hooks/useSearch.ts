/**
 * =============================================================================
 * useSearch Hooks
 * =============================================================================
 * React Query hooks for search functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { searchService, SearchOptions } from '../services/search';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const searchKeys = {
  all: ['search'] as const,
  searches: () => [...searchKeys.all, 'searches'] as const,
  search: (query: string, options?: SearchOptions) => [...searchKeys.searches(), query, options] as const,
  autocomplete: (query: string) => [...searchKeys.all, 'autocomplete', query] as const,
  suggestions: () => [...searchKeys.all, 'suggestions'] as const,
  history: () => [...searchKeys.all, 'history'] as const,
  filters: () => [...searchKeys.all, 'filters'] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to perform search
 */
export function useSearch(query: string, options?: SearchOptions & { enabled?: boolean }) {
  const { enabled = true, ...searchOptions } = options || {};

  return useQuery({
    queryKey: searchKeys.search(query, searchOptions),
    queryFn: () => searchService.search(query, searchOptions),
    enabled: enabled && query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get autocomplete suggestions
 */
export function useAutocomplete(query: string, options?: { limit?: number; enabled?: boolean }) {
  const { limit = 10, enabled = true } = options || {};

  return useQuery({
    queryKey: searchKeys.autocomplete(query),
    queryFn: () => searchService.autocomplete(query, limit),
    enabled: enabled && query.length >= 1, // Start autocomplete after 1 character
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

/**
 * Hook to get search suggestions
 */
export function useSearchSuggestions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: searchKeys.suggestions(),
    queryFn: () => searchService.getSuggestions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to get search history
 */
export function useSearchHistory(options?: { limit?: number; enabled?: boolean }) {
  const { limit = 20, enabled = true } = options || {};

  return useQuery({
    queryKey: searchKeys.history(),
    queryFn: () => searchService.getHistory(limit),
    staleTime: 60 * 1000, // 1 minute
    enabled,
  });
}

/**
 * Hook to clear search history
 */
export function useClearSearchHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => searchService.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.history() });
      toast.success('Search history cleared');
    },
    onError: (error: any) => {
      toast.error('Failed to clear search history', {
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Hook to delete search history item
 */
export function useDeleteHistoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => searchService.deleteHistoryItem(itemId),
    onMutate: async (itemId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: searchKeys.history() });

      // Snapshot previous value
      const previous = queryClient.getQueryData(searchKeys.history());

      // Optimistically update
      queryClient.setQueryData(searchKeys.history(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          history: old.history.filter((item: any) => item.id !== itemId),
          total_count: old.total_count - 1,
        };
      });

      return { previous };
    },
    onError: (error: any, _, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(searchKeys.history(), context.previous);
      }
      toast.error('Failed to delete history item');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.history() });
    },
  });
}

/**
 * Hook to get available filters
 */
export function useAvailableFilters(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: searchKeys.filters(),
    queryFn: () => searchService.getAvailableFilters(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
  });
}
