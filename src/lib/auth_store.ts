// src/lib/auth_store.ts

/**
 * =============================================================================
 *  In-memory access-token store (browser-first, SSR-safe, HMR-resilient)
 * =============================================================================
 *
 *  Why in-memory?
 *  --------------
 *  • Safer than local/session storage (no persistent XSS blast radius).
 *  • Token is per-tab and cleared on hard refresh/navigation.
 *  • Cross-tab *logout* sync via BroadcastChannel, with a storage-event fallback.
 *
 *  Design goals
 *  ------------
 *  • **SSR-safe**: No browser APIs at import time; listeners bound lazily.
 *  • **HMR-resilient**: Single global store across hot reloads in dev.
 *  • **Zero side-effects on import**: First API call initializes listeners.
 *  • **Small surface** with strict typing for hooks/components.
 *
 *  Non-goals
 *  ---------
 *  • No client persistence. Use HttpOnly cookies (refresh/server session) for
 *    long-lived auth; keep access tokens ephemeral and memory-only.
 *  • Never *trust* JWT claims client-side; the server is source of truth.
 */

export type TokenChangeListener = (token: string | null) => void;

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                      Cross-tab signaling primitives                      ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/** BroadcastChannel name for auth events. */
const CHANNEL_NAME = "auth" as const;
/** Storage key used to emulate cross-tab logout when BC is unavailable. */
const STORAGE_LOGOUT_KEY = "__auth_logout__" as const;
/** Message shape carried over BroadcastChannel (never carries tokens). */
type AuthBroadcastMessage = { type: "logout" };

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                         Internal store & singleton                       ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

type Store = {
  token: string | null;
  listeners: Set<TokenChangeListener>;

  // Cross-tab transports
  bc: BroadcastChannel | null;
  bcBound: boolean;
  storageBound: boolean;

  // Exposed for test cleanup
  __onMessage?: (e: MessageEvent<AuthBroadcastMessage>) => void;
  __onStorage?: (e: StorageEvent) => void;

  // One-time lazy init
  initialized: boolean;
};

function createStore(): Store {
  return {
    token: null,
    listeners: new Set<TokenChangeListener>(),
    bc: null,
    bcBound: false,
    storageBound: false,
    __onMessage: undefined,
    __onStorage: undefined,
    initialized: false,
  };
}

// Keep a single instance across HMR in development.
declare global {
  var __AUTH_STORE__: Store | undefined;
}

const store: Store =
  process.env.NODE_ENV !== "production"
    ? (globalThis.__AUTH_STORE__ ?? (globalThis.__AUTH_STORE__ = createStore()))
    : createStore();

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                           Init & channel helpers                         ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Lazily initialize cross-tab listeners the first time *any* public API
 * is called (get/set/subscribe/logout). No-op on the server.
 */
function ensureInitialized(): void {
  if (!isBrowser() || store.initialized) return;
  store.initialized = true;
  ensureCrossTabSignals();
}

/**
 * Ensure BroadcastChannel (primary) or storage-event (fallback) listeners
 * are bound exactly once. No-ops during SSR.
 */
function ensureCrossTabSignals(): void {
  if (!isBrowser()) return;

  // BroadcastChannel (primary)
  if (!store.bc && typeof (globalThis as any).BroadcastChannel !== "undefined") {
    try {
      store.bc = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      store.bc = null;
    }
  }

  bindBroadcastChannelOnce();
  bindStorageFallbackOnce();
}

/** Bind BroadcastChannel listener once (idempotent). */
function bindBroadcastChannelOnce(): void {
  if (store.bcBound || !store.bc) return;

  const onMessage = (e: MessageEvent<AuthBroadcastMessage>) => {
    if (e?.data?.type === "logout") {
      // Apply locally without re-broadcasting (loop protection).
      applyAccessToken(null, { broadcast: false });
    }
  };

  store.bc.addEventListener("message", onMessage);
  store.__onMessage = onMessage;
  store.bcBound = true;
}

/**
 * Bind storage-event fallback once (idempotent).
 * We ONLY emit/listen for **logout markers** (timestamps). Tokens are never written.
 */
