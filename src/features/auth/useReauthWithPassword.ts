// features/auth/useReauthWithPassword.ts
"use client";

/**
 * Auth › Reauth with Password (idempotent, alias-friendly, 204-tolerant)
 * POST /api/v1/auth/reauth/password
 */

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJsonWithMeta, type AppError } from "@/lib/api/client";
import { newIdemKey } from "@/lib/api/idempotency";
import { env } from "@/lib/env";
import { ReauthChallengeSchema, type ReauthChallenge } from "./reauthSchemas";
import { OkSchema } from "@/features/auth/schemas";

/* Path (SSR-safe; legacy alias) */
const RAW_REAUTH_PASSWORD_PATH =
  env().NEXT_PUBLIC_REAUTH_PASSWORD_PATH ??
  "api/v1/auth/reauth/password";
export const REAUTH_PASSWORD_PATH = RAW_REAUTH_PASSWORD_PATH.replace(/^\/+/, "");

/* Accept aliases; keep keys optional */
const RawPasswordInputSchema = z
  .object({
    password: z.string().optional(),
    current_password: z.string().optional(),
    remember_device: z.boolean().optional(),
  })
  .strict();

/* Normalize → { password, remember_device? } with remember_device staying optional */
const NormalizedPasswordInputSchema = RawPasswordInputSchema
  .transform((v) => {
    const out: { password: string; remember_device?: boolean } = {
      password: String(v.password ?? v.current_password ?? "").trim(),
    };
    if (typeof v.remember_device === "boolean") out.remember_device = v.remember_device;
    return out;
  })
  .pipe(
    z.object({
      password: z.string().min(1, "Password is required"),
      remember_device: z.boolean().optional(),
    })
  );

/* Public input & result types */
export type ReauthPasswordInputExtended = z.infer<typeof RawPasswordInputSchema>;
export type ReauthPasswordResult = ReauthChallenge | { ok: true };

/* Normalize tolerant server responses */
function parseChallenge(resp: unknown): ReauthPasswordResult {
  if (resp == null) return { ok: true } as const; // 204

  const a = ReauthChallengeSchema.safeParse(resp);
  if (a.success) return a.data;

  const tokenLike = z
    .object({
      token: z.string().min(1).optional(),
      challenge_token: z.string().min(1).optional(),
      reauth: z.object({ token: z.string().min(1) }).partial().optional(),
      expires_at: z.string().datetime().optional(),
    })
    .passthrough()
    .safeParse(resp);

  if (tokenLike.success) {
    const t =
      tokenLike.data.token ??
      tokenLike.data.challenge_token ??
      tokenLike.data.reauth?.token;
    if (t) return { reauth_token: t, expires_at: tokenLike.data.expires_at };
  }

  const ok = OkSchema.safeParse(resp);
  if (ok.success) return { ok: true } as const;

  return ReauthChallengeSchema.parse(resp);
}

/* Hook */
export function useReauthWithPassword() {
  return useMutation<ReauthPasswordResult, AppError, ReauthPasswordInputExtended>({
    mutationKey: ["auth", "reauth", "password"],
    mutationFn: async (variables) => {
      const body = NormalizedPasswordInputSchema.parse(variables);

      const { data } = await fetchJsonWithMeta<unknown>(REAUTH_PASSWORD_PATH, {
        method: "POST",
        json: body,
        headers: { "Idempotency-Key": newIdemKey() },
        cache: "no-store",
      });

      return parseChallenge(data);
    },
  });
}
