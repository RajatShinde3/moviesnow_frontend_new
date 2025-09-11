// lib/reauth.ts

/**
 * =============================================================================
 *  Reauthentication (step-up) utilities — backend aligned, client aware
 * =============================================================================
 *
 *  Why this exists
 *  ---------------
 *  Some protected operations require a fresh proof of identity (step-up). The
 *  backend can signal this in a few ways:
 *    • Preferred: normalized `code: "need_step_up"` in the problem response
 *      (our HTTP client exposes this as `AppError.code` and preserves hints).
 *    • Headers: `X-Reauth: required`, optionally with:
 *        - `X-Reauth-Method: mfa|password|any`
 *        - `X-Reauth-Expires-In: <seconds>`
 *        - `X-Reauth-Id: <challenge-id>`
 *    • WWW-Authenticate: Bearer challenges with parameters (best-effort).
 *
 *  What this module provides
 *  -------------------------
 *  - `getReauthInfo(err)`   → structured hints for the UI (required/method/reason/ttl/requestId)
 *  - `isReauthRequired(err)`→ boolean + type guard
 *  - `pickReauthMethod(err)`→ "password" | "mfa" | "any" | "unknown"
 *  - `reauthReason(err)`    → short human message for banners
 *
 *  Notes
 *  -----
 *  - Enforcement is always server-side. This module is **UI logic only**.
 *  - Works with our `AppError` (preferred) and gracefully with legacy errors
 *    that still carry `response` (e.g., older Ky-based code paths).
 */

import type { AppError } from "@/lib/api/client";
import type { ProblemDetail } from "@/lib/formatError";

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                                   Types                                  ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/** Hint for which step-up mechanism to prompt in the UI. */
export type ReauthMethod = "password" | "mfa" | "any" | "unknown";

/** Structured summary for the UI (stable, UI-facing shape). */
export type ReauthInfo = {
  /** True if reauth is clearly required. */
  required: boolean;
  /** Suggested method to prompt. */
  method: ReauthMethod;
  /** Human-readable reason (from RFC7807 or headers), if any. */
  reason?: string;
  /** Optional window for which the step-up token remains valid (seconds). */
  expiresInSeconds?: number;
  /** Correlation id for diagnostics/support. */
  requestId?: string;
  /** Raw signaling for advanced callers (best-effort; do not rely on stability). */
  source?: {
    // From headers (legacy or direct Response access)
    xReauth?: string | null;
    xReauthMethod?: string | null;
    xReauthExpiresIn?: string | null;
    xReauthTtl?: string | null; // legacy alias
    xReauthId?: string | null;
    wwwAuthenticate?: string | null;

    // From AppError.meta (preferred client path)
    metaHint?: string | null;
    metaChallengeId?: string | null;
    metaExpiresIn?: number | string | null;

    // Problem details and status
    problemType?: string;
    problemCode?: string;
    status?: number;
  };
};

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                              Legacy error guard                          ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

type LegacyHttpError = {
  response?: Response;
  // optional legacy fields some Ky wrappers add:
  code?: string;
  problem?: ProblemDetail;
  requestId?: string;
};

function isLegacyHttpError(e: unknown): e is LegacyHttpError {
  return !!e && typeof e === "object" && "response" in (e as any);
}

