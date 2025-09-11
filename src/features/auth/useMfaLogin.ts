// features/auth/useMfaLogin.ts
"use client";

/**
 * =============================================================================
 * Auth › MFA Login (TOTP) — flexible input, idempotent, production-grade
 * =============================================================================
 * @endpoint POST /api/v1/auth/mfa-login
 * @body     { mfa_token, totp_code, remember?, trusted_device_label? }
 *
 * Semantics
 * - Validates with canonical Zod schema first; falls back to a flexible schema
 *   that accepts `code` or `totp_code` and strips whitespace (e.g., "123 456").
 * - Sends Idempotency-Key to dedupe double-submits and allow safe transient retries.
 * - Uses unified client (auth/refresh aware, 204-tolerant, step-up aware).
 * - On success, stores the access token **in memory** (refresh remains HttpOnly).
 */

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { setAccessToken } from "@/lib/api/tokens";
import { env } from "@/lib/env";
import {
  MFALoginSchema,         // { mfa_token, totp_code } (strict)
  type MFALoginInput,
  LoginSuccessSchema,      // { access_token, ... } (passthrough)
} from "@/features/auth/schemas";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_MFA_LOGIN_PATH =
  env().NEXT_PUBLIC_MFA_LOGIN_PATH ??
  "api/v1/auth/mfa-login";
export const MFA_LOGIN_PATH = RAW_MFA_LOGIN_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Flexible input (accept `code` or `totp_code`, normalize, keep extras)
   ──────────────────────────────────────────────────────────────────────────── */

const FlexibleMfaLoginInput = z
  .object({
    mfa_token: z.string().min(1, "Missing MFA token"),
    // Accept either, normalize to `totp_code`
    totp_code: z.string().optional(),
    code: z.string().optional(),
    // Optional extras some backends support
    remember: z.boolean().optional(),
    trusted_device_label: z.string().min(1).max(120).optional(),
  })
  .refine((v) => !!(v.totp_code ?? v.code), {
    message: "Enter your 6-digit code",
    path: ["totp_code"],
  })
  .transform((v) => {
    const raw = (v.totp_code ?? v.code ?? "").replace(/\s+/g, "");
    return {
      mfa_token: v.mfa_token,
      totp_code: raw,
      ...(typeof v.remember === "boolean" ? { remember: v.remember } : null),
      ...(v.trusted_device_label ? { trusted_device_label: v.trusted_device_label } : null),
    } as {
      mfa_token: string;
      totp_code: string;
      remember?: boolean;
      trusted_device_label?: string;
    };
  });

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

export type MfaLoginResult = z.infer<typeof LoginSuccessSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useMfaLogin() {
  return useMutation<
    MfaLoginResult,
    AppError,
    MFALoginInput | z.input<typeof FlexibleMfaLoginInput>
  >({
    mutationKey: ["auth", "mfa-login"],
    mutationFn: async (variables) => {
      // 1) Prefer canonical strict schema; fall back to flexible input
      let body:
        | { mfa_token: string; totp_code: string; remember?: boolean; trusted_device_label?: string };

      try {
        const strict = MFALoginSchema.parse(variables);
        body = {
          mfa_token: strict.mfa_token,
          // be forgiving of spaces even on strict path
          totp_code: strict.totp_code.replace(/\s+/g, ""),
        };
      } catch {
        body = FlexibleMfaLoginInput.parse(variables as unknown);
      }

      // 2) POST with Idempotency-Key (unified client = 204-tolerant, auth aware)
      const { data } = await fetchJsonWithMeta<unknown>(MFA_LOGIN_PATH, {
        method: "POST",
        json: body,
        headers: { "Idempotency-Key": newIdemKey() },
        cache: "no-store",
      });

      // 3) Validate token success (schema is .passthrough() for forward-compat)
      const parsed = LoginSuccessSchema.parse(data ?? {});
      // 4) Store access token in memory (refresh cookie is server-managed)
      setAccessToken(parsed.access_token);
      return parsed;
    },
  });
}
