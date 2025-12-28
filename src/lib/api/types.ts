// lib/api/types.ts
/**
 * =============================================================================
 * API Types - Type-safe contracts matching backend schemas
 * =============================================================================
 * Auto-generated types matching FastAPI backend responses.
 * Update these when backend schemas change.
 */

/* ══════════════════════════════════════════════════════════════
   ENUMS (matching backend)
   ══════════════════════════════════════════════════════════════ */

export type TitleType = "MOVIE" | "SERIES";
export type TitleStatus = "ANNOUNCED" | "IN_PRODUCTION" | "RELEASED" | "ENDED" | "CANCELLED";
export type OrgRole = "USER" | "ADMIN" | "SUPERUSER";
export type MediaAssetType = "POSTER" | "BACKDROP" | "VIDEO" | "SUBTITLE" | "TRAILER" | "LOGO" | "STILL";
export type StreamProtocol = "HLS" | "DASH" | "MP4";
export type QualityTier = "480p" | "720p" | "1080p" | "4K";

/* ══════════════════════════════════════════════════════════════
   USER & AUTH
   ══════════════════════════════════════════════════════════════ */

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role: OrgRole;
  is_active: boolean;
  is_verified: boolean;
  is_email_verified: boolean;
  is_2fa_enabled: boolean;
  created_at: string;
  updated_at: string;

  subscription_tier?: string;}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
  requires_mfa?: boolean;
  mfa_challenge_token?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name?: string;
  username?: string;
}

export interface TokenRefreshResponse {
  access_token: string;
  token_type: string;
}

/* ══════════════════════════════════════════════════════════════
   TITLES & CONTENT
   ══════════════════════════════════════════════════════════════ */

export interface Title {
  id: string;
  type: TitleType;
  status: TitleStatus;
  name: string;
  original_name?: string;
  slug: string;
  overview?: string;
  tagline?: string;
  release_year?: number;
  release_date?: string;
  runtime_minutes?: number;
  origin_countries?: string[];
  spoken_languages?: string[];
  content_rating?: string;
  is_adult: boolean;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  imdb_id?: string;
  tmdb_id?: number;
  created_at: string;
  updated_at: string;
  genres?: Genre[];
  credits?: Credit[];
  seasons?: Season[];
}