function bindStorageFallbackOnce(): void {
  if (store.storageBound || !isBrowser()) return;

  const hasStorage = (() => {
    try {
      return typeof window.localStorage !== "undefined";
    } catch {
      return false;
    }
  })();
  if (!hasStorage) return;

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_LOGOUT_KEY && e.newValue) {
      applyAccessToken(null, { broadcast: false });
    }
  };

  try {
    window.addEventListener("storage", onStorage);
    store.__onStorage = onStorage;
    store.storageBound = true;
  } catch {
    // Some hardened contexts block storage events; ignore.
    store.storageBound = false;
  }
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                          Core state transitions                          ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/**
 * Internal setter that updates state, notifies subscribers, and (optionally)
 * broadcasts a **logout** to other tabs via BroadcastChannel + storage fallback.
 * We never broadcast or persist the token value itself.
 */
function applyAccessToken(token: string | null, opts: { broadcast?: boolean } = {}) {
  const prev = store.token;
  const changed = prev !== token;

  store.token = token;

  // Notify subscribers only on change; guard against listener exceptions.
  if (changed) {
    for (const fn of Array.from(store.listeners)) {
      try {
        fn(store.token);
      } catch {
        /* no-op */
      }
    }
  }

  // Broadcast *only* logout events to other tabs (never share tokens).
  if (opts.broadcast !== false && token === null && isBrowser()) {
    // Ensure transports are ready.
    ensureCrossTabSignals();

    // BroadcastChannel path (best-effort).
    try {
      store.bc?.postMessage({ type: "logout" } as AuthBroadcastMessage);
    } catch {
      /* no-op */
    }

    // Storage-event fallback (best-effort).
    try {
      // Touch-and-remove to trigger storage events in other tabs.
      localStorage.setItem(STORAGE_LOGOUT_KEY, String(Date.now()));
      localStorage.removeItem(STORAGE_LOGOUT_KEY);
    } catch {
      /* no-op */
    }
  }
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                                 Public API                               ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/** Get the current access token (or null). */
export function getAccessToken(): string | null {
  ensureInitialized();
  return store.token;
}

/**
 * Set or clear the access token.
 *
 * • Setting a token does NOT broadcast (tokens are per-tab).
 * • Clearing a token DOES broadcast logout to other tabs.
 */
export function setAccessToken(token: string | null): void {
  ensureInitialized();
  applyAccessToken(token, { broadcast: true });
}

/** Clear token convenience (alias of setAccessToken(null)). */
export function clearAccessToken(): void {
  setAccessToken(null);
}

/**
 * Ergonomic logout helper:
 * - Clears token locally and broadcasts cross-tab.
 * - Call your backend `/auth/logout` separately in your hook/UI if desired.
 */
export function logout(): void {
  ensureInitialized();
  clearAccessToken();
}

/**
 * Subscribe to token changes.
 * @param listener  Callback invoked on every token change.
 * @param fireNow   If true, invoke immediately with current token.
 * @returns         Unsubscribe function.
 */
export function subscribe(listener: TokenChangeListener, fireNow = false): () => void {
  ensureInitialized();

  store.listeners.add(listener);
  if (fireNow) {
    try {
      listener(store.token);
    } catch {
      /* no-op */
    }
  }

  // Ensure cross-tab listeners are bound on first subscription (browser only).
  ensureCrossTabSignals();

  return () => {
    store.listeners.delete(listener);
  };
}

/**
 * Subscribe once and resolve when a token first meets a condition.
 *
 * @example
 * await waitForToken({ predicate: t => !!t, timeoutMs: 5000 });
 */
export function waitForToken(opts: {
  predicate?: (t: string | null) => boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
} = {}): Promise<string | null> {
  ensureInitialized();

  const { predicate = (t) => t != null, timeoutMs, signal } = opts;

  return new Promise((resolve, reject) => {
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let unsub: (() => void) | undefined;

    const cleanup = () => {
      if (unsub) unsub();
      if (timeoutId) clearTimeout(timeoutId);
      if (signal) signal.removeEventListener("abort", onAbort);
    };

    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    const onAbort = () => {
      if (settled) return;
      settled = true;
      cleanup();
      // DOMException may not exist in some runtimes; fall back to Error
      try {
        throw new DOMException("Aborted", "AbortError");
      } catch {
        reject(new Error("AbortError"));
        return;
      }
    };

    // Subscribe first so TDZ cannot occur if signal is already aborted.
    unsub = subscribe((t) => {
      if (predicate(t)) finish(t);
    }, true);

    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }

    if (timeoutMs && Number.isFinite(timeoutMs)) {
      timeoutId = setTimeout(() => finish(null), Math.max(1, timeoutMs));
    }
  });
}

