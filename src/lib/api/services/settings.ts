/**
 * =============================================================================
 * Settings API Service
 * =============================================================================
 * User settings, preferences, and account management
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface UserSettings {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  new_release_notifications: boolean;
  watchlist_notifications: boolean;
  language: string;
  timezone: string;
  auto_play_next_episode: boolean;
  auto_play_previews: boolean;
  data_usage: 'low' | 'medium' | 'high' | 'auto';
  subtitle_appearance: {
    font_size: 'small' | 'medium' | 'large';
    font_family: string;
    text_color: string;
    background_color: string;
    background_opacity: number;
  };
}

export interface PrivacySettings {
  user_id: string;
  show_watch_history: boolean;
  share_watching_activity: boolean;
  personalized_recommendations: boolean;
  allow_analytics: boolean;
  adult_content: boolean;
}

export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  device_type: 'web' | 'mobile' | 'tablet' | 'tv' | 'desktop';
  browser?: string;
  os?: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
  trusted: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  ip_address: string;
  device_info: string;
  timestamp: string;
  details?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────────────────────────────────────

export const settingsService = {
  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    return (await fetchJson<UserSettings>(`${API_BASE}/api/v1/user/settings`))!;
  },

  /**
   * Update user settings
   */
  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    return (await fetchJson<UserSettings>(`${API_BASE}/api/v1/user/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }))!;
  },

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<PrivacySettings> {
    return (await fetchJson<PrivacySettings>(`${API_BASE}/api/v1/user/privacy`))!;
  },

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(data: Partial<PrivacySettings>): Promise<PrivacySettings> {
    return (await fetchJson<PrivacySettings>(`${API_BASE}/api/v1/user/privacy`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }))!;
  },

  /**
   * Get all devices
   */
  async getDevices(): Promise<{ devices: Device[] }> {
    return fetchJson<any>(`${API_BASE}/api/v1/user/devices`);
  },

  /**
   * Remove device
   */
  async removeDevice(deviceId: string): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/user/devices/${deviceId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Trust device
   */
  async trustDevice(deviceId: string): Promise<Device> {
    return fetchJson<any>(`${API_BASE}/api/v1/user/devices/${deviceId}/trust`, {
      method: 'POST',
    });
  },

  /**
   * Sign out all devices
   */
  async signOutAllDevices(): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/user/devices/signout-all`, {
      method: 'POST',
    });
  },

  /**
   * Get activity log
   */
  async getActivityLog(options?: {
    page?: number;
    per_page?: number;
  }): Promise<{
    logs: ActivityLog[];
    total_count: number;
    page: number;
    per_page: number;
  }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<any>(`${API_BASE}/api/v1/user/activity${query}`);
  },

  /**
   * Change password
   */
  async changePassword(data: {
    current_password: string;
    new_password: string;
  }): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/user/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change email
   */
  async changeEmail(data: {
    new_email: string;
    password: string;
  }): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/user/change-email`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/user/delete-account`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  /**
   * Export user data
   */
  async exportData(): Promise<Blob> {
    const response = await fetch(`${API_BASE}/api/v1/user/export-data`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    return response.blob();
  },
};