function isAppError(e: unknown): e is AppError {
  return !!e && typeof e === "object" && (e as any).name === "AppError";
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                        Header names honored (case-insensitive)           ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

const HDR_X_REAUTH = "x-reauth";
const HDR_X_REAUTH_METHOD = "x-reauth-method";
const HDR_X_REAUTH_EXPIRES_IN = "x-reauth-expires-in"; // seconds (preferred)
const HDR_X_REAUTH_TTL = "x-reauth-ttl";               // legacy alias (seconds)
const HDR_X_REAUTH_ID = "x-reauth-id";

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                         WWW-Authenticate parser (best-effort)            ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/**
 * Parse `WWW-Authenticate` parameters into a record.
 * Example header:
 *   Bearer realm="example", error="insufficient_user_authentication", prompt="login"
 */
function parseWwwAuthenticate(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  // Drop the auth scheme (e.g., "Bearer")
  const afterScheme = raw.replace(/^\s*\w+\s*/i, "");
  // Split preserving quoted commas.
  const parts: string[] = [];
  let buf = "";
  let inQuotes = false;
  for (const ch of afterScheme) {
    if (ch === '"') inQuotes = !inQuotes;
    if (ch === "," && !inQuotes) {
      if (buf.trim()) parts.push(buf.trim());
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) parts.push(buf.trim());

  const params: Record<string, string> = {};
  for (const seg of parts) {
    const m = seg.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*=\s*"?([^"]*)"?$/);
    if (m) params[m[1].toLowerCase()] = m[2];
  }
  return params;
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                               Inference helpers                          ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

function toSeconds(v: string | number | null | undefined): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return Number.isFinite(v) && v >= 0 ? Math.floor(v) : undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Prefer a short reason from RFC7807; else use hints from WWW-Auth or meta. */
function inferReason(
  problem?: ProblemDetail,
  wwwParams?: Record<string, string>,
  metaHint?: string | null
): string | undefined {
  if (problem?.detail) return problem.detail;
  if (problem?.title) return problem.title;
  if (metaHint && typeof metaHint === "string") return metaHint;
  const err = wwwParams?.error;
  if (err) return err.replace(/_/g, " ");
  return undefined;
}

/** Infer a method hint using headers / WWW-Auth / RFC7807 details. */
function inferMethod(
  xReauthMethod: string | null | undefined,
  wwwParams: Record<string, string>,
  problem?: Partial<ProblemDetail> | null,
  fallback: ReauthMethod = "unknown"
): ReauthMethod {
  const lowered = (xReauthMethod ?? "").toLowerCase();
  if (lowered === "any") return "any";
  if (lowered.includes("mfa") || lowered.includes("totp") || lowered.includes("otp")) return "mfa";
  if (lowered.includes("password") || lowered.includes("passcode")) return "password";

  const err = (wwwParams["error"] || "").toLowerCase();
  const prompt = (wwwParams["prompt"] || "").toLowerCase();
  const acr = (wwwParams["acr_values"] || "").toLowerCase();
  if (err.includes("mfa") || prompt.includes("mfa") || acr.includes("mfa")) return "mfa";
  if (prompt.includes("login") || prompt.includes("password")) return "password";

  const type = (problem?.type || "").toLowerCase();
  const title = (problem?.title || "").toLowerCase();
  const detail = (problem?.detail || "").toLowerCase();
  if (type.includes("mfa") || title.includes("mfa") || detail.includes("mfa")) return "mfa";
  if (title.includes("password") || detail.includes("password")) return "password";

  return fallback;
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                                 Public API                               ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/**
 * Extract a structured summary describing the reauth requirement.
 * Safe for SSR; no browser APIs used.
 *
 * Works with:
 *  • Our `AppError` (preferred) — uses `code/status/requestId/meta`
 *  • Legacy `Ky`-style errors that still carry `response`/headers
 */
export function getReauthInfo(e: unknown): ReauthInfo {
  const base: ReauthInfo = { required: false, method: "unknown" };

  // ── Preferred path: AppError from our client ──────────────────────────────
  if (isAppError(e)) {
    const status = e.status ?? 0;
    const code = e.code;
    const meta = (e.meta ?? {}) as Record<string, unknown>;
    const problem = (meta as unknown as ProblemDetail) || (undefined as unknown as ProblemDetail | undefined);

    // The client maps header-based step-up into AppError.meta:
    //   meta.hint?: string, meta.challengeId?: string, meta.expiresIn?: number
    const metaHint = (meta["hint"] as string | undefined) ?? null;
    const metaChallengeId = (meta["challengeId"] as string | undefined) ?? null;
    const metaExpiresInRaw = (meta["expiresIn"] as number | string | undefined) ?? null;

    const required = code === "need_step_up";

    const info: ReauthInfo = {
      required,
      method: inferMethod(undefined, {}, problem, required ? "any" : "unknown"),
      reason: inferReason(problem, undefined, metaHint),
      expiresInSeconds: toSeconds(metaExpiresInRaw),
      requestId: e.requestId ?? undefined,
      source: {
        metaHint,
        metaChallengeId,
        metaExpiresIn: metaExpiresInRaw,
        problemType: (problem as any)?.type,
        problemCode: (problem as any)?.code as string | undefined,
        status,
      },
    };

    // Heuristic: 401/403 with problem type/hints may still imply reauth
    if (!required && (status === 401 || status === 403)) {
      const type = String((problem as any)?.type ?? "").toLowerCase();
      const looksLikeReauth =
        type.includes("reauth") ||
        type.includes("step_up") ||
        type.includes("step-up") ||
        type.includes("insufficient_user_authentication");
      if (looksLikeReauth) {
        info.required = true;
        info.method = inferMethod(undefined, {}, problem, "unknown");
      }
    }

    return info;
  }

  // ── Legacy fallback: error with `response` and headers ────────────────────
  if (isLegacyHttpError(e) && e.response) {
    const res = e.response;
    const status = res.status;
    const requestId = (e as any).requestId || res.headers.get("x-request-id") || undefined;

    const xReauth = res.headers.get(HDR_X_REAUTH); // "required"?
    const xReauthMethod = res.headers.get(HDR_X_REAUTH_METHOD);
    const xReauthExpiresIn = res.headers.get(HDR_X_REAUTH_EXPIRES_IN);
    const xReauthTtl = res.headers.get(HDR_X_REAUTH_TTL);
    const xReauthId = res.headers.get(HDR_X_REAUTH_ID);
    const wwwAuth = res.headers.get("www-authenticate");
    const wwwParams = parseWwwAuthenticate(wwwAuth);
    const problem = (e.problem as ProblemDetail | undefined) ?? undefined;
    const legacyCode = (e.code as string | undefined) ?? undefined;

    const expiresInSeconds = toSeconds(xReauthExpiresIn) ?? toSeconds(xReauthTtl) ?? undefined;

    // Primary signals: explicit header or normalized code
    const headerRequires = (xReauth || "").toLowerCase() === "required";
    const codeRequires = legacyCode?.toLowerCase() === "need_step_up";

    if (headerRequires || codeRequires) {
      return {
        required: true,
        method: inferMethod(xReauthMethod, wwwParams, problem, "any"),
        reason: inferReason(problem, wwwParams, null),
        expiresInSeconds,
        requestId,
        source: {
          xReauth,
          xReauthMethod,
          xReauthExpiresIn,
          xReauthTtl,
          xReauthId,
          wwwAuthenticate: wwwAuth,
          problemType: problem?.type,
          problemCode: (problem as any)?.code as string | undefined,
          status,
        },
      };
    }

    // Secondary hints: 401/403 + authenticate/problem hints
    const problemType = (problem?.type || "").toLowerCase();
    const looksLikeReauthProblem =
      problemType.includes("reauth") ||
      problemType.includes("step_up") ||
      problemType.includes("step-up") ||
      problemType.includes("insufficient_user_authentication");

    const wwwSuggestsReauth =
      ["insufficient_user_authentication", "mfa_required", "step_up_required"].some((k) =>
        (wwwParams["error"] || "").toLowerCase().includes(k)
      ) || (wwwParams["prompt"] || "").toLowerCase().includes("login");

    if ((status === 401 || status === 403) && (looksLikeReauthProblem || wwwSuggestsReauth)) {
      return {
        required: true,
        method: inferMethod(null, wwwParams, problem, "unknown"),
        reason: inferReason(problem, wwwParams, null),
        expiresInSeconds,
        requestId,
        source: {
          xReauth,
          xReauthMethod,
          xReauthExpiresIn,
          xReauthTtl,
          xReauthId,
          wwwAuthenticate: wwwAuth,
          problemType: problem?.type,
          problemCode: (problem as any)?.code as string | undefined,
          status,
        },
      };
    }

    return base;
  }

  // Unknown error shape
  return base;
}

/** Type guard: returns `true` when the given error indicates a reauth requirement. */
export function isReauthRequired(e: unknown): boolean {
  return getReauthInfo(e).required;
}

/** Convenience: pick the best-effort method hint for which dialog to open. */
export function pickReauthMethod(e: unknown): ReauthMethod {
  return getReauthInfo(e).method;
}

/**
 * Convenience: a concise, human-readable reason to show near the prompt.
 * Falls back to a generic message when not available.
 */
export function reauthReason(
  e: unknown,
  fallback = "Please confirm your identity to continue."
): string {
  return getReauthInfo(e).reason ?? fallback;
}
