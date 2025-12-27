/**
 * =============================================================================
 * useAnime Hooks
 * =============================================================================
 * React Query hooks for anime features
 */

import { useQuery } from '@tanstack/react-query';
import { animeService } from '../services/anime';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const animeKeys = {
  all: ['anime'] as const,
  markers: (titleId: string) => [...animeKeys.all, 'markers', titleId] as const,
  arcs: (titleId: string) => [...animeKeys.all, 'arcs', titleId] as const,
  relations: (titleId: string) => [...animeKeys.all, 'relations', titleId] as const,
  variants: (titleId: string) => [...animeKeys.all, 'variants', titleId] as const,
  schedule: (filters?: any) => [...animeKeys.all, 'schedule', filters] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to fetch episode markers
 */
export function useAnimeMarkers(titleId: string, enabled = true) {
  return useQuery({
    queryKey: animeKeys.markers(titleId),
    queryFn: () => animeService.getMarkers(titleId),
    enabled: enabled && !!titleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch arcs
 */
export function useAnimeArcs(titleId: string, enabled = true) {
  return useQuery({
    queryKey: animeKeys.arcs(titleId),
    queryFn: () => animeService.getArcs(titleId),
    enabled: enabled && !!titleId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch relations
 */
export function useAnimeRelations(titleId: string, enabled = true) {
  return useQuery({
    queryKey: animeKeys.relations(titleId),
    queryFn: () => animeService.getRelations(titleId),
    enabled: enabled && !!titleId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch variants
 */
export function useAnimeVariants(titleId: string, enabled = true) {
  return useQuery({
    queryKey: animeKeys.variants(titleId),
    queryFn: () => animeService.getVariants(titleId),
    enabled: enabled && !!titleId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch airing schedule
 */
export function useAnimeSchedule(options?: {
  from_ts?: string;
  to_ts?: string;
  region?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: animeKeys.schedule(options),
    queryFn: () => animeService.getSchedule(options),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}
