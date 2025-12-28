// lib/api/client.ts
"use client";

/**
 * =============================================================================
 *  Auth-Aware HTTP Client for Next.js (App Router safe)
 * =============================================================================
 *
 *  What this provides
 *  ------------------
 *  • Single entrypoints:
 *      - `fetchJson<T>()`              → JSON-first, returns `T | undefined`
 *      - `fetchJsonWithMeta<T>()`      → JSON + `{ status, headers, requestId }`
 *  • Strict timeouts via AbortController (default from env)
 *  • JSON-first semantics (tolerant of 204 / empty bodies)
 *  • Unified `AppError` (status, code, requestId, retryAfter, meta, cause)
 *  • Automatic `Authorization: Bearer` from in-memory token store
 *  • `401` → single-flight refresh (HttpOnly cookie) → **retry once** if replay-safe
 *  • Step-Up/Reauth detection via **headers** and **WWW-Authenticate**
 *  • Safe transient retry for `429/408/5xx` (bounded, only if replay-safe)
 *  • `Cache-Control: no-store` by default on requests
 *
 *  Security & platform notes
 *  -------------------------
 *  • Access token lives **only in memory**; refresh stays in **HttpOnly** cookie.
 *  • We **never** auto-retry unsafe mutations unless `Idempotency-Key` is present.
 *  • We **never** attempt refresh if the server asks for **Step-Up** (X-Reauth
 *    or `WWW-Authenticate` with `insufficient_user_authentication` / `mfa_required`).
 *
 *  Backend contracts expected
 *  --------------------------
 *  • `/auth/refresh` rotates/validates using cookies, MAY return:
 *      `{ accessToken } | { access_token } | { token }`
 *  • Step-Up signals:
 *      Header: `X-Reauth: required`
 *      Body  : `{ code: "reauth_required" | "need_step_up", ... }` (optional)
 *      WWW-Authenticate: `Bearer error="insufficient_user_authentication"| "mfa_required"| "step_up"`
 *
 *  Environment (via src/lib/env)
 *  -----------------------------
 *  • `API_BASE`       : `/api/v1` (Next rewrite) or absolute https URL
 *  • `API_TIMEOUT_MS` : default request timeout in ms (e.g. 15000)
 *  • `PATHS.refresh`  : backend refresh endpoint path used by this client
 */

import { setAccessToken, getAccessToken } from "@/lib/api/tokens";
import { API_BASE, API_TIMEOUT_MS, PATHS } from "@/lib/env";

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                              Types & Errors                             ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

export type AppErrorCode =
  | "invalid_credentials"
  | "email_unverified"
  | "mfa_required"
  | "invalid_or_expired_token"
  | "need_step_up"
  | "rate_limited"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "server_error"
  | "bad_request"
  | "network_error"
  | "timeout"
  | "unknown_error";

export interface AppError extends Error {
  name: "AppError";
  status?: number;
  code: AppErrorCode;
  requestId?: string | null;
  retryAfter?: number | null;
  meta?: unknown;
  cause?: unknown;
}

export type FetchJsonOptions = {
  method?: string;
  /** JSON body. If provided, `Content-Type: application/json` is set. */
  json?: unknown;
  /** Raw body for FormData or other non-JSON payloads. */
  body?: BodyInit;
  /** Additional headers (merged). */
  headers?: Record<string, string>;
  /** URLSearchParams or record to be appended to the URL. */
  searchParams?: URLSearchParams | Record<string, string | number | boolean | null | undefined>;
  /** External signal to cancel the request. */
  signal?: AbortSignal | null;
  /** Per-call timeout override in ms. */
  timeoutMs?: number;
  /** Override request cache control (defaults to `no-store`). */
  cache?: RequestCache;
};

export type FetchJsonMetaResult<T> = {
  data: T | undefined;
  status: number;
  headers: Record<string, string>;
  requestId: string | null;
};

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                               HTTP Headers                              ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

