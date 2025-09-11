// lib/auth/tokens.ts
"use client";

/**
 * =============================================================================
 *  Canonical Auth Token API (client-only shim)
 * =============================================================================
 *
 *  Purpose
 *  -------
 *  Provide a stable import path for all token operations while keeping a single
 *  source of truth in `lib/auth_store.ts` (Zustand store / event emitters).
 *
 *  Why a shim?
 *  ----------
 *  • Production-safe: no side-effects at import; runs only on the client.
 *  • HMR-resilient: re-exports the same global store (no duplicate listeners).
 *  • Separation of concerns: UI code depends on this small facade, not the
 *    internals of the store (easier to refactor later).
 *
 *  Security posture
 *  ----------------
 *  • Access token lives **only in memory** (never localStorage/sessionStorage).
 *  • Refresh is handled by HttpOnly cookies at the backend; this module does not
 *    read cookies or storage.
 *
 *  Common usage
 *  ------------
 *    import { getAccessToken, getAuthHeader, onAccessTokenChange } from "@/lib/auth/tokens";
 *
 *    const tok = getAccessToken();
 *    const hdr = getAuthHeader(); // { Authorization: "Bearer <...>" } | {}
 *    const unsubscribe = onAccessTokenChange((t) => console.log("token changed:", t));
 *
 *    // When logging out:
 *    await logout(); // clears in-memory token & emits events
 *
 *  Compatibility aliases
 *  ---------------------
 *  • `onAccessTokenChange` → `subscribe`
 *  • `waitForAccessToken`  → `waitForToken`
 */

//
// Core token operations
//
/** Get the current in-memory access token (string or null). */
export { getAccessToken } from "../auth_store";
/** Set/replace the current in-memory access token (string or null). */
export { setAccessToken } from "../auth_store";
/** Clear the in-memory token and related auth state. */
export { clearAccessToken } from "../auth_store";
/** Application-level logout (clears token and emits logout event). */
export { logout } from "../auth_store";

//
// Events & reactive helpers
//
/** Subscribe to access token changes; returns an unsubscribe function. */
export { subscribe as onAccessTokenChange } from "../auth_store";
/** Subscribe to logout events; returns an unsubscribe function. */
export { onLogout } from "../auth_store";
/** Await until a non-null access token is present (with timeout support). */
export { waitForToken as waitForAccessToken } from "../auth_store";

//
// Header & auth helpers
//
/** Build `{ Authorization: "Bearer <token>" }` when a token exists, else `{}`. */
export { getAuthHeader } from "../auth_store";
/** True when an access token exists and is not expired (best effort). */
export { isAuthenticated } from "../auth_store";

//
// JWT / expiry utilities
//
/** Decode the access token’s payload (without verifying signature). */
export { getTokenPayload } from "../auth_store";
/** Seconds until token expiry (best effort; 0 when unknown/expired). */
export { secondsUntilExpiry } from "../auth_store";
/** Epoch seconds when the token expires (from `exp` claim), or null. */
export { getTokenExpiry } from "../auth_store";
/** Whether the current token is expired (tolerates small clock skew). */
export { isTokenExpired } from "../auth_store";

//
// Testing hooks (safe to tree-shake from production)
//
/** Test-only: reset the auth store between tests. */
export { __resetAuthStoreForTests__ } from "../auth_store";

//
// Types
//
export type {
  TokenChangeListener as TokenListener,
  JwtPayload,
} from "../auth_store";
