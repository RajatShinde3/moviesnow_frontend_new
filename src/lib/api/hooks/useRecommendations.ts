/**
 * =============================================================================
 * useRecommendations Hooks
 * =============================================================================
 * React Query hooks for content discovery
 */

import { useQuery } from '@tanstack/react-query';
import { recommendationsService } from '../services/recommendations';

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const recommendationKeys = {
  all: ['recommendations'] as const,
  homeRails: (profileId?: string) => [...recommendationKeys.all, 'home', profileId] as const,
  trending: (window?: string, region?: string) =>
    [...recommendationKeys.all, 'trending', window, region] as const,
  top10: (region?: string) => [...recommendationKeys.all, 'top10', region] as const,
  recommended: (filters?: any) => [...recommendationKeys.all, 'recommended', filters] as const,
  collection: (slug: string) => [...recommendationKeys.all, 'collection', slug] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to fetch homepage rails
 */
export function useHomeRails(profileId?: string, enabled = true) {
  return useQuery({
    queryKey: recommendationKeys.homeRails(profileId),
    queryFn: () => recommendationsService.getHomeRails(profileId),
    enabled,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

/**
 * Hook to fetch trending titles
 */
export function useTrending(
  options?: {
    window?: '6h' | '24h' | '72h' | '168h';
    region?: string;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: recommendationKeys.trending(options?.window, options?.region),
    queryFn: () => recommendationsService.getTrending(options),
    enabled: options?.enabled !== false,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}

/**
 * Hook to fetch top 10
 */
export function useTop10(region = 'US', enabled = true) {
  return useQuery({
    queryKey: recommendationKeys.top10(region),
    queryFn: () => recommendationsService.getTop10(region),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch personalized recommendations
 */
export function useRecommendations(
  options?: {
    seed?: string;
    profile_id?: string;
    page_size?: number;
    cursor?: string;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: recommendationKeys.recommended(options),
    queryFn: () => recommendationsService.getRecommendations(options),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch editorial collection
 */
export function useCollection(slug: string, enabled = true) {
  return useQuery({
    queryKey: recommendationKeys.collection(slug),
    queryFn: () => recommendationsService.getCollection(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