export const IDEMPOTENCY_HEADER_NAME = "Idempotency-Key";
export const REAUTH_HEADER_NAME = "X-Reauth";
export const REQUEST_ID_HEADER_NAME = "x-request-id";
export const RETRY_AFTER_HEADER_NAME = "retry-after";

// Step-up hint headers (read on responses; case-insensitive on the wire)
export const REAUTH_HINT_HEADER_NAME = "x-reauth-hint";
export const REAUTH_ID_HEADER_NAME = "x-reauth-id";
export const REAUTH_EXPIRES_IN_HEADER_NAME = "x-reauth-expires-in";
export const REAUTH_METHOD_HEADER_NAME = "x-reauth-method";
export const WWW_AUTHENTICATE_HEADER_NAME = "www-authenticate";

/** Convert `HeadersInit` to a mutable record (lower cost than cloning Headers repeatedly). */
function headersToRecord(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h as Array<[string, string]>);
  return { ...(h as Record<string, string>) };
}

/** Compose Idempotency header. Use on **all mutating** auth operations. */
export function withIdempotency(key: string = newIdemKey()): Pick<FetchJsonOptions, 'headers'> {
  return {
    headers: {
      [IDEMPOTENCY_HEADER_NAME]: key,
    },
  };
}

/** Compose Step-Up / Reauth header for sensitive operations. */
export function withReauth(reauthToken: string, opts?: RequestInit): RequestInit {
  return {
    ...opts,
    headers: {
      ...(opts?.headers ? headersToRecord(opts.headers) : {}),
      [REAUTH_HEADER_NAME]: reauthToken,
    },
  };
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                              Retry Policy                               ║
   ╚═════════════════════════════════════════════════════════════════════════╝
   Transient retry is deliberately small and bounded:
   • Retry at most 2 times (3 attempts total) for 429/408/5xx.
   • Only retry when SAFE:
       - GET/HEAD/OPTIONS, or
       - caller provided Idempotency-Key.
   • Honor Retry-After; otherwise small exponential backoff.
*/

const MAX_TRANSIENT_RETRIES = 2;
const BACKOFF_BASE_MS = 300;

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                         Core Request (Response)                         ║
   ╚═════════════════════════════════════════════════════════════════════════╝
   NOTE: `fetchCore` encapsulates refresh, step-up detection, and retry logic,
         and returns a **successful Response**. Any non-2xx becomes an AppError.
*/

async function fetchCore(
  path: string,
  options: FetchJsonOptions = {},
  _attempt = 0,
  _transientAttempt = 0
): Promise<Response> {
  const url = buildUrl(path, options.searchParams);
  const method = (options.method ?? "GET").toUpperCase();

  // Build headers (default to no-store on request)
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.cache ? {} : { "Cache-Control": "no-store" }),
    ...(options.headers ?? {}),
  };

  // JSON body support (sets Content-Type if none provided)
  // If raw body is provided, use it directly (for FormData, etc.)
  const body =
    options.body !== undefined
      ? options.body
      : typeof options.json !== "undefined"
      ? ((headers["Content-Type"] = headers["Content-Type"] ?? "application/json"),
        JSON.stringify(options.json))
      : undefined;

  // Authorization header (memory-only access token)
  const token = getAccessToken();
  if (token && !hasAuthHeader(headers)) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Timeout & cancellation
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? API_TIMEOUT_MS;
  const timeoutId = timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null;
  const signal = mergeSignals(options.signal ?? null, controller.signal);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body,
      cache: options.cache ?? "no-store",
      signal,
      credentials: "include", // required for refresh/trusted-device cookies
    });
  } catch (err: any) {
    if (timeoutId) clearTimeout(timeoutId);
    if (isAbortError(err)) throw makeAppError("timeout", "Request timed out.", { cause: err });
    throw makeAppError("network_error", "Network error. Please check your connection.", { cause: err });
  }
  if (timeoutId) clearTimeout(timeoutId);

  if (res.ok) return res;

  // ── Step-Up/Reauth detection (header takes precedence; do NOT attempt refresh) ──
  const xReauth = (res.headers.get(REAUTH_HEADER_NAME) || "").toLowerCase();
  const isReauthRequiredHeader = xReauth === "required";

  // Also detect via WWW-Authenticate, e.g. "insufficient_user_authentication" / "mfa_required"
  const wwwAuthRaw = res.headers.get(WWW_AUTHENTICATE_HEADER_NAME) || "";
  const isReauthSuggestedWww = suggestsReauth(wwwAuthRaw);

  if (isReauthRequiredHeader) {
    const err = makeAppError("need_step_up", "Reauthentication required.", {
      status: res.status,
      requestId: res.headers.get(REQUEST_ID_HEADER_NAME),
      meta: {
        hint: res.headers.get(REAUTH_HINT_HEADER_NAME) ?? null,
        challengeId: res.headers.get(REAUTH_ID_HEADER_NAME) ?? null,
        expiresIn: parseIntOrNull(res.headers.get(REAUTH_EXPIRES_IN_HEADER_NAME)),
        xReauth: res.headers.get(REAUTH_HEADER_NAME),
        xReauthMethod: res.headers.get(REAUTH_METHOD_HEADER_NAME),
        wwwAuthenticate: wwwAuthRaw || null,
      },
    });
    throw err;
  }

  // ── 401: Attempt a single refresh if the request is safe to replay ──
  // Never refresh if request already carries X-Reauth or if WWW-Authenticate suggests step-up.
  const carriedReauth = hasHeader(headers, REAUTH_HEADER_NAME);
  if (res.status === 401 && !carriedReauth && !isReauthSuggestedWww && isReplaySafe(method, headers) && _attempt === 0) {
    const refreshed = await refreshAccessTokenSingleFlight();
    if (refreshed) return fetchCore(path, options, 1, _transientAttempt);
  }

  // If WWW-Authenticate suggests step-up, do not refresh: normalize and throw.
  if ((res.status === 401 || res.status === 403) && isReauthSuggestedWww) {
    throw await makeAppErrorFromResponse(res);
  }

  // ── Transient retry budget for 429 / 408 / 5xx ──
  if (shouldRetryTransient(res.status) && isReplaySafe(method, headers) && _transientAttempt < MAX_TRANSIENT_RETRIES) {
    const retryAfter = parseRetryAfter(res.headers.get(RETRY_AFTER_HEADER_NAME));
    const backoff = Math.max((retryAfter ?? 0) * 1000, BACKOFF_BASE_MS * 2 ** _transientAttempt);
    await sleep(backoff);
    return fetchCore(path, options, _attempt, _transientAttempt + 1);
  }

  // ── Normalize error and throw ──
  throw await makeAppErrorFromResponse(res);
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                               Public API                                ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/**
 * JSON-first convenience wrapper. Tolerant of 204/empty bodies.
 * Returns parsed JSON (`T`) or `undefined` when there is no body.
 *
 * @example
 * const me = await fetchJson<User>(PATHS.me);
 * const ok = await fetchJson<void>("/auth/logout", { method: "POST" }); // <- returns undefined on 204
 */
