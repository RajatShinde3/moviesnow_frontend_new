/**
 * =============================================================================
 * User Preferences Service
 * =============================================================================
 * API service for managing user preferences and settings
 */

import { fetchJson } from '../client';

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
    const response: any = await fetchJson<any>('/user/preferences');
    return response as any;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response: any = await fetchJson<any>('/user/preferences', { method: "PATCH", json: preferences });
    return response as any;
  },

  /**
   * Reset preferences to default
   */
  async resetPreferences(): Promise<UserPreferences> {
    const response: any = await fetchJson<any>('/user/preferences/reset');
    return response as any;
  },

  /**
   * Get playback preferences
   */
  async getPlaybackPreferences(): Promise<Pick<UserPreferences,
    'default_quality' | 'auto_play_next_episode' | 'skip_intro' | 'skip_recap' |
    'skip_credits' | 'playback_speed' | 'subtitle_language' | 'audio_language'
  >> {
    const response: any = await fetchJson<any>('/user/preferences/playback');
    return response as any;
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
    await fetchJson<any>('/user/preferences/playback', { method: "PATCH", json: preferences });
  },

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response: any = await fetchJson<any>('/user/preferences/notifications');
    return response as any;
  },

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response: any = await fetchJson<any>('/user/preferences/notifications', { method: "PATCH", json: settings });
    return response as any;
  },

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<PrivacySettings> {
    const response: any = await fetchJson<any>('/user/preferences/privacy');
    return response as any;
  },

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const response: any = await fetchJson<any>('/user/preferences/privacy', { method: "PATCH", json: settings });
    return response as any;
  },

  /**
   * Get content filters
   */
  async getContentFilters(): Promise<ContentFilter[]> {
    const response: any = await fetchJson<any>('/user/preferences/content-filters');
    return response.data.filters || [];
  },

  /**
   * Add content filter
   */
  async addContentFilter(filter: {
    type: 'genre' | 'rating' | 'language' | 'keyword';
    value: string;
  }): Promise<ContentFilter> {
    const response: any = await fetchJson<any>('/user/preferences/content-filters', { method: "PATCH", json: filter });
    return response as any;
  },

  /**
   * Remove content filter
   */
  async removeContentFilter(filterId: string): Promise<void> {
    await fetchJson<any>(`/user/preferences/content-filters/${filterId}`);
  },

  /**
   * Toggle content filter
   */
  async toggleContentFilter(filterId: string, enabled: boolean): Promise<ContentFilter> {
    const response: any = await fetchJson<any>(`/user/preferences/content-filters/${filterId}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    });
    return response as any;
  },

  /**
   * Get preferred genres
   */
  async getPreferredGenres(): Promise<string[]> {
    const response: any = await fetchJson<any>('/user/preferences/genres');
    return response.data.genres || [];
  },

  /**
   * Update preferred genres
   */
  async updatePreferredGenres(genres: string[]): Promise<void> {
    await fetchJson<any>('/user/preferences/genres', {
      method: 'PUT',
      body: JSON.stringify({ genres }),
    });
  },

  /**
   * Get watch reminders
   */
  async getWatchReminders(): Promise<WatchReminder[]> {
    const response: any = await fetchJson<any>('/user/preferences/reminders');
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
    const response: any = await fetchJson<any>('/user/preferences/reminders', { method: "PATCH", json: reminder });
    return response as any;
  },

  /**
   * Delete watch reminder
   */
  async deleteWatchReminder(reminderId: string): Promise<void> {
    await fetchJson<any>(`/user/preferences/reminders/${reminderId}`);
  },

  /**
   * Export user preferences
   */
  async exportPreferences(): Promise<Blob> {
    const response: any = await fetchJson<any>('/user/preferences/export');
    return response as any;
  },

  /**
   * Import user preferences
   */
  async importPreferences(file: File): Promise<UserPreferences> {
    const formData = new FormData();
    formData.append('file', file);

    const response: any = await fetchJson<any>('/user/preferences/import', {
      method: 'POST',
      body: formData,
    });
    return response as any;
  },

  /**
   * Get language options
   */
  async getLanguageOptions(): Promise<Array<{ code: string; name: string; native_name: string }>> {
    const response: any = await fetchJson<any>('/user/preferences/languages');
    return response.data.languages || [];
  },

  /**
   * Get timezone options
   */
  async getTimezoneOptions(): Promise<Array<{ value: string; label: string; offset: string }>> {
    const response: any = await fetchJson<any>('/user/preferences/timezones');
    return response.data.timezones || [];
  },
};
