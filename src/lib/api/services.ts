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

  /**
   * Get all profiles for the current user
   */
  getProfiles: async () =>
    fetchJson<T.Profile[]>(ENDPOINTS.PROFILES.LIST),

  /**
   * Switch to a different profile
   */
  switchProfile: async (profileId: string) =>
    fetchJson<T.SuccessResponse>(ENDPOINTS.PROFILES.GET(profileId), {
      method: "POST",
    }),

  /**
   * Create a new profile
   */
  createProfile: async (data: { name: string; avatar_url?: string }) =>
    fetchJson<T.Profile>(ENDPOINTS.PROFILES.CREATE, {
      method: "POST",
      json: data,
    }),

  /**
   * Get subscription info
   */
  getSubscription: async () =>
    fetchJson<T.Subscription | null>(`${ENDPOINTS.USER.ME}/subscription`).catch(() => null),

  /**
   * Rate a title (like/dislike)
   */
  rateTitle: async (titleId: string, rating: "like" | "dislike") =>
    fetchJson<T.SuccessResponse>(`/api/v1/titles/${titleId}/rate`, {
      method: "POST",
      json: { rating },
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
      ...withIdempotency(),
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

  /**
   * Switch active profile
   */
  switch: async (profileId: string) =>
    fetchJson<T.SuccessResponse>(`${ENDPOINTS.PROFILES.GET(profileId)}/switch`, {
      method: "POST",
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
  search: async (query: string, params?: Omit<T.DiscoveryParams, "q">) => {
    const searchParams: Record<string, string | number | boolean> = { q: query };
    if (params) {
      if (params.type) searchParams.type = params.type;
      if (params.genres) searchParams.genres = params.genres.join(",");
      if (params.year) searchParams.year = params.year;
      if (params.min_rating) searchParams.min_rating = params.min_rating;
      if (params.language) searchParams.language = params.language;
      if (params.sort_by) searchParams.sort_by = params.sort_by;
      if (params.sort_order) searchParams.sort_order = params.sort_order;
      if (params.page) searchParams.page = params.page;
      if (params.page_size) searchParams.page_size = params.page_size;
    }
    return fetchJson<T.TitleListResponse>(ENDPOINTS.DISCOVERY.SEARCH, { searchParams });
  },

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
   TITLE AVAILABILITY SERVICES
   ══════════════════════════════════════════════════════════════ */

export const titleAvailabilityService = {
  /**
   * Get availability windows for a title
   */
  getAvailability: async (titleId: string) =>
    fetchJson<T.AvailabilityWindow[]>(`/api/v1/admin/titles/${titleId}/availability`),

  /**
   * Set availability windows for a title
   */
  setAvailability: async (titleId: string, data: T.AvailabilityWindow[]) =>
    fetchJson<T.AvailabilityWindow[]>(`/api/v1/admin/titles/${titleId}/availability`, {
      method: "PUT",
      json: data,
    }),

  /**
   * Get regional availability for a title
   */
  getRegionalAvailability: async (titleId: string) =>
    fetchJson<T.RegionalAvailability[]>(`/api/v1/admin/titles/${titleId}/availability/regions`),

  /**
   * Set regional availability for a title
   */
  setRegionalAvailability: async (titleId: string, data: T.RegionalAvailability[]) =>
    fetchJson<T.RegionalAvailability[]>(`/api/v1/admin/titles/${titleId}/availability/regions`, {
      method: "PUT",
      json: data,
    }),

  /**
   * List availability windows for a title
   */
  listAvailability: async (titleId: string) =>
    fetchJson<T.AvailabilityWindow[]>(`/api/v1/admin/titles/${titleId}/availability`),

  /**
   * Create availability window for a title
   */
  createAvailability: async (titleId: string, data: T.CreateAvailabilityWindowRequest) =>
    fetchJson<T.AvailabilityWindow>(`/api/v1/admin/titles/${titleId}/availability`, {
      method: "POST",
      json: data,
    }),

  /**
   * Update availability window for a title
   */
  updateAvailability: async (titleId: string, windowId: string, data: T.UpdateAvailabilityWindowRequest) =>
    fetchJson<T.AvailabilityWindow>(`/api/v1/admin/titles/${titleId}/availability/${windowId}`, {
      method: "PATCH",
      json: data,
    }),

  /**
   * Delete availability window for a title
   */
  deleteAvailability: async (titleId: string, windowId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/titles/${titleId}/availability/${windowId}`, {
      method: "DELETE",
    }),
};

/* ══════════════════════════════════════════════════════════════
   STREAM VARIANTS SERVICES
   ══════════════════════════════════════════════════════════════ */

export const streamVariantsService = {
  /**
   * Add stream quality variant
   */
  addVariant: async (titleId: string, data: T.CreateStreamVariantRequest) =>
    fetchJson<T.StreamVariant>(`/api/v1/admin/titles/${titleId}/stream-variants`, {
      method: "POST",
      json: data,
    }),

  /**
   * Bulk add stream variants
   */
  bulkAddVariants: async (titleId: string, data: T.CreateStreamVariantRequest[]) =>
    fetchJson<T.StreamVariant[]>(`/api/v1/admin/titles/${titleId}/stream-variants/bulk`, {
      method: "POST",
      json: data,
    }),

  /**
   * List stream variants for a title
   */
  listVariants: async (titleId: string) =>
    fetchJson<T.StreamVariant[]>(`/api/v1/admin/titles/${titleId}/stream-variants`),

  /**
   * Update stream variant
   */
  updateVariant: async (titleId: string, variantId: string, data: Partial<T.StreamVariant>) =>
    fetchJson<T.StreamVariant>(`/api/v1/admin/titles/${titleId}/stream-variants/${variantId}`, {
      method: "PATCH",
      json: data,
    }),

  /**
   * Get variant analytics (with variantId)
   */
  getVariantAnalytics: async (titleId: string, variantId: string) =>
    fetchJson<T.QualityAnalytics>(`/api/v1/admin/titles/${titleId}/stream-variants/${variantId}/analytics`),

  /**
   * Get all variant analytics for a title
   */
  getTitleVariantAnalytics: async (titleId: string) =>
    fetchJson<{ quality_distribution: any[]; bandwidth_usage: any[] }>(`/api/v1/admin/titles/${titleId}/variants/analytics`),

  /**
   * Admin quality controls
   */
  adminControls: async (titleId: string, variantId: string, data: T.AdminQualityControls) =>
    fetchJson<T.StreamVariant>(`/api/v1/admin/titles/${titleId}/stream-variants/${variantId}/admin-controls`, {
      method: "PATCH",
      json: data,
    }),

  /**
   * Test quality fallback logic
   */
  testFallback: async (titleId: string) =>
    fetchJson<T.FallbackTestResult>(`/api/v1/admin/titles/${titleId}/test-fallback`, {
      method: "POST",
    }),
};

/* ══════════════════════════════════════════════════════════════
   ASSET MANAGEMENT SERVICES
   ══════════════════════════════════════════════════════════════ */

export const assetsService = {
  // Artwork Management
  uploadArtwork: async (data: FormData) =>
    fetchJson<T.Artwork>(`/api/v1/admin/assets/artwork/upload`, {
      method: "POST",
      body: data,
    }),

  getArtwork: async (titleId: string) =>
    fetchJson<T.Artwork[]>(`/api/v1/admin/assets/artwork/${titleId}`),

  updateArtwork: async (artworkId: string, data: Partial<T.Artwork>) =>
    fetchJson<T.Artwork>(`/api/v1/admin/assets/artwork/${artworkId}`, {
      method: "PATCH",
      json: data,
    }),

  deleteArtwork: async (artworkId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/assets/artwork/${artworkId}`, {
      method: "DELETE",
    }),

  // Subtitle Management
  uploadSubtitle: async (data: FormData) =>
    fetchJson<T.Subtitle>(`/api/v1/admin/assets/subtitles/upload`, {
      method: "POST",
      body: data,
    }),

  getSubtitles: async (titleId: string) =>
    fetchJson<T.Subtitle[]>(`/api/v1/admin/assets/subtitles/${titleId}`),

  updateSubtitle: async (subtitleId: string, data: Partial<T.Subtitle>) =>
    fetchJson<T.Subtitle>(`/api/v1/admin/assets/subtitles/${subtitleId}`, {
      method: "PATCH",
      json: data,
    }),

  deleteSubtitle: async (subtitleId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/assets/subtitles/${subtitleId}`, {
      method: "DELETE",
    }),

  // Trailer Management
  uploadTrailer: async (data: FormData) =>
    fetchJson<T.Trailer>(`/api/v1/admin/assets/trailers/upload`, {
      method: "POST",
      body: data,
    }),

  getTrailers: async (titleId: string) =>
    fetchJson<T.Trailer[]>(`/api/v1/admin/assets/trailers/${titleId}`),

  deleteTrailer: async (trailerId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/assets/trailers/${trailerId}`, {
      method: "DELETE",
    }),

  // CDN Management
  invalidateCache: async (data: T.CacheInvalidationRequest) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/assets/cdn/invalidate`, {
      method: "POST",
      json: data,
    }),

  getCdnStats: async () =>
    fetchJson<T.CDNStats>(`/api/v1/admin/assets/cdn/stats`),

  // Asset Validation
  validateAsset: async (data: T.AssetValidationRequest) =>
    fetchJson<T.ValidationResult>(`/api/v1/admin/assets/validation/check`, {
      method: "POST",
      json: data,
    }),

  getValidationStatus: async (assetId: string) =>
    fetchJson<T.ValidationResult>(`/api/v1/admin/assets/validation/${assetId}`),
};

/* ══════════════════════════════════════════════════════════════
   MONETIZATION SERVICES
   ══════════════════════════════════════════════════════════════ */

export const monetizationService = {
  // Ad Configuration
  listAdConfigs: async () =>
    fetchJson<T.AdConfig[]>(`/api/v1/admin/monetization/ads`),

  createAdConfig: async (data: T.CreateAdConfigRequest) =>
    fetchJson<T.AdConfig>(`/api/v1/admin/monetization/ads`, {
      method: "POST",
      json: data,
    }),

  updateAdConfig: async (configId: string, data: Partial<T.AdConfig>) =>
    fetchJson<T.AdConfig>(`/api/v1/admin/monetization/ads/${configId}`, {
      method: "PUT",
      json: data,
    }),

  deleteAdConfig: async (configId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/monetization/ads/${configId}`, {
      method: "DELETE",
    }),

  // Download Redirects
  listDownloadRedirects: async () =>
    fetchJson<T.DownloadRedirect[]>(`/api/v1/admin/monetization/download-redirects`),

  createDownloadRedirect: async (data: T.CreateDownloadRedirectRequest) =>
    fetchJson<T.DownloadRedirect>(`/api/v1/admin/monetization/download-redirects`, {
      method: "POST",
      json: data,
    }),

  updateDownloadRedirect: async (redirectId: string, data: Partial<T.DownloadRedirect>) =>
    fetchJson<T.DownloadRedirect>(`/api/v1/admin/monetization/download-redirects/${redirectId}`, {
      method: "PUT",
      json: data,
    }),

  deleteDownloadRedirect: async (redirectId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/monetization/download-redirects/${redirectId}`, {
      method: "DELETE",
    }),

  verifyRedirect: async (redirectId: string) =>
    fetchJson<T.RedirectVerificationResult>(`/api/v1/admin/monetization/download-redirects/${redirectId}/verify`, {
      method: "POST",
    }),

  // Subscription Plans
  listPlans: async () =>
    fetchJson<T.SubscriptionPlan[]>(`/api/v1/admin/monetization/plans`),

  createPlan: async (data: T.CreateSubscriptionPlanRequest) =>
    fetchJson<T.SubscriptionPlan>(`/api/v1/admin/monetization/plans`, {
      method: "POST",
      json: data,
    }),

  updatePlan: async (planSlug: string, data: Partial<T.SubscriptionPlan>) =>
    fetchJson<T.SubscriptionPlan>(`/api/v1/admin/monetization/plans/${planSlug}`, {
      method: "PUT",
      json: data,
    }),

  deletePlan: async (planSlug: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/monetization/plans/${planSlug}`, {
      method: "DELETE",
    }),

  // Coupons
  listCoupons: async () =>
    fetchJson<T.Coupon[]>(`/api/v1/admin/monetization/coupons`),

  createCoupon: async (data: T.CreateCouponRequest) =>
    fetchJson<T.Coupon>(`/api/v1/admin/monetization/coupons`, {
      method: "POST",
      json: data,
    }),

  updateCoupon: async (couponId: string, data: Partial<T.Coupon>) =>
    fetchJson<T.Coupon>(`/api/v1/admin/monetization/coupons/${couponId}`, {
      method: "PATCH",
      json: data,
    }),

  deleteCoupon: async (couponId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/monetization/coupons/${couponId}`, {
      method: "DELETE",
    }),

  // Subscription Management
  getSubscriptionStats: async () =>
    fetchJson<T.SubscriptionStats>(`/api/v1/admin/monetization/subscriptions/stats`),

  listSubscriptions: async (params?: T.SubscriptionFilterParams) =>
    fetchJson<T.PaginatedResponse<T.Subscription>>(`/api/v1/admin/monetization/subscriptions`, {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  grantTrial: async (subscriptionId: string, data: T.GrantTrialRequest) =>
    fetchJson<T.Subscription>(`/api/v1/admin/monetization/subscriptions/${subscriptionId}/grant-trial`, {
      method: "POST",
      json: data,
    }),

  extendSubscription: async (subscriptionId: string, data: T.ExtendSubscriptionRequest) =>
    fetchJson<T.Subscription>(`/api/v1/admin/monetization/subscriptions/${subscriptionId}/extend`, {
      method: "POST",
      json: data,
    }),

  cancelSubscription: async (subscriptionId: string) =>
    fetchJson<T.Subscription>(`/api/v1/admin/monetization/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
    }),
};

/* ══════════════════════════════════════════════════════════════
   ADVANCED ANALYTICS SERVICES
   ══════════════════════════════════════════════════════════════ */

export const advancedAnalyticsService = {
  // Quality Analytics
  qualityUsage: async () =>
    fetchJson<T.QualityUsageAnalytics>(`/api/v1/admin/analytics/quality/usage`),

  qualityOverrides: async () =>
    fetchJson<T.QualityOverrideAnalytics>(`/api/v1/admin/analytics/quality/overrides`),

  costOptimization: async () =>
    fetchJson<T.CostOptimizationAnalytics>(`/api/v1/admin/analytics/cost/optimization`),

  userPreferences: async (userId: string) =>
    fetchJson<T.UserQualityPreferences>(`/api/v1/admin/analytics/users/${userId}/preferences`),

  // Download Analytics
  downloadAnalytics: async () =>
    fetchJson<T.DownloadAnalytics>(`/api/v1/admin/analytics/downloads`),

  // Device Analytics
  deviceInsights: async () =>
    fetchJson<T.DeviceAnalytics>(`/api/v1/admin/analytics/devices`),

  // Real-Time Metrics
  realTimeMetrics: async () =>
    fetchJson<T.RealTimeMetrics>(`/api/v1/admin/analytics/real-time`),

  // Title Performance
  titlePerformance: async (titleId: string) =>
    fetchJson<T.TitlePerformance>(`/api/v1/admin/analytics/titles/${titleId}/performance`),

  // Cost Analytics Dashboard
  costAnalyticsDashboard: async () =>
    fetchJson<T.CostAnalyticsDashboard>(`/api/v1/admin/cost-analytics/dashboard`),

  // Dashboard Summary
  dashboardSummary: async () =>
    fetchJson<T.AnalyticsDashboard>(`/api/v1/admin/analytics/dashboard`),
};

/* ══════════════════════════════════════════════════════════════
   SERIES & SEASONS SERVICES
   ══════════════════════════════════════════════════════════════ */

export const seriesService = {
  // Season Management
  createSeason: async (titleId: string, data: T.CreateSeasonRequest) =>
    fetchJson<T.Season>(`/api/v1/admin/titles/${titleId}/seasons`, {
      method: "POST",
      json: data,
    }),

  listSeasons: async (titleId: string) =>
    fetchJson<T.Season[]>(`/api/v1/admin/titles/${titleId}/seasons`),

  getSeason: async (seasonId: string) =>
    fetchJson<T.Season>(`/api/v1/admin/seasons/${seasonId}`),

  updateSeason: async (seasonId: string, data: Partial<T.Season>) =>
    fetchJson<T.Season>(`/api/v1/admin/seasons/${seasonId}`, {
      method: "PATCH",
      json: data,
    }),

  deleteSeason: async (seasonId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/seasons/${seasonId}`, {
      method: "DELETE",
    }),

  // Episode Management
  createEpisode: async (seasonId: string, data: T.CreateEpisodeRequest) =>
    fetchJson<T.Episode>(`/api/v1/admin/seasons/${seasonId}/episodes`, {
      method: "POST",
      json: data,
    }),

  listEpisodes: async (seasonId: string) =>
    fetchJson<T.Episode[]>(`/api/v1/admin/seasons/${seasonId}/episodes`),

  getEpisode: async (episodeId: string) =>
    fetchJson<T.Episode>(`/api/v1/admin/episodes/${episodeId}`),

  updateEpisode: async (episodeId: string, data: Partial<T.Episode>) =>
    fetchJson<T.Episode>(`/api/v1/admin/episodes/${episodeId}`, {
      method: "PATCH",
      json: data,
    }),

  deleteEpisode: async (episodeId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/episodes/${episodeId}`, {
      method: "DELETE",
    }),
};

/* ══════════════════════════════════════════════════════════════
   ANIME ARCS SERVICES
   ══════════════════════════════════════════════════════════════ */

export const animeArcsService = {
  createArc: async (data: T.CreateAnimeArcRequest) =>
    fetchJson<T.AnimeArc>(`/api/v1/admin/series/arcs`, {
      method: "POST",
      json: data,
    }),

  listArcs: async (params?: T.AnimeArcFilterParams) =>
    fetchJson<T.AnimeArc[]>(`/api/v1/admin/series/arcs`, {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  getArc: async (arcId: string) =>
    fetchJson<T.AnimeArc>(`/api/v1/admin/series/arcs/${arcId}`),

  updateArc: async (arcId: string, data: Partial<T.AnimeArc>) =>
    fetchJson<T.AnimeArc>(`/api/v1/admin/series/arcs/${arcId}`, {
      method: "PATCH",
      json: data,
    }),

  deleteArc: async (arcId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/series/arcs/${arcId}`, {
      method: "DELETE",
    }),

  getArcEpisodes: async (arcId: string) =>
    fetchJson<T.Episode[]>(`/api/v1/admin/series/arcs/${arcId}/episodes`),

  bulkUpdateStatus: async (data: T.BulkArcStatusUpdate) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/series/arcs/bulk-update-status`, {
      method: "POST",
      json: data,
    }),
};

/* ══════════════════════════════════════════════════════════════
   AUDIO TRACKS SERVICES
   ══════════════════════════════════════════════════════════════ */

export const audioTracksService = {
  uploadTracks: async (data: FormData) =>
    fetchJson<T.AudioTrackUpload>(`/api/v1/admin/audio-tracks/upload`, {
      method: "POST",
      body: data,
    }),

  processTracks: async (uploadId: string) =>
    fetchJson<T.AudioTrackProcessing>(`/api/v1/admin/audio-tracks/process/${uploadId}`, {
      method: "POST",
    }),

  getTitleTracks: async (titleId: string) =>
    fetchJson<T.AudioTrack[]>(`/api/v1/admin/audio-tracks/${titleId}`),

  getSeasonTracks: async (titleId: string, seasonId: string) =>
    fetchJson<T.AudioTrack[]>(`/api/v1/admin/audio-tracks/${titleId}/seasons/${seasonId}`),

  getEpisodeTracks: async (titleId: string, episodeId: string) =>
    fetchJson<T.AudioTrack[]>(`/api/v1/admin/audio-tracks/${titleId}/episodes/${episodeId}`),

  getProcessingStatus: async (uploadId: string) =>
    fetchJson<T.AudioTrackProcessingStatus>(`/api/v1/admin/audio-tracks/processing-status/${uploadId}`),

  deleteBundle: async (bundleId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/audio-tracks/${bundleId}`, {
      method: "DELETE",
    }),

  listTracks: async (titleId: string) =>
    fetchJson<T.AudioTrack[]>(`/api/v1/admin/media/titles/${titleId}/audio-tracks`),

  deleteTrack: async (trackId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/media/audio-tracks/${trackId}`, {
      method: "DELETE",
    }),
};

/* ══════════════════════════════════════════════════════════════
   COMPLIANCE SERVICES
   ══════════════════════════════════════════════════════════════ */

export const complianceService = {
  addCertification: async (titleId: string, data: T.CreateCertificationRequest) =>
    fetchJson<T.Certification>(`/api/v1/admin/taxonomy/titles/${titleId}/certifications`, {
      method: "POST",
      json: data,
    }),

  dmcaTakedown: async (titleId: string, data: T.DMCATakedownRequest) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/taxonomy/titles/${titleId}/dmca`, {
      method: "POST",
      json: data,
    }),

  getComplianceFlags: async () =>
    fetchJson<T.ComplianceFlags>(`/api/v1/admin/compliance/flags`),

  listCertifications: async (params?: { title_id?: string; region?: string; rating_system?: string }) =>
    fetchJson<T.ContentCertification[]>(`/api/v1/admin/compliance/certifications`, {
      searchParams: params as Record<string, string>,
    }),

  getCertification: async (certId: string) =>
    fetchJson<T.ContentCertification>(`/api/v1/admin/compliance/certifications/${certId}`),

  createCertification: async (titleId: string, data: T.CreateCertificationRequest) =>
    fetchJson<T.ContentCertification>(`/api/v1/admin/taxonomy/titles/${titleId}/certifications`, {
      method: "POST",
      json: data,
    }),

  updateCertification: async (titleId: string, certId: string, data: Partial<T.ContentCertification>) =>
    fetchJson<T.ContentCertification>(`/api/v1/admin/taxonomy/titles/${titleId}/certifications/${certId}`, {
      method: "PATCH",
      json: data,
    }),

  deleteCertification: async (titleId: string, certId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/taxonomy/titles/${titleId}/certifications/${certId}`, {
      method: "DELETE",
    }),

  listDMCATakedowns: async (params?: { status?: string; limit?: number }) =>
    fetchJson<T.DMCATakedownRequest[]>(`/api/v1/admin/compliance/dmca`, {
      searchParams: params as Record<string, string | number>,
    }),

  getDMCAStats: async () =>
    fetchJson<{ pending: number; approved: number; rejected: number }>(`/api/v1/admin/compliance/dmca/stats`),

  approveDMCATakedown: async (takedownId: string, notes?: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/compliance/dmca/${takedownId}/approve`, {
      method: "POST",
      json: { notes },
    }),

  rejectDMCATakedown: async (takedownId: string, reason: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/compliance/dmca/${takedownId}/reject`, {
      method: "POST",
      json: { reason },
    }),
};

/* ══════════════════════════════════════════════════════════════
   USER MANAGEMENT SERVICES
   ══════════════════════════════════════════════════════════════ */

export const userManagementService = {
  searchUsers: async (params: T.UserSearchParams) =>
    fetchJson<T.PaginatedResponse<T.User>>(`/api/v1/admin/users`, {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  getUserById: async (userId: string) =>
    fetchJson<T.User>(`/api/v1/admin/users/${userId}`),

  updateUser: async (userId: string, data: Partial<T.User>) =>
    fetchJson<T.User>(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      json: data,
    }),

  deactivateUser: async (userId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/users/${userId}/deactivate`, {
      method: "POST",
    }),

  reactivateUser: async (userId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/users/${userId}/reactivate`, {
      method: "POST",
    }),

  deleteUser: async (userId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/users/${userId}`, {
      method: "DELETE",
    }),

  getUserSessions: async (userId: string) =>
    fetchJson<T.UserSession[]>(`/api/v1/admin/users/${userId}/sessions`),

  adminResetPassword: async (userId: string, data: T.AdminPasswordResetRequest) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/users/${userId}/reset-password-admin`, {
      method: "POST",
      json: data,
    }),
};

/* ══════════════════════════════════════════════════════════════
   PERMISSIONS SERVICES
   ══════════════════════════════════════════════════════════════ */

export const permissionsService = {
  createGroup: async (data: T.CreatePermissionGroupRequest) =>
    fetchJson<T.PermissionGroup>(`/api/v1/admin/permissions/groups`, {
      method: "POST",
      json: data,
    }),

  listGroups: async () =>
    fetchJson<T.PermissionGroup[]>(`/api/v1/admin/permissions/groups`),

  updateGroup: async (groupId: string, data: Partial<T.PermissionGroup>) =>
    fetchJson<T.PermissionGroup>(`/api/v1/admin/permissions/groups/${groupId}`, {
      method: "PATCH",
      json: data,
    }),

  assignPermissions: async (data: T.AssignPermissionsRequest) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/permissions/assign`, {
      method: "POST",
      json: data,
    }),

  getUserPermissions: async (userId: string) =>
    fetchJson<T.UserPermissions>(`/api/v1/admin/permissions/users/${userId}`),

  grantUserPermission: async (userId: string, data: T.GrantPermissionRequest) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/permissions/users/${userId}/grant`, {
      method: "POST",
      json: data,
    }),

  assignUserToGroup: async (userId: string, data: T.AssignGroupRequest) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/permissions/users/${userId}/assign-group`, {
      method: "POST",
      json: data,
    }),

  removeUserFromGroup: async (userId: string, data: T.RemoveGroupRequest) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/permissions/users/${userId}/remove-group`, {
      method: "POST",
      json: data,
    }),

  getEffectivePermissions: async (userId: string) =>
    fetchJson<T.EffectivePermissions>(`/api/v1/admin/permissions/effective/${userId}`),

  listRoles: async () =>
    fetchJson<T.Role[]>(`/api/v1/admin/staff/roles`),

  getRole: async (roleId: string) =>
    fetchJson<T.Role>(`/api/v1/admin/staff/roles/${roleId}`),

  createRole: async (data: { name: string; description?: string; permissions: string[] }) =>
    fetchJson<T.Role>(`/api/v1/admin/staff/roles`, {
      method: "POST",
      json: data,
    }),

  updateRole: async (roleId: string, data: Partial<{ name: string; description: string; permissions: string[] }>) =>
    fetchJson<T.Role>(`/api/v1/admin/staff/roles/${roleId}`, {
      method: "PATCH",
      json: data,
    }),

  deleteRole: async (roleId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/staff/roles/${roleId}`, {
      method: "DELETE",
    }),

  listPermissions: async () =>
    fetchJson<T.Permission[]>(`/api/v1/admin/staff/permissions`),
};

/* ══════════════════════════════════════════════════════════════
   ANIME DISCOVERY SERVICES
   ══════════════════════════════════════════════════════════════ */

export const animeDiscoveryService = {
  getSeasonal: async () =>
    fetchJson<T.Title[]>(`/api/v1/anime/seasonal`),

  getTop: async () =>
    fetchJson<T.Title[]>(`/api/v1/anime/top`),

  getAiring: async () =>
    fetchJson<T.Title[]>(`/api/v1/anime/airing`),

  getUpcoming: async () =>
    fetchJson<T.Title[]>(`/api/v1/anime/upcoming`),

  getPopular: async () =>
    fetchJson<T.Title[]>(`/api/v1/anime/popular`),
};

/* ══════════════════════════════════════════════════════════════
   SCHEDULE SERVICES
   ══════════════════════════════════════════════════════════════ */

export const scheduleService = {
  getReleases: async () =>
    fetchJson<T.ScheduledRelease[]>(`/api/v1/schedule/releases`),

  getEpisodes: async () =>
    fetchJson<T.ScheduledEpisode[]>(`/api/v1/schedule/episodes`),
};

/* ══════════════════════════════════════════════════════════════
   USER DATA EXPORT SERVICES
   ══════════════════════════════════════════════════════════════ */

export const userDataExportService = {
  exportActivity: async (profileId: string) =>
    fetchJson<Blob>(`/api/v1/user/history/${profileId}/activity/export`, {
      headers: {
        Accept: "application/zip",
      },
    }),
};

/* ══════════════════════════════════════════════════════════════
   CDN MANAGEMENT SERVICES
   ══════════════════════════════════════════════════════════════ */

export const cdnManagementService = {
  generateSignedCookie: async (data: T.SignedCookieRequest) =>
    fetchJson<T.SignedCookieResponse>(`/api/v1/admin/cdn-cookies/generate`, {
      method: "POST",
      json: data,
    }),
};

/* ══════════════════════════════════════════════════════════════
   MEDIA UPLOADS SERVICES
   ══════════════════════════════════════════════════════════════ */

export const mediaUploadsService = {
  listUploads: async (params?: T.MediaUploadFilterParams) =>
    fetchJson<T.PaginatedResponse<T.MediaUpload>>(`/api/v1/admin/media-uploads/`, {
      searchParams: params as Record<string, string | number | boolean>,
    }),

  getUploadDetails: async (uploadId: string) =>
    fetchJson<T.MediaUpload>(`/api/v1/admin/media-uploads/${uploadId}`),

  getUploadProgress: async (uploadId: string) =>
    fetchJson<T.UploadProgress>(`/api/v1/admin/media-uploads/${uploadId}/progress`),

  getUploadLogs: async (uploadId: string) =>
    fetchJson<T.ProcessingLog[]>(`/api/v1/admin/media-uploads/${uploadId}/logs`),

  cancelUpload: async (uploadId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/media-uploads/${uploadId}/cancel`, {
      method: "POST",
    }),

  retryUpload: async (uploadId: string) =>
    fetchJson<T.MediaUpload>(`/api/v1/admin/media-uploads/${uploadId}/retry`, {
      method: "POST",
    }),

  deleteUpload: async (uploadId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/media-uploads/${uploadId}`, {
      method: "DELETE",
    }),

  getStatistics: async () =>
    fetchJson<T.UploadStatistics>(`/api/v1/admin/media-uploads/statistics`),

  listArtwork: async (titleId: string) =>
    fetchJson<T.Artwork[]>(`/api/v1/admin/media/titles/${titleId}/artwork`),

  listSubtitles: async (titleId: string) =>
    fetchJson<T.Subtitle[]>(`/api/v1/admin/media/titles/${titleId}/subtitles`),

  listTrailers: async (titleId: string) =>
    fetchJson<T.Trailer[]>(`/api/v1/admin/media/titles/${titleId}/trailers`),

  invalidateCDN: async (assetId: string) =>
    fetchJson<T.SuccessResponse>(`/api/v1/admin/cdn/invalidate/${assetId}`, {
      method: "POST",
    }),
};

/* ══════════════════════════════════════════════════════════════
   IMPORT ADVANCED SERVICES
   ══════════════════════════════════════════════════════════════ */

import { analyticsService } from './services/analytics';
import { staffService } from './services/staff';
import { playbackIntelligenceService } from './services/playback-intelligence';
import { preferencesService } from './services/preferences';
import { sessionsService } from './services/sessions';

/* ══════════════════════════════════════════════════════════════
   EXPORT ALL SERVICES
   ══════════════════════════════════════════════════════════════ */

export const api = {
  // Core Services
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

  // Content Management Services
  titleAvailability: titleAvailabilityService,
  streamVariants: streamVariantsService,
  assets: assetsService,
  series: seriesService,
  animeArcs: animeArcsService,
  audioTracks: audioTracksService,

  // Monetization Services
  monetization: monetizationService,

  // Analytics Services
  analytics: analyticsService,
  advancedAnalytics: advancedAnalyticsService,

  // Admin Services
  staff: staffService,
  userManagement: userManagementService,
  permissions: permissionsService,
  compliance: complianceService,
  cdn: cdnManagementService,
  mediaUploads: mediaUploadsService,

  // Discovery Services
  animeDiscovery: animeDiscoveryService,
  schedule: scheduleService,

  // Advanced Services
  playbackIntelligence: playbackIntelligenceService,
  preferences: preferencesService,
  sessions: sessionsService,
  userDataExport: userDataExportService,
} as const;

export default api;
