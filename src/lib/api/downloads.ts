// lib/api/downloads.ts
/**
 * Download API Integration
 * Handles download requests, quality selection, and premium/free user flow
 */

import { fetchJson } from "./client";

const API_V1 = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface DownloadLink {
  quality: "480p" | "720p" | "1080p" | "4K";
  size: string;
  url: string;
  isPremium: boolean; // If true, requires subscription for direct download
}

export interface DownloadResponse {
  titleId: string;
  titleName: string;
  type: "MOVIE" | "SERIES" | "ANIME" | "DOCUMENTARY";
  links: DownloadLink[];
  requiresSubscription: boolean;
  adRedirectUrl?: string; // For free users
}

/**
 * Request download links for a title
 * Premium users get direct links, free users get redirect URLs
 */
export async function requestDownload(titleId: string, quality?: string): Promise<DownloadResponse> {
  const params = new URLSearchParams();
  if (quality) params.set("quality", quality);

  const response = await fetchJson<DownloadResponse>(`${API_V1}/downloads/request/${titleId}`, {
    method: "GET",
    searchParams: params,
  });

  if (!response) {
    throw new Error("Failed to fetch download information");
  }

  return response;
}

/**
 * Get signed download URL (for premium users or after ad completion)
 */
export async function getDownloadUrl(titleId: string, quality: string): Promise<{ url: string; expiresIn: number }> {
  const response = await fetchJson<{ url: string; expiresIn: number }>(`${API_V1}/download/${titleId}/${quality}`, {
    method: "GET",
  });

  if (!response) {
    throw new Error("Failed to generate download URL");
  }

  return response;
}

/**
 * Track download event (analytics)
 */
export async function trackDownload(titleId: string, quality: string): Promise<void> {
  await fetchJson(`${API_V1}/analytics/download`, {
    method: "POST",
    body: JSON.stringify({ titleId, quality, timestamp: new Date().toISOString() }),
  });
}
