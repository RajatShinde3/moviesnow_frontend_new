// lib/api.ts
"use client";

/**
 * =============================================================================
 *  Compatibility shim: legacy "lib/api" façade over the new client
 * =============================================================================
 *
 *  Purpose
 *  -------
 *  Allow older call-sites (previously Ky-style helpers) to keep importing from
 *  `@/lib/api` while transparently delegating to the production-grade client in
 *  `@/lib/api/client` (timeouts, single-flight refresh, safe retries, X-Reauth).
 *
 *  Why keep this file?
 *  -------------------
 *  • Non-breaking migration: gradually switch imports to `@/lib/api/client`.
 *  • Production-safe: all behavior funnels into `fetchJson`.
 *  • Fully typed: preserves generics and return types.
 *
 *  Migration plan
 *  --------------
 *  1) Prefer importing from `@/lib/api/client` in new code:
 *       import { fetchJson, withIdempotency, withReauth } from "@/lib/api/client";
 *  2) Remove this shim once legacy imports are gone.
 *
 *  Behavior guarantees (inherited from client.ts)
 *  ----------------------------------------------
 *  • JSON-first semantics; 204/empty tolerant.
 *  • Attaches Bearer from in-memory store (never persisted).
 *  • 401 → single-flight refresh via HttpOnly cookie → retry if **safe**.
 *  • Step-Up detection from headers (`X-Reauth: required`) returns `need_step_up`.
 *  • `x-request-id` surfaced; stable AppError codes; `Retry-After` honored.
 *  • Default request `Cache-Control: no-store`.
 */

import {
  fetchJson,
  withIdempotency as _withIdempotency,
  withReauth as _withReauth,
  type FetchJsonOptions,
  type AppError,
  type AppErrorCode,
} from "@/lib/api/client";

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                               Public Re-exports                          ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/** Legacy alias kept for older code paths. Prefer `AppError` going forward. */
export type EnrichedHTTPError = AppError;

/** Re-export helpers under both old and new names for convenience. */
export const withIdempotency = _withIdempotency;
export const withReauth = _withReauth;

/** Optional: re-export types so legacy call-sites can import from here. */
export type { FetchJsonOptions, AppError, AppErrorCode };

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                         Legacy Options Adapter                           ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/**
 * Options accepted by legacy helpers; mapped into `FetchJsonOptions`.
 * Note: Body is passed as `json` via the per-method wrappers below.
 */
type LegacyOptions = {
  headers?: HeadersInit | Record<string, string>;
  /** URLSearchParams or a record; merged into the request URL. */
  searchParams?: URLSearchParams | Record<string, string | number | boolean | null | undefined>;
  /** Request cache mode; defaults to "no-store" in the new client if omitted. */
  cache?: RequestCache;
  /** Timeout in ms (string or number). */
  timeout?: number | string;
  /** Abort controller signal. */
  signal?: AbortSignal;
};

/** Normalize `HeadersInit` to a plain record<string,string>. */
function headersToRecord(
  h?: HeadersInit | Record<string, string>
): Record<string, string> | undefined {
  if (!h) return undefined;
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h as Array<[string, string]>);
  return h as Record<string, string>;
}

/** Map legacy helper options → `FetchJsonOptions` used by the new client. */
function toFetchOpts(o?: LegacyOptions): FetchJsonOptions {
  if (!o) return {};
  const out: FetchJsonOptions = {};
  const hdr = headersToRecord(o.headers);
  if (hdr) out.headers = hdr;
  if (o.searchParams) out.searchParams = o.searchParams;
  if (o.cache) out.cache = o.cache;
  if (o.signal) out.signal = o.signal;
  if (o.timeout !== undefined) {
    const n = typeof o.timeout === "string" ? parseInt(o.timeout, 10) : o.timeout;
    if (Number.isFinite(n)) out.timeoutMs = n as number;
  }
  return out;
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                    Legacy-style JSON helpers (thin wrappers)             ║
   ╚═════════════════════════════════════════════════════════════════════════╝
   All helpers delegate to `fetchJson` and preserve its guarantees. Prefer the
   `withIdempotency()` header on **mutating** auth endpoints (login/signup/etc.)
*/

/**
 * GET and expect JSON (throws on non-2xx).
 * @example
 * const me = await getJson<User>(PATHS.me);
 */
export function getJson<T>(path: string, options?: LegacyOptions) {
  return fetchJson<T>(path, { ...toFetchOpts(options), method: "GET" });
}

/**
 * POST JSON and expect JSON (throws on non-2xx).
 * Use `withIdempotency()` for idempotent POSTs (signup/login/etc).
 * @example
 * await postJson(PATHS.signup, body, withIdempotency());
 */
export function postJson<T>(path: string, json?: unknown, options?: LegacyOptions) {
  return fetchJson<T>(path, { ...toFetchOpts(options), method: "POST", json });
}

/** PUT JSON and expect JSON (throws on non-2xx). */
export function putJson<T>(path: string, json?: unknown, options?: LegacyOptions) {
  return fetchJson<T>(path, { ...toFetchOpts(options), method: "PUT", json });
}

/** PATCH JSON and expect JSON (throws on non-2xx). */
export function patchJson<T>(path: string, json?: unknown, options?: LegacyOptions) {
  return fetchJson<T>(path, { ...toFetchOpts(options), method: "PATCH", json });
}

/** DELETE and expect JSON (throws on non-2xx). */
export function delJson<T>(path: string, options?: LegacyOptions) {
  return fetchJson<T>(path, { ...toFetchOpts(options), method: "DELETE" });
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║             Variants that tolerate 204/empty bodies (T | undefined)      ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/** GET and tolerate 204/empty body. */
export function getMaybeJson<T>(path: string, options?: LegacyOptions) {
  return fetchJson<T | undefined>(path, { ...toFetchOpts(options), method: "GET" });
}

/** POST and tolerate 204/empty body. */
export function postMaybeJson<T>(path: string, json?: unknown, options?: LegacyOptions) {
  return fetchJson<T | undefined>(path, { ...toFetchOpts(options), method: "POST", json });
}

/** PUT and tolerate 204/empty body. */
export function putMaybeJson<T>(path: string, json?: unknown, options?: LegacyOptions) {
  return fetchJson<T | undefined>(path, { ...toFetchOpts(options), method: "PUT", json });
}

/** PATCH and tolerate 204/empty body. */
export function patchMaybeJson<T>(path: string, json?: unknown, options?: LegacyOptions) {
  return fetchJson<T | undefined>(path, { ...toFetchOpts(options), method: "PATCH", json });
}

/** DELETE and tolerate 204/empty body. */
export function delMaybeJson<T>(path: string, options?: LegacyOptions) {
  return fetchJson<T | undefined>(path, { ...toFetchOpts(options), method: "DELETE" });
}
