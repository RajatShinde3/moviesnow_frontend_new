// lib/api/endpoints.ts
/**
 * =============================================================================
 * API Endpoints - Centralized endpoint paths
 * =============================================================================
 * All backend API endpoints in one place for easy maintenance.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_V1 = `${API_BASE}/api/v1`;

/* ══════════════════════════════════════════════════════════════
   AUTH ENDPOINTS
   ══════════════════════════════════════════════════════════════ */

export const AUTH = {
  LOGIN: `${API_V1}/auth/login`,
  SIGNUP: `${API_V1}/auth/signup`,
  LOGOUT: `${API_V1}/auth/logout`,
  REFRESH: `${API_V1}/auth/refresh`,
  ME: `${API_V1}/auth/me`,

  // MFA
  MFA_ENABLE: `${API_V1}/auth/mfa/enable`,
  MFA_VERIFY: `${API_V1}/auth/mfa/verify`,
  MFA_DISABLE: `${API_V1}/auth/mfa/disable`,
  MFA_RESET: `${API_V1}/auth/mfa/reset`,

  // Password
  PASSWORD_RESET_REQUEST: `${API_V1}/auth/password-reset/request`,
  PASSWORD_RESET_CONFIRM: `${API_V1}/auth/password-reset/confirm`,
  PASSWORD_CHANGE: `${API_V1}/auth/password/change`,

  // Email
  EMAIL_VERIFY: `${API_V1}/auth/email/verify`,
  EMAIL_RESEND: `${API_V1}/auth/email/resend`,

  // Account
  ACCOUNT_DEACTIVATE: `${API_V1}/auth/account/deactivate`,
  ACCOUNT_DELETE: `${API_V1}/auth/account/delete`,
  ACCOUNT_REACTIVATE: `${API_V1}/auth/account/reactivate`,
} as const;

/* ══════════════════════════════════════════════════════════════
   USER ENDPOINTS
   ══════════════════════════════════════════════════════════════ */

export const USER = {
  ME: `${API_V1}/user/me`,
  UPDATE_PROFILE: `${API_V1}/user/me`,

  // Sessions & Devices
  SESSIONS: `${API_V1}/user/sessions`,
  SESSION_REVOKE: (id: string) => `${API_V1}/user/sessions/${id}`,
  DEVICES: `${API_V1}/users/devices`,
  DEVICE_REMOVE: (id: string) => `${API_V1}/users/devices/${id}`,

  // Watchlist
  WATCHLIST: `${API_V1}/user/watchlist`,
  WATCHLIST_ADD: `${API_V1}/user/watchlist`,
  WATCHLIST_REMOVE: (id: string) => `${API_V1}/user/watchlist/${id}`,

  // Watch History
  HISTORY: `${API_V1}/user/history`,
  PROGRESS: `${API_V1}/user/progress`,
  PROGRESS_UPDATE: (id: string) => `${API_V1}/user/progress/${id}`,

  // Downloads
  DOWNLOADS: `${API_V1}/user/downloads`,
  DOWNLOAD_REQUEST: `${API_V1}/user/downloads/request`,
} as const;

/* ══════════════════════════════════════════════════════════════
   PROFILES ENDPOINTS
   ══════════════════════════════════════════════════════════════ */

export const PROFILES = {
  LIST: `${API_V1}/users/profiles`,
  CREATE: `${API_V1}/users/profiles`,
  GET: (id: string) => `${API_V1}/users/profiles/${id}`,
  UPDATE: (id: string) => `${API_V1}/users/profiles/${id}`,
  DELETE: (id: string) => `${API_V1}/users/profiles/${id}`,
} as const;

/* ══════════════════════════════════════════════════════════════
   PUBLIC DISCOVERY ENDPOINTS
   ══════════════════════════════════════════════════════════════ */

