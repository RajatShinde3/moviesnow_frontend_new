// features/auth/useAuthActivity.ts
"use client";

import { useInfiniteQuery, type QueryClient } from "@tanstack/react-query";
import { getMaybeJson, type EnrichedHTTPError } from "@/lib/api";
import { z } from "zod";

/**
 * ============================================================================
 * Activity › List Auth Activity (cursor-based)
 * ============================================================================
 * @summary Fetch the user’s recent auth/security events using cursor pagination.
 *
 * @endpoint GET /api/v1/auth/activity?limit=<n>&cursor=<token>&since=<ISO>
 *
 * @headers
 * - Authorization: Bearer <access_token> (added by your API client)
 * - Cache-Control: no-store (recommended for account data)
 *
 * @returns {AuthActivityPage}
 * Normalized page:
 *   { items: AuthActivityItem[], next_cursor?: string|null, total?: number }
 * Accepts 200 JSON and 204 No Content (treated as empty page).
 *
 * @errors AppError (normalized by your lib)
 * - 401: unauthenticated (client will auto-refresh & retry once)
 * - 403: forbidden        (no retries)
 * - 429: rate limited     (eligible for retry)
 * - 5xx/network: transient (eligible for retry)
 *
 * @react-query
 * - `staleTime`: 60s  | `gcTime`: 5m
 * - Infinite query with `getNextPageParam` from `next_cursor`.
 *
 * @example
 * const { data, fetchNextPage, hasNextPage } = useAuthActivity({ pageSize: 25 });
 * const items = flattenAuthActivity(data);
 */

// ─────────────────────────────────────────────────────────────────────────────
// Path + Query Keys
// ─────────────────────────────────────────────────────────────────────────────

const RAW_AUTH_ACTIVITY_PATH =
  process.env.NEXT_PUBLIC_AUTH_ACTIVITY_PATH ?? "api/v1/auth/activity";

/** Strip leading slashes so the client's `prefixUrl` applies. */
export const AUTH_ACTIVITY_PATH = RAW_AUTH_ACTIVITY_PATH.replace(/^\/+/, "");

type QueryKey = ["auth", "activity", { pageSize: number; since?: string }];
const makeQK = (pageSize: number, since?: string): QueryKey => [
  "auth",
  "activity",
  { pageSize, since },
];

// ─────────────────────────────────────────────────────────────────────────────
// Schemas + normalization
// ─────────────────────────────────────────────────────────────────────────────

