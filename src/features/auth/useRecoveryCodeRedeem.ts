// features/auth/useRecoveryCodeRedeem.ts
"use client";

/**
 * =============================================================================
 * Auth › Recovery Code Redeem
 * =============================================================================
 * POST /api/v1/auth/mfa/recovery-codes/redeem
 *
 * Guarantees
 * - Accepts aliases (`code` | `recovery_code`) and normalizes to uppercase,
 *   stripping whitespace/dashes.
 * - Sends Idempotency-Key (safe against double-submit/refresh).
 * - Tolerates 204 or tiny JSON acks `{ ok: true }`.
 * - Accepts several token-wrapping shapes and normalizes to either:
 *     • LoginSuccess (access_token …)  OR  • { ok: true }
 * - Conservative retry posture: transient network/5xx only (never retry 429/other 4xx).
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { env } from "@/lib/env";
import { setAccessToken } from "@/lib/auth_store";
import { LoginSuccessSchema, OkSchema } from "./schemas";

/* ────────────────────────────────────────────────────────────────────────────
   Path
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_RECOVERY_REDEEM_PATH =
  env().NEXT_PUBLIC_MFA_RECOVERY_REDEEM_PATH ??
  "api/v1/auth/mfa/recovery-codes/redeem";
export const RECOVERY_REDEEM_PATH = RAW_RECOVERY_REDEEM_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   Input — accept aliases; normalize to { code, mfa_token?, remember_device? }
   ──────────────────────────────────────────────────────────────────────────── */

const RawInputSchema = z
  .object({
    code: z.string().min(1, "Recovery code is required").optional(),
    recovery_code: z.string().min(1).optional(), // alias
    mfa_token: z.string().min(1).optional(),
    remember_device: z.boolean().optional(),
  })
  .strict();

const NormalizedInputSchema = RawInputSchema.transform((v) => {
  const raw = String(v.code ?? v.recovery_code ?? "");
  // "ABCD-EFGH 1234" → "ABCDEFGH1234"
  const normalized = raw.replace(/[\s-]+/g, "").toUpperCase();
  const out: { code: string; mfa_token?: string; remember_device?: boolean } = {
    code: normalized,
  };
  if (v.mfa_token) out.mfa_token = v.mfa_token;
  if (typeof v.remember_device === "boolean") out.remember_device = v.remember_device;
  return out;
}).pipe(
  z.object({
    code: z.string().min(1, "Recovery code is required"),
    mfa_token: z.string().optional(),
    remember_device: z.boolean().optional(),
  })
);

export type RecoveryCodeRedeemInput = z.infer<typeof RawInputSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Result — token bundle or { ok: true }
   ──────────────────────────────────────────────────────────────────────────── */

export type RecoveryCodeRedeemResult =
  | z.infer<typeof LoginSuccessSchema>
  | { ok: true };

const WrappedTokensSchema = z
  .union([
    z.object({ tokens: LoginSuccessSchema }).passthrough(),
    z.object({ session: LoginSuccessSchema }).passthrough(),
    z.object({ data: LoginSuccessSchema }).passthrough(),
  ])

function parseRedeemResponse(resp: unknown): RecoveryCodeRedeemResult {
  if (resp == null) return { ok: true } as RecoveryCodeRedeemResult; // 204

  const direct = LoginSuccessSchema.safeParse(resp);
  if (direct.success) return direct.data;

  const wrapped = WrappedTokensSchema.safeParse(resp);
  if (wrapped.success) {
    const any = wrapped.data as any;
    return (any.tokens ?? any.session ?? any.data) as RecoveryCodeRedeemResult;
  }

  const ok = OkSchema.safeParse(resp);
  if (ok.success) return { ok: true } as RecoveryCodeRedeemResult;

  // If server returned some other 2xx shape, this will throw a precise ZodError.
  return LoginSuccessSchema.parse(resp);
}

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

export function useRecoveryCodeRedeem() {
  const qc = useQueryClient();

  return useMutation<RecoveryCodeRedeemResult, AppError, RecoveryCodeRedeemInput>({
    mutationKey: ["auth", "mfa", "recovery-codes", "redeem"],
    retry: shouldRetry,
    mutationFn: async (vars) => {
      const body = NormalizedInputSchema.parse(vars);

      const { data } = await fetchJsonWithMeta<unknown>(RECOVERY_REDEEM_PATH, {
        method: "POST",
        json: body,
        headers: { "Idempotency-Key": newIdemKey() },
        cache: "no-store",
      });

      const result = parseRedeemResponse(data);

      // If backend returns tokens, store short-lived access token in memory
      if ("access_token" in result && typeof result.access_token === "string") {
        setAccessToken(result.access_token);
      }

      return result;
    },
    onSuccess: async (result) => {
      // If tokens were issued, refresh auth-bound views
      if ("access_token" in result) {
        await qc.invalidateQueries({ queryKey: ["auth", "me"] });
      }
    },
  });
}