export async function fetchJson<T = unknown>(
  path: string,
  options: FetchJsonOptions = {}
): Promise<T | undefined> {
  const res = await fetchCore(path, options);
  return (await safeJson<T>(res)) as T | undefined;
}

/**
 * Same as `fetchJson` but also returns response metadata you might need in hooks
 * (e.g., to read `x-logout` or `retry-after`).
 *
 * @example
 * const { data, headers, status } = await fetchJsonWithMeta("/auth/sessions/123", { method: "DELETE" });
 * if (headers["x-logout"] === "required") logout();
 */
export async function fetchJsonWithMeta<T = unknown>(
  path: string,
  options: FetchJsonOptions = {}
): Promise<FetchJsonMetaResult<T>> {
  const res = await fetchCore(path, options);
  const data = (await safeJson<T>(res)) as T | undefined;
  const headers = Object.fromEntries(res.headers.entries());
  return {
    data,
    status: res.status,
    headers,
    requestId: headers[REQUEST_ID_HEADER_NAME] ?? null,
  };
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                         Single-Flight Refresh Gate                       ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessTokenSingleFlight(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const url = buildUrl(PATHS.refresh);
        const res = await fetch(url, {
          method: "POST",
          headers: { Accept: "application/json" },
          credentials: "include",
          cache: "no-store",
        });

        // SECURITY: Only clear tokens on authentication failures (401/403)
        // Network errors (timeout, offline) should NOT clear the token
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            // Refresh token expired or invalid - user needs to re-authenticate
            setAccessToken(null);
            return null;
          }
          // Other errors (500, 502, etc.) - keep trying with existing token
          // This prevents logout on transient backend issues
          return null;
        }

        const data = await safeJson<any>(res);
        const newToken = data?.access_token ?? data?.token ?? data?.accessToken ?? null;

        if (typeof newToken === "string" && newToken.length > 0) {
          setAccessToken(newToken);
          return newToken;
        }
        // Some backends rely solely on the cookie; keep current token if any.
        return getAccessToken() ?? null;
      } catch (err) {
        // Network errors, timeouts, aborts should NOT clear the token
        // The token might still be valid, we just couldn't reach the server
        // Log the error for debugging but keep user logged in
        if (typeof console !== 'undefined' && console.debug) {
          console.debug('[Auth] Token refresh failed (network error):', err);
        }
        return null;
      } finally {
        refreshPromise = null; // release single-flight lock
      }
    })();
  }
  return refreshPromise;
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                              JSON Utilities                              ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

