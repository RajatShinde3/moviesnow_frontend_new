// types/api.ts
// Comprehensive type definitions for all API services

/**
 * =============================================================================
 * TITLE AVAILABILITY TYPES
 * =============================================================================
 */

export interface AvailabilityWindow {
  id: string;
  title_id: string;
  start_date: string; // ISO date
  end_date: string; // ISO date
  regions: string[]; // Array of region codes (e.g., ["US", "CA", "UK"])
  is_active: boolean;
  window_type?: 'theatrical' | 'streaming' | 'download' | 'all';
  created_at: string;
  updated_at: string;
}

export interface CreateAvailabilityWindowRequest {
  start_date: string;
  end_date: string;
  regions: string[];
  window_type?: 'theatrical' | 'streaming' | 'download' | 'all';
  is_active?: boolean;
}

export interface UpdateAvailabilityWindowRequest {
  start_date?: string;
  end_date?: string;
  regions?: string[];
  window_type?: 'theatrical' | 'streaming' | 'download' | 'all';
  is_active?: boolean;
}

/**
 * =============================================================================
 * STREAM VARIANTS TYPES
 * =============================================================================
 */

export interface StreamVariant {
  id: string;
  title_id: string;
  quality: '480p' | '720p' | '1080p' | '4K';
  bitrate: number; // in kbps
  codec: string; // e.g., "h264", "h265", "av1"
  file_size: number; // in bytes
  file_url: string;
  cdn_url: string;
  hls_manifest_url?: string;
  duration?: number; // in seconds
  resolution_width: number;
  resolution_height: number;
  frame_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStreamVariantRequest {
  quality: '480p' | '720p' | '1080p' | '4K';
  bitrate: number;
  codec: string;
  file_size: number;
  file_url: string;
  cdn_url: string;
  hls_manifest_url?: string;
  duration?: number;
  resolution_width: number;
  resolution_height: number;
  frame_rate?: number;
  is_active?: boolean;
}

export interface UpdateStreamVariantRequest {
  quality?: '480p' | '720p' | '1080p' | '4K';
  bitrate?: number;
  codec?: string;
  file_size?: number;
  file_url?: string;
  cdn_url?: string;
  hls_manifest_url?: string;
  duration?: number;
  resolution_width?: number;
  resolution_height?: number;
  frame_rate?: number;
  is_active?: boolean;
}

export interface VariantAnalytics {
  variant_id: string;
  quality: string;
  total_views: number;
  total_bandwidth: number; // in bytes
  average_watch_time: number; // in seconds
  cost_per_view: number;
  completion_rate: number; // percentage
  buffering_events: number;
  average_bitrate: number;
  peak_concurrent_streams: number;
  time_series: Array<{
    date: string;
    views: number;
    bandwidth: number;
    unique_viewers: number;
  }>;
}

/**
 * =============================================================================
 * ASSETS TYPES (Artwork, Subtitles, Trailers)
 * =============================================================================
 */

export interface Artwork {
  id: string;
  title_id: string;
  type: 'poster' | 'banner' | 'thumbnail' | 'backdrop' | 'logo';
  url: string;
  cdn_url: string;
  width: number;
  height: number;
  file_size: number; // in bytes
  mime_type: string;
  is_primary: boolean;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadArtworkRequest {
  type: 'poster' | 'banner' | 'thumbnail' | 'backdrop' | 'logo';
  url: string;
  cdn_url: string;
  width: number;
  height: number;
  file_size: number;
  mime_type: string;
  is_primary?: boolean;
  language?: string;
}

export interface Subtitle {
  id: string;
  title_id: string;
  language: string; // ISO 639-1 code (e.g., "en", "es", "ja")
  language_name: string; // Display name (e.g., "English", "Spanish", "Japanese")
  url: string;
  cdn_url: string;
  format: 'srt' | 'vtt' | 'ass' | 'ssa';
  file_size: number; // in bytes
  is_forced: boolean; // Forced subtitles (e.g., for foreign language parts)
  is_sdh: boolean; // Subtitles for deaf/hard-of-hearing
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UploadSubtitleRequest {
  language: string;
  language_name: string;
  url: string;
  cdn_url: string;
  format: 'srt' | 'vtt' | 'ass' | 'ssa';
  file_size: number;
  is_forced?: boolean;
  is_sdh?: boolean;
  is_default?: boolean;
}

export interface Trailer {
  id: string;
  title_id: string;
  name: string; // e.g., "Official Trailer", "Teaser", "Trailer 2"
  url: string;
  cdn_url: string;
  hls_manifest_url?: string;
  duration: number; // in seconds
  quality: '480p' | '720p' | '1080p' | '4K';
  file_size: number; // in bytes
  thumbnail_url?: string;
  release_date?: string;
  is_primary: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface UploadTrailerRequest {
  name: string;
  url: string;
  cdn_url: string;
  hls_manifest_url?: string;
  duration: number;
  quality: '480p' | '720p' | '1080p' | '4K';
  file_size: number;
  thumbnail_url?: string;
  release_date?: string;
  is_primary?: boolean;
}

export interface CDNInvalidationResult {
  invalidation_id: string;
  paths: string[];
  status: 'in_progress' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

/**
 * =============================================================================
 * MONETIZATION TYPES
 * =============================================================================
 */

export interface AdConfig {
  id: string;
  ad_type: 'pre-roll' | 'mid-roll' | 'pause' | 'post-roll';
  ad_url: string; // VAST/VMAP URL or ad tag
  frequency: number; // For mid-roll: every X minutes
  duration?: number; // Expected ad duration in seconds
  enabled: boolean;
  skip_after?: number; // Allow skip after X seconds (e.g., 5)
  target_content_types?: ('movie' | 'series' | 'anime' | 'documentary')[];
  target_user_types?: ('free' | 'trial')[];
  created_at: string;
  updated_at: string;
}

export interface CreateAdConfigRequest {
  ad_type: 'pre-roll' | 'mid-roll' | 'pause' | 'post-roll';
  ad_url: string;
  frequency?: number;
  duration?: number;
  enabled?: boolean;
  skip_after?: number;
  target_content_types?: ('movie' | 'series' | 'anime' | 'documentary')[];
  target_user_types?: ('free' | 'trial')[];
}

export interface UpdateAdConfigRequest {
  ad_type?: 'pre-roll' | 'mid-roll' | 'pause' | 'post-roll';
  ad_url?: string;
  frequency?: number;
  duration?: number;
  enabled?: boolean;
  skip_after?: number;
  target_content_types?: ('movie' | 'series' | 'anime' | 'documentary')[];
  target_user_types?: ('free' | 'trial')[];
}

export interface DownloadRedirect {
  id: string;
  redirect_url: string; // Template URL with placeholders (e.g., "{file_id}", "{quality}")
  wait_time: number; // Countdown timer in seconds (e.g., 30, 60)
  quality?: '480p' | '720p' | '1080p'; // Specific quality or null for all
  content_type?: 'movie' | 'series' | 'anime' | 'documentary';
  is_active: boolean;
  click_count: number;
  conversion_count: number; // Users who completed download
  created_at: string;
  updated_at: string;
}

export interface CreateDownloadRedirectRequest {
  redirect_url: string;
  wait_time: number;
  quality?: '480p' | '720p' | '1080p';
  content_type?: 'movie' | 'series' | 'anime' | 'documentary';
  is_active?: boolean;
}

export interface UpdateDownloadRedirectRequest {
  redirect_url?: string;
  wait_time?: number;
  quality?: '480p' | '720p' | '1080p';
  content_type?: 'movie' | 'series' | 'anime' | 'documentary';
  is_active?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number; // in cents
  currency: string; // e.g., "USD"
  interval: 'month' | 'year';
  interval_count: number; // e.g., 1 for monthly, 3 for quarterly
  trial_period_days?: number;
  features: string[];
  is_active: boolean;
  is_popular?: boolean;
  stripe_price_id: string;
  stripe_product_id: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  interval: 'month' | 'year';
  interval_count?: number;
  trial_period_days?: number;
  features?: string[];
  is_active?: boolean;
  is_popular?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  trial_period_days?: number;
  features?: string[];
  is_active?: boolean;
  is_popular?: boolean;
  metadata?: Record<string, any>;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number; // Percentage (e.g., 20) or cents (e.g., 1000)
  currency?: string; // For fixed discounts
  max_uses?: number;
  current_uses: number;
  valid_from?: string;
  expires_at?: string;
  applies_to_plans?: string[]; // Plan IDs or null for all plans
  is_active: boolean;
  stripe_coupon_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponRequest {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  currency?: string;
  max_uses?: number;
  valid_from?: string;
  expires_at?: string;
  applies_to_plans?: string[];
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateCouponRequest {
  discount_value?: number;
  max_uses?: number;
  valid_from?: string;
  expires_at?: string;
  applies_to_plans?: string[];
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface RevenueStats {
  total_revenue: number;
  subscription_revenue: number;
  ad_revenue: number;
  refunded_amount: number;
  net_revenue: number;
  time_series: Array<{
    date: string;
    subscription_revenue: number;
    ad_revenue: number;
    total_revenue: number;
  }>;
  revenue_by_plan: Array<{
    plan_id: string;
    plan_name: string;
    revenue: number;
    percentage: number;
  }>;
  revenue_by_region: Array<{
    region: string;
    revenue: number;
    percentage: number;
  }>;
}

export interface AdPerformance {
  total_impressions: number;
  total_clicks: number;
  ctr: number; // Click-through rate (percentage)
  total_revenue: number;
  ecpm: number; // Effective cost per mille
  completion_rate: number; // Percentage
  skip_rate: number; // Percentage
  time_series: Array<{
    date: string;
    impressions: number;
    clicks: number;
    revenue: number;
  }>;
  performance_by_type: Array<{
    ad_type: 'pre-roll' | 'mid-roll' | 'pause' | 'post-roll';
    impressions: number;
    clicks: number;
    revenue: number;
    ctr: number;
  }>;
}

/**
 * =============================================================================
 * ADVANCED ANALYTICS TYPES
 * =============================================================================
 */

export interface QualityAnalytics {
  quality_distribution: Array<{
    quality: '480p' | '720p' | '1080p' | '4K';
    count: number;
    percentage: number;
    total_views: number;
  }>;
  bandwidth_by_quality: Array<{
    quality: string;
    bandwidth: number; // in GB
    cost: number;
  }>;
  user_preferences: {
    most_selected: '480p' | '720p' | '1080p' | '4K';
    upgrade_rate: number; // Percentage of users upgrading quality
    downgrade_rate: number; // Percentage of users downgrading quality
  };
  quality_by_content_type: Array<{
    content_type: 'movie' | 'series' | 'anime' | 'documentary';
    quality_breakdown: Record<string, number>;
  }>;
  quality_by_device: Array<{
    device_type: 'desktop' | 'mobile' | 'tablet' | 'tv';
    quality_breakdown: Record<string, number>;
  }>;
}

export interface DownloadAnalytics {
  total_downloads: number;
  downloads_by_quality: Array<{
    quality: '480p' | '720p' | '1080p';
    count: number;
    percentage: number;
  }>;
  conversion_rate: {
    free_users: number; // Percentage who clicked through ads
    premium_users: number; // Percentage who directly downloaded
    overall: number;
  };
  geographic_distribution: Array<{
    country: string;
    country_code: string;
    count: number;
    percentage: number;
  }>;
  downloads_by_content_type: Array<{
    content_type: 'movie' | 'series' | 'anime' | 'documentary';
    count: number;
    percentage: number;
  }>;
  peak_download_times: Array<{
    hour: number; // 0-23
    day_of_week: number; // 0-6 (Sunday-Saturday)
    count: number;
  }>;
  completion_rate: number; // Percentage of successful downloads
  failed_downloads: number;
  average_download_time: number; // in seconds
}

export interface RealTimeMetrics {
  active_streams: number;
  active_downloads: number;
  concurrent_users: number;
  bandwidth_usage: number; // in Mbps
  error_rate: number; // Percentage
  average_buffer_time: number; // in seconds
  server_health: {
    cpu: number; // Percentage
    memory: number; // Percentage
    disk: number; // Percentage
    uptime: number; // in seconds
  };
  cdn_performance: {
    hit_ratio: number; // Percentage
    miss_ratio: number; // Percentage
    cache_size: number; // in GB
    bandwidth_saved: number; // in GB
  };
  active_users_by_region: Array<{
    region: string;
    count: number;
  }>;
  active_content: Array<{
    title_id: string;
    title_name: string;
    active_streams: number;
    active_downloads: number;
  }>;
  timestamp: string;
}

export interface CostAnalytics {
  total_cost: number;
  storage_cost: number;
  bandwidth_cost: number;
  compute_cost: number;
  cdn_cost: number;
  other_costs: number;
  cost_per_user: number;
  cost_per_hour: number; // Cost per hour of content watched
  cost_per_gb: number; // Cost per GB transferred
  projected_monthly_cost: number;
  cost_trends: Array<{
    date: string;
    storage: number;
    bandwidth: number;
    compute: number;
    cdn: number;
    total: number;
  }>;
  cost_by_service: Array<{
    service: 'S3' | 'CloudFront' | 'EC2' | 'RDS' | 'SES' | 'Other';
    cost: number;
    percentage: number;
  }>;
  optimization_recommendations: Array<{
    category: string;
    recommendation: string;
    potential_savings: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface DeviceAnalytics {
  device_distribution: Array<{
    device_type: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'other';
    count: number;
    percentage: number;
  }>;
  os_distribution: Array<{
    os: string; // e.g., "Windows", "macOS", "iOS", "Android"
    version?: string;
    count: number;
    percentage: number;
  }>;
  browser_distribution: Array<{
    browser: string; // e.g., "Chrome", "Safari", "Firefox"
    version?: string;
    count: number;
    percentage: number;
  }>;
  screen_resolutions: Array<{
    resolution: string; // e.g., "1920x1080", "1366x768"
    count: number;
    percentage: number;
  }>;
  connection_types: Array<{
    type: '4g' | '5g' | 'wifi' | 'ethernet' | 'other';
    count: number;
    percentage: number;
    average_quality: string;
  }>;
}

export interface DashboardSummary {
  overview: {
    total_users: number;
    active_users: number;
    premium_users: number;
    total_content: number;
    total_views: number;
    total_downloads: number;
  };
  growth_metrics: {
    user_growth: number; // Percentage
    revenue_growth: number;
    content_growth: number;
    engagement_growth: number;
  };
  top_content: Array<{
    id: string;
    title: string;
    type: 'movie' | 'series' | 'anime' | 'documentary';
    views: number;
    rating: number;
    thumbnail_url: string;
  }>;
  recent_activity: Array<{
    id: string;
    type: 'signup' | 'subscription' | 'upload' | 'stream' | 'download';
    user: string;
    description: string;
    timestamp: string;
  }>;
}

/**
 * =============================================================================
 * SERIES & ANIME TYPES
 * =============================================================================
 */

export interface Season {
  id: string;
  series_id: string;
  season_number: number;
  title?: string;
  description?: string;
  release_year?: number;
  poster_url?: string;
  episode_count: number;
  status: 'upcoming' | 'airing' | 'completed' | 'cancelled';
  air_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSeasonRequest {
  season_number: number;
  title?: string;
  description?: string;
  release_year?: number;
  poster_url?: string;
  status?: 'upcoming' | 'airing' | 'completed' | 'cancelled';
  air_date?: string;
}

export interface UpdateSeasonRequest {
  title?: string;
  description?: string;
  release_year?: number;
  poster_url?: string;
  status?: 'upcoming' | 'airing' | 'completed' | 'cancelled';
  air_date?: string;
}

export interface Episode {
  id: string;
  season_id: string;
  episode_number: number;
  title: string;
  description?: string;
  duration: number; // in seconds
  air_date?: string;
  thumbnail_url?: string;
  video_url?: string;
  hls_manifest_url?: string;
  status: 'upcoming' | 'available' | 'unavailable';
  views: number;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEpisodeRequest {
  episode_number: number;
  title: string;
  description?: string;
  duration: number;
  air_date?: string;
  thumbnail_url?: string;
  video_url?: string;
  hls_manifest_url?: string;
  status?: 'upcoming' | 'available' | 'unavailable';
}

export interface UpdateEpisodeRequest {
  title?: string;
  description?: string;
  duration?: number;
  air_date?: string;
  thumbnail_url?: string;
  video_url?: string;
  hls_manifest_url?: string;
  status?: 'upcoming' | 'available' | 'unavailable';
}

export interface AnimeArc {
  id: string;
  anime_id: string;
  name: string;
  description?: string;
  arc_type: 'canon' | 'filler' | 'mixed';
  start_episode: number;
  end_episode: number;
  episode_count: number;
  manga_chapters?: string; // e.g., "Chapters 50-75"
  is_filler: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAnimeArcRequest {
  name: string;
  description?: string;
  arc_type: 'canon' | 'filler' | 'mixed';
  start_episode: number;
  end_episode: number;
  manga_chapters?: string;
  is_filler?: boolean;
}

export interface UpdateAnimeArcRequest {
  name?: string;
  description?: string;
  arc_type?: 'canon' | 'filler' | 'mixed';
  start_episode?: number;
  end_episode?: number;
  manga_chapters?: string;
  is_filler?: boolean;
}

export interface AudioTrack {
  id: string;
  title_id: string;
  language: string; // ISO 639-1 code
  language_name: string; // Display name
  url: string;
  cdn_url: string;
  format: 'aac' | 'mp3' | 'flac' | 'opus';
  bitrate: number; // in kbps (e.g., 128, 256, 320)
  channels: number; // e.g., 2 for stereo, 6 for 5.1
  sample_rate: number; // in Hz (e.g., 44100, 48000)
  file_size: number; // in bytes
  is_default: boolean;
  is_descriptive_audio: boolean; // Audio description for visually impaired
  created_at: string;
  updated_at: string;
}

export interface CreateAudioTrackRequest {
  language: string;
  language_name: string;
  url: string;
  cdn_url: string;
  format: 'aac' | 'mp3' | 'flac' | 'opus';
  bitrate: number;
  channels: number;
  sample_rate: number;
  file_size: number;
  is_default?: boolean;
  is_descriptive_audio?: boolean;
}

/**
 * =============================================================================
 * COMPLIANCE TYPES
 * =============================================================================
 */

export interface DMCATakedownRequest {
  id: string;
  title_id: string;
  title_name: string;
  claimant_name: string;
  claimant_email: string;
  claimant_organization?: string;
  content_url: string;
  description: string;
  copyright_work: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'appealed';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  resolution_notes?: string;
  appeal_deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDMCARequest {
  title_id: string;
  claimant_name: string;
  claimant_email: string;
  claimant_organization?: string;
  content_url: string;
  description: string;
  copyright_work: string;
}

export interface UpdateDMCARequest {
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'appealed';
  resolution_notes?: string;
}

export interface ContentCertification {
  id: string;
  title_id: string;
  rating: string; // e.g., "G", "PG", "PG-13", "R", "TV-MA"
  rating_system: string; // e.g., "MPAA", "TV Parental Guidelines", "PEGI"
  region: string; // Country/region code
  certification_body: string;
  descriptors: string[]; // e.g., ["Violence", "Strong Language", "Sexual Content"]
  certified_date?: string;
  certificate_url?: string;
  age_restriction?: number; // Minimum age
  created_at: string;
  updated_at: string;
}

export interface CreateCertificationRequest {
  rating: string;
  rating_system: string;
  region: string;
  certification_body: string;
  descriptors?: string[];
  certified_date?: string;
  certificate_url?: string;
  age_restriction?: number;
}

/**
 * =============================================================================
 * USER MANAGEMENT TYPES
 * =============================================================================
 */

export interface UserSearchFilters {
  query?: string;
  subscription_status?: 'active' | 'inactive' | 'trial' | 'cancelled';
  role?: 'user' | 'admin' | 'moderator';
  created_after?: string;
  created_before?: string;
  has_mfa?: boolean;
  is_verified?: boolean;
  sort_by?: 'created_at' | 'last_login' | 'email';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface UserSearchResult {
  results: UserProfile[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled';
  subscription_plan?: string;
  role: 'user' | 'admin' | 'moderator';
  is_verified: boolean;
  has_mfa: boolean;
  created_at: string;
  last_login?: string;
  total_watch_time?: number; // in seconds
  total_downloads?: number;
}

export interface BanUserRequest {
  reason: string;
  duration?: number; // in days, null for permanent
  notify_user?: boolean;
}

export interface UnbanUserRequest {
  reason?: string;
  notify_user?: boolean;
}

/**
 * =============================================================================
 * PERMISSIONS & RBAC TYPES
 * =============================================================================
 */

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  user_count: number;
  is_system_role: boolean; // Cannot be deleted
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string; // e.g., "titles", "users", "analytics"
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  description?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permission_ids: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permission_ids?: string[];
}

export interface AssignRoleRequest {
  user_id: string;
  role_ids: string[];
}

/**
 * =============================================================================
 * ANIME DISCOVERY TYPES
 * =============================================================================
 */

export interface SeasonalAnime {
  season: 'winter' | 'spring' | 'summer' | 'fall';
  year: number;
  anime_list: AnimeListItem[];
}

export interface AnimeListItem {
  id: string;
  title: string;
  japanese_title?: string;
  description: string;
  poster_url: string;
  banner_url?: string;
  genres: string[];
  rating: number;
  episode_count: number;
  status: 'upcoming' | 'airing' | 'completed';
  air_date?: string;
  studio?: string;
}

export interface AiringAnime {
  anime_id: string;
  title: string;
  current_episode: number;
  total_episodes?: number;
  next_episode_date?: string;
  air_time?: string; // e.g., "Saturdays at 11:30 PM JST"
  broadcast_day?: string;
}

/**
 * =============================================================================
 * SCHEDULE TYPES
 * =============================================================================
 */

export interface ReleaseSchedule {
  date: string; // ISO date
  releases: ScheduleRelease[];
}

export interface ScheduleRelease {
  id: string;
  title_id: string;
  title_name: string;
  type: 'movie' | 'series' | 'anime' | 'documentary';
  release_type: 'new' | 'episode' | 'season';
  episode_number?: number;
  season_number?: number;
  poster_url: string;
  air_time?: string;
}

/**
 * =============================================================================
 * USER DATA EXPORT TYPES
 * =============================================================================
 */

export interface DataExportRequest {
  export_type: 'full' | 'watch_history' | 'downloads' | 'subscriptions' | 'profile';
  format: 'json' | 'csv' | 'pdf';
  include_media?: boolean; // Include downloaded files
}

export interface DataExportResponse {
  export_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  expires_at?: string;
  file_size?: number; // in bytes
  created_at: string;
}

/**
 * =============================================================================
 * CDN MANAGEMENT TYPES
 * =============================================================================
 */

export interface CDNStats {
  total_bandwidth: number; // in GB
  cache_hit_ratio: number; // Percentage
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number; // in ms
  bandwidth_by_region: Array<{
    region: string;
    bandwidth: number;
    requests: number;
  }>;
}

export interface SignedCookieRequest {
  resource_path: string;
  expiration: number; // in seconds
}

export interface SignedCookieResponse {
  cookie_name: string;
  cookie_value: string;
  domain: string;
  path: string;
  expires: string;
}

/**
 * =============================================================================
 * MEDIA UPLOADS TYPES
 * =============================================================================
 */

export interface UploadSession {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number; // in bytes
  content_type: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number; // Percentage
  upload_url?: string;
  chunks_uploaded: number;
  total_chunks: number;
  error_message?: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface InitiateUploadRequest {
  file_name: string;
  file_size: number;
  content_type: string;
  chunk_size?: number; // in bytes
}

export interface InitiateUploadResponse {
  upload_id: string;
  upload_url: string;
  chunk_size: number;
  total_chunks: number;
}

export interface UploadChunkRequest {
  upload_id: string;
  chunk_number: number;
  chunk_data: Blob | File;
}

export interface CompleteUploadRequest {
  upload_id: string;
  parts: Array<{
    part_number: number;
    etag: string;
  }>;
}

/**
 * =============================================================================
 * GENERAL API TYPES
 * =============================================================================
 */

export interface APIResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  status_code: number;
  details?: any;
}

/**
 * =============================================================================
 * QUERY PARAMETER TYPES
 * =============================================================================
 */

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
