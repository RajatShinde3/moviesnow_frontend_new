// lib/api/titles.ts
/**
 * ===========================================================================
 * Titles API Client
 * ===========================================================================
 * API functions for fetching titles (movies, series, anime, documentaries)
 */

import { fetchJson } from "./client";

/* ══════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════ */

export interface TitleSummary {
  id: string;
  name: string;
  slug: string;
  type: "MOVIE" | "SERIES";
  overview?: string;
  tagline?: string;
  release_year?: number;
  rating_average?: number; // 0-100
  content_rating?: string;
  runtime_minutes?: number;
  poster_url?: string | null;
  backdrop_url?: string | null;
  trailer_url?: string | null;
  genres?: string[];
}

export interface PaginatedTitles {
  items: TitleSummary[];
  page: number;
  page_size: number;
  total: number;
  facets?: Record<string, unknown>;
}

export interface TitleFilters {
  q?: string; // Search query
  genres?: string[];
  year_gte?: number;
  year_lte?: number;
  rating_gte?: number;
  rating_lte?: number;
  cast?: string[];
}

export interface TitleListParams extends TitleFilters {
  page?: number;
  page_size?: number;
  sort?: "popularity" | "year" | "rating" | "name" | "released_at";
  order?: "asc" | "desc";
}

/* ══════════════════════════════════════════════════════════════
   API FUNCTIONS
   ══════════════════════════════════════════════════════════════ */

/**
 * Fetch paginated titles for discovery/browse
 */
export async function getTitles(params: TitleListParams = {}): Promise<PaginatedTitles | undefined> {
  const searchParams = new URLSearchParams();

  // Pagination
  searchParams.set("page", String(params.page || 1));
  searchParams.set("page_size", String(params.page_size || 24));

  // Sorting
  if (params.sort) searchParams.set("sort", params.sort);

  // Filters
  if (params.q) searchParams.set("q", params.q);
  if (params.genres && params.genres.length > 0) {
    searchParams.set("genre", params.genres[0]); // Backend uses single genre filter
  }
  if (params.year_gte) searchParams.set("year_gte", String(params.year_gte));
  if (params.year_lte) searchParams.set("year_lte", String(params.year_lte));

  try {
    return await fetchJson<PaginatedTitles>(`/catalog/titles`, {
      method: "GET",
      searchParams,
    });
  } catch (error) {
    console.error("Failed to fetch titles:", error);
    return {
      items: [],
      page: params.page || 1,
      page_size: params.page_size || 24,
      total: 0,
    };
  }
}

/**
 * Fetch trending titles
 */
export async function getTrendingTitles(
  region: string = "US",
  window: "6h" | "24h" | "72h" | "168h" = "24h"
): Promise<{ region: string; window: string; items: TitleSummary[] } | undefined> {
  const searchParams = new URLSearchParams({ region, window, page_size: "20" });

  try {
    return await fetchJson<{ region: string; window: string; items: TitleSummary[] }>(
      `/browse/trending`,
      {
        method: "GET",
        searchParams,
      }
    );
  } catch (error) {
    console.error("Failed to fetch trending titles:", error);
    return {
      region,
      window,
      items: [],
    };
  }
}

/**
 * Fetch top 10 titles by region
 */
export async function getTop10Titles(region: string = "US"): Promise<{ region: string; items: TitleSummary[] } | undefined> {
  const searchParams = new URLSearchParams({ region });

  return fetchJson<{ region: string; items: TitleSummary[] }>(`/top10`, {
    method: "GET",
    searchParams,
  });
}

/**
 * Helper: Get popular titles (sorted by popularity)
 */
export async function getPopularTitles(page: number = 1, page_size: number = 24): Promise<PaginatedTitles | undefined> {
  const searchParams = new URLSearchParams({ page: String(page), page_size: String(page_size) });

  try {
    return await fetchJson<PaginatedTitles>(`/browse/popular`, {
      method: "GET",
      searchParams,
    });
  } catch (error) {
    console.error("Failed to fetch popular titles:", error);
    return {
      items: [],
      page,
      page_size,
      total: 0,
    };
  }
}

/**
 * Helper: Get new releases (sorted by release date)
 */
export async function getNewReleases(page: number = 1, page_size: number = 24): Promise<PaginatedTitles | undefined> {
  const searchParams = new URLSearchParams({ page: String(page), page_size: String(page_size) });

  try {
    return await fetchJson<PaginatedTitles>(`/browse/new-releases`, {
      method: "GET",
      searchParams,
    });
  } catch (error) {
    console.error("Failed to fetch new releases:", error);
    return {
      items: [],
      page,
      page_size,
      total: 0,
    };
  }
}

/**
 * Helper: Get top rated titles (sorted by rating)
 */
export async function getTopRated(page: number = 1, page_size: number = 24): Promise<PaginatedTitles | undefined> {
  const searchParams = new URLSearchParams({ page: String(page), page_size: String(page_size) });

  try {
    return await fetchJson<PaginatedTitles>(`/browse/top-rated`, {
      method: "GET",
      searchParams,
    });
  } catch (error) {
    console.error("Failed to fetch top rated titles:", error);
    return {
      items: [],
      page,
      page_size,
      total: 0,
    };
  }
}

/**
 * Helper: Get titles by genre
 */
export async function getTitlesByGenre(genre: string, page: number = 1, page_size: number = 24): Promise<PaginatedTitles | undefined> {
  const searchParams = new URLSearchParams({ page: String(page), page_size: String(page_size) });
  const genreSlug = genre.toLowerCase().replace(/ /g, "-");

  try {
    return await fetchJson<PaginatedTitles>(`/browse/by-genre/${genreSlug}`, {
      method: "GET",
      searchParams,
    });
  } catch (error) {
    console.error(`Failed to fetch titles for genre ${genre}:`, error);
    return {
      items: [],
      page,
      page_size,
      total: 0,
    };
  }
}

/**
 * Helper: Convert rating from 0-100 to 0-10 scale
 */
export function normalizeRating(rating_average?: number): number {
  if (!rating_average) return 0;
  return rating_average / 10; // 0-100 → 0-10
}

/**
 * Helper: Format runtime (minutes to "Xh Ym" format)
 */
export function formatRuntime(runtime_minutes?: number): string {
  if (!runtime_minutes) return "";
  const hours = Math.floor(runtime_minutes / 60);
  const minutes = runtime_minutes % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}
