// lib/api/services.ts
/**
 * =============================================================================
 * API Services - Type-safe service layer for all backend operations
 * =============================================================================
 * Wraps fetchJson with typed methods for each endpoint category.
 */

import { fetchJson, fetchJsonWithMeta, withIdempotency } from "./client";
import { ENDPOINTS } from "./endpoints";
import type * as T from "./types";

/* ══════════════════════════════════════════════════════════════
   AUTH SERVICES
   ══════════════════════════════════════════════════════════════ */

export const authService = {
  /**
   * Login with email and password
   */
  login: async (data: T.LoginRequest) =>
    fetchJson<T.LoginResponse>(ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      json: data,
      ...withIdempotency(),
    }),

  /**
   * Register a new user
   */
  signup: async (data: T.SignupRequest) =>
    fetchJson<T.LoginResponse>(ENDPOINTS.AUTH.SIGNUP, {
      method: "POST",
      json: data,
      ...withIdempotency(),
    }),

  /**
   * Logout current session
   */
  logout: async () =>
    fetchJson<void>(ENDPOINTS.AUTH.LOGOUT, {
      method: "POST",
    }),

  /**
   * Refresh access token (uses HTTP-only refresh cookie)
   */
  refresh: async () =>
    fetchJson<T.TokenRefreshResponse>(ENDPOINTS.AUTH.REFRESH, {
      method: "POST",
    }),

  /**
   * Get current authenticated user
   */
  me: async () => fetchJson<T.User>(ENDPOINTS.AUTH.ME),

  /**
   * Verify MFA code
   */
  verifyMfa: async (code: string, challengeToken: string) =>
    fetchJson<T.LoginResponse>(ENDPOINTS.AUTH.MFA_VERIFY, {
      method: "POST",
      json: { code, challenge_token: challengeToken },
      ...withIdempotency(),
    }),

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string) =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.AUTH.PASSWORD_CHANGE, {
      method: "POST",
      json: { current_password: currentPassword, new_password: newPassword },
    }),

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string) =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST, {
      method: "POST",
      json: { email },
      ...withIdempotency(),
    }),

  /**
   * Confirm password reset with token
   */
  confirmPasswordReset: async (token: string, newPassword: string) =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, {
      method: "POST",
      json: { token, new_password: newPassword },
      ...withIdempotency(),
    }),

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string) =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.AUTH.EMAIL_VERIFY, {
      method: "POST",
      json: { token },
    }),

  /**
   * Resend email verification
   */
  resendEmailVerification: async () =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.AUTH.EMAIL_RESEND, {
      method: "POST",
    }),
};

/* ══════════════════════════════════════════════════════════════
   USER SERVICES
   ══════════════════════════════════════════════════════════════ */

export const userService = {
  /**
   * Get current user profile
   */
  getMe: async () => fetchJson<T.User>(ENDPOINTS.USER.ME),

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<T.User>) =>
    fetchJson<T.User>(ENDPOINTS.USER.ME, {
      method: "PATCH",
      json: data,
    }),

  /**
   * Get user sessions
   */
  getSessions: async () =>
    fetchJson<T.UserSession[]>(ENDPOINTS.USER.SESSIONS),

  /**
   * Revoke a specific session
   */
  revokeSession: async (sessionId: string) =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.USER.SESSION_REVOKE(sessionId), {
      method: "DELETE",
    }),

  /**
   * Get user devices
   */
  getDevices: async () =>
    fetchJson<T.Device[]>(ENDPOINTS.USER.DEVICES),

  /**
   * Remove a device
   */
  removeDevice: async (deviceId: string) =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.USER.DEVICE_REMOVE(deviceId), {
      method: "DELETE",
    }),
};

/* ══════════════════════════════════════════════════════════════
   PROFILE SERVICES
   ══════════════════════════════════════════════════════════════ */

export const profileService = {
  /**
   * List all profiles for current user
   */
  list: async () => fetchJson<T.Profile[]>(ENDPOINTS.PROFILES.LIST),

  /**
   * Create a new profile
   */
  create: async (data: Partial<T.Profile>) =>
    fetchJson<T.Profile>(ENDPOINTS.PROFILES.CREATE, {
      method: "POST",
      json: data,
    }),

  /**
   * Get profile by ID
   */
  get: async (id: string) => fetchJson<T.Profile>(ENDPOINTS.PROFILES.GET(id)),

  /**
   * Update profile
   */
  update: async (id: string, data: Partial<T.Profile>) =>
    fetchJson<T.Profile>(ENDPOINTS.PROFILES.UPDATE(id), {
      method: "PATCH",
      json: data,
    }),

  /**
   * Delete profile
   */
  delete: async (id: string) =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.PROFILES.DELETE(id), {
      method: "DELETE",
    }),
};

