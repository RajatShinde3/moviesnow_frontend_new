// lib/formatError.ts

/**
 * =============================================================================
 *  formatError() — production-grade UI error normalizer
 * =============================================================================
 *
 *  Purpose
 *  -------
 *  Turn *any* thrown value into a short, user-friendly message for toasts,
 *  inline banners, and ARIA live regions. Aligned with our backend + client:
 *    • Uses our unified `AppError` (from lib/api/client) when present
 *    • Honors stable `AppErrorCode` values for consistent copy
 *    • Reads RFC7807-style details from `err.meta` (if provided by the server)
 *    • Masks 5xx internals by default (no leakage of stack traces)
 *    • Optionally appends request correlation id (`x-request-id`) for support
 *    • Exposes helpers to extract field errors and detect step-up (reauth) cases
 *
 *  Typical usage
 *  -------------
 *    try {
 *      await mutate();
 *    } catch (e) {
 *      toast.error(formatError(e));
 *      const fields = extractFieldErrors(e); // { email: ["..."], password: ["..."] }
 *      if (isStepUpError(e)) openReauthDialog(getReauthMeta(e));
 *    }
 */

import type { AppError, AppErrorCode } from "@/lib/api/client";

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                       RFC7807 (Problem Details) shape                    ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

export type ProblemDetail = {
  type?: string;
  title?: string;
  detail?: string;
  code?: string;
  // Pydantic-style: [{ loc: [...], msg: "..." }, ...]
  errors?: Array<{ loc?: Array<string | number>; msg?: string; [k: string]: unknown } | string>
         | Record<string, unknown>;
  // Additional server context allowed:
  [k: string]: unknown;
};

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                           Options & defaults                             ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

export type FormatErrorOptions = {
  /** Include server correlation id if available. Default: true */
  includeRequestId?: boolean;
  /** Fallback message when nothing better is available. */
  fallback?: string;
  /**
   * Status-specific overrides (e.g., { 401: "Please sign in again" }).
   * Used only when no code-based or RFC7807 message is used.
   */
  statusMessages?: Partial<Record<number, string>>;
  /**
   * Mask server-provided details for 5xx responses. Default: true
   * (prevents exposing internal traces in production).
   */
  maskServerErrors?: boolean;
  /**
   * Prefer standardized copy by AppErrorCode over RFC7807 detail/title.
   * Default: true (ensures consistent UX across flows).
   */
  preferCodeCopy?: boolean;
  /**
   * Truncate very long messages to a max length (adds ellipsis).
   * Default: 300 characters. Set 0 to disable.
   */
  maxLength?: number;
};

const DEFAULT_FALLBACK = "Something went wrong. Please try again.";

const DEFAULT_STATUS_MESSAGES: Record<number, string> = {
  400: "Your request is invalid. Please check and try again.",
  401: "You need to sign in to continue.",
  403: "You don’t have permission to do that.",
  404: "We couldn’t find what you’re looking for.",
  409: "This action conflicts with the current state. Refresh and retry.",
  413: "The request is too large.",
  415: "This content type isn’t supported.",
  422: "Some fields look invalid. Please review and resubmit.",
  429: "You’re doing that too often. Please slow down.",
  500: "We hit a server error. Please try again.",
  502: "Bad gateway from an upstream service. Try again shortly.",
  503: "Service is temporarily unavailable. Please try again.",
  504: "The server took too long to respond. Please try again.",
};

/** Canonical, friendly copy per AppErrorCode (keeps UX consistent). */
const CODE_COPY: Partial<Record<AppErrorCode, string>> = {
  invalid_credentials: "Email or password is incorrect.",
  email_unverified: "Please verify your email to continue.",
  mfa_required: "Two-factor authentication is required.",
  invalid_or_expired_token: "That link or code has expired. Request a new one.",
  need_step_up: "Please confirm your identity to continue.",
  rate_limited: "Too many attempts. Try again shortly.",
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You don’t have permission to do that.",
  bad_request: "Your request is invalid. Please check and try again.",
  not_found: "We couldn’t find what you’re looking for.",
  conflict: "This action conflicts with the current state. Refresh and retry.",
  server_error: "We hit a server error. Please try again.",
  network_error: "Network error. Please check your connection and try again.",
  timeout: "Request timed out. Please try again.",
  unknown_error: DEFAULT_FALLBACK,
};

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                         Type guards & tiny helpers                       ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

function isAppError(e: unknown): e is AppError {
  return !!e && typeof e === "object" && (e as any).name === "AppError";
}

