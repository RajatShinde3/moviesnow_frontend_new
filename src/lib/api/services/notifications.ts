/**
 * =============================================================================
 * Notifications API Service
 * =============================================================================
 * Complete API client for notification management
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'new_release'
  | 'watchlist_update'
  | 'recommendation'
  | 'subscription_update'
  | 'payment_reminder'
  | 'account_security'
  | 'promotional'
  | 'system_announcement'
  | 'download_complete'
  | 'content_available';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationAction {
  label: string;
  url: string;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  summary?: string;
  image_url?: string;
  thumbnail_url?: string;
  icon?: string;
  action_url?: string;
  action_label?: string;
  actions?: NotificationAction[];
  is_read: boolean;
  is_pinned: boolean;
  created_at: string;
  read_at?: string;
  metadata?: Record<string, any>;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
  total: number;
  has_more: boolean;
}

export interface NotificationStatsResponse {
  total_count: number;
  unread_count: number;
  by_type: Record<string, number>;
  recent_activity: Array<{
    date: string;
    count: number;
  }>;
}

export interface NotificationChannelPreferences {
  email: boolean;
  push: boolean;
  in_app: boolean;
  sms: boolean;
}

export interface NotificationTypePreferences {
  new_release: boolean;
  watchlist_update: boolean;
  recommendation: boolean;
  subscription_update: boolean;
  payment_reminder: boolean;
  account_security: boolean;
  promotional: boolean;
  system_announcement: boolean;
}

export interface NotificationFrequencyPreferences {
  new_release_frequency: 'instant' | 'daily' | 'weekly' | 'never';
  recommendation_frequency: 'instant' | 'daily' | 'weekly' | 'never';
  digest_time: string; // HH:MM format
  timezone: string;
}

export interface NotificationPreferences {
  channels: NotificationChannelPreferences;
  types: NotificationTypePreferences;
  frequency: NotificationFrequencyPreferences;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  mute_all_until?: string;
}

export interface NotificationPreferencesResponse {
  user_id: string;
  preferences: NotificationPreferences;
  last_updated: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────────────────────────────────────

export const notificationsService = {
  /**
   * List notifications with filtering and pagination
   */
  async listNotifications(options?: {
    unread_only?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
    limit?: number;
    offset?: number;
  }): Promise<NotificationListResponse> {
    const params = new URLSearchParams();

    if (options?.unread_only) params.append('unread_only', 'true');
    if (options?.type) params.append('type', options.type);
    if (options?.priority) params.append('priority', options.priority);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const query = params.toString() ? `?${params.toString()}` : '';

    return (await fetchJson<NotificationListResponse>(
      `${API_BASE}/api/v1/notifications${query}`
    ))!;
  },

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStatsResponse> {
    return (await fetchJson<NotificationStatsResponse>(
      `${API_BASE}/api/v1/notifications/stats`
    ))!;
  },

  /**
   * Get a single notification by ID
   */
  async getNotification(notificationId: string): Promise<Notification> {
    return (await fetchJson<Notification>(
      `${API_BASE}/api/v1/notifications/${notificationId}`
    ))!;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<{ message: string }> {
    return (await fetchJson<{ message: string }>(
      `${API_BASE}/api/v1/notifications/${notificationId}/read`,
      {
        method: 'POST',
      }
    ))!;
  },

  /**
   * Mark all notifications as read (or specific IDs)
   */
  async markAllAsRead(notificationIds?: string[]): Promise<{ message: string }> {
    return (await fetchJson<{ message: string }>(
      `${API_BASE}/api/v1/notifications/read-all`,
      {
        method: 'POST',
        body: JSON.stringify({
          notification_ids: notificationIds || null,
        }),
      }
    ))!;
  },

  /**
   * Mark a notification as unread
   */
  async markAsUnread(notificationId: string): Promise<{ message: string }> {
    return (await fetchJson<{ message: string }>(
      `${API_BASE}/api/v1/notifications/${notificationId}/unread`,
      {
        method: 'POST',
      }
    ))!;
  },

  /**
   * Track notification click (analytics)
   */
  async trackClick(notificationId: string): Promise<{ message: string }> {
    return (await fetchJson<{ message: string }>(
      `${API_BASE}/api/v1/notifications/${notificationId}/click`,
      {
        method: 'POST',
      }
    ))!;
  },

  /**
   * Pin a notification to the top
   */
  async pinNotification(notificationId: string): Promise<{ message: string }> {
    return (await fetchJson<{ message: string }>(
      `${API_BASE}/api/v1/notifications/${notificationId}/pin`,
      {
        method: 'POST',
      }
    ))!;
  },

  /**
   * Unpin a notification
   */
  async unpinNotification(notificationId: string): Promise<{ message: string }> {
    return (await fetchJson<{ message: string }>(
      `${API_BASE}/api/v1/notifications/${notificationId}/unpin`,
      {
        method: 'POST',
      }
    ))!;
  },

  /**
   * Delete a notification permanently
   */
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    return (await fetchJson<{ message: string }>(
      `${API_BASE}/api/v1/notifications/${notificationId}`,
      {
        method: 'DELETE',
      }
    ))!;
  },

  /**
   * Clear all notifications (mark as read and archived)
   */
  async clearAll(): Promise<{ message: string }> {
    return (await fetchJson<{ message: string }>(
      `${API_BASE}/api/v1/notifications/clear-all`,
      {
        method: 'DELETE',
      }
    ))!;
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Notification Preferences
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Get user notification preferences
   */
  async getPreferences(): Promise<NotificationPreferencesResponse> {
    return (await fetchJson<NotificationPreferencesResponse>(
      `${API_BASE}/api/v1/notifications/preferences`
    ))!;
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferencesResponse> {
    return (await fetchJson<NotificationPreferencesResponse>(
      `${API_BASE}/api/v1/notifications/preferences`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    ))!;
  },

  /**
   * Quick toggle for a specific notification type
   */
  async quickToggle(
    notificationType: string,
    channel: string,
    enabled: boolean
  ): Promise<{ success: boolean; message: string }> {
    return (await fetchJson<{ success: boolean; message: string }>(
      `${API_BASE}/api/v1/notifications/preferences/quick-toggle`,
      {
        method: 'POST',
        body: JSON.stringify({
          notification_type: notificationType,
          channel,
          enabled,
        }),
      }
    ))!;
  },

  /**
   * Reset preferences to defaults
   */
  async resetPreferences(): Promise<NotificationPreferencesResponse> {
    return (await fetchJson<NotificationPreferencesResponse>(
      `${API_BASE}/api/v1/notifications/preferences/reset`,
      {
        method: 'POST',
      }
    ))!;
  },

  /**
   * Mute all notifications temporarily
   */
  async muteTemporarily(hours: number): Promise<{
    success: boolean;
    muted_until: string;
    hours: number;
    message: string;
  }> {
    return fetchJson<any>(
      `${API_BASE}/api/v1/notifications/preferences/mute-temporarily?hours=${hours}`,
      {
        method: 'POST',
      }
    );
  },

  /**
   * Unmute notifications
   */
  async unmute(): Promise<{ success: boolean; message: string }> {
    return (await fetchJson<{ success: boolean; message: string }>(
      `${API_BASE}/api/v1/notifications/preferences/unmute`,
      {
        method: 'POST',
      }
    ))!;
  },
};
