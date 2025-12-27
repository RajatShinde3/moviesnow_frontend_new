/**
 * =============================================================================
 * Recommendations API Service
 * =============================================================================
 * Personalized content discovery and trending titles
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface TitleItem {
  id: string;
  name: string;
  type: string;
  poster_url?: string;
  backdrop_url?: string;
  rating_average?: number;
  release_year?: number;
  genres?: string[];
}

export interface Rail {
  id: string;
  title: string;
  items: TitleItem[];
  type: 'trending' | 'popular' | 'recommended' | 'new_releases' | 'continue_watching' | 'custom';
}

export interface HomeRailsResponse {
  rails: Rail[];
}

export interface TrendingResponse {
  region: string;
  window: string;
  items: TitleItem[];
}

export interface Top10Response {
  region: string;
  items: TitleItem[];
}

export interface RecommendationsResponse {
  seed?: string;
  items: TitleItem[];
  next_cursor?: string;
}

export interface CollectionResponse {
  slug: string;
  items: TitleItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────────────────────────────────────

export const recommendationsService = {
  /**
   * Get homepage rails (multiple content sections)
   */
  async getHomeRails(profileId?: string): Promise<HomeRailsResponse> {
    const params = profileId ? `?profile_id=${profileId}` : '';
    return fetchJson<HomeRailsResponse>(`${API_BASE}/api/v1/home/rails${params}`);
  },

  /**
   * Get trending titles
   */
  async getTrending(options?: {
    window?: '6h' | '24h' | '72h' | '168h';
    region?: string;
  }): Promise<TrendingResponse> {
    const params = new URLSearchParams();
    if (options?.window) params.append('window', options.window);
    if (options?.region) params.append('region', options.region);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<TrendingResponse>(`${API_BASE}/api/v1/trending${query}`);
  },

  /**
   * Get top 10 titles by region
   */
  async getTop10(region = 'US'): Promise<Top10Response> {
    return fetchJson<Top10Response>(`${API_BASE}/api/v1/top10?region=${region}`);
  },

  /**
   * Get personalized recommendations
   */
  async getRecommendations(options?: {
    seed?: string;
    profile_id?: string;
    page_size?: number;
    cursor?: string;
  }): Promise<RecommendationsResponse> {
    const params = new URLSearchParams();
    if (options?.seed) params.append('seed', options.seed);
    if (options?.profile_id) params.append('profile_id', options.profile_id);
    if (options?.page_size) params.append('page_size', options.page_size.toString());
    if (options?.cursor) params.append('cursor', options.cursor);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<RecommendationsResponse>(`${API_BASE}/api/v1/recommendations${query}`);
  },

  /**
   * Get editorial collection
   */
  async getCollection(slug: string): Promise<CollectionResponse> {
    return fetchJson<CollectionResponse>(`${API_BASE}/api/v1/collections/${slug}`);
  },
};