function isAbortError(e: unknown): boolean {
  return (
    (typeof DOMException !== "undefined" && e instanceof DOMException && e.name === "AbortError") ||
    (e as any)?.name === "AbortError"
  );
}

/** Extract best human text from a ProblemDetail object. */
function problemMessage(pd?: ProblemDetail): string | undefined {
  if (!pd || typeof pd !== "object") return undefined;
  if (typeof pd.detail === "string" && pd.detail) return pd.detail;
  if (typeof pd.title === "string" && pd.title) return pd.title;

  // Some servers include generic fields
  const generic = (pd as any).message ?? (pd as any).error;
  if (typeof generic === "string" && generic) return generic;

  // Some servers put a flat array of error messages
  if (Array.isArray(pd.errors)) {
    for (const it of pd.errors) {
      if (!it) continue;
      if (typeof it === "string") return it;
      if (typeof it === "object" && typeof (it as any).msg === "string") return (it as any).msg;
    }
  }
  return undefined;
}

function requestIdSuffix(err: AppError, include = true): string {
  if (!include) return "";
  const rid = err.requestId ?? null;
  return rid ? ` (ref: ${rid})` : "";
}

function sanitizeAndMaybeTruncate(msg: string, maxLength = 300): string {
  let m = String(msg).replace(/\s+/g, " ").trim();
  if (!maxLength || maxLength <= 0) return m;
  if (m.length <= maxLength) return m;
  return m.slice(0, Math.max(1, maxLength - 1)).trimEnd() + "…";
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                                Public API                                ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/**
 * Normalize any thrown value into a short, safe string.
 *
 * Precedence (by default):
 *  1) Abort → "Request was canceled."
 *  2) AppError:
 *       a) code-based copy (if preferCodeCopy)
 *       b) RFC7807 detail/title from `err.meta` (unless masked for 5xx)
 *       c) status-specific message (override → defaults)
 *  3) TypeError (network) → "Network error…"
 *  4) Error|string → message or fallback
 *  5) Unknown → fallback
 */
export function formatError(e: unknown, opts: FormatErrorOptions = {}): string {
  const {
    includeRequestId = true,
    fallback = DEFAULT_FALLBACK,
    statusMessages = {},
    maskServerErrors = true,
    preferCodeCopy = true,
    maxLength = 300,
  } = opts;

  // Abort/cancel
  if (isAbortError(e)) return "Request was canceled.";

  // Unified client error (preferred path)
  if (isAppError(e)) {
    const status = e.status ?? 0;
    const code = e.code as AppErrorCode | undefined;
    const pd = (e.meta ?? undefined) as ProblemDetail | undefined;

    // 2a) Standardized copy by code
    if (preferCodeCopy && code && CODE_COPY[code]) {
      let copy = CODE_COPY[code] as string;

      // Add Retry-After hint on 429/rate-limited when available
      if ((code === "rate_limited" || status === 429) && typeof e.retryAfter === "number" && e.retryAfter > 0) {
        copy = `${copy} Try again in ${e.retryAfter}s.`;
      }
      return sanitizeAndMaybeTruncate(copy + requestIdSuffix(e, includeRequestId), maxLength);
    }

    // 2b) RFC7807 message (unless masking 5xx)
    if (!(maskServerErrors && status >= 500 && status <= 599)) {
      const pdMsg = problemMessage(pd);
      if (pdMsg) return sanitizeAndMaybeTruncate(pdMsg + requestIdSuffix(e, includeRequestId), maxLength);
    }

    // 2c) Status-specific or fallback
    let msg =
      statusMessages[status] ??
      DEFAULT_STATUS_MESSAGES[status] ??
      CODE_COPY[code ?? "unknown_error"] ??
      fallback;

    // Retry-After hint if we have it
    if (status === 429 && typeof e.retryAfter === "number" && e.retryAfter > 0) {
      msg = `${msg} Try again in ${e.retryAfter}s.`;
    }

    return sanitizeAndMaybeTruncate(msg + requestIdSuffix(e, includeRequestId), maxLength);
  }

  // Network-TypeError (fetch throws TypeError on connection/CORS issues)
  if (e instanceof TypeError) {
    return CODE_COPY.network_error as string;
  }

  // Plain Error or string
  if (e instanceof Error) return sanitizeAndMaybeTruncate(e.message || fallback, opts.maxLength ?? 300);
  if (typeof e === "string") return sanitizeAndMaybeTruncate(e || fallback, opts.maxLength ?? 300);

  // Unknown
  return sanitizeAndMaybeTruncate(fallback, opts.maxLength ?? 300);
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                       Helpers for forms & control flow                   ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

export type FieldErrorsMap = Record<string, string[]>;

/**
 * Extract RFC7807 validation errors into a form-friendly map.
 * Understands Pydantic `loc` arrays and generic error maps.
 *
 * Example
 * -------
 *   const errs = extractFieldErrors(err);
 *   setError("email", { message: errs.email?.[0] });
 */
export function extractFieldErrors(e: unknown): FieldErrorsMap {
  const out: FieldErrorsMap = {};
  if (!isAppError(e)) return out;

  const pd = (e.meta ?? undefined) as ProblemDetail | undefined;
  const raw = pd?.errors;
  if (!raw) return out;

  // Case A: Array of objects/strings
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item) continue;
      if (typeof item === "string") {
        (out.non_field_errors ??= []).push(item);
        continue;
      }
      const key = Array.isArray((item as any).loc) ? normalizeLoc((item as any).loc) : "non_field_errors";
      const msg = (item as any).msg || "Invalid value.";
      (out[key] ??= []).push(String(msg));
    }
    return out;
  }

  // Case B: Map { field: ["msg"] | "msg" | { msg } }
  if (typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (v == null) continue;
      if (Array.isArray(v)) {
        for (const msg of v) (out[k] ??= []).push(String((msg as any)?.msg ?? msg));
      } else if (typeof v === "object") {
        (out[k] ??= []).push(String((v as any).msg ?? "Invalid value."));
      } else {
        (out[k] ??= []).push(String(v));
      }
    }
  }

  return out;
}

