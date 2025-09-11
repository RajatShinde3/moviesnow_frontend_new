// hooks/useEmailVerificationVerify.ts
"use client";

/**
 * =============================================================================
 * Auth › Verify Email (GET-first, POST fallback, 204-tolerant)
 * =============================================================================
 * @primary  GET  `${PATHS.verifyEmail}?token=...`
 * @fallback POST `${PATHS.verifyEmail}` with JSON `{ token }` (only on 404/405)
 *
 * Semantics
 * - Tolerates both 200 JSON and 204 No Content.
 * - Accepts several common success shapes and normalizes to:
 *     { ok: true, access_token?: string, next?: string }
 * - If `access_token` is returned, it is stored **in-memory only**.
 *
 * Notes
 * - No Idempotency-Key: resend is idempotent, verification isn’t.
 * - Our client will only retry **safe** requests; POST fallback won’t auto-retry.
 */

import { useMutation } from "@tanstack/react-query";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { PATHS } from "@/lib/env";
import { setAccessToken } from "@/lib/api/tokens";
import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────────
   Input
   ──────────────────────────────────────────────────────────────────────────── */

const Input = z.object({
  token: z.string().min(1, "Verification token is required"),
});
export type EmailVerificationVerifyInput = z.infer<typeof Input>;

/* ────────────────────────────────────────────────────────────────────────────
   Response normalization
   ──────────────────────────────────────────────────────────────────────────── */

/** Server response patterns seen in the wild (permissive). */
const ResponseShape = z.union([
  z.object({ ok: z.literal(true) }).passthrough(),
  z.object({ verified: z.literal(true) }).passthrough(),
  z.object({ access_token: z.string() }).passthrough(),
  z.object({ token: z.string() }).passthrough(),
  z.object({ accessToken: z.string() }).passthrough(),
  z.object({ next: z.string() }).passthrough(), // may be relative or absolute
]);

export type EmailVerificationVerifyResult = {
  ok: true;
  /** Provided when the backend auto-signs in after verification. */
  access_token?: string;
  /** Optional follow-up location from the server. */
  next?: string;
};

function isAppError(e: unknown): e is AppError {
  return !!e && typeof e === "object" && (e as any).name === "AppError";
}

/** Normalize diverse success payloads into a single, predictable shape. */
function normalize(resp: unknown | undefined): EmailVerificationVerifyResult {
  if (!resp) return { ok: true };
  const parsed = ResponseShape.safeParse(resp);
  if (!parsed.success) return { ok: true }; // treat any 2xx as success
  const v = parsed.data as any;

  const result: EmailVerificationVerifyResult = { ok: true };
  const tok: unknown = v?.access_token ?? v?.token ?? v?.accessToken;
  if (typeof tok === "string") result.access_token = tok;
  if (typeof v?.next === "string") result.next = v.next;
  if (v?.verified === true || v?.ok === true) result.ok = true;
  return result;
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useEmailVerificationVerify() {
  return useMutation<EmailVerificationVerifyResult, AppError, EmailVerificationVerifyInput>({
    mutationKey: ["auth", "verify-email"],
    mutationFn: async (vars) => {
      const { token } = Input.parse(vars);

      // Build query params safely for GET-first strategy
      const searchParams = new URLSearchParams({ token });

      // 1) Try GET (idempotent; client may transient-retry if needed)
      try {
        const { data } = await fetchJsonWithMeta<unknown | undefined>(PATHS.verifyEmail, {
          method: "GET",
          searchParams,
        });
        const res = normalize(data);
        if (res.access_token) setAccessToken(res.access_token);
        return res;
      } catch (err) {
        // 2) Fallback to POST only for method/path mismatch (404/405)
        if (isAppError(err) && (err.status === 405 || err.status === 404)) {
          const { data } = await fetchJsonWithMeta<unknown | undefined>(PATHS.verifyEmail, {
            method: "POST",
            json: { token },
          });
          const res = normalize(data);
          if (res.access_token) setAccessToken(res.access_token);
          return res;
        }
        throw err;
      }
    },
  });
}
