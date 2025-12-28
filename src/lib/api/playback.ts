// lib/api/playback.ts
/**
 * Playback/Streaming API Integration
 * Handles video playback, stream quality selection, progress tracking
 */

import { fetchJson } from "./client";

const API_V1 = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface StreamVariant {
  quality: "480p" | "720p" | "1080p" | "AUTO";
  bitrate: number;
  url: string;
  codec: string;
}

export interface SubtitleTrack {
  language: string;
  label: string;
  url: string;
  isDefault: boolean;
}

export interface PlaybackSession {
  sessionId: string;
  titleId: string;
  streamUrl: string;
  streamVariants: StreamVariant[];
  subtitles: SubtitleTrack[];
  resumePosition: number; // in seconds
  duration: number;
  hasAds: boolean; // True for free users
  adSchedule?: Array<{ time: number; duration: number }>; // Ad break schedule
}

export interface WatchProgress {
  titleId: string;
  currentTime: number;
  duration: number;
  percentComplete: number;
  lastWatchedAt: string;
  isCompleted: boolean;
}

/**
 * Start a playback session for a title
 */
export async function startPlayback(titleId: string, episodeId?: string): Promise<PlaybackSession> {
  const body: any = { titleId };
  if (episodeId) body.episodeId = episodeId;

  const response = await fetchJson<PlaybackSession>(`${API_V1}/playback/start`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response) {
    throw new Error("Failed to start playback session");
  }

  return response;
}

/**
 * Get signed stream URL for a specific quality
 */
export async function getStreamUrl(titleId: string, quality: string): Promise<{ url: string; expiresIn: number }> {
  const response = await fetchJson<{ url: string; expiresIn: number }>(`${API_V1}/stream/${titleId}/${quality}`, {
    method: "GET",
  });

  if (!response) {
    throw new Error("Failed to generate stream URL");
  }

  return response;
}

/**
 * Get available stream qualities for a title
 */
export async function getStreamQualities(titleId: string): Promise<StreamVariant[]> {
  const response = await fetchJson<StreamVariant[]>(`${API_V1}/playback/qualities/${titleId}`, {
    method: "GET",
  });

  return response || [];
}

/**
 * Update watch progress
 */
export async function updateProgress(titleId: string, currentTime: number, duration: number): Promise<void> {
  await fetchJson(`${API_V1}/playback/progress`, {
    method: "POST",
    body: JSON.stringify({
      titleId,
      currentTime,
      duration,
      percentComplete: (currentTime / duration) * 100,
    }),
  });
}

/**
 * Get watch progress for a title
 */
export async function getProgress(titleId: string): Promise<WatchProgress | null> {
  try {
    const response = await fetchJson<WatchProgress>(`${API_V1}/playback/progress/${titleId}`, {
      method: "GET",
    });
    return response || null;
  } catch {
    return null; // No progress found
  }
}

/**
 * Mark title as watched/completed
 */
export async function markAsWatched(titleId: string): Promise<void> {
  await fetchJson(`${API_V1}/playback/mark-watched`, {
    method: "POST",
    body: JSON.stringify({ titleId }),
  });
}

/**
 * Get continue watching list
 */
export async function getContinueWatching(): Promise<WatchProgress[]> {
  const response = await fetchJson<WatchProgress[]>(`${API_V1}/user/continue-watching`, {
    method: "GET",
  });

  return response || [];
}
