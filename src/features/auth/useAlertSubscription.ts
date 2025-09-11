// features/auth/useAlertSubscription.ts
"use client";

import { useQuery, QueryClient, UseQueryOptions } from "@tanstack/react-query";
import { getMaybeJson, type EnrichedHTTPError } from "@/lib/api";
import { PATHS } from "@/lib/env";
import {
  AlertSubscriptionGetResponseSchema,
  type AlertSubscription,
} from "./schemas";

/**
 * ============================================================================
 * Alerts › Get Subscription Preferences
 * ============================================================================
 * @summary Fetch the user’s alert/notification subscription flags.
 *
 * @endpoint GET /api/v1/auth/alerts/subscription
 *
 * @headers
 * - Authorization: Bearer <access_token> (sent by your client wrapper)
 * - Cache-Control: no-store (recommended for account data)
 *
 * @returns {AlertSubscription}
 * A flat, frozen object of boolean flags (e.g., `{ email_login: true, ... }`).
 * Accepts 200 JSON and 204 No Content (treated as `{}`).
 *
 * @errors AppError (normalized in your lib)
 * - 401: unauthenticated (client will auto-refresh & retry once)
 * - 403: forbidden
 * - 429: rate limited (eligible for retry)
 * - 5xx/network: transient (eligible for retry)
 *
 * @caching React Query
 * - `staleTime`: 5m      (reasonable for account settings)
 * - `gcTime`   : 30m     (kept in memory for UX)
 *
 * @example
 * const { data: prefs, isLoading, error } = useAlertSubscription();
 * // prefs?.email_login, prefs?.email_new_device, ...
 */

// ─────────────────────────────────────────────────────────────────────────────
// Path + Query Keys
// ─────────────────────────────────────────────────────────────────────────────

// Use centralized, validated path (relative to API base)
export const ALERT_SUBSCRIPTION_PATH = PATHS.alertsSubscription as string;

/** Canonical React Query key for this resource. */
export const ALERT_SUBSCRIPTION_QK = ["auth", "alerts", "subscription"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Retry policy (robust to AppError shapes)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract an HTTP status code from various error shapes.
 * Supports:
 * - AppError with `status`
 * - Fetch/Ky-style `{ response: { status } }`
 * - Errors that wrap another error in `cause`
 */
function getHttpStatus(err: unknown): number | undefined {
  const e: any = err;
  if (typeof e?.status === "number") return e.status;
  if (typeof e?.response?.status === "number") return e.response.status;
  if (typeof e?.cause?.status === "number") return e.cause.status;
  if (typeof e?.cause?.response?.status === "number") return e.cause.response.status;
  return undefined;
}

function shouldRetry(_failureCount: number, err: unknown): boolean {
  const status = getHttpStatus(err);
  if (status == null) return true;                  // network/CORS/etc → retry
  if (status === 429) return true;                  // rate limited → retry
  if (status >= 500 && status < 600) return true;   // transient server errors
  return false;                                     // never retry other 4xx
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export type UseAlertSubscriptionOptions = {
  /** Enable/disable the query entirely (default: true). */
  enabled?: boolean;
  /**
   * Optional React Query overrides.
   * You usually don’t need this; provided for advanced callers.
   */
  queryOptions?: Omit<
    UseQueryOptions<AlertSubscription, EnrichedHTTPError, AlertSubscription, typeof ALERT_SUBSCRIPTION_QK>,
    "queryKey" | "queryFn"
  >;
};

/**
 * Fetch the current alert/notification subscription preferences.
 *
 * Behavior:
 * - Accepts 200 JSON and 204 No Content.
 * - Validates/normalizes via `AlertSubscriptionGetResponseSchema`.
 * - Returns a **frozen** object to discourage accidental mutation.
 */
export function useAlertSubscription(options?: UseAlertSubscriptionOptions) {
  const enabled = options?.enabled ?? true;

  return useQuery<AlertSubscription, EnrichedHTTPError, AlertSubscription, typeof ALERT_SUBSCRIPTION_QK>({
    queryKey: ALERT_SUBSCRIPTION_QK,
    queryFn: async () => {
      // `getMaybeJson` returns `undefined` for 204; parse `{}` for defaults.
      const body = await getMaybeJson<unknown>(ALERT_SUBSCRIPTION_PATH);
      const parsed = AlertSubscriptionGetResponseSchema.parse(body ?? {});
      return Object.freeze({ ...parsed });
    },
    // sensible cache defaults for account settings
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 30 * 60_000,   // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: shouldRetry,
    enabled,
    placeholderData: () => Object.freeze({}) as AlertSubscription,
    ...(options?.queryOptions ?? {}),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
/** Warm the cache (e.g., in a layout or after sign-in). */
export async function prefetchAlertSubscription(qc: QueryClient) {
  await qc.prefetchQuery({
    queryKey: ALERT_SUBSCRIPTION_QK,
    queryFn: async () => {
      const body = await getMaybeJson<unknown>(ALERT_SUBSCRIPTION_PATH);
      const parsed = AlertSubscriptionGetResponseSchema.parse(body ?? {});
      return Object.freeze({ ...parsed });
    },
    staleTime: 5 * 60_000,
  });
}

/** Invalidate cached prefs after a successful update. */
export async function invalidateAlertSubscription(qc: QueryClient) {
  await qc.invalidateQueries({ queryKey: ALERT_SUBSCRIPTION_QK });
}
