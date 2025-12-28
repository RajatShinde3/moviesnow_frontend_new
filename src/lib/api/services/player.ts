/**
 * =============================================================================
 * Player API Service
 * =============================================================================
 * Enhanced video player with playback sessions, quality selection, and progress tracking
 */

import { fetchJson } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface PlaybackSession {
  id: string;
  user_id: string;
  profile_id: string;
  title_id: string;
  episode_id?: string;
  stream_url: string;
  quality: '480p' | '720p' | '1080p' | 'auto';
  started_at: string;
  last_heartbeat?: string;
  ended_at?: string;
  total_watch_time_seconds: number;
  is_active: boolean;
  device_info?: {
    device_type: string;
    browser: string;
    os: string;
    ip_address: string;
  };
}

export interface WatchProgress {
  id: string;
  user_id: string;
  profile_id: string;
  title_id: string;
  episode_id?: string;
  progress_seconds: number;
  duration_seconds: number;
  progress_percentage: number;
  last_watched_at: string;
  completed: boolean;
}

export interface StreamVariant {
  quality: '480p' | '720p' | '1080p';
  url: string;
  bitrate: number;
  codec: string;
  file_size_bytes?: number;
}

export interface PlaybackInfo {
  title_id: string;
  episode_id?: string;
  title: string;
  description?: string;
  duration_seconds: number;
  thumbnail_url?: string;
  variants: StreamVariant[];
  subtitles?: Subtitle[];
  audio_tracks?: AudioTrack[];
  markers?: SceneMarker[];
  next_episode?: {
    id: string;
    title: string;
    thumbnail_url?: string;
  };
  continue_from?: number;
}

export interface Subtitle {
  id: string;
  language: string;
  label: string;
  url: string;
  is_default: boolean;
}

export interface AudioTrack {
  id: string;
  language: string;
  label: string;
  codec: string;
  is_default: boolean;
}

export interface SceneMarker {
  id: string;
  type: 'intro_start' | 'intro_end' | 'recap_start' | 'recap_end' | 'credits_start' | 'credits_end';
  time_seconds: number;
  duration_seconds?: number;
}

export interface PlaybackStats {
  session_id: string;
  average_bitrate: number;
  buffer_events: number;
  quality_switches: number;
  total_pauses: number;
  bandwidth_estimate: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────────────────────────────────────

export const playerService = {
  /**
   * Get playback information for a title/episode
   */
  async getPlaybackInfo(titleId: string, episodeId?: string): Promise<PlaybackInfo> {
    const params = episodeId ? `?episode_id=${episodeId}` : '';
    return (await fetchJson<PlaybackInfo>(`${API_BASE}/api/v1/playback/${titleId}/info${params}`))!;
  },

  /**
   * Start a new playback session
   */
  async startSession(data: {
    title_id: string;
    episode_id?: string;
    quality: string;
    device_info?: any;
  }): Promise<PlaybackSession> {
    return (await fetchJson<PlaybackSession>(`${API_BASE}/api/v1/playback/sessions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }))!;
  },

  /**
   * Send heartbeat to keep session alive
   */
  async heartbeat(sessionId: string, currentTime: number): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/playback/sessions/${sessionId}/heartbeat`, {
      method: 'POST',
      body: JSON.stringify({ current_time: currentTime }),
    });
  },

  /**
   * End playback session
   */
  async endSession(sessionId: string, finalTime: number): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/playback/sessions/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify({ final_time: finalTime }),
    });
  },

  /**
   * Update watch progress
   */
  async updateProgress(data: {
    title_id: string;
    episode_id?: string;
    progress_seconds: number;
    duration_seconds: number;
  }): Promise<WatchProgress> {
    return (await fetchJson<WatchProgress>(`${API_BASE}/api/v1/playback/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
    }))!;
  },

  /**
   * Get watch progress for a title/episode
   */
  async getProgress(titleId: string, episodeId?: string): Promise<WatchProgress | null> {
    try {
      const params = episodeId ? `?episode_id=${episodeId}` : '';
      return (await fetchJson<WatchProgress>(`${API_BASE}/api/v1/playback/progress/${titleId}${params}`)) || null;
    } catch (error: any) {
      if (error?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get active playback sessions
   */
  async getActiveSessions(): Promise<{ sessions: PlaybackSession[] }> {
    return fetchJson<any>(`${API_BASE}/api/v1/playback/sessions/active`);
  },

  /**
   * Get playback statistics
   */
  async getStats(sessionId: string): Promise<PlaybackStats> {
    return fetchJson<any>(`${API_BASE}/api/v1/playback/sessions/${sessionId}/stats`);
  },

  /**
   * Report playback quality metrics
   */
  async reportMetrics(sessionId: string, metrics: {
    buffer_duration_ms?: number;
    dropped_frames?: number;
    current_bitrate?: number;
    bandwidth_estimate?: number;
  }): Promise<void> {
    return fetchJson<any>(`${API_BASE}/api/v1/playback/sessions/${sessionId}/metrics`, {
      method: 'POST',
      body: JSON.stringify(metrics),
    });
  },

  /**
   * Get continue watching list
   */
  async getContinueWatching(profileId: string): Promise<{
    items: (WatchProgress & { title: any })[];
    total_count: number;
  }> {
    return fetchJson<any>(`${API_BASE}/api/v1/playback/continue-watching?profile_id=${profileId}`);
  },

  /**
   * Mark episode/title as completed
   */
  async markCompleted(titleId: string, episodeId?: string): Promise<void> {
    const params = episodeId ? `?episode_id=${episodeId}` : '';
    return fetchJson<any>(`${API_BASE}/api/v1/playback/progress/${titleId}/complete${params}`, {
      method: 'POST',
    });
  },
};
