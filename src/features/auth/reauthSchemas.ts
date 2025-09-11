// features/auth/reauthSchemas.ts
import { z } from "zod";

/**
 * Reauth (Step-Up) Schemas & Helpers — Frontend
 * =============================================================================
 * Backend contracts (MoviesNow-style)
 * - POST /reauth/password   { password }        → { reauth_token, expires_in }
 * - POST /reauth/mfa        { code, ... }       → { reauth_token, expires_in }
 * - POST /reauth/verify     (Authorization: Bearer <reauth>)
 *                            → { ok: true, token_type: "reauth", expires_in }
 *
 * Design notes
 * - **Strict** client→server inputs (reject unknown keys).
 * - Raw response schemas mirror backend.
 * - Normalized challenge schema accepts `{expires_in}` or `{expires_at}`
 *   and outputs `{ reauth_token, expires_at? }`.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const OTP_DIGITS_MIN = 6 as const;
export const OTP_DIGITS_MAX = 8 as const;

// Forward-compatible method list (UI hinting only)
export const REAUTH_METHODS = ["totp", "sms", "email", "backup", "webauthn"] as const;
export type ReauthMethod = (typeof REAUTH_METHODS)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Normalization helpers (pure)
// ─────────────────────────────────────────────────────────────────────────────

/** Collapse whitespace/dashes and uppercase (for case-insensitive codes). */
function normalizeCode(raw: unknown): string {
  const s = String(raw ?? "");
  return s.replace(/[\s-]+/g, "").toUpperCase();
}

/** Trim to string; used for password/token inputs. */
function normalizeNonEmpty(raw: unknown): string {
  return String(raw ?? "").trim();
}

/** 6–8 digit numeric OTP (TOTP/SMS/Email one-time codes). */
function isNumericOtp(code: string): boolean {
  const re = new RegExp(`^[0-9]{${OTP_DIGITS_MIN},${OTP_DIGITS_MAX}}$`);
  return re.test(code);
}

/** 8–20 alnum backup code (after normalization). */
function isBackupCodeLike(code: string): boolean {
  return /^[A-Z0-9]{8,20}$/.test(code);
}

