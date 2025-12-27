/**
 * =============================================================================
 * Bundle Service
 * =============================================================================
 * API service for download bundle management
 */

import { apiClient } from '../client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Bundle {
  id: string;
  title_id: string;
  title_name?: string;
  season_id?: string | null;
  season_number?: number;
  bundle_type: 'single_episode' | 'season' | 'complete_series' | 'movie';
  format: 'mp4' | 'mkv' | 'avi';
  quality: '480p' | '720p' | '1080p' | '4k';
  file_size_bytes: number;
  download_url: string;
  is_premium_only: boolean;
  includes_subtitles: boolean;
  includes_audio_tracks: string[]; // ["en", "ja", "es"]
  episode_range?: {
    start: number;
    end: number;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBundleRequest {
  title_id: string;
  season_id?: string | null;
  bundle_type: 'single_episode' | 'season' | 'complete_series' | 'movie';
  format: 'mp4' | 'mkv' | 'avi';
  quality: '480p' | '720p' | '1080p' | '4k';
  download_url: string;
  file_size_bytes: number;
  is_premium_only: boolean;
  includes_subtitles: boolean;
  includes_audio_tracks: string[];
  episode_ids?: string[];
}

export interface UpdateBundleRequest {
  download_url?: string;
  file_size_bytes?: number;
  is_premium_only?: boolean;
  includes_subtitles?: boolean;
  includes_audio_tracks?: string[];
}

export interface BundleListResponse {
  bundles: Bundle[];
  total_count: number;
}

export interface BundleGenerationRequest {
  title_id: string;
  season_id?: string;
  episode_ids?: string[];
  format: 'mp4' | 'mkv' | 'avi';
  quality: '480p' | '720p' | '1080p' | '4k';
  include_subtitles: boolean;
  audio_tracks: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundle Service
// ─────────────────────────────────────────────────────────────────────────────

export const bundleService = {
  /**
   * List all bundles (admin)
   */
  async listBundles(options?: {
    title_id?: string;
    quality?: string;
    format?: string;
    is_premium_only?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<BundleListResponse> {
    const params = new URLSearchParams();
    if (options?.title_id) params.append('title_id', options.title_id);
    if (options?.quality) params.append('quality', options.quality);
    if (options?.format) params.append('format', options.format);
    if (options?.is_premium_only !== undefined) {
      params.append('is_premium_only', String(options.is_premium_only));
    }
    if (options?.page) params.append('page', String(options.page));
    if (options?.per_page) params.append('per_page', String(options.per_page));

    const response = await apiClient.get(`/admin/bundles?${params.toString()}`);
    return response.data;
  },

  /**
   * Get bundle by ID
   */
  async getBundleById(bundleId: string): Promise<Bundle> {
    const response = await apiClient.get(`/admin/bundles/${bundleId}`);
    return response.data;
  },

  /**
   * Create new bundle (admin)
   */
  async createBundle(data: CreateBundleRequest): Promise<Bundle> {
    const response = await apiClient.post('/admin/bundles', data);
    return response.data;
  },

  /**
   * Update bundle (admin)
   */
  async updateBundle(bundleId: string, data: UpdateBundleRequest): Promise<Bundle> {
    const response = await apiClient.patch(`/admin/bundles/${bundleId}`, data);
    return response.data;
  },

  /**
   * Delete bundle (admin)
   */
  async deleteBundle(bundleId: string): Promise<void> {
    await apiClient.delete(`/admin/bundles/${bundleId}`);
  },

  /**
   * Get available bundles for a title (public)
   */
  async getTitleBundles(titleId: string): Promise<Bundle[]> {
    const response = await apiClient.get(`/public/titles/${titleId}/bundles`);
    return response.data.bundles || [];
  },

  /**
   * Get available bundles for a season (public)
   */
  async getSeasonBundles(titleId: string, seasonId: string): Promise<Bundle[]> {
    const response = await apiClient.get(
      `/public/titles/${titleId}/seasons/${seasonId}/bundles`
    );
    return response.data.bundles || [];
  },

  /**
   * Generate download link for bundle
   */
  async generateDownloadLink(bundleId: string): Promise<{ download_url: string }> {
    const response = await apiClient.post(`/bundles/${bundleId}/download`);
    return response.data;
  },

  /**
   * Generate custom bundle (admin)
   */
  async generateBundle(data: BundleGenerationRequest): Promise<Bundle> {
    const response = await apiClient.post('/admin/bundles/generate', data);
    return response.data;
  },

  /**
   * Bulk create bundles for title (admin)
   */
  async bulkCreateBundles(titleId: string, configs: CreateBundleRequest[]): Promise<Bundle[]> {
    const response = await apiClient.post(`/admin/bundles/bulk`, {
      title_id: titleId,
      bundles: configs,
    });
    return response.data.bundles || [];
  },

  /**
   * Track bundle download (analytics)
   */
  async trackDownload(bundleId: string, metadata?: {
    user_agent?: string;
    referrer?: string;
  }): Promise<void> {
    await apiClient.post(`/bundles/${bundleId}/track`, metadata);
  },

  /**
   * Get bundle download statistics (admin)
   */
  async getBundleStats(bundleId: string): Promise<{
    total_downloads: number;
    downloads_last_7_days: number;
    downloads_last_30_days: number;
    unique_users: number;
    bandwidth_used_bytes: number;
  }> {
    const response = await apiClient.get(`/admin/bundles/${bundleId}/stats`);
    return response.data;
  },

  /**
   * Get episodes for a bundle (for series bundles)
   */
  async getBundleEpisodes(bundleId: string): Promise<{
    id: string;
    episode_number: number;
    season_number: number;
    title: string;
    duration_minutes?: number;
    file_size_bytes?: number;
  }[]> {
    const response = await apiClient.get(`/bundles/${bundleId}/episodes`);
    return response.data.episodes || [];
  },

  /**
   * Get episodes for a title's season (for download selection)
   */
  async getSeasonEpisodes(titleId: string, seasonId: string): Promise<{
    id: string;
    episode_number: number;
    season_number: number;
    title: string;
    duration_minutes?: number;
    file_size_bytes?: number;
  }[]> {
    const response = await apiClient.get(`/public/titles/${titleId}/seasons/${seasonId}/episodes`);
    return response.data.episodes || [];
  },
};
