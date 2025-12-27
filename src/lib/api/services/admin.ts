/**
 * =============================================================================
 * Admin API Service
 * =============================================================================
 * Admin content management, user management, and analytics
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface TitleUpload {
  name: string;
  original_name?: string;
  type: 'movie' | 'series' | 'anime' | 'documentary';
  description?: string;
  release_year?: number;
  duration_minutes?: number;
  genres?: string[];
  cast?: string[];
  crew?: { role: string; name: string }[];
  rating?: string;
  studio?: string;
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
}

export interface EpisodeUpload {
  season_number: number;
  episode_number: number;
  title: string;
  description?: string;
  duration_minutes: number;
  air_date?: string;
  thumbnail_url?: string;
}

export interface MediaAssetUpload {
  quality: '480p' | '720p' | '1080p';
  file_url: string;
  file_size_bytes?: number;
  bitrate?: number;
  codec?: string;
}

export interface AdminStats {
  total_titles: number;
  total_episodes: number;
  total_users: number;
  active_subscribers: number;
  total_revenue_cents: number;
  storage_used_gb: number;
  bandwidth_used_gb: number;
  new_users_today: number;
  active_sessions: number;
}

export interface UserManagement {
  id: string;
  email: string;
  full_name?: string;
  is_verified: boolean;
  is_active: boolean;
  subscription_status?: string;
  created_at: string;
  last_login?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────────────────────────────────────

export const adminService = {
  /**
   * Get admin dashboard statistics
   */
  async getStats(): Promise<AdminStats> {
    return fetchJson<AdminStats>(`${API_BASE}/api/v1/admin/stats`);
  },

  /**
   * Create new title
   */
  async createTitle(data: TitleUpload): Promise<any> {
    return fetchJson(`${API_BASE}/api/v1/admin/titles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update title
   */
  async updateTitle(titleId: string, data: Partial<TitleUpload>): Promise<any> {
    return fetchJson(`${API_BASE}/api/v1/admin/titles/${titleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete title
   */
  async deleteTitle(titleId: string): Promise<void> {
    return fetchJson(`${API_BASE}/api/v1/admin/titles/${titleId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Create episode
   */
  async createEpisode(titleId: string, data: EpisodeUpload): Promise<any> {
    return fetchJson(`${API_BASE}/api/v1/admin/titles/${titleId}/episodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload media asset
   */
  async uploadMediaAsset(titleId: string, episodeId: string | null, data: MediaAssetUpload): Promise<any> {
    const endpoint = episodeId
      ? `${API_BASE}/api/v1/admin/titles/${titleId}/episodes/${episodeId}/media`
      : `${API_BASE}/api/v1/admin/titles/${titleId}/media`;

    return fetchJson(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload file (multipart)
   */
  async uploadFile(file: File, type: 'poster' | 'backdrop' | 'video' | 'subtitle'): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE}/api/v1/admin/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * List all users (paginated)
   */
  async listUsers(options?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<{
    users: UserManagement[];
    total_count: number;
    page: number;
    per_page: number;
  }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());
    if (options?.search) params.append('search', options.search);
    if (options?.status) params.append('status', options.status);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson(`${API_BASE}/api/v1/admin/users${query}`);
  },

  /**
   * Ban/unban user
   */
  async toggleUserStatus(userId: string, active: boolean): Promise<void> {
    return fetchJson(`${API_BASE}/api/v1/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ is_active: active }),
    });
  },

  /**
   * Grant/revoke admin access
   */
  async toggleAdminAccess(userId: string, isAdmin: boolean): Promise<void> {
    return fetchJson(`${API_BASE}/api/v1/admin/users/${userId}/admin`, {
      method: 'POST',
      body: JSON.stringify({ is_admin: isAdmin }),
    });
  },

  /**
   * Get content analytics
   */
  async getContentAnalytics(titleId: string): Promise<{
    total_views: number;
    unique_viewers: number;
    average_watch_time_minutes: number;
    completion_rate: number;
    ratings_average: number;
    ratings_count: number;
  }> {
    return fetchJson(`${API_BASE}/api/v1/admin/analytics/content/${titleId}`);
  },

  /**
   * Get user analytics
   */
  async getUserAnalytics(days = 30): Promise<{
    new_users: number;
    active_users: number;
    churn_rate: number;
    average_watch_time: number;
  }> {
    return fetchJson(`${API_BASE}/api/v1/admin/analytics/users?days=${days}`);
  },

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(days = 30): Promise<{
    total_revenue_cents: number;
    new_subscriptions: number;
    cancellations: number;
    mrr_cents: number;
  }> {
    return fetchJson(`${API_BASE}/api/v1/admin/analytics/revenue?days=${days}`);
  },

  /**
   * Bulk import titles
   */
  async bulkImport(titles: TitleUpload[]): Promise<{ success: number; failed: number }> {
    return fetchJson(`${API_BASE}/api/v1/admin/titles/bulk-import`, {
      method: 'POST',
      body: JSON.stringify({ titles }),
    });
  },
};
