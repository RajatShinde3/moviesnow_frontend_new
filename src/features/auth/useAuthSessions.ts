// features/auth/useAuthSessions.ts
"use client";

/**
 * =============================================================================
 * Sessions › List active sessions (backend-aligned)
 * =============================================================================
 * @endpoint GET /api/v1/auth/sessions
 *
 * Accepts multiple server response shapes:
 *   - { sessions: RawSession[], total }              (FastAPI: SessionsListResponse)
 *   - { items: RawSession[], total }
 *   - RawSession[]                                   (legacy/alt)
 *
 * Normalization:
 *   - Field aliases: jti|id|session_id, current|is_current,
 *     last_seen|last_seen_at, ip|ip_address.
 *   - Date-safe: accepts ISO strings or epoch (sec/ms) and outputs ISO.
 *
 * Caching:
 *   - Query key: ["auth","sessions"]
 *   - Conservative retry: only network/429/5xx; no retries for other 4xx.
 */

import { useQuery, type QueryClient } from "@tanstack/react-query";
import { fetchJson, type AppError } from "@/lib/api/client";
import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────────
   Paths & Query Keys
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_SESSIONS_BASE_PATH =
  process.env.NEXT_PUBLIC_AUTH_SESSIONS_BASE_PATH ?? "api/v1/auth/sessions";
/** Strip leading slashes so relative API_BASE in the client applies. */
export const SESSIONS_BASE_PATH = RAW_SESSIONS_BASE_PATH.replace(/^\/+/, "");
/** Canonical key for invalidation/prefetch across the app. */
export const SESSIONS_QK = ["auth", "sessions"] as const;

/* ────────────────────────────────────────────────────────────────────────────
   Schemas (tolerant to backend variations)
   ──────────────────────────────────────────────────────────────────────────── */

const DateishSchema = z.union([z.string(), z.number()]).optional();

/** Raw item as backend might return; we allow passthrough for forward-compat. */
export const RawSessionSchema = z
  .object({
    jti: z.string().optional(),
    id: z.string().optional(),
    session_id: z.string().optional(),

    current: z.boolean().optional(),
    is_current: z.boolean().optional(),

    created_at: DateishSchema,
    issued_at: DateishSchema,
    iat: DateishSchema, // numeric seconds sometimes
    last_seen_at: DateishSchema,
    last_seen: DateishSchema, // backend uses 'last_seen'
    expires_at: DateishSchema,
    exp: DateishSchema,

    ip: z.string().optional(),
    ip_address: z.string().optional(),

    user_agent: z.string().optional(),
    client: z.string().optional(),
    location: z.string().optional(),
  })
  .passthrough();

export type RawSession = z.infer<typeof RawSessionSchema>;

const RawSessionsEnvelopeSchema = z.union([
  z.array(RawSessionSchema),
  z
    .object({
      sessions: z.array(RawSessionSchema).optional(),
      items: z.array(RawSessionSchema).optional(),
      total: z.number().int().nonnegative().optional(),
      data: z
        .object({
          sessions: z.array(RawSessionSchema).optional(),
          items: z.array(RawSessionSchema).optional(),
          total: z.number().int().nonnegative().optional(),
        })
        .partial()
        .optional(),
    })
    .passthrough(),
]);

/* ────────────────────────────────────────────────────────────────────────────
   Normalization helpers
   ──────────────────────────────────────────────────────────────────────────── */