export interface TitleListResponse {
  items: Title[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order?: number;
  is_active: boolean;
}

export interface Credit {
  id: string;
  person_id: string;
  kind: "CAST" | "CREW";
  role?: string;
  character?: string;
  billing_order?: number;
  person?: Person;
}

export interface Person {
  id: string;
  name: string;
  slug: string;
  biography?: string;
  profile_url?: string;
  birth_date?: string;
  death_date?: string;
}

/* ══════════════════════════════════════════════════════════════
   SEASONS & EPISODES
   ══════════════════════════════════════════════════════════════ */

export interface Season {
  id: string;
  title_id: string;
  season_number: number;
  name?: string;
  overview?: string;
  release_date?: string;
  episode_count?: number;
  poster_url?: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  title_id: string;
  season_id: string;
  episode_number: number;
  name: string;
  overview?: string;
  runtime_minutes?: number;
  release_date?: string;
  still_url?: string;
  video_asset_id?: string;
}

/* ══════════════════════════════════════════════════════════════
   MEDIA ASSETS & STREAMING
   ══════════════════════════════════════════════════════════════ */

export interface MediaAsset {
  id: string;
  type: MediaAssetType;
  storage_key: string;
  content_type?: string;
  size_bytes?: number;
  width?: number;
  height?: number;
  duration_seconds?: number;
  codec_video?: string;
  codec_audio?: string;
  bitrate_kbps?: number;
  fps?: number;
  is_hdr: boolean;
  created_at: string;
}

export interface StreamVariant {
  id: string;
  media_asset_id: string;
  protocol: StreamProtocol;
  quality: QualityTier;
  bandwidth_kbps: number;
  bitrate?: number;
  resolution?: string;
  format?: string;
  codec?: string;
  codec_video?: string;
  codec_audio?: string;
  file_size?: number;
  file_url?: string;
  cdn_url?: string;
  manifest_url?: string;
  hls_manifest_url?: string;
  is_streamable: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subtitle {
  id: string;
  media_asset_id: string;
  language: string;
  language_name?: string;
  label?: string;
  format?: 'srt' | 'vtt' | 'ass' | 'ssa';
  file_size?: number;
  url?: string;
  cdn_url?: string;
  is_default: boolean;
  is_forced: boolean;
  is_sdh: boolean;
}

/* ══════════════════════════════════════════════════════════════
   PLAYBACK & SESSIONS
   ══════════════════════════════════════════════════════════════ */

export interface PlaybackSessionRequest {
  title_id?: string;
  episode_id?: string;
  quality?: QualityTier;
  protocol?: StreamProtocol;
}

export interface PlaybackSession {
  session_id: string;
  manifest_url: string;
  expires_at: string;
  quality: QualityTier;
  protocol: StreamProtocol;
  subtitles?: Subtitle[];
  markers?: SceneMarker[];
}

export interface SceneMarker {
  id: string;
  type: "INTRO" | "CREDITS" | "RECAP";
  start_time_seconds: number;
  end_time_seconds: number;
}

export interface PlaybackHeartbeat {
  session_id: string;
  current_time_seconds: number;
  buffer_health?: number;
  bitrate_kbps?: number;
}

export interface Progress {
  id: string;
  user_id: string;
  title_id?: string;
  episode_id?: string;
  progress_seconds: number;
  duration_seconds?: number;
  completed: boolean;
  last_watched_at: string;
}

/* ══════════════════════════════════════════════════════════════
   DOWNLOADS & BUNDLES
   ══════════════════════════════════════════════════════════════ */

export interface Bundle {
  id: string;
  title_id: string;
  season_number?: number;
  name: string;
  description?: string;
  size_bytes?: number;
  file_count?: number;
  download_url?: string;
  checksum_sha256?: string;
  expires_at?: string;
  created_at: string;
}

export interface Download {
  id: string;
  user_id: string;
  title_id?: string;
  episode_id?: string;
  quality: QualityTier;
  size_bytes?: number;
  download_url?: string;
  expires_at: string;
  downloaded_at?: string;
}

/* ══════════════════════════════════════════════════════════════
   USER ENGAGEMENT
   ══════════════════════════════════════════════════════════════ */

export interface WatchlistItem {
  id: string;
  user_id: string;
  title_id: string;
  added_at: string;
  title?: Title;
}

export interface Review {
  id: string;
  user_id: string;
  title_id: string;
  rating?: number;
  review_text?: string;
  is_spoiler: boolean;
  created_at: string;
  updated_at: string;
  user?: Pick<User, "id" | "username" | "full_name">;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  is_kids: boolean;
  is_primary: boolean;
  is_active?: boolean;
  language?: string;
  auto_play_next: boolean;
  created_at: string;
}

/* ══════════════════════════════════════════════════════════════
   SUBSCRIPTION
   ══════════════════════════════════════════════════════════════ */

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name?: string;
  status: "active" | "cancelled" | "expired" | "trial";
  is_premium: boolean;
  expires_at: string | null;
  cancelled_at: string | null;
  next_billing_date?: string | null;
  amount?: number;
  created_at: string;
}

/* ══════════════════════════════════════════════════════════════
   DISCOVERY & SEARCH
   ══════════════════════════════════════════════════════════════ */

export interface DiscoveryParams {
  q?: string;
  type?: TitleType;
  genres?: string[];
  year?: number;
  min_rating?: number;
  language?: string;
  sort_by?: "popularity" | "release_date" | "rating" | "title";
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export interface HomePageData {
  trending: Title[];
  recommended: Title[];
  continue_watching: Progress[];
  new_releases: Title[];
  popular_by_genre: Record<string, Title[]>;
}

export interface SearchSuggestion {
  title: string;
  type: "title" | "person" | "genre";
  id: string;
  image_url?: string;
}

/* ══════════════════════════════════════════════════════════════
   ADMIN
   ══════════════════════════════════════════════════════════════ */

export interface CreateTitleRequest {
  type: TitleType;
  name: string;
  original_name?: string;
  overview?: string;
  tagline?: string;
  release_year?: number;
  release_date?: string;
  runtime_minutes?: number;
  origin_countries?: string[];
  spoken_languages?: string[];
  content_rating?: string;
  is_adult?: boolean;
  imdb_id?: string;
  tmdb_id?: number;
}

export interface UpdateTitleRequest extends Partial<CreateTitleRequest> {
  status?: TitleStatus;
}

export interface UploadUrlRequest {
  key: string;
  content_type: string;
  public?: boolean;
  expires_in?: number;
}

export interface UploadUrlResponse {
  upload_url: string;
  key: string;
  expires_at: string;
}

export interface AnalyticsSummary {
  total_users: number;
  active_users?: number;
  active_users_24h: number;
  total_titles: number;
  total_views_24h: number;
  views_24h?: number;
  total_downloads_24h: number;
  revenue_mtd?: number;
  users_change?: number;
  titles_change?: number;
  views_change?: number;
  downloads_change?: number;
  revenue_change?: number;
  popular_titles: Array<{
    title: Title;
    view_count: number;
  }>;
}

/* ══════════════════════════════════════════════════════════════
   SESSIONS & DEVICES
   ══════════════════════════════════════════════════════════════ */

export interface UserSession {
  id: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  location?: string;
  created_at: string;
  last_activity_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  device_type: string;
  os?: string;
  browser?: string;
  last_ip?: string;
  last_seen_at: string;
  created_at: string;
}

/* ══════════════════════════════════════════════════════════════
   PAGINATION & COMMON
   ══════════════════════════════════════════════════════════════ */

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}

export interface SuccessResponse {
  message: string;
  success: boolean;
}

/* ══════════════════════════════════════════════════════════════
   TITLE AVAILABILITY
   ══════════════════════════════════════════════════════════════ */

export interface AvailabilityWindow {
  id: string;
  title_id: string;
  start_date: string;
  end_date: string;
  regions: string[];
  is_active: boolean;
  window_type?: 'theatrical' | 'streaming' | 'download' | 'all';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAvailabilityWindowRequest {
  start_date: string;
  end_date?: string;
  regions: string[];
  window_type?: 'theatrical' | 'streaming' | 'download' | 'all';
  is_active?: boolean;
  notes?: string;
}

export interface UpdateAvailabilityWindowRequest {
  start_date?: string;
  end_date?: string;
  regions?: string[];
  window_type?: 'theatrical' | 'streaming' | 'download' | 'all';
  is_active?: boolean;
  notes?: string;
}

/* ══════════════════════════════════════════════════════════════
   STREAM VARIANTS (Extended)
   ══════════════════════════════════════════════════════════════ */

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
  total_bandwidth: number;
  average_watch_time: number;
  cost_per_view: number;
  completion_rate: number;
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

export interface TitleVariantAnalytics {
  quality_distribution: any[];
  bandwidth_usage: any[];
  total_views: number;
  most_popular_quality: string;
  total_storage_used: number;
  avg_bitrate: number;
  quality_breakdown?: any[];
}

/* ══════════════════════════════════════════════════════════════
   ASSETS (Artwork, Subtitles, Trailers)
   ══════════════════════════════════════════════════════════════ */

export interface Artwork {
  id: string;
  title_id: string;
  type: 'poster' | 'banner' | 'thumbnail' | 'backdrop' | 'logo';
  url: string;
  cdn_url: string;
  width: number;
  height: number;
  file_size: number;
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
  name: string;
  url: string;
  cdn_url: string;
  hls_manifest_url?: string;
  duration: number;
  quality: '480p' | '720p' | '1080p' | '4K';
  file_size: number;
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

/* ══════════════════════════════════════════════════════════════
   MONETIZATION
   ══════════════════════════════════════════════════════════════ */

export interface AdConfig {
  id: string;
  ad_type: 'pre-roll' | 'mid-roll' | 'pause' | 'post-roll';
  ad_url: string;
  frequency: number;
  duration?: number;
  enabled: boolean;
  skip_after?: number;
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
  redirect_url: string;
  wait_time: number;
  quality?: '480p' | '720p' | '1080p';
  content_type?: 'movie' | 'series' | 'anime' | 'documentary';
  is_active: boolean;
  click_count: number;
  conversion_count: number;
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
  price: number;
  currency: string;
  interval: 'month' | 'year';
  interval_count: number;
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
  discount_value: number;
  currency?: string;
  max_uses?: number;
  current_uses: number;
  valid_from?: string;
  expires_at?: string;
  applies_to_plans?: string[];
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
  ctr: number;
  total_revenue: number;
  ecpm: number;
  completion_rate: number;
  skip_rate: number;
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

/* ══════════════════════════════════════════════════════════════
   ADVANCED ANALYTICS
   ══════════════════════════════════════════════════════════════ */

export interface QualityAnalytics {
  quality_distribution: Array<{
    quality: '480p' | '720p' | '1080p' | '4K';
    count: number;
    percentage: number;
    total_views: number;
  }>;
  bandwidth_by_quality: Array<{
    quality: string;
    bandwidth: number;
    cost: number;
  }>;
  user_preferences: {
    most_selected: '480p' | '720p' | '1080p' | '4K';
    upgrade_rate: number;
    downgrade_rate: number;
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
    free_users: number;
    premium_users: number;
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
    hour: number;
    day_of_week: number;
    count: number;
  }>;
  completion_rate: number;
  failed_downloads: number;
  average_download_time: number;
}

export interface RealTimeMetrics {
  active_streams: number;
  active_downloads: number;
  concurrent_users: number;
  bandwidth_usage: number;
  error_rate: number;
  average_buffer_time: number;
  server_health: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: number;
  };
  cdn_performance: {
    hit_ratio: number;
    miss_ratio: number;
    cache_size: number;
    bandwidth_saved: number;
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
  cost_per_hour: number;
  cost_per_gb: number;
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
    os: string;
    version?: string;
    count: number;
    percentage: number;
  }>;
  browser_distribution: Array<{
    browser: string;
    version?: string;
    count: number;
    percentage: number;
  }>;
  screen_resolutions: Array<{
    resolution: string;
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
    user_growth: number;
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

/* ══════════════════════════════════════════════════════════════
   SERIES & ANIME (Extended)
   ══════════════════════════════════════════════════════════════ */

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
  manga_chapters?: string;
  is_filler: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAnimeArcRequest {
  anime_id: string;
  name: string;
  description?: string;
  arc_type: 'canon' | 'filler' | 'mixed';
  start_episode: number;
  end_episode: number;
  manga_chapters?: string;
  is_filler?: boolean;
}

export interface AnimeArcFilterParams {
  anime_id?: string;
  arc_type?: 'canon' | 'filler' | 'mixed';
  limit?: number;
  offset?: number;
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
  language: string;
  language_name: string;
  url: string;
  cdn_url: string;
  format: 'aac' | 'mp3' | 'flac' | 'opus';
  bitrate: number;
  channels: number;
  sample_rate: number;
  file_size: number;
  is_default: boolean;
  is_descriptive_audio: boolean;
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

/* ══════════════════════════════════════════════════════════════
   COMPLIANCE
   ══════════════════════════════════════════════════════════════ */

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
  rating: string;
  rating_system: string;
  region: string;
  certification_body: string;
  descriptors: string[];
  certified_date?: string;
  certificate_url?: string;
  age_restriction?: number;
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

/* ══════════════════════════════════════════════════════════════
   USER MANAGEMENT (Extended)
   ══════════════════════════════════════════════════════════════ */

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
  total_watch_time?: number;
  total_downloads?: number;
}

export interface BanUserRequest {
  reason: string;
  duration?: number;
  notify_user?: boolean;
}

export interface UnbanUserRequest {
  reason?: string;
  notify_user?: boolean;
}

/* ══════════════════════════════════════════════════════════════
   PERMISSIONS & RBAC
   ══════════════════════════════════════════════════════════════ */

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  user_count: number;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
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

/* ══════════════════════════════════════════════════════════════
   ANIME DISCOVERY
   ══════════════════════════════════════════════════════════════ */

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
  air_time?: string;
  broadcast_day?: string;
}

/* ══════════════════════════════════════════════════════════════
   SCHEDULE
   ══════════════════════════════════════════════════════════════ */

export interface ReleaseSchedule {
  date: string;
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

/* ══════════════════════════════════════════════════════════════
   USER DATA EXPORT
   ══════════════════════════════════════════════════════════════ */

export interface DataExportRequest {
  export_type: 'full' | 'watch_history' | 'downloads' | 'subscriptions' | 'profile';
  format: 'json' | 'csv' | 'pdf';
  include_media?: boolean;
}

export interface DataExportResponse {
  export_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  expires_at?: string;
  file_size?: number;
  created_at: string;
}

/* ══════════════════════════════════════════════════════════════
   CDN MANAGEMENT
   ══════════════════════════════════════════════════════════════ */

export interface CDNStats {
  total_bandwidth: number;
  cache_hit_ratio: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number;
  bandwidth_by_region: Array<{
    region: string;
    bandwidth: number;
    requests: number;
  }>;
}

export interface SignedCookieRequest {
  resource_path: string;
  expiration: number;
}

export interface SignedCookieResponse {
  cookie_name: string;
  cookie_value: string;
  domain: string;
  path: string;
  expires: string;
}

/* ══════════════════════════════════════════════════════════════
   MEDIA UPLOADS
   ══════════════════════════════════════════════════════════════ */

export interface UploadSession {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  content_type: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
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
  chunk_size?: number;
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

/* ══════════════════════════════════════════════════════════════
   QUERY PARAMETER TYPES
   ══════════════════════════════════════════════════════════════ */

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/* ══════════════════════════════════════════════════════════════
   ADDITIONAL ADMIN & ANALYTICS TYPES
   ══════════════════════════════════════════════════════════════ */

export interface RegionalAvailability {
  region: string;
  country_code: string;
  is_available: boolean;
  release_date?: string;
  restrictions?: string[];
}

export interface AdminQualityControls {
  titleId: string;
  auto_quality_enabled: boolean;
  force_quality?: QualityTier;
  max_quality?: QualityTier;
  min_quality?: QualityTier;
}

export interface FallbackTestResult {
  success: boolean;
  tested_qualities: QualityTier[];
  fallback_chain: QualityTier[];
  errors?: string[];
}

export interface CacheInvalidationRequest {
  paths: string[];
  pattern?: string;
}

export interface CDNInvalidationResult {
  invalidation_id: string;
  status: 'in_progress' | 'completed' | 'failed';
  paths: string[];
  created_at: string;
}

export interface AssetValidationRequest {
  asset_id: string;
  check_accessibility: boolean;
  check_integrity: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  asset_id: string;
  checked_at: string;
}

export interface RedirectVerificationResult {
  url: string;
  is_valid: boolean;
  status_code: number;
  redirect_chain: string[];
  final_url: string;
  errors?: string[];
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  stripe_price_id?: string;
}

export interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  cancelled_subscriptions: number;
  total_revenue: number;
  mrr: number;
  churn_rate: number;
}

export interface SubscriptionFilterParams {
  status?: 'active' | 'trial' | 'cancelled' | 'expired';
  plan_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface GrantTrialRequest {
  user_id: string;
  duration_days: number;
  plan_id: string;
}

export interface ExtendSubscriptionRequest {
  subscription_id: string;
  extension_days: number;
  reason?: string;
}

export interface QualityUsageAnalytics {
  quality: QualityTier;
  total_views: number;
  total_bandwidth: number;
  unique_users: number;
  average_bitrate: number;
  completion_rate: number;
  quality_distribution: Array<{
    quality: QualityTier;
    count: number;
    total_views: number;
    percentage: number;
  }>;
  user_preferences: {
    most_selected: QualityTier;
    upgrade_rate: number;
    downgrade_rate: number;
  };
  bandwidth_by_quality: Array<{
    quality: QualityTier;
    bandwidth: number;
    cost: number;
  }>;
  quality_by_content_type: Array<{
    content_type: string;
    quality_breakdown: Record<string, number>;
  }>;
  quality_by_device: Array<{
    device_type: string;
    quality_breakdown: Record<string, number>;
  }>;
}

export interface QualityOverrideAnalytics {
  title_id: string;
  title_name: string;
  override_count: number;
  most_common_override: QualityTier;
  reasons: string[];
}

export interface CostOptimizationAnalytics {
  total_bandwidth_cost: number;
  cost_by_quality: Record<QualityTier, number>;
  optimization_suggestions: string[];
  potential_savings: number;
}

export interface UserQualityPreferences {
  user_id: string;
  preferred_quality: QualityTier;
  auto_quality_enabled: boolean;
  data_saver_mode: boolean;
}

export interface TitlePerformance {
  title_id: string;
  title_name: string;
  total_views: number;
  unique_viewers: number;
  total_watch_time: number;
  average_completion_rate: number;
  revenue: number;
}

export interface CostAnalyticsDashboard {
  total_cost: number;
  bandwidth_cost: number;
  storage_cost: number;
  cdn_cost: number;
  compute_cost: number;
  other_costs: number;
  projected_monthly_cost: number;
  cost_per_user: number;
  cost_per_gb: number;
  cost_per_hour: number;
  cost_trend: Array<{
    date: string;
    cost: number;
  }>;
  cost_trends: Array<{
    date: string;
    storage: number;
    bandwidth: number;
    compute: number;
    cdn: number;
    total: number;
  }>;
  cost_by_service: Array<{
    service: string;
    cost: number;
    percentage: number;
  }>;
  optimization_recommendations: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    potential_savings: number;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    priority: number;
  }>;
}

export interface AnalyticsDashboard {
  overview: AnalyticsSummary;
  quality_usage: QualityUsageAnalytics[];
  top_titles: TitlePerformance[];
  revenue_metrics: SubscriptionStats;
  cost_metrics: CostAnalyticsDashboard;
}

export interface BulkArcStatusUpdate {
  arc_ids: string[];
  is_filler: boolean;
}

export interface AudioTrackUpload {
  language: string;
  label: string;
  file: File;
  is_default?: boolean;
}

/* ══════════════════════════════════════════════════════════════
   MISSING TYPES - Stub exports for services.ts
   ══════════════════════════════════════════════════════════════ */

export type AudioTrackProcessing = any;
export type AudioTrackProcessingStatus = any;
export type Certification = any;
export type ComplianceFlags = any;
export type UserSearchParams = any;
export type AdminPasswordResetRequest = any;
export type CreatePermissionGroupRequest = any;
export type PermissionGroup = any;
export type AssignPermissionsRequest = any;
export type UserPermissions = any;
export type GrantPermissionRequest = any;
export type AssignGroupRequest = any;
export type RemoveGroupRequest = any;
export type EffectivePermissions = any;
export type ScheduledRelease = any;
export type ScheduledEpisode = any;
export type MediaUploadFilterParams = any;
export type MediaUpload = any;
export type UploadProgress = any;
export type ProcessingLog = any;
export type UploadStatistics = any;
