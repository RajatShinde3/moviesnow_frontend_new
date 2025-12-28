/**
 * =============================================================================
 * Playback Intelligence Service
 * =============================================================================
 * Advanced playback analytics, QoE tracking, and adaptive streaming
 */

import { fetchJson } from '../client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface QoEMetrics {
  session_id: string;
  video_startup_time_ms: number;
  rebuffering_count: number;
  rebuffering_duration_ms: number;
  avg_bitrate_kbps: number;
  quality_switches: number;
  dropped_frames: number;
  playback_errors: number;
  completion_rate: number;
  watch_duration_seconds: number;
  quality_distribution: Record<string, number>; // e.g., {"1080p": 80, "720p": 20}
}

export interface AdaptiveStreamingConfig {
  enable_abr: boolean; // Adaptive Bitrate
  min_bitrate_kbps: number;
  max_bitrate_kbps: number;
  initial_bitrate_kbps: number;
  buffer_size_seconds: number;
  fast_switch_threshold: number;
  bandwidth_estimation_method: 'throughput' | 'latency' | 'hybrid';
}

export interface PlaybackSession {
  id: string;
  user_id: string;
  title_id: string;
  episode_id?: string;
  device_type: string;
  platform: string;
  quality: string;
  started_at: string;
  ended_at?: string;
  current_position_seconds: number;
  duration_seconds: number;
  is_active: boolean;
  bandwidth_kbps?: number;
  cdn_node?: string;
}

export interface BandwidthTest {
  test_id: string;
  download_speed_mbps: number;
  upload_speed_mbps: number;
  latency_ms: number;
  jitter_ms: number;
  packet_loss_percent: number;
  recommended_quality: string;
  timestamp: string;
}

export interface CDNPerformance {
  node_id: string;
  region: string;
  latency_ms: number;
  availability_percent: number;
  bandwidth_available_mbps: number;
  active_connections: number;
  cache_hit_rate: number;
}

export interface VideoQualityRecommendation {
  recommended_quality: string;
  available_qualities: string[];
  current_bandwidth_kbps: number;
  buffer_health: number;
  network_stability: 'stable' | 'unstable' | 'poor';
  should_switch: boolean;
  reason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Playback Intelligence Service
// ─────────────────────────────────────────────────────────────────────────────

export const playbackIntelligenceService = {
  /**
   * Report Quality of Experience metrics
   */
  async reportQoEMetrics(sessionId: string, metrics: Partial<QoEMetrics>): Promise<void> {
    await fetchJson<any>(`/playback/sessions/${sessionId}/qoe`, { method: "PATCH", json: metrics });
  },

  /**
   * Get adaptive streaming configuration
   */
  async getAdaptiveConfig(sessionId: string): Promise<AdaptiveStreamingConfig> {
    const response: any = await fetchJson<any>(`/playback/sessions/${sessionId}/adaptive-config`);
    return response as any;
  },

  /**
   * Update adaptive streaming configuration
   */
  async updateAdaptiveConfig(
    sessionId: string,
    config: Partial<AdaptiveStreamingConfig>
  ): Promise<AdaptiveStreamingConfig> {
    const response: any = await fetchJson<any>(`/playback/sessions/${sessionId}/adaptive-config`, { method: "PATCH", json: config });
    return response as any;
  },

  /**
   * Run bandwidth test
   */
  async runBandwidthTest(): Promise<BandwidthTest> {
    const response: any = await fetchJson<any>('/playback/bandwidth-test');
    return response as any;
  },

  /**
   * Get video quality recommendation based on current network
   */
  async getQualityRecommendation(options: {
    title_id: string;
    current_bandwidth_kbps?: number;
    device_type?: string;
  }): Promise<VideoQualityRecommendation> {
    const response: any = await fetchJson<any>('/playback/quality-recommendation', { method: "PATCH", json: options });
    return response as any;
  },

  /**
   * Get CDN performance metrics
   */
  async getCDNPerformance(region?: string): Promise<CDNPerformance[]> {
    const params = new URLSearchParams();
    if (region) params.append('region', region);

    const response: any = await fetchJson<any>(`/playback/cdn/performance?${params.toString()}`);
    return response.data.nodes || [];
  },

  /**
   * Select optimal CDN node
   */
  async selectOptimalCDN(options: {
    title_id: string;
    user_location?: { lat: number; lon: number };
  }): Promise<{ node_id: string; base_url: string; region: string }> {
    const response: any = await fetchJson<any>('/playback/cdn/select', { method: "PATCH", json: options });
    return response as any;
  },

  /**
   * Report playback error
   */
  async reportPlaybackError(sessionId: string, error: {
    error_code: string;
    error_message: string;
    timestamp: string;
    video_position_seconds: number;
    quality: string;
    user_agent: string;
  }): Promise<void> {
    await fetchJson<any>(`/playback/sessions/${sessionId}/error`, { method: "PATCH", json: error });
  },

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<{
    total_watch_time: number;
    rebuffer_ratio: number;
    avg_bitrate: number;
    quality_changes: number;
    error_count: number;
    qoe_score: number; // 0-100
  }> {
    const response: any = await fetchJson<any>(`/playback/sessions/${sessionId}/stats`);
    return response as any;
  },

  /**
   * Get active playback sessions for user
   */
  async getActiveSessions(): Promise<PlaybackSession[]> {
    const response: any = await fetchJson<any>('/playback/sessions/active');
    return response.data.sessions || [];
  },

  /**
   * Terminate playback session
   */
  async terminateSession(sessionId: string, reason?: string): Promise<void> {
    await fetchJson<any>(`/playback/sessions/${sessionId}/terminate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Get playback history
   */
  async getPlaybackHistory(options?: {
    title_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    sessions: PlaybackSession[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (options?.title_id) params.append('title_id', options.title_id);
    if (options?.start_date) params.append('start_date', options.start_date);
    if (options?.end_date) params.append('end_date', options.end_date);
    if (options?.page) params.append('page', String(options.page));
    if (options?.per_page) params.append('per_page', String(options.per_page));

    const response: any = await fetchJson<any>(`/playback/history?${params.toString()}`);
    return response as any;
  },

  /**
   * Enable auto-quality switching
   */
  async enableAutoQuality(sessionId: string, enabled: boolean): Promise<void> {
    await fetchJson<any>(`/playback/sessions/${sessionId}/auto-quality`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  },

  /**
   * Set bandwidth cap
   */
  async setBandwidthCap(sessionId: string, maxBandwidthKbps: number): Promise<void> {
    await fetchJson<any>(`/playback/sessions/${sessionId}/bandwidth-cap`, {
      method: 'POST',
      body: JSON.stringify({
        max_bandwidth_kbps: maxBandwidthKbps,
      }),
    });
  },

  /**
   * Get buffer health
   */
  async getBufferHealth(sessionId: string): Promise<{
    buffer_level_seconds: number;
    buffer_target_seconds: number;
    is_healthy: boolean;
    risk_of_rebuffer: boolean;
  }> {
    const response: any = await fetchJson<any>(`/playback/sessions/${sessionId}/buffer-health`);
    return response as any;
  },

  /**
   * Pre-buffer content
   */
  async preBuffer(options: {
    title_id: string;
    episode_id?: string;
    quality: string;
    start_position_seconds?: number;
  }): Promise<{ buffer_id: string; expires_at: string }> {
    const response: any = await fetchJson<any>('/playback/pre-buffer', { method: "PATCH", json: options });
    return response as any;
  },
};