function toIsoMaybe(v?: string | number | null): string | undefined {
  if (v == null) return undefined;
  // Accept numeric-like strings
  const n = typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v;
  if (typeof n === "number") {
    // 13+ digits → ms, 10 digits → sec
    const ms = n > 1e12 ? n : n >= 1e9 && n < 1e10 ? n * 1000 : n;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Canonical UI shape. */
export type AuthSession = {
  jti: string;
  is_current: boolean;
  created_at?: string;   // ISO
  last_seen_at?: string; // ISO
  expires_at?: string;   // ISO
  ip?: string;
  user_agent?: string;
  client?: string;
  location?: string;
  session_id?: string;
  /** Original item for diagnostics if needed. */
  _raw?: RawSession;
};

export function normalizeSession(raw: RawSession): AuthSession | null {
  const jti = raw.jti ?? raw.session_id ?? raw.id;
  if (!jti) return null;

  const is_current = Boolean(raw.is_current ?? raw.current);

  const created_at =
    toIsoMaybe(raw.created_at) ?? toIsoMaybe(raw.issued_at) ?? toIsoMaybe(raw.iat);
  const last_seen_at = toIsoMaybe(raw.last_seen_at) ?? toIsoMaybe(raw.last_seen);
  const expires_at = toIsoMaybe(raw.expires_at) ?? toIsoMaybe(raw.exp);

  const ip = raw.ip ?? raw.ip_address;

  return {
    jti,
    is_current,
    created_at,
    last_seen_at,
    expires_at,
    ip,
    user_agent: raw.user_agent,
    client: raw.client,
    location: raw.location,
    session_id: raw.session_id,
    _raw: raw,
  };
}

export function normalizeSessionsEnvelope(
  body: unknown
): { sessions: AuthSession[]; total?: number } {
  const parsed = RawSessionsEnvelopeSchema.safeParse(body);
  if (!parsed.success) return { sessions: [], total: 0 };

  const env = parsed.data as any;
  const list: RawSession[] =
    (Array.isArray(env) && env) ||
    env.sessions ||
    env.items ||
    env.data?.sessions ||
    env.data?.items ||
    [];

  const sessions = list
    .map((it) => RawSessionSchema.parse(it))
    .map(normalizeSession)
    .filter(Boolean) as AuthSession[];

  const total: number | undefined =
    env.total ?? env.data?.total ?? (Array.isArray(env) ? env.length : undefined);

  return { sessions, total };
}

/* ────────────────────────────────────────────────────────────────────────────
   Retry policy (transient-friendly, user-friendly)
   ──────────────────────────────────────────────────────────────────────────── */

function getHttpStatus(err: unknown): number | undefined {
  const e: any = err;
  if (typeof e?.status === "number") return e.status;
  if (typeof e?.response?.status === "number") return e.response.status;
  if (typeof e?.cause?.status === "number") return e.cause.status;
  if (typeof e?.cause?.response?.status === "number") return e.cause.response.status;
  return undefined;
}

function shouldRetry(_failureCount: number, err: unknown): boolean {
  const s = getHttpStatus(err);
  if (s == null) return true;            // network/CORS/etc.
  if (s === 429) return true;            // rate limited
  if (s >= 500 && s < 600) return true;  // transient server errors
  return false;                          // do not retry other 4xx
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * List authentication sessions for the current user.
 *
 * Behavior:
 *   - Accepts multiple server shapes (array or wrapped).
 *   - Tolerates 204/empty: returns { sessions: [], total: 0 }.
 *   - Normalizes timestamps & aliases to a stable client shape.
 */
export function useAuthSessions(options?: { enabled?: boolean }) {
  return useQuery<{ sessions: AuthSession[]; total?: number }, AppError>({
    queryKey: SESSIONS_QK,
    queryFn: async ({ signal }) => {
      const body = await fetchJson<unknown>(SESSIONS_BASE_PATH, { signal });
      if (body == null) return { sessions: [], total: 0 };
      return normalizeSessionsEnvelope(body);
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnReconnect: "always",
    retry: shouldRetry,
    enabled: options?.enabled ?? true,
    // Give components a stable empty structure immediately if needed:
    // placeholderData: { sessions: [], total: 0 },
  });
}

/* ────────────────────────────────────────────────────────────────────────────
   Prefetch & Invalidate helpers
   ──────────────────────────────────────────────────────────────────────────── */

export async function prefetchAuthSessions(qc: QueryClient) {
  await qc.prefetchQuery({
    queryKey: SESSIONS_QK,
    queryFn: async () => {
      const body = await fetchJson<unknown>(SESSIONS_BASE_PATH);
      return body == null ? { sessions: [], total: 0 } : normalizeSessionsEnvelope(body);
    },
    staleTime: 60_000,
  });
}

export async function invalidateAuthSessions(qc: QueryClient) {
  await qc.invalidateQueries({ queryKey: SESSIONS_QK });
}