/** Raw item accepting common aliases for forward/back-compat. */
const RawItemSchema = z
  .object({
    id: z.string().optional(),
    // some APIs call it "event", others "action"
    action: z.string().optional(),
    event: z.string().optional(),
    created_at: z.string().datetime(), // ISO
    ip: z.string().optional(),
    user_agent: z.string().optional(),
    location: z.string().optional(),
    // metadata aliases
    metadata: z.record(z.string(), z.unknown()).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

/** Normalized item shape used by the UI. */
export type AuthActivityItem = {
  id?: string;
  action: string;
  created_at: string; // ISO 8601
  ip?: string;
  user_agent?: string;
  location?: string;
  metadata?: Record<string, unknown>;
};

const ItemSchema = RawItemSchema.transform((r): AuthActivityItem => {
  const action = r.action ?? r.event ?? "";
  return {
    id: r.id,
    action,
    created_at: r.created_at,
    ip: r.ip,
    user_agent: r.user_agent,
    location: r.location,
    metadata: (r.metadata ?? r.meta) as Record<string, unknown> | undefined,
  };
}).refine((v) => !!v.action, { message: "Missing activity action" });

/** Raw page accepting both `items`/`events` and `cursor`/`next_cursor`. */
const RawPageSchema = z
  .object({
    items: z.array(RawItemSchema).optional(),
    events: z.array(RawItemSchema).optional(),
    next_cursor: z.string().nullable().optional(),
    cursor: z.string().nullable().optional(),
    total: z.number().int().nonnegative().optional(),
  })
  .passthrough();

export type AuthActivityPage = {
  items: AuthActivityItem[];
  next_cursor?: string | null;
  total?: number;
};

function normalizePage(input: unknown): AuthActivityPage {
  if (input == null) return { items: [], next_cursor: null, total: 0 };
  const raw = RawPageSchema.parse(input);
  const rows = (raw.items ?? raw.events ?? []).map((r) => ItemSchema.parse(r));
  return {
    items: rows,
    next_cursor: raw.next_cursor ?? raw.cursor ?? null,
    total: raw.total,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Retry policy (robust to different error shapes)
// ─────────────────────────────────────────────────────────────────────────────

/** Extract HTTP status from various error shapes (AppError, ky/fetch, wrapped). */
function getHttpStatus(err: unknown): number | undefined {
  const e: any = err;
  if (typeof e?.status === "number") return e.status;
  if (typeof e?.response?.status === "number") return e.response.status;
  if (typeof e?.cause?.status === "number") return e.cause.status;
  if (typeof e?.cause?.response?.status === "number") return e.cause.response.status;
  return undefined;
}

function shouldRetry(_count: number, err: unknown) {
  const s = getHttpStatus(err);
  if (s == null) return true;                // network/CORS/etc.
  if (s === 429) return true;                // rate limited → backoff
  if (s >= 500 && s < 600) return true;      // transient server errors
  return false;                               // do not retry user/validation errors
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export type UseAuthActivityOptions = {
  /** Max items per page (default: 20; must be ≥ 1). */
  pageSize?: number;
  /** Enable/disable the query entirely (default: true). */
  enabled?: boolean;
  /** Optional ISO string to filter activity since a timestamp (if backend supports it). */
  since?: string;
};

/**
 * Fetch paged auth activity with cursor pagination.
 *
 * Behavior:
 * - Uses `limit`, `cursor`, and optional `since` query params.
 * - Accepts 200 JSON (with aliases) and 204 No Content.
 * - Normalizes to { items, next_cursor, total }.
 */
export function useAuthActivity(options?: UseAuthActivityOptions) {
  const pageSize = Math.max(1, options?.pageSize ?? 20);
  const since = options?.since?.trim() || undefined;

  return useInfiniteQuery<
    AuthActivityPage, // TData
    EnrichedHTTPError,
    AuthActivityPage,
    QueryKey,
    string | undefined // cursor
  >({
    queryKey: makeQK(pageSize, since),
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("limit", String(pageSize));
      if (since) params.set("since", since);

      // `getMaybeJson` returns `undefined` for 204; normalize accordingly.
      const body = await getMaybeJson<unknown>(AUTH_ACTIVITY_PATH, { searchParams: params });
      return normalizePage(body);
    },
    getNextPageParam: (last) => last.next_cursor || undefined,
    // sensible defaults for “activity” data
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: shouldRetry,
    enabled: options?.enabled ?? true,
    // provide a stable shape immediately
    placeholderData: {
      pages: [{ items: [], next_cursor: null, total: 0 }],
      pageParams: [undefined],
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (flatten, prefetch, invalidate)
// ─────────────────────────────────────────────────────────────────────────────

/** Flatten all pages into a single array for UI lists. */
export function flattenAuthActivity(data: { pages?: AuthActivityPage[] } | undefined) {
  if (!data?.pages?.length) return [] as AuthActivityItem[];
  return Object.freeze(data.pages.flatMap((p) => p.items)) as ReadonlyArray<AuthActivityItem>;
}

/** Warm the first page (e.g., after login or in a layout). */
export async function prefetchAuthActivity(
  qc: QueryClient,
  opts?: { pageSize?: number; since?: string }
) {
  const pageSize = Math.max(1, opts?.pageSize ?? 20);
  const since = opts?.since?.trim() || undefined;

  await qc.prefetchInfiniteQuery({
    queryKey: makeQK(pageSize, since),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("limit", String(pageSize));
      if (since) params.set("since", since);

      const body = await getMaybeJson<unknown>(AUTH_ACTIVITY_PATH, { searchParams: params });
      return normalizePage(body);
    },
    staleTime: 60_000,
    initialPageParam: undefined,
  });
}

/** Invalidate cached activity (e.g., after a security action). */
export async function invalidateAuthActivity(
  qc: QueryClient,
  opts?: { pageSize?: number; since?: string }
) {
  const pageSize = Math.max(1, opts?.pageSize ?? 20);
  const since = opts?.since?.trim() || undefined;
  await qc.invalidateQueries({ queryKey: makeQK(pageSize, since) });
}