/** True if the error indicates a step-up (reauth) requirement. */
export function isStepUpError(e: unknown): boolean {
  return isAppError(e) && e.code === "need_step_up";
}

/** Convenience getter for raw ProblemDetail (if present). */
export function getProblemDetail(e: unknown): ProblemDetail | undefined {
  if (!isAppError(e)) return undefined;
  return (e.meta ?? undefined) as ProblemDetail | undefined;
}

/** True if the error is a validation error (HTTP 422 or has field errors). */
export function isValidationError(e: unknown): boolean {
  if (!isAppError(e)) return false;
  const pd = (e.meta ?? undefined) as ProblemDetail | undefined;
  return e.status === 422 || (!!pd?.errors && (Array.isArray(pd.errors) ? pd.errors.length > 0 : true));
}

/**
 * Extract the first error message for a specific field (if any).
 * Returns undefined when not present.
 */
export function formatFieldError(field: string, e: unknown): string | undefined {
  const map = extractFieldErrors(e);
  const arr = map[field];
  return Array.isArray(arr) && arr.length > 0 ? String(arr[0]) : undefined;
}

/** Structured metadata for reauth dialogs. */
export type ReauthMeta = {
  hint?: string | null;
  challengeId?: string | null;
  expiresIn?: number | null;
  [k: string]: unknown;
};

/**
 * Extract reauth metadata (hint/challengeId/expiresIn) from an AppError,
 * when available. Returns `undefined` if not a step-up error.
 */
export function getReauthMeta(e: unknown): ReauthMeta | undefined {
  if (!isStepUpError(e)) return undefined;
  const err = e as AppError;
  const meta = (err.meta ?? {}) as Record<string, unknown>;
  const hint = (meta["hint"] as string | undefined) ?? null;
  const challengeId = (meta["challengeId"] as string | undefined) ?? null;
  const expiresInRaw = meta["expiresIn"];
  const expiresIn =
    typeof expiresInRaw === "number"
      ? Math.max(0, Math.floor(expiresInRaw))
      : typeof expiresInRaw === "string" && !Number.isNaN(Number(expiresInRaw))
      ? Math.max(0, Math.floor(Number(expiresInRaw)))
      : null;

  return { hint, challengeId, expiresIn, ...meta };
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                  Internal: path normalization for Pydantic `loc`         ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

function normalizeLoc(loc: Array<string | number>): string {
  // Strip common leading scopes like "body" | "query" | "path" | "__root__"
  const parts = loc.filter(
    (p, idx) => !(idx === 0 && (p === "body" || p === "query" || p === "path" || p === "__root__"))
  );
  return parts
    .map((p) => (typeof p === "number" ? `[${p}]` : String(p)))
    .join(".")
    .replace(/\.\[(\d+)\]\./g, "[$1].") // tidy up dot + bracket combos
    .replace(/^data\./, ""); // some libs prefix with data.*
}

export default formatError;
