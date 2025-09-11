// features/auth/useRefresh.ts
"use client";

/**
 * =============================================================================
 * Auth › Refresh Access Token (production-grade, backend-aligned)
 * =============================================================================
 *
 * Purpose
 * -------
 * Manually rotate the **access token** using the server-managed, HttpOnly
 * refresh cookie. Normally our fetch client auto-refreshes on a 401; use this
 * when you want to proactively refresh (e.g., before long uploads).
 *
 * Backend contract
 * ----------------
 * POST `${PATHS.refresh}`  → e.g. `/api/v1/auth/refresh-token`
 * Body is optional. Many backends read the cookie only; others accept:
 *   { refresh_token?, device_id? }
 *
 * Behavior & safety
 * -----------------
 * - **Never** stores refresh tokens in web storage (server keeps them in cookie).
 * - Tolerates `204 No Content` and common JSON shapes:
 *     { access_token, token_type?, expires_in? }
 *     { token } | { accessToken } | { tokens: {...} } | { data: {...} } | { ok:true }
 * - Updates the in-memory access token **only when** the server returns one
 *   (won’t clear your current token on 204/ACK).
 * - Conservative retry: at most once for network/5xx; never retry 4xx/429.
 */

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJson, type AppError } from "@/lib/api/client";
import { PATHS } from "@/lib/env";
import { setAccessToken, getAccessToken } from "@/lib/api/tokens";

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

export type RefreshInput = {
  /** Strongly discouraged on the client; prefer HttpOnly cookies on the server. */
  refresh_token?: string;
  /** Optional device/session hint if your API supports it. */
  device_id?: string;
};

export type RefreshResult = {
  access_token: string | null;
  token_type?: string;
  expires_in?: number;
};

/* ────────────────────────────────────────────────────────────────────────────
   Schemas
   ──────────────────────────────────────────────────────────────────────────── */

const InputSchema = z
  .object({
    refresh_token: z.string().min(1).optional(),
    device_id: z.string().min(1).optional(),
  })
  .strict();

/** Canonical token payload validator (used for all shapes below). */
const TokenPayload = z
  .object({
    access_token: z.string(),
    token_type: z.string().optional(),
    /** Seconds until expiry (sometimes returned as a string). */
    expires_in: z
      .preprocess((v) => (typeof v === "string" ? Number.parseInt(v, 10) : v), z.number().int().positive())
      .optional(),
  })
  .passthrough();

/* ────────────────────────────────────────────────────────────────────────────
   Helpers (runtime guards → avoid brittle union narrowing errors)
   ──────────────────────────────────────────────────────────────────────────── */

const isObj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object";

const parseTokenPayload = (v: unknown) => {
  const p = TokenPayload.safeParse(v);
  return p.success ? p.data : null;
};

/** Extract access token data from flexible server response shapes. */
function extractToken(data: unknown): RefreshResult {
  // 204/empty → do not clear what we have; simply report "no new token"
  if (data == null) return { access_token: null };

  // Accept a simple ack `{ ok: true }`
  if (isObj(data) && data.ok === true) return { access_token: null };

  // Variant: { token } or { accessToken }
  if (isObj(data) && typeof data.token === "string") {
    return { access_token: data.token, token_type: "bearer" };
  }
  if (isObj(data) && typeof (data as any).accessToken === "string") {
    return { access_token: (data as any).accessToken, token_type: "bearer" };
  }

  // Variant: { tokens: {...} }
  if (isObj(data) && isObj((data as any).tokens)) {
    const p = parseTokenPayload((data as any).tokens);
    if (p) return { access_token: p.access_token, token_type: p.token_type, expires_in: p.expires_in };
  }

  // Variant: { data: {...} }
  if (isObj(data) && isObj((data as any).data)) {
    const p = parseTokenPayload((data as any).data);
    if (p) return { access_token: p.access_token, token_type: p.token_type, expires_in: p.expires_in };
  }

  // Direct payload: { access_token, ... }
  const p = parseTokenPayload(data);
  if (p) return { access_token: p.access_token, token_type: p.token_type, expires_in: p.expires_in };

  // Unknown success shape → safest to keep the current token
  return { access_token: null };
}

/* ────────────────────────────────────────────────────────────────────────────
   Retry posture — transient only (at most once)
   ──────────────────────────────────────────────────────────────────────────── */

function shouldRetry(count: number, err: AppError) {
  const s = err?.status;
  if (!s) return count < 1;                 // network/CORS/etc → retry once
  if (s >= 500 && s < 600) return count < 1; // single retry for 5xx
  return false;                              // never retry 4xx/429
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useRefresh() {
  return useMutation<RefreshResult, AppError, RefreshInput | void>({
    mutationKey: ["auth", "refresh"],
    retry: shouldRetry,
    mutationFn: async (vars) => {
      // Many servers need no body (cookie only). Only send if caller passed fields.
      const input = InputSchema.parse(vars ?? {});
      const body = input.refresh_token || input.device_id ? input : undefined;

      // Accepts 200 JSON or 204 No Content (client returns `undefined` on 204)
      const raw = await fetchJson<unknown | undefined>(PATHS.refresh, {
        method: "POST",
        json: body,
        // No Idempotency-Key: refresh is a single exchange backed by the cookie.
      });

      const result = extractToken(raw);

      // Update in-memory access token **only if** the server returned one.
      if (typeof result.access_token === "string" && result.access_token.length > 0) {
        setAccessToken(result.access_token);
      } else {
        // Explicitly keep whatever we have; do not clear on 204/ACK.
        void getAccessToken();
      }

      return result;
    },
  });
}
