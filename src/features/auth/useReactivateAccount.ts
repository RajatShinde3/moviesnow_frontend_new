// features/auth/useReactivateAccount.ts
"use client";

/**
 * useReactivateAccount — future-proof (MoviesNow style)
 * =============================================================================
 * Reactivate a previously deactivated account with an OTP.
 *
 * - Accepts `otp` or `code`, trims/normalizes → `otp`.
 * - Optional `reauth_token` for step-up aware backends.
 * - Idempotent POST (dedupes double-submits & safe retries).
 * - Tolerates 204 No Content or small JSON acks.
 * - If backend returns tokens, we validate + store `access_token` (memory only).
 */

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { setAccessToken } from "@/lib/auth_store";
import { GenericOtpSchema as OtpSchema, OkSchema, LoginSuccessSchema } from "@/features/auth/schemas";

/** Env path (legacy alias supported); strip leading slash so prefixUrl applies. */
const REACTIVATE_ACCOUNT_PATH = (
  process.env.NEXT_PUBLIC_REACTIVATE_ACCOUNT_PATH ??
  process.env.NEXT_PUBLIC_AUTH_REACTIVATE_PATH ?? // legacy alias
  "api/v1/auth/reactivate"
).replace(/^\/+/, "");

/** Flexible client input; we normalize to canonical payload. */
const RawReactivateInputSchema = z
  .object({
    otp: z.string().optional(),
    code: z.string().optional(),
    reauth_token: z.string().min(1).optional(),
  })
  .strict();

const ReactivatePayloadSchema = RawReactivateInputSchema
  .transform((v) => {
    const normalized = (v.otp ?? v.code ?? "").replace(/[\s-]+/g, "");
    return { otp: normalized, reauth_token: v.reauth_token };
  })
  .superRefine((val, ctx) => {
    if (!OtpSchema.safeParse(val.otp).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otp"],
        message: "Enter a valid code",
      });
    }
  });

export type ReactivateAccountInput = z.input<typeof RawReactivateInputSchema>;
type ReactivateAccountPayload = z.infer<typeof ReactivatePayloadSchema>;

export type ReactivateAccountResult =
  | { ok: true }
  | z.infer<typeof LoginSuccessSchema>;

export function useReactivateAccount() {
  return useMutation<ReactivateAccountResult, AppError, ReactivateAccountInput>({
    mutationKey: ["auth", "account", "reactivate"],
    mutationFn: async (variables) => {
      const body: ReactivateAccountPayload = ReactivatePayloadSchema.parse(variables);

      const { data: resp } = await fetchJsonWithMeta<unknown | undefined>(
        REACTIVATE_ACCOUNT_PATH,
        {
          method: "POST",
          json: body,
          headers: { "Idempotency-Key": newIdemKey() },
          cache: "no-store",
        }
      );

      if (!resp) return { ok: true } as const; // 204

      const tokens = LoginSuccessSchema.safeParse(resp);
      if (tokens.success) {
        setAccessToken(tokens.data.access_token);
        return tokens.data;
      }

      const ack = OkSchema.safeParse(resp);
      if (ack.success) return { ok: true } as const;

      return { ok: true } as const; // tolerant fallback
    },
  });
}