async function safeJson<T>(res: Response): Promise<T | undefined> {
  if (res.status === 204) return undefined;

  const len = res.headers.get("content-length");
  if (len === "0") return undefined;

  const ctype = (res.headers.get("content-type") ?? "").toLowerCase();
  const isJson = ctype.includes("application/json") || ctype.includes("application/problem+json");
  if (!isJson) return undefined;

  try {
    return (await res.json()) as T;
  } catch {
    return undefined;
  }
}

async function makeAppErrorFromResponse(res: Response): Promise<AppError> {
  const requestId = res.headers.get(REQUEST_ID_HEADER_NAME);
  const retryAfter = parseRetryAfter(res.headers.get(RETRY_AFTER_HEADER_NAME));
  const status = res.status;

  // Try to parse RFC7807 / custom error bodies
  let problem: any = undefined;
  try {
    problem = await res.clone().json();
  } catch {
    /* ignore non-JSON bodies */
  }

  // Step-up hints from headers (merge into meta later)
  const xReauth = res.headers.get(REAUTH_HEADER_NAME);
  const xReauthMethod = res.headers.get(REAUTH_METHOD_HEADER_NAME);
  const xReauthHint = res.headers.get(REAUTH_HINT_HEADER_NAME);
  const xReauthId = res.headers.get(REAUTH_ID_HEADER_NAME);
  const xReauthExpiresIn = res.headers.get(REAUTH_EXPIRES_IN_HEADER_NAME);
  const wwwAuthenticate = res.headers.get(WWW_AUTHENTICATE_HEADER_NAME) || "";

  const expiresInNum = parseIntOrNull(xReauthExpiresIn);

  // Prefer backend-provided message & code
  const backendMessage =
    problem?.detail ?? problem?.message ?? problem?.error ?? problem?.title ?? undefined;

  let code: AppErrorCode | undefined = normalizeCode(problem?.code);

  // If body asked for reauth (without header), honor it
  if (code === "need_step_up") {
    return makeAppError("need_step_up", backendMessage ?? "Reauthentication required.", {
      status,
      requestId,
      meta: {
        ...(problem ?? {}),
        hint: problem?.hint ?? xReauthHint ?? null,
        challengeId: problem?.challengeId ?? xReauthId ?? null,
        expiresIn: problem?.expiresIn ?? (expiresInNum ?? null),
        xReauth,
        xReauthMethod,
        wwwAuthenticate: wwwAuthenticate || null,
      },
    });
  }

  // Fallback message by status
  const fallbackMessage =
    status === 400 ? "Bad request."
    : status === 401 ? "Unauthorized."
    : status === 403 ? "Forbidden."
    : status === 404 ? "Not found."
    : status === 409 ? "Conflict."
    : status === 422 ? "Validation error."
    : status === 429 ? "Too many requests."
    : status >= 500 ? "Server error. Please try again."
    : "Request failed.";

  // Infer code from status if not provided
  code =
    code ?? (
      status === 400 ? "bad_request"
      : status === 401 ? "unauthorized"
      : status === 403 ? "forbidden"
      : status === 404 ? "not_found"
      : status === 409 ? "conflict"
      : status === 429 ? "rate_limited"
      : status >= 500 ? "server_error"
      : "unknown_error"
    );

  // If headers or WWW-Authenticate suggest step-up, upgrade code accordingly
  if ((status === 401 || status === 403) && (String(xReauth).toLowerCase() === "required" || suggestsReauth(wwwAuthenticate))) {
    code = "need_step_up";
  }

  const meta = {
    ...(problem ?? {}),
    hint: (problem?.hint as string | undefined) ?? xReauthHint ?? null,
    challengeId: (problem?.challengeId as string | undefined) ?? xReauthId ?? null,
    expiresIn: (problem?.expiresIn as number | undefined) ?? (expiresInNum ?? null),
    xReauth,
    xReauthMethod,
    wwwAuthenticate: wwwAuthenticate || null,
  };

  return makeAppError(code, backendMessage ?? (code === "need_step_up" ? "Reauthentication required." : fallbackMessage), {
    status,
    requestId,
    retryAfter,
    meta,
  });
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                                 Utils                                   ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

function buildUrl(
  path: string,
  searchParams?: URLSearchParams | Record<string, string | number | boolean | null | undefined>
): string {
  // Absolute http(s) URLs pass through unchanged.
  if (/^https?:\/\//i.test(path)) return withSearch(path, searchParams);

  // Compose relative URL against API_BASE (already `/api/v1` or an absolute base)
  const full = `${stripTrailingSlash(API_BASE)}/${stripLeadingSlash(path)}`;
  return withSearch(full, searchParams);
}

function withSearch(
  url: string,
  searchParams?: URLSearchParams | Record<string, string | number | boolean | null | undefined>
): string {
  if (!searchParams) return url;
  const u = new URL(url, typeof window === "undefined" ? "http://localhost" : window.location.href);
  const sp = searchParams instanceof URLSearchParams ? searchParams : toURLSearchParams(searchParams);
  sp.forEach((v, k) => u.searchParams.set(k, v));
  return u.toString();
}

function toURLSearchParams(
  obj: Record<string, string | number | boolean | null | undefined>
): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    sp.set(k, String(v));
  }
  return sp;
}

