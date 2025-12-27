// types/playerIntelligence.ts

/**
 * Player Intelligence configuration and analytics
 */
export interface PlayerIntelligence {
  userId: string;
  titleId: string;
  episodeId?: string;
  sessionId: string;

  // Adaptive Quality
  adaptiveQuality: AdaptiveQualityData;

  // Network Analytics
  networkAnalytics: NetworkAnalytics;

  // Playback Analytics
  playbackAnalytics: PlaybackAnalytics;

  // User Behavior
  userBehavior: UserBehavior;

  // Recommendations
  qualityRecommendation: QualityRecommendation;

  // Performance Metrics
  performanceMetrics: PerformanceMetrics;
}

/**
 * Adaptive quality selection data
 */
export interface AdaptiveQualityData {
  currentQuality: VideoQuality;
  availableQualities: VideoQuality[];
  autoSwitchEnabled: boolean;
  switchHistory: QualitySwitchEvent[];
  bufferHealth: number; // 0-100%
  estimatedBandwidth: number; // Mbps
  recommendedQuality: VideoQuality;
}

/**
 * Video quality levels
 */
export type VideoQuality = '360p' | '480p' | '720p' | '1080p' | '1440p' | '4K' | 'auto';

/**
 * Quality switch event
 */
export interface QualitySwitchEvent {
  timestamp: string;
  fromQuality: VideoQuality;
  toQuality: VideoQuality;
  reason: SwitchReason;
  bandwidth: number;
  bufferLevel: number;
}

/**
 * Reason for quality switch
 */
export type SwitchReason =
  | 'bandwidth_increase'
  | 'bandwidth_decrease'
  | 'buffer_starvation'
  | 'user_manual'
  | 'startup'
  | 'network_congestion'
  | 'device_capability';

/**
 * Network analytics
 */
export interface NetworkAnalytics {
  currentBandwidth: number; // Mbps
  averageBandwidth: number; // Mbps
  minBandwidth: number; // Mbps
  maxBandwidth: number; // Mbps
  bandwidthVariation: number; // Percentage
  latency: number; // ms
  packetLoss: number; // Percentage
  connectionType: ConnectionType;
  isStable: boolean;
  bandwidthHistory: BandwidthDataPoint[];
}

/**
 * Connection type
 */
export type ConnectionType = 'wifi' | '4g' | '5g' | 'ethernet' | 'unknown';

/**
 * Bandwidth data point
 */
export interface BandwidthDataPoint {
  timestamp: string;
  bandwidth: number;
  latency: number;
}

/**
 * Playback analytics
 */
export interface PlaybackAnalytics {
  totalPlayTime: number; // seconds
  bufferingTime: number; // seconds
  bufferingEvents: number;
  rebufferingRatio: number; // Percentage
  startupTime: number; // ms
  averageFrameRate: number;
  droppedFrames: number;
  playbackErrors: PlaybackError[];
  qualityOfExperience: number; // 0-100 score
}

/**
 * Playback error
 */
export interface PlaybackError {
  timestamp: string;
  errorCode: string;
  errorMessage: string;
  quality: VideoQuality;
  recovered: boolean;
}

/**
 * User behavior patterns
 */
export interface UserBehavior {
  preferredQuality: VideoQuality;
  averageSessionDuration: number; // seconds
  skipPatterns: SkipPattern[];
  watchSpeed: number; // 1.0 = normal
  frequentPausePoints: number[]; // Timestamps in seconds
  completionRate: number; // Percentage
  rewindCount: number;
  forwardSeekCount: number;
}

/**
 * Skip pattern (intro, recap, etc.)
 */
export interface SkipPattern {
  type: 'intro' | 'recap' | 'credits' | 'other';
  startTime: number;
  endTime: number;
  skipFrequency: number; // How often user skips this section
}

/**
 * Quality recommendation
 */
export interface QualityRecommendation {
  recommendedQuality: VideoQuality;
  confidence: number; // 0-100%
  reasons: RecommendationReason[];
  alternativeQualities: Array<{
    quality: VideoQuality;
    score: number;
    pros: string[];
    cons: string[];
  }>;
}

/**
 * Recommendation reason
 */
export interface RecommendationReason {
  factor: RecommendationFactor;
  weight: number; // 0-1
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

/**
 * Factors considered in recommendation
 */
export type RecommendationFactor =
  | 'bandwidth'
  | 'device_capability'
  | 'battery_level'
  | 'user_preference'
  | 'network_stability'
  | 'content_type'
  | 'time_of_day'
  | 'data_saver_mode';

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  videoStartupTime: number; // ms
  timeToFirstFrame: number; // ms
  segmentDownloadTime: number; // ms
  bufferLevel: number; // seconds
  targetBufferLevel: number; // seconds
  cpuUsage: number; // Percentage
  memoryUsage: number; // MB
  decodingPerformance: DecodingPerformance;
}

/**
 * Video decoding performance
 */
export interface DecodingPerformance {
  decodedFrames: number;
  droppedFrames: number;
  corruptedFrames: number;
  averageDecodeTime: number; // ms
  decoderUtilization: number; // Percentage
}