export const DISCOVERY = {
  // Home & Browse
  HOME: `${API_V1}/home`,
  BROWSE: `${API_V1}/discovery`,
  SEARCH: `${API_V1}/discovery/search`,
  SUGGESTIONS: `${API_V1}/discovery/suggestions`,

  // Titles
  TITLE_DETAIL: (id: string) => `${API_V1}/titles/${id}`,
  TITLE_BY_SLUG: (slug: string) => `${API_V1}/titles/slug/${slug}`,

  // Seasons & Episodes
  TITLE_SEASONS: (titleId: string) => `${API_V1}/titles/${titleId}/seasons`,
  SEASON_DETAIL: (titleId: string, seasonNumber: number) =>
    `${API_V1}/titles/${titleId}/seasons/${seasonNumber}`,
  EPISODE_DETAIL: (titleId: string, seasonNumber: number, episodeNumber: number) =>
    `${API_V1}/titles/${titleId}/seasons/${seasonNumber}/episodes/${episodeNumber}`,

  // Genres & Categories
  GENRES: `${API_V1}/catalog/genres`,
  GENRE_TITLES: (slug: string) => `${API_V1}/catalog/genres/${slug}/titles`,

  // Trending & Popular
  TRENDING: `${API_V1}/discovery/trending`,
  POPULAR: `${API_V1}/discovery/popular`,
  NEW_RELEASES: `${API_V1}/discovery/new-releases`,

  // Schedule
  SCHEDULE: `${API_V1}/schedule`,
  UPCOMING: `${API_V1}/schedule/upcoming`,
} as const;

/* ══════════════════════════════════════════════════════════════
   PLAYBACK ENDPOINTS
   ══════════════════════════════════════════════════════════════ */

export const PLAYBACK = {
  // Create session
  START_SESSION: `${API_V1}/playback/sessions`,

  // Session management
  SESSION_HEARTBEAT: (sessionId: string) => `${API_V1}/playback/sessions/${sessionId}/heartbeat`,
  SESSION_END: (sessionId: string) => `${API_V1}/playback/sessions/${sessionId}/end`,

  // Markers (intro skip, credits)
  MARKERS: (episodeId: string) => `${API_V1}/markers/episode/${episodeId}`,

  // Presigned URLs for HLS/DASH
  MANIFEST_URL: (assetId: string) => `${API_V1}/delivery/manifest/${assetId}`,
} as const;

/* ══════════════════════════════════════════════════════════════
   DOWNLOADS & BUNDLES ENDPOINTS
   ══════════════════════════════════════════════════════════════ */

export const DOWNLOADS = {
  // Bundles
  BUNDLES: `${API_V1}/bundles`,
  BUNDLE_DETAIL: (id: string) => `${API_V1}/bundles/${id}`,
  BUNDLE_DOWNLOAD_URL: (id: string) => `${API_V1}/bundles/${id}/download`,

  // Season bundles
  SEASON_BUNDLE: (titleId: string, seasonNumber: number) =>
    `${API_V1}/bundles/title/${titleId}/season/${seasonNumber}`,

  // Per-file downloads
  DOWNLOAD_FILE: `${API_V1}/downloads/file`,
  DOWNLOAD_BATCH: `${API_V1}/downloads/batch`,
} as const;

/* ══════════════════════════════════════════════════════════════
   REVIEWS ENDPOINTS
   ══════════════════════════════════════════════════════════════ */

export const REVIEWS = {
  TITLE_REVIEWS: (titleId: string) => `${API_V1}/titles/${titleId}/reviews`,
  CREATE_REVIEW: (titleId: string) => `${API_V1}/titles/${titleId}/reviews`,
  UPDATE_REVIEW: (titleId: string, reviewId: string) =>
    `${API_V1}/titles/${titleId}/reviews/${reviewId}`,
  DELETE_REVIEW: (titleId: string, reviewId: string) =>
    `${API_V1}/titles/${titleId}/reviews/${reviewId}`,
} as const;

/* ══════════════════════════════════════════════════════════════
   ADMIN ENDPOINTS
   ══════════════════════════════════════════════════════════════ */

