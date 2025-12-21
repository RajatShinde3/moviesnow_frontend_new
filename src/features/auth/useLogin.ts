// features/auth/useLogin.ts
"use client";

/**
 * =============================================================================
 * Auth › Password Login (MFA-aware, idempotent, production-grade)
 * =============================================================================
 * @endpoint POST /api/v1/auth/login
 * @body     { email, password }
 *
 * Semantics
 * - Strict request validation with Zod (email normalized in schema).
 * - Sends Idempotency-Key to dedupe double-submits/retries.
 * - Uses unified client (204 tolerant, refresh/step-up aware).
 * - Response union parsed strictly:
 *     • Success → stores access_token (in-memory) + invalidates ["auth","me"].
 *     • MFA required → returns challenge as-is (no token stored).
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { setAccessToken } from "@/lib/api/tokens";
import {
  LoginSchema,
  type LoginInput,
  LoginResponseSchema, // union: success tokens OR MFA challenge
} from "@/features/auth/schemas";
import { env } from "@/lib/env";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_LOGIN_PATH = env().NEXT_PUBLIC_LOGIN_PATH ?? "api/v1/auth/login";
export const LOGIN_PATH = RAW_LOGIN_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Types & helpers
   ──────────────────────────────────────────────────────────────────────────── */

export type LoginResult = z.infer<typeof LoginResponseSchema>;
type LoginSuccess = Extract<LoginResult, { access_token: string }>;
type LoginMfa = Extract<LoginResult, { mfa_token: string }>;

function isLoginSuccess(v: LoginResult): v is LoginSuccess {
  return typeof (v as any)?.access_token === "string";
}
function isLoginMfa(v: LoginResult): v is LoginMfa {
  return typeof (v as any)?.mfa_token === "string";
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useLogin() {
  const qc = useQueryClient();

  return useMutation<LoginResult, AppError, LoginInput>({
    mutationKey: ["auth", "login"],
    mutationFn: async (variables) => {
      // 1) Strictly validate client payload (email normalized by schema)
      const payload = LoginSchema.parse(variables);

      // 2) POST with Idempotency-Key; unified client handles 204, refresh, etc.
      const { data } = await fetchJsonWithMeta<unknown>(LOGIN_PATH, {
        method: "POST",
        json: payload,
        headers: { "Idempotency-Key": newIdemKey() },
        cache: "no-store",
      });

      // 3) Parse against the union (success tokens OR MFA challenge)
      const parsed = LoginResponseSchema.parse(data ?? {});

      // 4) Branch on union
      if (isLoginSuccess(parsed)) {
        // Store short-lived access token in memory (refresh remains in HttpOnly cookie)
        setAccessToken(parsed.access_token);
        return parsed;
      }
      if (isLoginMfa(parsed)) {
        // Caller should route to MFA step with this token
        return parsed;
      }

      // Should never happen due to schema validation; safety net for drift
      throw new Error("Unexpected login response shape");
    },

    // Keep cache consistent after successful credential login
    onSuccess: async (result) => {
      if (isLoginSuccess(result)) {
        // Force refetch to ensure we get fresh user data immediately
        await qc.refetchQueries({ queryKey: ["user", "me"], type: "active" });
      }
    },
  });
}
