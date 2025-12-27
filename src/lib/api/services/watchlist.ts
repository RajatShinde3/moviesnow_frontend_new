/**
 * =============================================================================
 * Watchlist API Service
 * =============================================================================
 * Enhanced watchlist management with bulk operations and export/import
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface WatchlistItem {
  user_id: string;
  title_id: string;
  title_name?: string;
  title_type?: string;
  sort_index: number;
  is_favorite: boolean;
  archived: boolean;
  progress_pct: number;
  last_watched_at?: string;
  notify_new_content: boolean;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface WatchlistResponse {
  profile_id: string;
  total_count: number;
  page: number;
  per_page: number;
  sort_by: string;
  sort_order: string;
  filters: {
    archived?: boolean;
    favorites_only: boolean;
  };
  watchlist: WatchlistItem[];
}

export interface AddToWatchlistRequest {
  title_id: string;
  is_favorite?: boolean;
  note?: string;
  notify_new_content?: boolean;
  sort_index?: number;
}

export interface UpdateWatchlistItemRequest {
  is_favorite?: boolean;
  note?: string;
  notify_new_content?: boolean;
  sort_index?: number;
  progress_pct?: number;
  archived?: boolean;
}

export interface ReorderItem {
  title_id: string;
  sort_index: number;
}

export interface BulkUploadResponse {
  profile_id: string;
  merge_strategy: string;
  total_items: number;
  added_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  errors: string[];
  message: string;
}

export interface ExportData {
  profile_id: string;
  exported_at: string;
  export_params: {
    include_archived: boolean;
  };
  total_items: number;
  watchlist: WatchlistItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────────────────────────────────────

export const watchlistService = {
  /**
   * Get user's watchlist with filtering and sorting
   */
  async getWatchlist(
    profileId: string,
    options?: {
      page?: number;
      per_page?: number;
      archived?: boolean;
      favorites_only?: boolean;
      sort_by?: 'created_at' | 'updated_at' | 'sort_index' | 'title_name';
      sort_order?: 'asc' | 'desc';
    }
  ): Promise<WatchlistResponse> {
    const params = new URLSearchParams();

    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());
    if (options?.archived !== undefined) params.append('archived', options.archived.toString());
    if (options?.favorites_only) params.append('favorites_only', 'true');
    if (options?.sort_by) params.append('sort_by', options.sort_by);
    if (options?.sort_order) params.append('sort_order', options.sort_order);

    const query = params.toString() ? `?${params.toString()}` : '';

    return fetchJson<WatchlistResponse>(
      `${API_BASE}/api/v1/user/profiles/${profileId}/watchlist${query}`
    );
  },

  /**
   * Add title to watchlist
   */
  async addToWatchlist(profileId: string, data: AddToWatchlistRequest): Promise<any> {
    return fetchJson(`${API_BASE}/api/v1/user/profiles/${profileId}/watchlist`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove title from watchlist
   */
  async removeFromWatchlist(
    profileId: string,
    titleId: string,
    archiveOnly = false
  ): Promise<void> {
    const params = archiveOnly ? '?archive_only=true' : '';
    return fetchJson(
      `${API_BASE}/api/v1/user/profiles/${profileId}/watchlist/${titleId}${params}`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Update watchlist item
   */
  async updateWatchlistItem(
    profileId: string,
    titleId: string,
    data: UpdateWatchlistItemRequest
  ): Promise<any> {
    return fetchJson(`${API_BASE}/api/v1/user/profiles/${profileId}/watchlist/${titleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Reorder watchlist items
   */
  async reorderWatchlist(profileId: string, reorderData: ReorderItem[]): Promise<any> {
    return fetchJson(`${API_BASE}/api/v1/user/profiles/${profileId}/watchlist/reorder`, {
      method: 'POST',
      body: JSON.stringify({ reorder_data: reorderData }),
    });
  },

  /**
   * Bulk upload watchlist from JSON file
   */
  async bulkUpload(
    profileId: string,
    file: File,
    mergeStrategy: 'upsert' | 'skip_existing' | 'replace_all' = 'upsert'
  ): Promise<BulkUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_BASE}/api/v1/user/profiles/${profileId}/watchlist/bulk-upload?merge_strategy=${mergeStrategy}`,
      {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Failed to upload watchlist');
    }

    return response.json();
  },

  /**
   * Export watchlist as JSON
   */
  async exportWatchlist(
    profileId: string,
    includeArchived = false
  ): Promise<ExportData> {
    const params = includeArchived ? '?include_archived=true' : '';
    return fetchJson<ExportData>(
      `${API_BASE}/api/v1/user/profiles/${profileId}/watchlist/export${params}`
    );
  },
};