export const ADMIN = {
  // Analytics
  ANALYTICS_SUMMARY: `${API_V1}/admin/analytics/summary`,
  ANALYTICS_USERS: `${API_V1}/admin/analytics/users`,
  ANALYTICS_CONTENT: `${API_V1}/admin/analytics/content`,

  // Titles Management
  TITLES: `${API_V1}/admin/titles`,
  TITLE_CREATE: `${API_V1}/admin/titles`,
  TITLE_UPDATE: (id: string) => `${API_V1}/admin/titles/${id}`,
  TITLE_DELETE: (id: string) => `${API_V1}/admin/titles/${id}`,

  // Seasons & Episodes
  SEASON_CREATE: (titleId: string) => `${API_V1}/admin/titles/${titleId}/seasons`,
  SEASON_UPDATE: (titleId: string, seasonId: string) =>
    `${API_V1}/admin/titles/${titleId}/seasons/${seasonId}`,
  EPISODE_CREATE: (titleId: string, seasonId: string) =>
    `${API_V1}/admin/titles/${titleId}/seasons/${seasonId}/episodes`,
  EPISODE_UPDATE: (titleId: string, seasonId: string, episodeId: string) =>
    `${API_V1}/admin/titles/${titleId}/seasons/${seasonId}/episodes/${episodeId}`,

  // Media Assets
  ASSETS: `${API_V1}/admin/assets`,
  ASSET_CREATE: `${API_V1}/admin/assets`,
  ASSET_UPDATE: (id: string) => `${API_V1}/admin/assets/${id}`,
  ASSET_DELETE: (id: string) => `${API_V1}/admin/assets/${id}`,

  // Uploads
  UPLOAD_URL_REQUEST: `${API_V1}/admin/assets/upload-url`,
  UPLOAD_COMPLETE: (assetId: string) => `${API_V1}/admin/assets/${assetId}/complete`,

  // Artwork
  ARTWORK_UPLOAD: `${API_V1}/admin/assets/artwork`,
  POSTER_UPLOAD: (titleId: string) => `${API_V1}/admin/assets/titles/${titleId}/poster`,
  BACKDROP_UPLOAD: (titleId: string) => `${API_V1}/admin/assets/titles/${titleId}/backdrop`,

  // Subtitles
  SUBTITLE_UPLOAD: `${API_V1}/admin/assets/subtitles`,

  // Stream Variants
  VARIANT_CREATE: (assetId: string) => `${API_V1}/admin/assets/${assetId}/variants`,
  VARIANT_UPDATE: (assetId: string, variantId: string) =>
    `${API_V1}/admin/assets/${assetId}/variants/${variantId}`,

  // Bundles
  BUNDLE_CREATE: `${API_V1}/admin/bundles`,
  BUNDLE_UPDATE: (id: string) => `${API_V1}/admin/bundles/${id}`,
  BUNDLE_DELETE: (id: string) => `${API_V1}/admin/bundles/${id}`,
  BUNDLE_BUILD: (id: string) => `${API_V1}/admin/bundles/${id}/build`,

  // Genres
  GENRES: `${API_V1}/admin/taxonomy/genres`,
  GENRE_CREATE: `${API_V1}/admin/taxonomy/genres`,
  GENRE_UPDATE: (id: string) => `${API_V1}/admin/taxonomy/genres/${id}`,

  // Users Management
  USERS: `${API_V1}/admin/users`,
  USER_UPDATE: (id: string) => `${API_V1}/admin/users/${id}`,
  USER_DELETE: (id: string) => `${API_V1}/admin/users/${id}`,
} as const;

/* ══════════════════════════════════════════════════════════════
   HEALTH & OBSERVABILITY
   ══════════════════════════════════════════════════════════════ */

export const HEALTH = {
  LIVENESS: `${API_BASE}/healthz`,
  READINESS: `${API_BASE}/readyz`,
  METRICS: `${API_BASE}/metrics`,
} as const;

/* ══════════════════════════════════════════════════════════════
   EXPORT ALL
   ══════════════════════════════════════════════════════════════ */

export const ENDPOINTS = {
  AUTH,
  USER,
  PROFILES,
  DISCOVERY,
  PLAYBACK,
  DOWNLOADS,
  REVIEWS,
  ADMIN,
  HEALTH,
} as const;

export default ENDPOINTS;