/**
 * Build an Authorization header map when a token exists.
 * Returns an empty object when not authenticated (safe to spread).
 *
 * @example
 *   fetch(url, { headers: { ...getAuthHeader() } })
 */
export function getAuthHeader(): Record<string, string> {
  ensureInitialized();
  return store.token ? { Authorization: `Bearer ${store.token}` } : {};
}

/** Convenience: subscribe to *only* logout events. */
export function onLogout(cb: () => void): () => void {
  return subscribe((t) => {
    if (t === null) {
      try {
        cb();
      } catch {
        /* no-op */
      }
    }
  });
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                 Lightweight JWT payload decode (UX only)                 ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

export type JwtPayload = {
  sub?: string;
  exp?: number; // seconds since epoch
  iat?: number;
  nbf?: number;
  [k: string]: unknown;
};

/** Base64URL → UTF-8 string (browser or SSR). */
function base64UrlToUtf8(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  const padLen = (4 - (b64.length % 4)) % 4;
  const padded = b64 + "=".repeat(padLen);

  // Browser path
  if (typeof atob === "function") {
    const bin = atob(padded);
    try {
      // Decode potential UTF-8 sequences
      return decodeURIComponent(
        bin
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      );
    } catch {
      return bin; // Fallback: raw Latin-1 string
    }
  }

  // SSR/Edge path: use global Buffer if available
  const maybeBuffer = (globalThis as any).Buffer as
    | { from: (s: string, enc: string) => { toString: (enc: string) => string } }
    | undefined;
  if (maybeBuffer) {
    return maybeBuffer.from(padded, "base64").toString("utf8");
  }

  // Last resort
  return padded;
}

/** Decode the current token's payload (returns null on failure). */
export function getTokenPayload(): JwtPayload | null {
  const t = getAccessToken();
  if (!t) return null;
  const parts = t.split(".");
  if (parts.length < 2) return null;
  try {
    const json = base64UrlToUtf8(parts[1]);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Seconds until token expiry (Infinity if no exp).
 * Useful for UX (e.g., showing “session expires in…”).
 */
export function secondsUntilExpiry(): number {
  const p = getTokenPayload();
  if (!p?.exp) return Infinity;
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, p.exp - now);
}

/** Returns the token expiry (seconds since epoch) or null if absent. */
export function getTokenExpiry(): number | null {
  const p = getTokenPayload();
  return p?.exp ?? null;
}

/**
 * Check if token is expired. Optionally treat it as expired a bit early
 * (e.g., `earlySeconds = 30` to refresh slightly before exact expiry).
 */
export function isTokenExpired(earlySeconds = 0): boolean {
  const p = getTokenPayload();
  if (!p?.exp) return false; // No exp → let server decide (401)
  const now = Math.floor(Date.now() / 1000);
  return now >= p.exp - Math.max(0, earlySeconds);
}

/** Convenience boolean for UI controls. */
export function isAuthenticated(): boolean {
  return !!getAccessToken() && !isTokenExpired(0);
}

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║                              Test utilities                              ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/** Close channels & reset state — useful in unit tests. Do not call at runtime. */
export function __resetAuthStoreForTests__(): void {
  store.token = null;
  store.listeners.clear();

  // BroadcastChannel cleanup
  if (store.bc) {
    try {
      if (store.__onMessage) store.bc.removeEventListener("message", store.__onMessage);
      store.bc.close();
    } catch {
      /* no-op */
    } finally {
      store.bc = null;
      store.bcBound = false;
      store.__onMessage = undefined;
    }
  }

  // Storage-event cleanup
  if (isBrowser() && store.__onStorage) {
    try {
      window.removeEventListener("storage", store.__onStorage);
    } catch {
      /* no-op */
    } finally {
      store.__onStorage = undefined;
      store.storageBound = false;
    }
  }

  store.initialized = false;
}