/**
 * Player Intelligence settings
 */
export interface PlayerIntelligenceSettings {
  adaptiveQualityEnabled: boolean;
  targetBuffer: number; // seconds
  maxBuffer: number; // seconds
  minBuffer: number; // seconds
  qualityUpgradeThreshold: number; // Percentage
  qualityDowngradeThreshold: number; // Percentage
  bandwidthSafetyFactor: number; // 0-1
  dataSaverMode: boolean;
  preloadEnabled: boolean;
  lowLatencyMode: boolean;
}

/**
 * Analytics dashboard data
 */
export interface PlayerAnalyticsDashboard {
  overview: {
    totalSessions: number;
    averageQoE: number;
    averageStartupTime: number;
    totalBufferingTime: number;
  };
  qualityDistribution: Record<VideoQuality, number>;
  deviceDistribution: Record<string, number>;
  errorRate: number;
  topErrors: Array<{
    errorCode: string;
    count: number;
    percentage: number;
  }>;
  bandwidthTrends: BandwidthDataPoint[];
  qoeOverTime: Array<{
    timestamp: string;
    qoe: number;
  }>;
}

/**
 * Real-time player event (WebSocket)
 */
export interface PlayerEvent {
  type: PlayerEventType;
  sessionId: string;
  timestamp: string;
  data: any;
}

/**
 * Player event types
 */
export type PlayerEventType =
  | 'quality_changed'
  | 'buffering_started'
  | 'buffering_ended'
  | 'error_occurred'
  | 'playback_started'
  | 'playback_paused'
  | 'playback_ended'
  | 'seek_performed'
  | 'bandwidth_updated';

/**
 * Quality presets for quick selection
 */
export interface QualityPreset {
  id: string;
  name: string;
  description: string;
  quality: VideoQuality;
  targetBandwidth: number; // Mbps
  bufferSettings: {
    target: number;
    max: number;
    min: number;
  };
  icon: string;
  color: string;
}

export const QUALITY_PRESETS: QualityPreset[] = [
  {
    id: 'data_saver',
    name: 'Data Saver',
    description: 'Minimal data usage, 360p-480p quality',
    quality: '480p',
    targetBandwidth: 1,
    bufferSettings: { target: 10, max: 20, min: 3 },
    icon: 'Wifi',
    color: '#10b981',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Good quality with moderate data usage, 720p',
    quality: '720p',
    targetBandwidth: 5,
    bufferSettings: { target: 20, max: 40, min: 5 },
    icon: 'TrendingUp',
    color: '#3b82f6',
  },
  {
    id: 'high_quality',
    name: 'High Quality',
    description: 'Best visual experience, 1080p+',
    quality: '1080p',
    targetBandwidth: 10,
    bufferSettings: { target: 30, max: 60, min: 10 },
    icon: 'Sparkles',
    color: '#8b5cf6',
  },
  {
    id: 'auto',
    name: 'Auto (Recommended)',
    description: 'Adapts to your connection automatically',
    quality: 'auto',
    targetBandwidth: 0, // Dynamic
    bufferSettings: { target: 20, max: 40, min: 5 },
    icon: 'Zap',
    color: '#f59e0b',
  },
];

/**
 * Quality level details
 */
export const QUALITY_LEVELS: Record<VideoQuality, { bitrate: number; resolution: string; label: string }> = {
  '360p': { bitrate: 0.7, resolution: '640x360', label: 'Low' },
  '480p': { bitrate: 1.5, resolution: '854x480', label: 'SD' },
  '720p': { bitrate: 5, resolution: '1280x720', label: 'HD' },
  '1080p': { bitrate: 10, resolution: '1920x1080', label: 'Full HD' },
  '1440p': { bitrate: 20, resolution: '2560x1440', label: '2K' },
  '4K': { bitrate: 40, resolution: '3840x2160', label: 'Ultra HD' },
  'auto': { bitrate: 0, resolution: 'Adaptive', label: 'Auto' },
};

/**
 * Color coding for metrics
 */
export const METRIC_COLORS = {
  excellent: '#10b981',
  good: '#3b82f6',
  fair: '#f59e0b',
  poor: '#f97316',
  critical: '#ef4444',
};

/**
 * QoE (Quality of Experience) thresholds
 */
export const QOE_THRESHOLDS = {
  excellent: 90,
  good: 75,
  fair: 60,
  poor: 40,
};

/**
 * Get QoE rating
 */
export const getQoERating = (score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' => {
  if (score >= QOE_THRESHOLDS.excellent) return 'excellent';
  if (score >= QOE_THRESHOLDS.good) return 'good';
  if (score >= QOE_THRESHOLDS.fair) return 'fair';
  if (score >= QOE_THRESHOLDS.poor) return 'poor';
  return 'critical';
};

/**
 * Format bandwidth
 */
export const formatBandwidth = (mbps: number): string => {
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(2)} Gbps`;
  if (mbps >= 1) return `${mbps.toFixed(2)} Mbps`;
  return `${(mbps * 1000).toFixed(0)} Kbps`;
};

/**
 * Format duration
 */
export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};
