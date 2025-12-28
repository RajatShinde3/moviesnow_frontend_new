/**
 * =============================================================================
 * Search API Service
 * =============================================================================
 * Advanced search with autocomplete, filters, and smart suggestions
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  type: 'movie' | 'series' | 'anime' | 'documentary';
  name: string;
  original_name?: string;
  description?: string;
  poster_url?: string;
  backdrop_url?: string;
  release_year?: number;
  rating_average?: number;
  genres?: string[];
  match_score?: number;
}

export interface AutocompleteResult {
  id: string;
  type: 'movie' | 'series' | 'anime' | 'documentary' | 'person' | 'genre';
  name: string;
  poster_url?: string;
  metadata?: {
    year?: number;
    role?: string;
    count?: number;
  };
}

export interface SearchFilters {
  types?: ('movie' | 'series' | 'anime' | 'documentary')[];
  genres?: string[];
  year_min?: number;
  year_max?: number;
  rating_min?: number;
  rating_max?: number;
  sort_by?: 'relevance' | 'rating' | 'year' | 'popularity' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface SearchOptions extends SearchFilters {
  page?: number;
  per_page?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
  filters_applied: SearchFilters;
  query: string;
}

export interface SearchSuggestion {
  query: string;
  type: 'trending' | 'recent' | 'popular' | 'similar';
  count?: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  searched_at: string;
  result_count: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────────────────────────────────────

export const searchService = {
  /**
   * Advanced search with filters
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResponse> {
    const params = new URLSearchParams();
    params.append('q', query);

    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());
    if (options?.types?.length) params.append('types', options.types.join(','));
    if (options?.genres?.length) params.append('genres', options.genres.join(','));
    if (options?.year_min) params.append('year_min', options.year_min.toString());
    if (options?.year_max) params.append('year_max', options.year_max.toString());
    if (options?.rating_min) params.append('rating_min', options.rating_min.toString());
    if (options?.rating_max) params.append('rating_max', options.rating_max.toString());
    if (options?.sort_by) params.append('sort_by', options.sort_by);
    if (options?.sort_order) params.append('sort_order', options.sort_order);

    return (await fetchJson<SearchResponse>(`${API_BASE}/api/v1/search?${params.toString()}`))!;
  },

  /**
   * Autocomplete suggestions
   */
  async autocomplete(query: string, limit = 10): Promise<{
    suggestions: AutocompleteResult[];
    query: string;
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    return fetchJson<any>(`${API_BASE}/api/v1/search/autocomplete?${params.toString()}`);
  },

  /**
   * Get search suggestions (trending, popular)
   */
  async getSuggestions(): Promise<{
    trending: SearchSuggestion[];
    popular: SearchSuggestion[];
  }> {
    return fetchJson<any>(`${API_BASE}/api/v1/search/suggestions`);
  },

  /**
   * Get search history for current user
   */
  async getHistory(limit = 20): Promise<{
    history: SearchHistory[];
    total_count: number;
  }> {
    return fetchJson<any>(`${API_BASE}/api/v1/search/history?limit=${limit}`);
  },

  /**
   * Clear search history
   */
  async clearHistory(): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/search/history`, {
      method: 'DELETE',
    });
  },

  /**
   * Delete specific search history item
   */
  async deleteHistoryItem(itemId: string): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/search/history/${itemId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get available filters (genres, years, etc.)
   */
  async getAvailableFilters(): Promise<{
    genres: string[];
    years: { min: number; max: number };
    types: string[];
  }> {
    return fetchJson<any>(`${API_BASE}/api/v1/search/filters`);
  },
};
