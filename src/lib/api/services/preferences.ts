/**
 * =============================================================================
 * User Preferences Service
 * =============================================================================
 * API service for managing user preferences and settings
 */

import { apiClient } from '../client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  // Playback Preferences
  default_quality: '480p' | '720p' | '1080p' | '4k' | 'auto';
  auto_play_next_episode: boolean;
  skip_intro: boolean;
  skip_recap: boolean;
  skip_credits: boolean;
  playback_speed: number; // 0.5, 0.75, 1, 1.25, 1.5, 2
  subtitle_language: string | null;
  audio_language: string | null;

  // Display Preferences
  theme: 'dark' | 'light' | 'auto';
  language: string;
  timezone: string;
  date_format: string;

  // Content Preferences
  mature_content: boolean;
  content_filters: string[]; // genres to filter out
  preferred_genres: string[];

  // Notification Preferences
  email_notifications: boolean;
  push_notifications: boolean;
  new_episode_alerts: boolean;
  recommendation_alerts: boolean;
  newsletter_subscription: boolean;

  // Privacy Preferences
  watch_history_enabled: boolean;
  share_watch_activity: boolean;
  personalized_recommendations: boolean;

  // Download Preferences
  default_download_quality: '480p' | '720p' | '1080p';
  default_download_format: 'mp4' | 'mkv' | 'avi';
  wifi_only_downloads: boolean;
  auto_delete_watched: boolean;

  // Accessibility
  high_contrast: boolean;
  reduce_motion: boolean;
  closed_captions_default: boolean;
  audio_descriptions: boolean;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    new_episodes: boolean;
    recommendations: boolean;
    subscription_updates: boolean;
    newsletter: boolean;
  };
  push: {
    enabled: boolean;
    new_episodes: boolean;
    recommendations: boolean;
    download_complete: boolean;
  };
  in_app: {
    enabled: boolean;
    new_episodes: boolean;
    recommendations: boolean;
    system_updates: boolean;
  };
}

export interface PrivacySettings {
  watch_history_visible: boolean;
  activity_sharing: boolean;
  personalized_ads: boolean;
  data_collection: boolean;
  third_party_sharing: boolean;
}

export interface ContentFilter {
  id: string;
  type: 'genre' | 'rating' | 'language' | 'keyword';
  value: string;
  enabled: boolean;
}

export interface WatchReminder {
  id: string;
  title_id: string;
  title_name: string;
  remind_at: string;
  notification_channels: ('email' | 'push' | 'in_app')[];
  is_active: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Preferences Service
// ─────────────────────────────────────────────────────────────────────────────

export const preferencesService = {
  /**
   * Get all user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get('/user/preferences');
    return response.data;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiClient.patch('/user/preferences', preferences);
    return response.data;
  },

  /**
   * Reset preferences to default
   */
  async resetPreferences(): Promise<UserPreferences> {
    const response = await apiClient.post('/user/preferences/reset');
    return response.data;
  },

  /**
   * Get playback preferences
   */
  async getPlaybackPreferences(): Promise<Pick<UserPreferences,
    'default_quality' | 'auto_play_next_episode' | 'skip_intro' | 'skip_recap' |
    'skip_credits' | 'playback_speed' | 'subtitle_language' | 'audio_language'
  >> {
    const response = await apiClient.get('/user/preferences/playback');
    return response.data;
  },

  /**
   * Update playback preferences
   */
  async updatePlaybackPreferences(preferences: {
    default_quality?: string;
    auto_play_next_episode?: boolean;
    skip_intro?: boolean;
    skip_recap?: boolean;
    skip_credits?: boolean;
    playback_speed?: number;
    subtitle_language?: string;
    audio_language?: string;
  }): Promise<void> {
    await apiClient.patch('/user/preferences/playback', preferences);
  },

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiClient.get('/user/preferences/notifications');
    return response.data;
  },

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await apiClient.patch('/user/preferences/notifications', settings);
    return response.data;
  },

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<PrivacySettings> {
    const response = await apiClient.get('/user/preferences/privacy');
    return response.data;
  },

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const response = await apiClient.patch('/user/preferences/privacy', settings);
    return response.data;
  },

  /**
   * Get content filters
   */
  async getContentFilters(): Promise<ContentFilter[]> {
    const response = await apiClient.get('/user/preferences/content-filters');
    return response.data.filters || [];
  },

  /**
   * Add content filter
   */
  async addContentFilter(filter: {
    type: 'genre' | 'rating' | 'language' | 'keyword';
    value: string;
  }): Promise<ContentFilter> {
    const response = await apiClient.post('/user/preferences/content-filters', filter);
    return response.data;
  },

  /**
   * Remove content filter
   */
  async removeContentFilter(filterId: string): Promise<void> {
    await apiClient.delete(`/user/preferences/content-filters/${filterId}`);
  },

  /**
   * Toggle content filter
   */
  async toggleContentFilter(filterId: string, enabled: boolean): Promise<ContentFilter> {
    const response = await apiClient.patch(`/user/preferences/content-filters/${filterId}`, {
      enabled,
    });
    return response.data;
  },

  /**
   * Get preferred genres
   */
  async getPreferredGenres(): Promise<string[]> {
    const response = await apiClient.get('/user/preferences/genres');
    return response.data.genres || [];
  },

  /**
   * Update preferred genres
   */
  async updatePreferredGenres(genres: string[]): Promise<void> {
    await apiClient.put('/user/preferences/genres', { genres });
  },

  /**
   * Get watch reminders
   */
  async getWatchReminders(): Promise<WatchReminder[]> {
    const response = await apiClient.get('/user/preferences/reminders');
    return response.data.reminders || [];
  },

  /**
   * Create watch reminder
   */
  async createWatchReminder(reminder: {
    title_id: string;
    remind_at: string;
    notification_channels: ('email' | 'push' | 'in_app')[];
  }): Promise<WatchReminder> {
    const response = await apiClient.post('/user/preferences/reminders', reminder);
    return response.data;
  },

  /**
   * Delete watch reminder
   */
  async deleteWatchReminder(reminderId: string): Promise<void> {
    await apiClient.delete(`/user/preferences/reminders/${reminderId}`);
  },

  /**
   * Export user preferences
   */
  async exportPreferences(): Promise<Blob> {
    const response = await apiClient.get('/user/preferences/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Import user preferences
   */
  async importPreferences(file: File): Promise<UserPreferences> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/user/preferences/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get language options
   */
  async getLanguageOptions(): Promise<Array<{ code: string; name: string; native_name: string }>> {
    const response = await apiClient.get('/user/preferences/languages');
    return response.data.languages || [];
  },

  /**
   * Get timezone options
   */
  async getTimezoneOptions(): Promise<Array<{ value: string; label: string; offset: string }>> {
    const response = await apiClient.get('/user/preferences/timezones');
    return response.data.timezones || [];
  },
};