/** Convert seconds-from-now to ISO timestamp. */
function isoFromSeconds(secs: number | null | undefined): string | undefined {
  if (secs == null || !Number.isFinite(secs)) return undefined;
  const ms = Date.now() + Math.max(0, Math.trunc(secs)) * 1000;
  return new Date(ms).toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Server → Client: Response Schemas (raw + normalized)
// ─────────────────────────────────────────────────────────────────────────────

/** Raw token response returned by /reauth/password and /reauth/mfa. */
export const ReauthTokenResponseSchema = z
  .object({
    reauth_token: z.string().trim().min(1, "Reauth token missing"),
    /** Remaining lifetime in seconds (integer). */
    expires_in: z.number().int().nonnegative(),
  })
  .strict();
export type ReauthTokenResponse = z.infer<typeof ReauthTokenResponseSchema>;

/** Raw verify response returned by /reauth/verify. */
export const ReauthVerifyResponseSchema = z
  .object({
    ok: z.literal(true),
    token_type: z.literal("reauth"),
    expires_in: z.number().int().min(0),
  })
  .strict();
export type ReauthVerifyResponse = z.infer<typeof ReauthVerifyResponseSchema>;

/**
 * Normalized challenge schema used by UI/hooks.
 * Accepts either of:
 *   { reauth_token, expires_in }    // server raw
 *   { reauth_token, expires_at }    // forward/back-compat
 * and outputs:
 *   { reauth_token: string; expires_at?: string }
 */
const RawChallengeEitherSchema = z.union([
  z
    .object({
      reauth_token: z.string().trim().min(1),
      expires_in: z.number().int().nonnegative(),
    })
    .passthrough(),
  z
    .object({
      reauth_token: z.string().trim().min(1),
      expires_at: z.string().datetime(),
    })
    .passthrough(),
]);

export const ReauthChallengeSchema = RawChallengeEitherSchema.transform((v) => {
  // Prefer explicit ISO; otherwise derive from seconds. Use runtime guards to
  // avoid TS complaining about `unknown` when narrowing union inputs.
  const token = (v as any).reauth_token as string;
  let expires_at: string | undefined;

  if ("expires_at" in (v as any) && typeof (v as any).expires_at === "string") {
    expires_at = (v as any).expires_at;
  } else if ("expires_in" in (v as any) && typeof (v as any).expires_in === "number") {
    expires_at = isoFromSeconds((v as any).expires_in);
  }

  return { reauth_token: token, expires_at };
});
export type ReauthChallenge = z.infer<typeof ReauthChallengeSchema>;

/** Back-compat alias some hooks/components may import. */
export const ReauthChallengeResponseSchema = ReauthChallengeSchema;

// ─────────────────────────────────────────────────────────────────────────────
/** Client → Server: Input Schemas (strict) */
// ─────────────────────────────────────────────────────────────────────────────

/** /reauth/password payload */
export const ReauthPasswordInputSchema = z
  .object({
    password: z
      .string()
      .transform(normalizeNonEmpty)
      .pipe(z.string().min(1, "Password is required")),
  })
  .strict();
export type ReauthPasswordInput = z.infer<typeof ReauthPasswordInputSchema>;

/**
 * /reauth/mfa payload
 * - `code` normalized → spaces/dashes removed, uppercased.
 * - When `method` provided, shape-aware validation (UI hint only; server expects `code`).
 */
export const ReauthMfaInputSchema = z
  .object({
    code: z.preprocess((v) => normalizeCode(v), z.string().min(1, "MFA code is required")),
    method: z.enum(REAUTH_METHODS).optional(),
    remember_device: z.boolean().optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const { code, method } = val;

    if (method === "webauthn") {
      if (code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "WebAuthn does not use a code here.",
          path: ["code"],
        });
      }
      return;
    }

    if (method === "backup") {
      if (!isBackupCodeLike(code)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid backup code.",
          path: ["code"],
        });
      }
      return;
    }

    // Default (totp/sms/email or unspecified): require a 6–8 digit OTP
    if (!isNumericOtp(code)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Enter the ${OTP_DIGITS_MIN}–${OTP_DIGITS_MAX} digit code.`,
        path: ["code"],
      });
    }
  });
export type ReauthMfaInput = z.infer<typeof ReauthMfaInputSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Parse helpers (ergonomic; throw ZodError on mismatch)
// ─────────────────────────────────────────────────────────────────────────────

/** Parse a RAW token response from /reauth/password or /reauth/mfa. */
export function parseReauthTokenResponse(json: unknown): ReauthTokenResponse {
  return ReauthTokenResponseSchema.parse(json);
}

/** Parse a normalized challenge from either `{expires_in}` or `{expires_at}`. */
export function parseReauthChallenge(json: unknown): ReauthChallenge {
  return ReauthChallengeSchema.parse(json);
}

/** Parse the response from /reauth/verify. */
export function parseReauthVerifyResponse(json: unknown): ReauthVerifyResponse {
  return ReauthVerifyResponseSchema.parse(json);
}

// ─────────────────────────────────────────────────────────────────────────────
// Type guards (narrowing)
// ─────────────────────────────────────────────────────────────────────────────

export function isReauthTokenResponse(x: unknown): x is ReauthTokenResponse {
  return ReauthTokenResponseSchema.safeParse(x).success;
}

export function isReauthVerifyResponse(x: unknown): x is ReauthVerifyResponse {
  return ReauthVerifyResponseSchema.safeParse(x).success;
}

export function isReauthChallenge(x: unknown): x is ReauthChallenge {
  return ReauthChallengeSchema.safeParse(x).success;
}

// ─────────────────────────────────────────────────────────────────────────────
// Header helper (server expects a header, not a body, for step-up)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compose the step-up header for sensitive routes protected by `require_step_up*`.
 * The backend accepts any of: X-Reauth, X-Reauth-Token, X-Action-Token.
 *
 * @example
 *   fetch("/auth/password/change", {
 *     method: "POST",
 *     headers: { ...reauthHeader(token) },
 *     body: JSON.stringify(payload)
 *   })
 */
export function reauthHeader(
  token: string,
  headerName: "X-Reauth" | "X-Reauth-Token" | "X-Action-Token" = "X-Reauth"
) {
  const t = normalizeNonEmpty(token);
  if (!t) throw new Error("Reauth token is required");
  return { [headerName]: t } as Record<typeof headerName, string>;
}
