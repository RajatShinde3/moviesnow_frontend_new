// features/auth/useMfaVerify.ts
"use client";

/**
 * =============================================================================
 * Auth › Verify MFA (TOTP) — flexible input, idempotent, step-up aware
 * =============================================================================
 * @endpoint POST /api/v1/auth/mfa/verify
 * @body     { totp_code, remember_device?, setup_token?, method? }
 *
 * Semantics
 * - Accepts `code` or `totp_code` → normalizes to `totp_code` (strips spaces/dashes).
 * - Validates with shared `Otp6to8DigitsSchema`.
 * - Optional `reauth_token` is sent as **X-Reauth** header (not in JSON).
 * - Adds Idempotency-Key to protect against double-submits.
 * - Uses unified client (204 tolerant, auth/refresh/step-up aware).
 * - Normalizes responses into a single result shape.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchJsonWithMeta,
  REAUTH_HEADER_NAME,
  type AppError,
} from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { env } from "@/lib/env";
import { z } from "zod";
import { Otp6to8DigitsSchema } from "@/features/auth/schemas";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env) + normalization (legacy alias supported)
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_MFA_VERIFY_PATH =
  env().NEXT_PUBLIC_MFA_VERIFY_PATH ??
  "api/v1/auth/mfa/verify";
export const MFA_VERIFY_PATH = RAW_MFA_VERIFY_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Input: flexible → canonical payload + validation
   ──────────────────────────────────────────────────────────────────────────── */

const RawInput = z
  .object({
    code: z.string().min(1).optional(),           // UI-friendly alias
    totp_code: z.string().min(1).optional(),      // canonical field
    remember_device: z.boolean().optional(),
    setup_token: z.string().min(1).optional(),
    reauth_token: z.string().min(1).optional(),   // sent as header, not in body
    method: z.enum(["totp", "sms", "email"]).optional(),
  })
  .strict();

/** Transform + validate: normalize to { totp_code, ... } and ensure 6–8 digits. */
// keep RawInput as-is

const MfaVerifyPayloadSchema = RawInput
  .transform((v) => {
    const normalized = (v.totp_code ?? v.code ?? "").replace(/[\s-]+/g, "");
    return {
      totp_code: normalized,
      remember_device: v.remember_device,
      setup_token: v.setup_token,
      // keep a precise union type for method
      method: (v.method ?? "totp") as "totp" | "sms" | "email",
      reauth_token: v.reauth_token,
    };
  })
  .superRefine((val, ctx) => {
    // Validate the normalized code using your shared schema
    // (import { Otp6to8DigitsSchema } from "@/features/auth/schemas")
    const ok = Otp6to8DigitsSchema.safeParse(val.totp_code).success;
    if (!ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["totp_code"],
        message: "Enter the 6–8 digit code",
      });
    }
  });

export type MfaVerifyInput = z.input<typeof RawInput>;
type MfaVerifyPayload = z.infer<typeof MfaVerifyPayloadSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Response normalization (tolerate 204 and varied JSON)
   ──────────────────────────────────────────────────────────────────────────── */

const MfaVerifyResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    enabled: z.boolean().optional(),
    recovery_codes: z.array(z.string()).nullable().optional(),
    backup_codes: z.array(z.string()).nullable().optional(), // alt name
    message: z.string().optional(), // Backend message
    mfa_token: z.string().nullable().optional(), // Backend token
  })
  .partial()
  .passthrough();

export type MfaVerifyResult = {
  ok: true;
  enabled?: boolean;
  recovery_codes?: string[];
  requestId?: string | null;
};

/* ────────────────────────────────────────────────────────────────────────────
   Retry policy — transient only (network/5xx). Never retry 429.
   ──────────────────────────────────────────────────────────────────────────── */

function getHttpStatus(err: unknown): number | undefined {
  const e: any = err;
  if (typeof e?.status === "number") return e.status;
  if (typeof e?.response?.status === "number") return e.response.status;
  if (typeof e?.cause?.status === "number") return e.cause.status;
  if (typeof e?.cause?.response?.status === "number") return e.cause.response.status;
  return undefined;
}
function shouldRetry(_count: number, err: unknown) {
  const s = getHttpStatus(err);
  if (s == null) return true;            // network/CORS/etc.
  if (s === 429) return false;           // respect rate limiting
  if (s >= 500 && s < 600) return true;  // transient server errors
  return false;                           // no retry for other 4xx
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useMfaVerify() {
  const qc = useQueryClient();

  return useMutation<MfaVerifyResult, AppError, MfaVerifyInput>({
    mutationKey: ["auth", "mfa", "verify"],
    retry: shouldRetry,
    mutationFn: async (variables) => {
      console.log("🔐 [useMfaVerify] Input variables:", variables);
      const payload: MfaVerifyPayload = MfaVerifyPayloadSchema.parse(variables);
      console.log("🔐 [useMfaVerify] Parsed payload:", payload);

      // Compose headers: Idempotency always; X-Reauth if provided
      const headers: Record<string, string> = { "Idempotency-Key": newIdemKey() };
      if (payload.reauth_token) headers[REAUTH_HEADER_NAME] = payload.reauth_token;

      // Build JSON body without the reauth token
      // Backend expects "code" not "totp_code"
      const { reauth_token: _rt, totp_code, ...rest } = payload;
      const json = { code: totp_code, ...rest };

      console.log("🔐 [useMfaVerify] Request path:", MFA_VERIFY_PATH);
      console.log("🔐 [useMfaVerify] Request body:", json);
      console.log("🔐 [useMfaVerify] Request headers:", headers);

      const { data, requestId } = await fetchJsonWithMeta<unknown | undefined>(MFA_VERIFY_PATH, {
        method: "POST",
        json,
        headers,
        cache: "no-store",
      });

      console.log("🔐 [useMfaVerify] Response data:", data, "requestId:", requestId);

      // 204 → ok
      if (!data) {
        console.log("🔐 [useMfaVerify] No data, returning ok");
        return { ok: true, requestId } as const;
      }

      // Normalize diverse responses
      const parsed = MfaVerifyResponseSchema.parse(data);
      console.log("🔐 [useMfaVerify] Parsed response:", parsed);
      const recovery = parsed.recovery_codes ?? parsed.backup_codes ?? undefined;

      const result = {
        ok: true as const,
        enabled: parsed.enabled,
        recovery_codes: recovery,
        requestId,
      };
      console.log("🔐 [useMfaVerify] Returning result:", result);
      return result;
    },
    onSuccess: async () => {
      // MFA verified successfully — refresh related caches
      await qc.invalidateQueries({ queryKey: ["auth", "mfa"] });
      await qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
