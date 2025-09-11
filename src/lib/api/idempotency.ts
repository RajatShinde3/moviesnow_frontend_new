// lib/api/idempotency.ts

/**
 * =============================================================================
 *  Idempotency Key Utilities — production grade
 * =============================================================================
 *
 *  Why idempotency?
 *  ----------------
 *  Auth endpoints often create side-effects (sessions, tokens, emails). If a user
 *  double-clicks, refreshes, or the network retries, we want **exactly-once**
 *  semantics. We achieve this by sending a unique, URL-safe **Idempotency-Key**
 *  with each user-initiated mutation and letting the backend de-duplicate.
 *
 *  What this module provides
 *  -------------------------
 *  • `newIdemKey()`             → cryptographically-random, URL-safe key
 *  • `newIdemKeyWithPrefix()`   → same as above, with a short semantic prefix
 *  • `isValidIdemKey()`         → basic validation (length/charset)
 *  • `IDEMPOTENCY_HEADER_NAME`  → canonical header name ("Idempotency-Key")
 *
 *  Recommended usage
 *  -----------------
 *  Use a **fresh key per attempt** on all mutating auth operations that the
 *  backend treats as idempotent:
 *
 *    - Signup / Login
 *    - Email verification resend
 *    - Password reset (start / verify / confirm)
 *    - MFA reset (start / verify / confirm)
 *    - Sessions revoke / revoke-others
 *    - Reauth verify (step-up)
 *    - Credentials update
 *    - Account deactivate / reactivate / delete
 *
 *  Example
 *  -------
 *    import { newIdemKey, IDEMPOTENCY_HEADER_NAME } from "@/lib/api/idempotency";
 *    import { fetchJson } from "@/lib/api/client";
 *
 *    await fetchJson("/auth/signup", {
 *      method: "POST",
 *      json: body,
 *      headers: { [IDEMPOTENCY_HEADER_NAME]: newIdemKey() },
 *    });
 *
 *  Characteristics
 *  ---------------
 *  • Keys are **URL-safe** (`A–Z a–z 0–9 - _`) and **opaque** (no user data).
 *  • Default length ≈ 22 chars (128 bits base64url) → compact yet strong.
 *  • We clamp to ≤ 64 chars when combining with prefixes to satisfy common
 *    gateways/proxies/CDNs.
 *  • Works in browsers and modern Node runtimes (WebCrypto when available).
 */

export const IDEMPOTENCY_HEADER_NAME = "Idempotency-Key";

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                                  Types                                  ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

export type IdemPrefix =
  | "signup"
  | "login"
  | "email-resend"
  | "email-verify-resend"
  | "password-reset-start"
  | "password-reset-verify"
  | "password-reset-confirm"
  | "mfa-reset-start"
  | "mfa-reset-verify"
  | "mfa-reset-confirm"
  | "reauth-verify"
  | "sessions-revoke"
  | "sessions-revoke-others"
  | "credentials-update"
  | "account-deactivate"
  | "account-reactivate"
  | "account-delete"
  | (string & {}); // allow custom prefixes (short, kebab-case);

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                               Public API                                ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/**
 * Create a new cryptographically-random, URL-safe idempotency key.
 *
 * Implementation details:
 *  - Uses WebCrypto `getRandomValues` when available (browser & Node 20+).
 *  - 16 random bytes (128 bits) → ~22 chars base64url w/o padding.
 *  - Fallback combines timestamp + Math.random (not crypto-strong, but adequate
 *    for a dedupe key if WebCrypto were unavailable).
 */
export function newIdemKey(): string {
  const g: any = globalThis as any;

  // Prefer WebCrypto for strong randomness
  if (g.crypto && typeof g.crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16); // 128 bits
    g.crypto.getRandomValues(bytes);
    return toBase64Url(bytes);
  }

  // Fallback: timestamp + Math.random (adequate for key uniqueness; not for secrets)
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2);
  return sanitizeKey(`${ts}-${rnd}`);
}

/**
 * Create a new idempotency key with a semantic prefix.
 *
 * Use short, lower-kebab prefixes like:
 *  "signup", "login", "email-resend",
 *  "password-reset-start" | "password-reset-verify" | "password-reset-confirm",
 *  "mfa-reset-start"      | "mfa-reset-verify"      | "mfa-reset-confirm",
 *  "reauth-verify",
 *  "sessions-revoke" | "sessions-revoke-others",
 *  "credentials-update",
 *  "account-deactivate" | "account-reactivate" | "account-delete"
 *
 * Notes:
 *  - The combined value is clamped to ≤ 64 characters to fit common proxy limits.
 *  - The prefix is sanitized to `[a-z0-9-]` and trimmed to ≤ 24 characters.
 *
 * @example
 *   const key = newIdemKeyWithPrefix("signup"); // "signup_AbCdEf..."
 */
export function newIdemKeyWithPrefix(prefix: IdemPrefix): string {
  const p = sanitizePrefix(prefix);
  const core = newIdemKey();
  const combined = `${p}_${core}`;
  return combined.length <= 64 ? combined : combined.slice(0, 64);
}

/**
 * Validate an idempotency key for common gateway constraints.
 *
 * Rules:
 *  - 8 to 128 characters
 *  - URL-safe characters only: [A-Za-z0-9\-_]
 *
 * We accept up to 128 to be liberal in what we receive (some callers might
 * supply their own), while our generators keep keys ≤ 64 by default.
 */
export function isValidIdemKey(k: string): boolean {
  if (typeof k !== "string") return false;
  if (k.length < 8 || k.length > 128) return false;
  return /^[A-Za-z0-9\-_]+$/.test(k);
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                              Internal Utils                             ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/** Convert random bytes to base64url without padding (RFC 4648 §5). */
function toBase64Url(bytes: Uint8Array): string {
  // Convert to regular base64
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = typeof btoa === "function" ? btoa(bin) : Buffer.from(bytes).toString("base64");
  // base64url encode, strip padding
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** Ensure the key stays URL-safe and within length constraints (≤ 64, ≥ 8). */
function sanitizeKey(k: string): string {
  const safe = k.replace(/[^A-Za-z0-9\-_]/g, "-");
  const clamped = safe.slice(0, 64);
  return clamped.length >= 8 ? clamped : (clamped + "xxxxxxxx").slice(0, 8);
}

/** Normalize and sanitize the prefix part (lower-kebab, ≤ 24 chars). */
function sanitizePrefix(prefix: string): string {
  const p = prefix.trim().toLowerCase().replace(/[^a-z0-9\-]/g, "-");
  const short = p || "op";
  return short.length <= 24 ? short : short.slice(0, 24);
}