/* ══════════════════════════════════════════════════════════════
   DISCOVERY SERVICES
   ══════════════════════════════════════════════════════════════ */

export const discoveryService = {
  /**
   * Get home page data (trending, recommended, continue watching)
   */
  getHome: async () => fetchJson<T.HomePageData>(ENDPOINTS.DISCOVERY.HOME),

  /**
   * Browse titles with filters and pagination
   */
  browse: async (params?: T.DiscoveryParams) =>
    fetchJson<T.TitleListResponse>(ENDPOINTS.DISCOVERY.BROWSE, {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  /**
   * Search titles
   */
  search: async (query: string, params?: Omit<T.DiscoveryParams, "q">) =>
    fetchJson<T.TitleListResponse>(ENDPOINTS.DISCOVERY.SEARCH, {
      searchParams: { q: query, ...params } as Record<string, string | number | boolean>,
    }),

  /**
   * Get search suggestions
   */
  getSuggestions: async (query: string) =>
    fetchJson<T.SearchSuggestion[]>(ENDPOINTS.DISCOVERY.SUGGESTIONS, {
      searchParams: { q: query },
    }),

  /**
   * Get title by ID
   */
  getTitle: async (id: string) =>
    fetchJson<T.Title>(ENDPOINTS.DISCOVERY.TITLE_DETAIL(id)),

  /**
   * Get title by slug
   */
  getTitleBySlug: async (slug: string) =>
    fetchJson<T.Title>(ENDPOINTS.DISCOVERY.TITLE_BY_SLUG(slug)),

  /**
   * Get seasons for a title
   */
  getSeasons: async (titleId: string) =>
    fetchJson<T.Season[]>(ENDPOINTS.DISCOVERY.TITLE_SEASONS(titleId)),

  /**
   * Get season detail
   */
  getSeason: async (titleId: string, seasonNumber: number) =>
    fetchJson<T.Season>(ENDPOINTS.DISCOVERY.SEASON_DETAIL(titleId, seasonNumber)),

  /**
   * Get episode detail
   */
  getEpisode: async (titleId: string, seasonNumber: number, episodeNumber: number) =>
    fetchJson<T.Episode>(
      ENDPOINTS.DISCOVERY.EPISODE_DETAIL(titleId, seasonNumber, episodeNumber)
    ),

  /**
   * Get all genres
   */
  getGenres: async () => fetchJson<T.Genre[]>(ENDPOINTS.DISCOVERY.GENRES),

  /**
   * Get titles by genre
   */
  getTitlesByGenre: async (genreSlug: string, params?: T.DiscoveryParams) =>
    fetchJson<T.TitleListResponse>(ENDPOINTS.DISCOVERY.GENRE_TITLES(genreSlug), {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  /**
   * Get trending titles
   */
  getTrending: async (limit?: number) =>
    fetchJson<T.Title[]>(ENDPOINTS.DISCOVERY.TRENDING, {
      searchParams: limit ? { limit } : undefined,
    }),

  /**
   * Get popular titles
   */
  getPopular: async (limit?: number) =>
    fetchJson<T.Title[]>(ENDPOINTS.DISCOVERY.POPULAR, {
      searchParams: limit ? { limit } : undefined,
    }),

  /**
   * Get new releases
   */
  getNewReleases: async (limit?: number) =>
    fetchJson<T.Title[]>(ENDPOINTS.DISCOVERY.NEW_RELEASES, {
      searchParams: limit ? { limit } : undefined,
    }),

  /**
   * Get upcoming releases (schedule)
   */
  getUpcoming: async () =>
    fetchJson<T.Title[]>(ENDPOINTS.DISCOVERY.UPCOMING),
};

/* ══════════════════════════════════════════════════════════════
   PLAYBACK SERVICES
   ══════════════════════════════════════════════════════════════ */

export const playbackService = {
  /**
   * Start a playback session (returns presigned HLS/DASH manifest URL)
   */
  startSession: async (request: T.PlaybackSessionRequest) =>
    fetchJson<T.PlaybackSession>(ENDPOINTS.PLAYBACK.START_SESSION, {
      method: "POST",
      json: request,
    }),

  /**
   * Send heartbeat to keep session alive and track progress
   */
  heartbeat: async (sessionId: string, data: Omit<T.PlaybackHeartbeat, "session_id">) =>
    fetchJson<void>(ENDPOINTS.PLAYBACK.SESSION_HEARTBEAT(sessionId), {
      method: "POST",
      json: data,
    }),

  /**
   * End playback session
   */
  endSession: async (sessionId: string, finalTimeSeconds: number) =>
    fetchJson<void>(ENDPOINTS.PLAYBACK.SESSION_END(sessionId), {
      method: "POST",
      json: { current_time_seconds: finalTimeSeconds },
    }),

  /**
   * Get episode markers (intro, credits, etc.)
   */
  getMarkers: async (episodeId: string) =>
    fetchJson<T.SceneMarker[]>(ENDPOINTS.PLAYBACK.MARKERS(episodeId)),
};

/* ══════════════════════════════════════════════════════════════
   WATCHLIST SERVICES
   ══════════════════════════════════════════════════════════════ */

export const watchlistService = {
  /**
   * Get user's watchlist
   */
  get: async () => fetchJson<T.WatchlistItem[]>(ENDPOINTS.USER.WATCHLIST),

  /**
   * Add title to watchlist
   */
  add: async (titleId: string) =>
    fetchJson<T.WatchlistItem>(ENDPOINTS.USER.WATCHLIST_ADD, {
      method: "POST",
      json: { title_id: titleId },
    }),

  /**
   * Remove title from watchlist
   */
  remove: async (itemId: string) =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.USER.WATCHLIST_REMOVE(itemId), {
      method: "DELETE",
    }),
};

/* ══════════════════════════════════════════════════════════════
   PROGRESS SERVICES
   ══════════════════════════════════════════════════════════════ */

export const progressService = {
  /**
   * Get watch progress for all titles
   */
  getAll: async () => fetchJson<T.Progress[]>(ENDPOINTS.USER.PROGRESS),

  /**
   * Get watch history
   */
  getHistory: async (page = 1, pageSize = 20) =>
    fetchJson<T.PaginatedResponse<T.Progress>>(ENDPOINTS.USER.HISTORY, {
      searchParams: { page, page_size: pageSize },
    }),

  /**
   * Update watch progress
   */
  update: async (id: string, progressSeconds: number, completed: boolean = false) =>
    fetchJson<T.Progress>(ENDPOINTS.USER.PROGRESS_UPDATE(id), {
      method: "PATCH",
      json: { progress_seconds: progressSeconds, completed },
    }),
};

/* ══════════════════════════════════════════════════════════════
   DOWNLOAD SERVICES
   ══════════════════════════════════════════════════════════════ */

export const downloadService = {
  /**
   * Get user's downloads
   */
  getAll: async () => fetchJson<T.Download[]>(ENDPOINTS.USER.DOWNLOADS),

  /**
   * Request a new download (returns presigned S3 URL)
   */
  request: async (titleId: string, episodeId?: string, quality: T.QualityTier = "720p") =>
    fetchJson<T.Download>(ENDPOINTS.USER.DOWNLOAD_REQUEST, {
      method: "POST",
      json: { title_id: titleId, episode_id: episodeId, quality },
    }),

  /**
   * Get available bundles
   */
  getBundles: async () => fetchJson<T.Bundle[]>(ENDPOINTS.DOWNLOADS.BUNDLES),

  /**
   * Get bundle detail
   */
  getBundle: async (id: string) =>
    fetchJson<T.Bundle>(ENDPOINTS.DOWNLOADS.BUNDLE_DETAIL(id)),

  /**
   * Get season bundle download URL
   */
  getSeasonBundle: async (titleId: string, seasonNumber: number) =>
    fetchJson<T.Bundle>(ENDPOINTS.DOWNLOADS.SEASON_BUNDLE(titleId, seasonNumber)),

  /**
   * Get download URL for a bundle
   */
  getBundleDownloadUrl: async (bundleId: string) =>
    fetchJson<{ download_url: string; expires_at: string }>(
      ENDPOINTS.DOWNLOADS.BUNDLE_DOWNLOAD_URL(bundleId)
    ),
};

/* ══════════════════════════════════════════════════════════════
   REVIEW SERVICES
   ══════════════════════════════════════════════════════════════ */

export const reviewService = {
  /**
   * Get reviews for a title
   */
  getByTitle: async (titleId: string, page = 1, pageSize = 20) =>
    fetchJson<T.PaginatedResponse<T.Review>>(ENDPOINTS.REVIEWS.TITLE_REVIEWS(titleId), {
      searchParams: { page, page_size: pageSize },
    }),

  /**
   * Create a review
   */
  create: async (titleId: string, data: Partial<T.Review>) =>
    fetchJson<T.Review>(ENDPOINTS.REVIEWS.CREATE_REVIEW(titleId), {
      method: "POST",
      json: data,
    }),

  /**
   * Update a review
   */
  update: async (titleId: string, reviewId: string, data: Partial<T.Review>) =>
    fetchJson<T.Review>(ENDPOINTS.REVIEWS.UPDATE_REVIEW(titleId, reviewId), {
      method: "PATCH",
      json: data,
    }),

  /**
   * Delete a review
   */
  delete: async (titleId: string, reviewId: string) =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.REVIEWS.DELETE_REVIEW(titleId, reviewId), {
      method: "DELETE",
    }),
};

/* ══════════════════════════════════════════════════════════════
   ADMIN SERVICES
   ══════════════════════════════════════════════════════════════ */

export const adminService = {
  /**
   * Get analytics summary
   */
  getAnalyticsSummary: async () =>
    fetchJson<T.AnalyticsSummary>(ENDPOINTS.ADMIN.ANALYTICS_SUMMARY),

  /**
   * Create a new title
   */
  createTitle: async (data: T.CreateTitleRequest) =>
    fetchJson<T.Title>(ENDPOINTS.ADMIN.TITLE_CREATE, {
      method: "POST",
      json: data,
    }),

  /**
   * Update a title
   */
  updateTitle: async (id: string, data: T.UpdateTitleRequest) =>
    fetchJson<T.Title>(ENDPOINTS.ADMIN.TITLE_UPDATE(id), {
      method: "PATCH",
      json: data,
    }),

  /**
   * Delete a title
   */
  deleteTitle: async (id: string) =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.ADMIN.TITLE_DELETE(id), {
      method: "DELETE",
    }),

  /**
   * Request presigned upload URL for S3
   */
  requestUploadUrl: async (data: T.UploadUrlRequest) =>
    fetchJson<T.UploadUrlResponse>(ENDPOINTS.ADMIN.UPLOAD_URL_REQUEST, {
      method: "POST",
      json: data,
    }),

  /**
   * Mark asset upload as complete
   */
  completeUpload: async (assetId: string, metadata?: Record<string, unknown>) =>
    fetchJson<T.MediaAsset>(ENDPOINTS.ADMIN.UPLOAD_COMPLETE(assetId), {
      method: "POST",
      json: metadata || {},
    }),

  /**
   * Upload poster for a title (returns presigned URL)
   */
  uploadPoster: async (titleId: string, contentType: string) =>
    fetchJson<T.UploadUrlResponse>(ENDPOINTS.ADMIN.POSTER_UPLOAD(titleId), {
      method: "POST",
      json: { content_type: contentType },
    }),

  /**
   * Upload backdrop for a title (returns presigned URL)
   */
  uploadBackdrop: async (titleId: string, contentType: string) =>
    fetchJson<T.UploadUrlResponse>(ENDPOINTS.ADMIN.BACKDROP_UPLOAD(titleId), {
      method: "POST",
      json: { content_type: contentType },
    }),

  /**
   * Create stream variant
   */
  createVariant: async (assetId: string, data: Partial<T.StreamVariant>) =>
    fetchJson<T.StreamVariant>(ENDPOINTS.ADMIN.VARIANT_CREATE(assetId), {
      method: "POST",
      json: data,
    }),

  /**
   * Create bundle
   */
  createBundle: async (data: Partial<T.Bundle>) =>
    fetchJson<T.Bundle>(ENDPOINTS.ADMIN.BUNDLE_CREATE, {
      method: "POST",
      json: data,
    }),

  /**
   * Build/rebuild a bundle
   */
  buildBundle: async (bundleId: string) =>
    fetchJson<T.Bundle>(ENDPOINTS.ADMIN.BUNDLE_BUILD(bundleId), {
      method: "POST",
    }),

  /**
   * Get all genres
   */
  getGenres: async () => fetchJson<T.Genre[]>(ENDPOINTS.ADMIN.GENRES),

  /**
   * Create genre
   */
  createGenre: async (data: Partial<T.Genre>) =>
    fetchJson<T.Genre>(ENDPOINTS.ADMIN.GENRE_CREATE, {
      method: "POST",
      json: data,
    }),

  /**
   * Update genre
   */
  updateGenre: async (id: string, data: Partial<T.Genre>) =>
    fetchJson<T.Genre>(ENDPOINTS.ADMIN.GENRE_UPDATE(id), {
      method: "PATCH",
      json: data,
    }),
};

/* ══════════════════════════════════════════════════════════════
   HEALTH SERVICES
   ══════════════════════════════════════════════════════════════ */

export const healthService = {
  /**
   * Check API liveness
   */
  checkLiveness: async () => fetchJson<{ status: string }>(ENDPOINTS.HEALTH.LIVENESS),

  /**
   * Check API readiness
   */
  checkReadiness: async () => fetchJson<{ status: string }>(ENDPOINTS.HEALTH.READINESS),
};

/* ══════════════════════════════════════════════════════════════
   EXPORT ALL SERVICES
   ══════════════════════════════════════════════════════════════ */

export const api = {
  auth: authService,
  user: userService,
  profiles: profileService,
  discovery: discoveryService,
  playback: playbackService,
  watchlist: watchlistService,
  progress: progressService,
  downloads: downloadService,
  reviews: reviewService,
  admin: adminService,
  health: healthService,
} as const;

export default api;
