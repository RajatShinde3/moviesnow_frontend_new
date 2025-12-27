/**
 * =============================================================================
 * Downloads API Service
 * =============================================================================
 * Complete API client for download management with quota tracking
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export type DownloadStatus =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired';

export type DownloadQuality = '480p' | '720p' | '1080p';

export type DownloadFormat = 'mp4' | 'mkv';

export interface Download {
  id: string;
  user_id: string;
  title_id: string;
  episode_id?: string;
  content_name: string;
  quality: DownloadQuality;
  format: DownloadFormat;
  status: DownloadStatus;
  file_size_bytes?: number;
  download_url?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface DownloadRequest {
  title_id: string;
  episode_id?: string;
  quality: DownloadQuality;
  format: DownloadFormat;
}

export interface DownloadQuota {
  user_id: string;
  daily_download_limit: number;
  daily_downloads_used: number;
  monthly_bandwidth_limit_gb: number;
  monthly_bandwidth_used_gb: number;
  concurrent_download_limit: number;
  current_concurrent_downloads: number;
  last_daily_reset: string;
  last_monthly_reset: string;
}

export interface DownloadStats {
  total_downloads: number;
  completed_downloads: number;
  success_rate: number;
  total_bytes_downloaded: number;
  total_gb_downloaded: number;
  downloads_by_quality: Record<DownloadQuality, number>;
  recent_downloads_30d: number;
}

export interface DownloadUrlResponse {
  download_id: string;
  url: string;
  expires_at: string;
  file_size_bytes?: number;
  content_name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────────────────────────────────────

export const downloadsService = {
  /**
   * Request a new download
   */
  async requestDownload(data: DownloadRequest): Promise<Download> {
    return fetchJson<Download>(`${API_BASE}/api/v1/user/downloads`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * List user's downloads with filtering
   */
  async listDownloads(options?: {
    status?: DownloadStatus;
    quality?: DownloadQuality;
    page?: number;
    per_page?: number;
  }): Promise<Download[]> {
    const params = new URLSearchParams();

    if (options?.status) params.append('status', options.status);
    if (options?.quality) params.append('quality', options.quality);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());

    const query = params.toString() ? `?${params.toString()}` : '';

    return fetchJson<Download[]>(`${API_BASE}/api/v1/user/downloads${query}`);
  },

  /**
   * Get a specific download by ID
   */
  async getDownload(downloadId: string): Promise<Download> {
    return fetchJson<Download>(`${API_BASE}/api/v1/user/downloads/${downloadId}`);
  },

  /**
   * Get secure download URL for a ready download
   */
  async getDownloadUrl(downloadId: string): Promise<DownloadUrlResponse> {
    return fetchJson<DownloadUrlResponse>(
      `${API_BASE}/api/v1/user/downloads/${downloadId}/url`
    );
  },

  /**
   * Cancel a pending or in-progress download
   */
  async cancelDownload(downloadId: string): Promise<void> {
    return fetchJson<void>(`${API_BASE}/api/v1/user/downloads/${downloadId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get current user's download quota
   */
  async getQuota(): Promise<DownloadQuota> {
    return fetchJson<DownloadQuota>(`${API_BASE}/api/v1/user/downloads/quota/me`);
  },

  /**
   * Get download statistics
   */
  async getStats(): Promise<DownloadStats> {
    return fetchJson<DownloadStats>(`${API_BASE}/api/v1/user/downloads/stats/me`);
  },

  /**
   * Cleanup expired downloads
   */
  async cleanupExpired(): Promise<void> {
    return fetchJson<void>(`${API_BASE}/api/v1/user/downloads/cleanup/expired`, {
      method: 'POST',
    });
  },
};
