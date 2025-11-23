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
}

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
  resolution?: string;
  codec_video?: string;
  codec_audio?: string;
  manifest_url?: string;
  is_streamable: boolean;
}

export interface Subtitle {
  id: string;
  media_asset_id: string;
  language: string;
  label?: string;
  is_default: boolean;
  is_forced: boolean;
  is_sdh: boolean;
  url?: string;
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
