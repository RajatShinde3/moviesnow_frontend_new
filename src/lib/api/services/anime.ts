/**
 * =============================================================================
 * Anime API Service
 * =============================================================================
 * Complete API client for anime-specific features
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export type MarkerType = 'op' | 'ed' | 'recap' | 'preview';
export type RelationType = 'prequel' | 'sequel' | 'side_story' | 'alt_version' | 'remake';
export type VariantKind = 'TV' | 'BD' | 'Uncensored' | 'Dub' | 'Sub';

export interface Marker {
  episode_id: string;
  type: MarkerType;
  start_sec: number;
  end_sec: number;
  source: 'editor' | 'ml' | 'import';
  confidence?: number;
  updated_at?: string;
}

export interface Arc {
  id: string;
  name: string;
  order: number;
  absolute_from?: number;
  absolute_to?: number;
  episodes?: string[];
}

export interface Relation {
  type: RelationType;
  title_id: string;
  title_name?: string;
}

export interface Variant {
  id?: string;
  label?: string;
  kind: VariantKind;
  languages: string[];
  region?: string;
}

export interface ScheduleItem {
  title_id: string;
  episode_number: number;
  air_time: string;
  region?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────────────────────────────────────

export const animeService = {
  /**
   * Get episode markers (OP/ED, recap, preview)
   */
  async getMarkers(titleId: string): Promise<Marker[]> {
    return (await fetchJson<Marker[]>(`${API_BASE}/api/v1/anime/titles/${titleId}/markers`))!;
  },

  /**
   * Get arcs and cours with absolute ordering
   */
  async getArcs(titleId: string): Promise<Arc[]> {
    return (await fetchJson<Arc[]>(`${API_BASE}/api/v1/anime/titles/${titleId}/arcs`))!;
  },

  /**
   * Get title relations (prequel, sequel, side story, alt version)
   */
  async getRelations(titleId: string): Promise<Relation[]> {
    return (await fetchJson<Relation[]>(`${API_BASE}/api/v1/anime/titles/${titleId}/relations`))!;
  },

  /**
   * Get release variants (TV, BD/Uncensored, Dub/Sub)
   */
  async getVariants(titleId: string): Promise<Variant[]> {
    return (await fetchJson<Variant[]>(`${API_BASE}/api/v1/anime/titles/${titleId}/variants`))!;
  },

  /**
   * Get airing schedule
   */
  async getSchedule(options?: {
    from_ts?: string;
    to_ts?: string;
    region?: string;
  }): Promise<ScheduleItem[]> {
    const params = new URLSearchParams();

    if (options?.from_ts) params.append('from_ts', options.from_ts);
    if (options?.to_ts) params.append('to_ts', options.to_ts);
    if (options?.region) params.append('region', options.region);

    const query = params.toString() ? `?${params.toString()}` : '';

    return (await fetchJson<ScheduleItem[]>(`${API_BASE}/api/v1/anime/schedule${query}`))!;
  },
};