function stripLeadingSlash(s: string): string { return s.replace(/^\/+/, ""); }
function stripTrailingSlash(s: string): string { return s.replace(/\/+$/g, ""); }

function hasAuthHeader(h: Record<string, string>): boolean {
  return Object.keys(h).some((k) => k.toLowerCase() === "authorization");
}

function hasHeader(h: Record<string, string>, name: string): boolean {
  const target = name.toLowerCase();
  return Object.keys(h).some((k) => k.toLowerCase() === target);
}

function isAbortError(err: unknown): boolean {
  return (
    !!err &&
    typeof err === "object" &&
    ((err as any).name === "AbortError" ||
      (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError"))
  );
}

function mergeSignals(a: AbortSignal | null, b: AbortSignal): AbortSignal {
  if (!a) return b;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (a.aborted || b.aborted) controller.abort();
  a.addEventListener("abort", onAbort);
  b.addEventListener("abort", onAbort);
  controller.signal.addEventListener("abort", () => {
    a.removeEventListener("abort", onAbort);
    b.removeEventListener("abort", onAbort);
  });
  return controller.signal;
}

function parseRetryAfter(h: string | null): number | null {
  if (!h) return null;
  const secs = Number(h);
  if (Number.isFinite(secs)) return Math.max(0, Math.round(secs));
  const when = Date.parse(h);
  if (Number.isFinite(when)) {
    const diff = Math.round((when - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  }
  return null;
}

function parseIntOrNull(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function suggestsReauth(wwwAuthenticate: string): boolean {
  const s = (wwwAuthenticate || "").toLowerCase();
  return s.includes("insufficient_user_authentication") || s.includes("mfa_required") || s.includes("step_up");
}

/** Map backend `code` (any casing) → stable AppErrorCode. */
function normalizeCode(code: unknown): AppErrorCode | undefined {
  if (!code || typeof code !== "string") return undefined;
  const c = code.toLowerCase();
  switch (c) {
    case "invalid_credentials": return "invalid_credentials";
    case "email_unverified": return "email_unverified";
    case "mfa_required": return "mfa_required";
    case "invalid_or_expired_token":
    case "invalid_token":
    case "expired_token": return "invalid_or_expired_token";
    case "need_step_up":
    case "reauth_required": return "need_step_up";
    case "rate_limited":
    case "too_many_requests": return "rate_limited";
    case "unauthorized": return "unauthorized";
    case "forbidden": return "forbidden";
    case "not_found": return "not_found";
    case "conflict": return "conflict";
    case "bad_request": return "bad_request";
    case "server_error":
    case "internal_error": return "server_error";
    default: return "unknown_error";
  }
}

/** Create an AppError with extra fields. */
function makeAppError(code: AppErrorCode, message: string, extra?: Partial<AppError>): AppError {
  const err = new Error(message) as AppError;
  err.name = "AppError";
  err.code = code;
  err.status = extra?.status;
  err.requestId = extra?.requestId ?? null;
  err.retryAfter = extra?.retryAfter ?? null;
  err.meta = extra?.meta;
  (err as any).cause = extra?.cause;
  return err;
}

/** Is it safe to replay this request? (Idempotent or protected by Idempotency-Key) */
function isReplaySafe(method: string, headers: Record<string, string>): boolean {
  const m = method.toUpperCase();
  if (m === "GET" || m === "HEAD" || m === "OPTIONS") return true;
  const hasIdem = hasHeader(headers, IDEMPOTENCY_HEADER_NAME);
  return hasIdem;
}

/** Should we attempt a transient retry for this HTTP status? */
function shouldRetryTransient(status: number): boolean {
  return status === 429 || status === 408 || (status >= 500 && status <= 599);
}

/** Small sleep helper for backoff. */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Generate a URL-safe idempotency key (collision-resistant where supported). */
function newIdemKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                     API Client Wrapper (Legacy Support)                 ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/**
 * Legacy API client wrapper that provides axios-like interface
 * Returns data wrapped in { data: T } format for backward compatibility
 */
export const apiClient = {
  async get<T = any>(url: string, config?: Omit<FetchJsonOptions, 'method'>): Promise<{ data: T }> {
    const data = await fetchJson<T>(url, { ...config, method: 'GET' });
    return { data: data as T };
  },

  async post<T = any>(url: string, data?: any, config?: Omit<FetchJsonOptions, 'method' | 'json'>): Promise<{ data: T }> {
    const result = await fetchJson<T>(url, { ...config, method: 'POST', json: data });
    return { data: result as T };
  },

  async put<T = any>(url: string, data?: any, config?: Omit<FetchJsonOptions, 'method' | 'json'>): Promise<{ data: T }> {
    const result = await fetchJson<T>(url, { ...config, method: 'PUT', json: data });
    return { data: result as T };
  },

  async patch<T = any>(url: string, data?: any, config?: Omit<FetchJsonOptions, 'method' | 'json'>): Promise<{ data: T }> {
    const result = await fetchJson<T>(url, { ...config, method: 'PATCH', json: data });
    return { data: result as T };
  },

  async delete<T = any>(url: string, config?: Omit<FetchJsonOptions, 'method'>): Promise<{ data: T }> {
    const result = await fetchJson<T>(url, { ...config, method: 'DELETE' });
    return { data: result as T };
  },
};
