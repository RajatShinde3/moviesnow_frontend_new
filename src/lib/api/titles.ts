// lib/api/titles.ts
/**
 * ===========================================================================
 * Titles API Client
 * ===========================================================================
 * API functions for fetching titles (movies, series, anime, documentaries)
 */

import { fetchJson } from "./client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_V1 = `${API_BASE}/api/v1`;

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
  if (params.order) searchParams.set("order", params.order);

  // Filters
  if (params.q) searchParams.set("q", params.q);
  if (params.genres && params.genres.length > 0) {
    params.genres.forEach(g => searchParams.append("genres", g));
  }
  if (params.year_gte) searchParams.set("year_gte", String(params.year_gte));
  if (params.year_lte) searchParams.set("year_lte", String(params.year_lte));
  if (params.rating_gte) searchParams.set("rating_gte", String(params.rating_gte));
  if (params.rating_lte) searchParams.set("rating_lte", String(params.rating_lte));
  if (params.cast && params.cast.length > 0) {
    params.cast.forEach(c => searchParams.append("cast", c));
  }

  // TEMPORARY: Use catalog endpoint which is working
  const catalogData = await fetchJson<Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
    overview: string | null;
    release_year: number | null;
    rating_average: number | null;
    content_rating: string | null;
  }>>(`${API_V1}/catalog/titles`, {
    method: "GET",
    searchParams,
  });

  // Transform catalog response to PaginatedTitles format
  return {
    items: catalogData.map(title => ({
      id: title.id,
      name: title.name,
      slug: title.slug,
      type: title.type,
      overview: title.overview,
      tagline: null,
      release_year: title.release_year,
      rating_average: title.rating_average,
      content_rating: title.content_rating,
      runtime_minutes: null,
      poster_url: null,
      backdrop_url: null,
      trailer_url: null,
      genres: [],
    })),
    page: params.page || 1,
    page_size: params.page_size || 24,
    total: catalogData.length,
    facets: { genres: [] },
  };
}

/**
 * Fetch trending titles
 */
export async function getTrendingTitles(
  region: string = "US",
  window: "6h" | "24h" | "72h" | "168h" = "24h"
): Promise<{ region: string; window: string; items: TitleSummary[] } | undefined> {
  const searchParams = new URLSearchParams({
    region,
    window,
  });

  return fetchJson<{ region: string; window: string; items: TitleSummary[] }>(
    `${API_V1}/trending`,
    {
      method: "GET",
      searchParams,
    }
  );
}

/**
 * Fetch top 10 titles by region
 */
export async function getTop10Titles(region: string = "US"): Promise<{ region: string; items: TitleSummary[] } | undefined> {
  const searchParams = new URLSearchParams({ region });

  return fetchJson<{ region: string; items: TitleSummary[] }>(`${API_V1}/top10`, {
    method: "GET",
    searchParams,
  });
}

/**
 * Helper: Get popular titles (sorted by popularity)
 */
export async function getPopularTitles(page: number = 1, page_size: number = 24): Promise<PaginatedTitles | undefined> {
  return getTitles({
    page,
    page_size,
    sort: "popularity",
    order: "desc",
  });
}

/**
 * Helper: Get new releases (sorted by release date)
 */
export async function getNewReleases(page: number = 1, page_size: number = 24): Promise<PaginatedTitles | undefined> {
  return getTitles({
    page,
    page_size,
    sort: "released_at",
    order: "desc",
  });
}

/**
 * Helper: Get top rated titles (sorted by rating)
 */
export async function getTopRated(page: number = 1, page_size: number = 24): Promise<PaginatedTitles | undefined> {
  return getTitles({
    page,
    page_size,
    sort: "rating",
    order: "desc",
    rating_gte: 7.0,
  });
}

/**
 * Helper: Get titles by genre
 */
export async function getTitlesByGenre(genre: string, page: number = 1, page_size: number = 24): Promise<PaginatedTitles | undefined> {
  return getTitles({
    page,
    page_size,
    genres: [genre],
    sort: "popularity",
    order: "desc",
  });
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
