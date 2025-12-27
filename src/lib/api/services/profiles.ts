/**
 * =============================================================================
 * Profiles API Service
 * =============================================================================
 * Multi-profile management with avatars and preferences
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  is_kids_profile: boolean;
  language_preference?: string;
  content_rating_max?: string;
  autoplay_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  name: string;
  avatar_url?: string;
  is_kids_profile?: boolean;
  language_preference?: string;
  content_rating_max?: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar_url?: string;
  is_kids_profile?: boolean;
  language_preference?: string;
  content_rating_max?: string;
  autoplay_enabled?: boolean;
}

export interface ProfilePreferences {
  profile_id: string;
  language_preference: string;
  subtitle_language?: string;
  audio_language?: string;
  content_rating_max: string;
  autoplay_enabled: boolean;
  notifications_enabled: boolean;
  playback_quality_preference?: 'auto' | '480p' | '720p' | '1080p';
}

export interface Avatar {
  id: string;
  url: string;
  category: 'default' | 'kids' | 'anime' | 'movies' | 'premium';
  name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────────────────────────────────────

export const profilesService = {
  /**
   * List all profiles for current user
   */
  async listProfiles(): Promise<{ profiles: Profile[] }> {
    return fetchJson<{ profiles: Profile[] }>(`${API_BASE}/api/v1/profiles`);
  },

  /**
   * Get specific profile
   */
  async getProfile(profileId: string): Promise<Profile> {
    return fetchJson<Profile>(`${API_BASE}/api/v1/profiles/${profileId}`);
  },

  /**
   * Create new profile
   */
  async createProfile(data: CreateProfileData): Promise<Profile> {
    return fetchJson<Profile>(`${API_BASE}/api/v1/profiles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update profile
   */
  async updateProfile(profileId: string, data: UpdateProfileData): Promise<Profile> {
    return fetchJson<Profile>(`${API_BASE}/api/v1/profiles/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete profile
   */
  async deleteProfile(profileId: string): Promise<void> {
    return fetchJson(`${API_BASE}/api/v1/profiles/${profileId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get profile preferences
   */
  async getPreferences(profileId: string): Promise<ProfilePreferences> {
    return fetchJson<ProfilePreferences>(`${API_BASE}/api/v1/profiles/${profileId}/preferences`);
  },

  /**
   * Update profile preferences
   */
  async updatePreferences(
    profileId: string,
    data: Partial<ProfilePreferences>
  ): Promise<ProfilePreferences> {
    return fetchJson<ProfilePreferences>(
      `${API_BASE}/api/v1/profiles/${profileId}/preferences`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Get available avatars
   */
  async getAvatars(category?: string): Promise<{ avatars: Avatar[] }> {
    const query = category ? `?category=${category}` : '';
    return fetchJson<{ avatars: Avatar[] }>(`${API_BASE}/api/v1/profiles/avatars${query}`);
  },

  /**
   * Upload custom avatar
   */
  async uploadAvatar(profileId: string, file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/v1/profiles/${profileId}/avatar`, {
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
   * Switch active profile
   */
  async switchProfile(profileId: string): Promise<void> {
    return fetchJson(`${API_BASE}/api/v1/profiles/${profileId}/switch`, {
      method: 'POST',
    });
  },
};
