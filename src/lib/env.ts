// src/lib/env.ts
/**
 * =============================================================================
 * Public environment variables — validation, normalization, and helpers
 * =============================================================================
 *
 * Strict validation
 * - PROD: throws on malformed public env (fail fast with a clear message).
 * - DEV/TEST: logs loudly and falls back to sane defaults so you can keep moving.
 *
 * API base (same-origin vs cross-origin)
 * - Default API base is "/api/v1" (relative). In dev, add a Next.js rewrite:
 *
 *     export const rewrites = () => [
 *       { source: "/api/v1/:path*", destination: "http://localhost:8000/api/v1/:path*" },
 *     ];
 *
 *   This keeps calls same-origin → **no CORS preflights**.
 *
 * - If you set `NEXT_PUBLIC_API_BASE_URL` to an absolute URL
 *   (e.g., "https://api.example.com/api/v1"), you’re in cross-origin mode.
 *   Ensure backend CORS allows: Accept, Authorization, Idempotency-Key, X-Reauth.
 *
 * Usage
 *   import {
 *     env, API_BASE, API_TIMEOUT_MS, PATHS,
 *     apiUrl, isAbsoluteApiBase, assertPublicEnv
 *   } from "@/lib/env";
 *   assertPublicEnv(); // optionally validate at app bootstrap
 */

import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────────
   Small helpers
   ──────────────────────────────────────────────────────────────────────────── */

const stripLeading = (s: string) => s.replace(/^\/+/, "");
const stripTrailing = (s: string) => s.replace(/\/+$/, "");
const isAbsoluteHttpUrl = (v: string) => /^https?:\/\//i.test(v);

function toPositiveInt(
  v: string | undefined,
  fallback: number,
  { min = 1, max = 120_000 }: { min?: number; max?: number } = {}
): number {
  const n = Number.parseInt(String(v ?? "").trim(), 10);
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return n;
}

/* ────────────────────────────────────────────────────────────────────────────
   Schema
   ──────────────────────────────────────────────────────────────────────────── */

const PublicEnvSchema = z
  .object({
    NEXT_PUBLIC_API_BASE_URL: z
      .string()
      .optional()
      .transform((v) => (v && v.trim().length ? stripTrailing(v.trim()) : undefined))
      .refine(
        (v) => v === undefined || v.startsWith("/") || isAbsoluteHttpUrl(v),
        "must be absolute (https://…) or a leading-slash base (e.g., /api/v1)"
      )
      .transform((v) => v ?? "/api/v1"),

    /** Numeric HTTP timeout (ms). Default 15000; clamped to [1, 120000]. */
    NEXT_PUBLIC_API_TIMEOUT_MS: z
      .string()
      .optional()
      .transform((v) => toPositiveInt(v, 15_000, { min: 1, max: 120_000 })),

    /* Auth/session core (relative paths, no leading slash) */
    NEXT_PUBLIC_LOGIN_PATH:               z.string().optional().transform((v) => stripLeading(v ?? "auth/login")),
    NEXT_PUBLIC_LOGIN_MFA_PATH:           z.string().optional().transform((v) => stripLeading(v ?? "auth/login/mfa")),
    /** Alias some apps expose for the MFA *verify* step during login */
    NEXT_PUBLIC_MFA_LOGIN_PATH:           z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)),
    NEXT_PUBLIC_MFA_VERIFY_PATH:          z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)),

    NEXT_PUBLIC_SIGNUP_PATH:              z.string().optional().transform((v) => stripLeading(v ?? "auth/signup")),
    NEXT_PUBLIC_REFRESH_PATH:             z.string().optional().transform((v) => stripLeading(v ?? "auth/refresh-token")),
    NEXT_PUBLIC_LOGOUT_PATH:              z.string().optional().transform((v) => stripLeading(v ?? "auth/logout")),
    NEXT_PUBLIC_ME_PATH:                  z.string().optional().transform((v) => stripLeading(v ?? "user/me")),

    /* Email verification */
    NEXT_PUBLIC_VERIFY_EMAIL_PATH:        z.string().optional().transform((v) => stripLeading(v ?? "auth/verify-email")),
    NEXT_PUBLIC_RESEND_VERIFICATION_PATH: z.string().optional().transform((v) => stripLeading(v ?? "auth/resend-verification")),

    /* Password reset (and aliases) */
    NEXT_PUBLIC_PW_RESET_REQUEST_PATH:    z.string().optional().transform((v) => stripLeading(v ?? "auth/request-reset")),
    NEXT_PUBLIC_REQUEST_RESET_PATH:       z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)), // alias
    NEXT_PUBLIC_PW_RESET_CONFIRM_PATH:    z.string().optional().transform((v) => stripLeading(v ?? "auth/confirm-reset")),
    NEXT_PUBLIC_CONFIRM_RESET_PATH:       z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)), // alias

    /* Credentials (email/password change) + aliases */
    NEXT_PUBLIC_CRED_PASSWORD_CHANGE_PATH: z.string().optional().transform((v) => stripLeading(v ?? "auth/password/change")),
    NEXT_PUBLIC_CHANGE_PASSWORD_PATH:       z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)), // alias

    NEXT_PUBLIC_CRED_EMAIL_START_PATH:     z.string().optional().transform((v) => stripLeading(v ?? "auth/email/change/start")),
    NEXT_PUBLIC_EMAIL_CHANGE_START_PATH:    z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)), // alias

    NEXT_PUBLIC_CRED_EMAIL_CONFIRM_PATH:   z.string().optional().transform((v) => stripLeading(v ?? "auth/email/change/confirm")),
    NEXT_PUBLIC_EMAIL_CHANGE_CONFIRM_PATH:  z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)), // alias

    /* MFA lifecycle + recovery codes */
    NEXT_PUBLIC_MFA_ENABLE_PATH:          z.string().optional().transform((v) => stripLeading(v ?? "auth/mfa/enable")),
    NEXT_PUBLIC_MFA_VERIFY_ENABLE_PATH:   z.string().optional().transform((v) => stripLeading(v ?? "auth/mfa/verify-enable")),
    NEXT_PUBLIC_MFA_DISABLE_PATH:         z.string().optional().transform((v) => stripLeading(v ?? "auth/mfa/disable")),

    /** Base list path; generate will default to `${base}/generate` */
    NEXT_PUBLIC_RECOVERY_CODES_PATH:      z.string().optional().transform((v) => stripLeading(v ?? "auth/mfa/recovery-codes")),
    /** Optional explicit paths (override the derivation) */
    NEXT_PUBLIC_RECOVERY_CODES_LIST_PATH:    z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)),
    NEXT_PUBLIC_RECOVERY_CODES_GENERATE_PATH:z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)),

    /** Redeem a single recovery code during MFA login */
    NEXT_PUBLIC_MFA_RECOVERY_REDEEM_PATH: z.string().optional().transform((v) => stripLeading(v ?? "auth/mfa/recovery-codes/redeem")),

    /* MFA reset (lost 2FA) + aliases */
    NEXT_PUBLIC_MFA_RESET_START_PATH:     z.string().optional().transform((v) => stripLeading(v ?? "auth/mfa/reset/start")),
    NEXT_PUBLIC_MFA_REQUEST_RESET_PATH:    z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)), // alias
    NEXT_PUBLIC_MFA_RESET_VERIFY_PATH:    z.string().optional().transform((v) => stripLeading(v ?? "auth/mfa/reset/verify")),
    NEXT_PUBLIC_MFA_RESET_CONFIRM_PATH:   z.string().optional().transform((v) => stripLeading(v ?? "auth/mfa/confirm-reset")),
    NEXT_PUBLIC_MFA_CONFIRM_RESET_PATH:    z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)), // alias

    /* Step-up / Reauth */
    NEXT_PUBLIC_REAUTH_PASSWORD_PATH:     z.string().optional().transform((v) => stripLeading(v ?? "auth/reauth/password")),
    NEXT_PUBLIC_REAUTH_MFA_PATH:          z.string().optional().transform((v) => stripLeading(v ?? "auth/reauth/mfa")),
    NEXT_PUBLIC_REAUTH_VERIFY_PATH:       z.string().optional().transform((v) => stripLeading(v ?? "auth/reauth/verify")),

    /* Sessions */
    NEXT_PUBLIC_SESSIONS_LIST_PATH:       z.string().optional().transform((v) => stripLeading(v ?? "auth/sessions")),
    NEXT_PUBLIC_SESSIONS_REVOKE_OTHERS_PATH: z.string().optional().transform((v) => stripLeading(v ?? "auth/sessions/others")),

    /* Trusted devices (MFA remembered devices) */
    NEXT_PUBLIC_TD_LIST_PATH:             z.string().optional().transform((v) => stripLeading(v ?? "auth/mfa/trusted-devices")),
    NEXT_PUBLIC_TD_REGISTER_PATH:         z.string().optional().transform((v) => stripLeading(v ?? "auth/mfa/trusted-devices/register")),

    /* Account lifecycle + aliases */
    NEXT_PUBLIC_ACCOUNT_DEACTIVATE_PATH:  z.string().optional().transform((v) => stripLeading(v ?? "auth/deactivate-user")),
    NEXT_PUBLIC_DEACTIVATE_USER_PATH:      z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)), // alias

    NEXT_PUBLIC_ACCOUNT_DELETE_PATH:      z.string().optional().transform((v) => stripLeading(v ?? "auth/delete-user")),
    NEXT_PUBLIC_DELETE_USER_PATH:          z.string().optional().transform((v) => (v ? stripLeading(v) : undefined)), // alias

    NEXT_PUBLIC_REACTIVATE_START_PATH:    z.string().optional().transform((v) => stripLeading(v ?? "auth/request-reactivation")),
    NEXT_PUBLIC_REACTIVATE_CONFIRM_PATH:  z.string().optional().transform((v) => stripLeading(v ?? "auth/confirm-reactivation")),

    /* OTP requests (deactivation / deletion) */
    NEXT_PUBLIC_REQUEST_DEACTIVATION_OTP_PATH: z.string().optional().transform((v) => stripLeading(v ?? "auth/request-deactivation-otp")),
    NEXT_PUBLIC_REQUEST_DELETION_OTP_PATH:     z.string().optional().transform((v) => stripLeading(v ?? "auth/request-deletion-otp")),

    /* Activity */
    NEXT_PUBLIC_ACTIVITY_LIST_PATH:       z.string().optional().transform((v) => stripLeading(v ?? "auth/activity")),

    /* Alerts (security notifications) */
    NEXT_PUBLIC_ALERT_SUBSCRIPTION_PATH:  z.string().optional().transform((v) => stripLeading(v ?? "auth/alerts/subscription")),
    NEXT_PUBLIC_ALERT_UPDATE_PATH:        z.string().optional().transform((v) => stripLeading(v ?? "auth/alerts/subscribe")),
  })
  .readonly();

export type PublicEnv = z.infer<typeof PublicEnvSchema>;

let cached: Readonly<PublicEnv> | null = null;

/* ────────────────────────────────────────────────────────────────────────────
   Validation utilities
   ──────────────────────────────────────────────────────────────────────────── */

function formatZodIssues(issues: z.ZodIssue[]): string {
  return issues
    .map((i) => {
      const path = i.path.join(".") || "(root)";
      return `- ${path}: ${i.message}`;
    })
    .join("\n");
}

function buildRawEnv(): Record<string, string | undefined> {
  return {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_TIMEOUT_MS: process.env.NEXT_PUBLIC_API_TIMEOUT_MS,

    NEXT_PUBLIC_LOGIN_PATH: process.env.NEXT_PUBLIC_LOGIN_PATH,
    NEXT_PUBLIC_LOGIN_MFA_PATH: process.env.NEXT_PUBLIC_LOGIN_MFA_PATH,
    NEXT_PUBLIC_MFA_LOGIN_PATH: process.env.NEXT_PUBLIC_MFA_LOGIN_PATH,
    NEXT_PUBLIC_MFA_VERIFY_PATH: process.env.NEXT_PUBLIC_MFA_VERIFY_PATH,

    NEXT_PUBLIC_SIGNUP_PATH: process.env.NEXT_PUBLIC_SIGNUP_PATH,
    NEXT_PUBLIC_REFRESH_PATH: process.env.NEXT_PUBLIC_REFRESH_PATH,
    NEXT_PUBLIC_LOGOUT_PATH: process.env.NEXT_PUBLIC_LOGOUT_PATH,
    NEXT_PUBLIC_ME_PATH: process.env.NEXT_PUBLIC_ME_PATH,

    NEXT_PUBLIC_VERIFY_EMAIL_PATH: process.env.NEXT_PUBLIC_VERIFY_EMAIL_PATH,
    NEXT_PUBLIC_RESEND_VERIFICATION_PATH: process.env.NEXT_PUBLIC_RESEND_VERIFICATION_PATH,

    NEXT_PUBLIC_PW_RESET_REQUEST_PATH: process.env.NEXT_PUBLIC_PW_RESET_REQUEST_PATH,
    NEXT_PUBLIC_REQUEST_RESET_PATH: process.env.NEXT_PUBLIC_REQUEST_RESET_PATH, // alias
    NEXT_PUBLIC_PW_RESET_CONFIRM_PATH: process.env.NEXT_PUBLIC_PW_RESET_CONFIRM_PATH,
    NEXT_PUBLIC_CONFIRM_RESET_PATH: process.env.NEXT_PUBLIC_CONFIRM_RESET_PATH, // alias

    NEXT_PUBLIC_CRED_PASSWORD_CHANGE_PATH: process.env.NEXT_PUBLIC_CRED_PASSWORD_CHANGE_PATH,
    NEXT_PUBLIC_CHANGE_PASSWORD_PATH: process.env.NEXT_PUBLIC_CHANGE_PASSWORD_PATH, // alias

    NEXT_PUBLIC_CRED_EMAIL_START_PATH: process.env.NEXT_PUBLIC_CRED_EMAIL_START_PATH,
    NEXT_PUBLIC_EMAIL_CHANGE_START_PATH: process.env.NEXT_PUBLIC_EMAIL_CHANGE_START_PATH, // alias

    NEXT_PUBLIC_CRED_EMAIL_CONFIRM_PATH: process.env.NEXT_PUBLIC_CRED_EMAIL_CONFIRM_PATH,
    NEXT_PUBLIC_EMAIL_CHANGE_CONFIRM_PATH: process.env.NEXT_PUBLIC_EMAIL_CHANGE_CONFIRM_PATH, // alias

    NEXT_PUBLIC_MFA_ENABLE_PATH: process.env.NEXT_PUBLIC_MFA_ENABLE_PATH,
    NEXT_PUBLIC_MFA_VERIFY_ENABLE_PATH: process.env.NEXT_PUBLIC_MFA_VERIFY_ENABLE_PATH,
    NEXT_PUBLIC_MFA_DISABLE_PATH: process.env.NEXT_PUBLIC_MFA_DISABLE_PATH,

    NEXT_PUBLIC_RECOVERY_CODES_PATH: process.env.NEXT_PUBLIC_RECOVERY_CODES_PATH,
    NEXT_PUBLIC_RECOVERY_CODES_LIST_PATH: process.env.NEXT_PUBLIC_RECOVERY_CODES_LIST_PATH,
    NEXT_PUBLIC_RECOVERY_CODES_GENERATE_PATH: process.env.NEXT_PUBLIC_RECOVERY_CODES_GENERATE_PATH,
    NEXT_PUBLIC_MFA_RECOVERY_REDEEM_PATH: process.env.NEXT_PUBLIC_MFA_RECOVERY_REDEEM_PATH,

    NEXT_PUBLIC_MFA_RESET_START_PATH: process.env.NEXT_PUBLIC_MFA_RESET_START_PATH,
    NEXT_PUBLIC_MFA_REQUEST_RESET_PATH: process.env.NEXT_PUBLIC_MFA_REQUEST_RESET_PATH, // alias
    NEXT_PUBLIC_MFA_RESET_VERIFY_PATH: process.env.NEXT_PUBLIC_MFA_RESET_VERIFY_PATH,
    NEXT_PUBLIC_MFA_RESET_CONFIRM_PATH: process.env.NEXT_PUBLIC_MFA_RESET_CONFIRM_PATH,
    NEXT_PUBLIC_MFA_CONFIRM_RESET_PATH: process.env.NEXT_PUBLIC_MFA_CONFIRM_RESET_PATH, // alias

    NEXT_PUBLIC_REAUTH_PASSWORD_PATH: process.env.NEXT_PUBLIC_REAUTH_PASSWORD_PATH,
    NEXT_PUBLIC_REAUTH_MFA_PATH: process.env.NEXT_PUBLIC_REAUTH_MFA_PATH,
    NEXT_PUBLIC_REAUTH_VERIFY_PATH: process.env.NEXT_PUBLIC_REAUTH_VERIFY_PATH,

    NEXT_PUBLIC_SESSIONS_LIST_PATH: process.env.NEXT_PUBLIC_SESSIONS_LIST_PATH,
    NEXT_PUBLIC_SESSIONS_REVOKE_OTHERS_PATH: process.env.NEXT_PUBLIC_SESSIONS_REVOKE_OTHERS_PATH,

    NEXT_PUBLIC_TD_LIST_PATH: process.env.NEXT_PUBLIC_TD_LIST_PATH,
    NEXT_PUBLIC_TD_REGISTER_PATH: process.env.NEXT_PUBLIC_TD_REGISTER_PATH,

    NEXT_PUBLIC_ACCOUNT_DEACTIVATE_PATH: process.env.NEXT_PUBLIC_ACCOUNT_DEACTIVATE_PATH,
    NEXT_PUBLIC_DEACTIVATE_USER_PATH: process.env.NEXT_PUBLIC_DEACTIVATE_USER_PATH, // alias
    NEXT_PUBLIC_ACCOUNT_DELETE_PATH: process.env.NEXT_PUBLIC_ACCOUNT_DELETE_PATH,
    NEXT_PUBLIC_DELETE_USER_PATH: process.env.NEXT_PUBLIC_DELETE_USER_PATH, // alias

    NEXT_PUBLIC_REACTIVATE_START_PATH: process.env.NEXT_PUBLIC_REACTIVATE_START_PATH,
    NEXT_PUBLIC_REACTIVATE_CONFIRM_PATH: process.env.NEXT_PUBLIC_REACTIVATE_CONFIRM_PATH,

    NEXT_PUBLIC_REQUEST_DEACTIVATION_OTP_PATH: process.env.NEXT_PUBLIC_REQUEST_DEACTIVATION_OTP_PATH,
    NEXT_PUBLIC_REQUEST_DELETION_OTP_PATH: process.env.NEXT_PUBLIC_REQUEST_DELETION_OTP_PATH,

    NEXT_PUBLIC_ACTIVITY_LIST_PATH: process.env.NEXT_PUBLIC_ACTIVITY_LIST_PATH,
    NEXT_PUBLIC_ALERT_SUBSCRIPTION_PATH: process.env.NEXT_PUBLIC_ALERT_SUBSCRIPTION_PATH,
    NEXT_PUBLIC_ALERT_UPDATE_PATH: process.env.NEXT_PUBLIC_ALERT_UPDATE_PATH,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   Accessors
   ──────────────────────────────────────────────────────────────────────────── */

export function env(): Readonly<PublicEnv> {
  if (cached) return cached;

  const raw = buildRawEnv();
  const parsed = PublicEnvSchema.safeParse(raw);

  if (parsed.success) {
    cached = Object.freeze(parsed.data);
    return cached;
  }

  const details = formatZodIssues(parsed.error.issues);
  const message =
    "[env] Invalid public environment configuration:\n" +
    details +
    "\n" +
    "Hint: `NEXT_PUBLIC_API_BASE_URL` must be absolute (https://…) or a leading-slash base (e.g., /api/v1).";

  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }

  // Dev/Test fallback: log loudly and fall back to defaults.
  console.error(message);

  const fallback = PublicEnvSchema.parse({
    ...raw,
    NEXT_PUBLIC_API_BASE_URL: undefined,
  });

  cached = Object.freeze(fallback);
  return cached;
}

/** The normalized API base ("/api/v1" in dev; absolute URL in prod). */
export const API_BASE: string = env().NEXT_PUBLIC_API_BASE_URL;

/** Client HTTP timeout in milliseconds. */
export const API_TIMEOUT_MS: number = env().NEXT_PUBLIC_API_TIMEOUT_MS;

/** True if API_BASE is absolute (cross-origin mode). */
export function isAbsoluteApiBase(): boolean {
  return isAbsoluteHttpUrl(API_BASE);
}

/** Also expose as a constant for convenience in components/hooks. */
export const IS_ABSOLUTE_API_BASE: boolean = isAbsoluteApiBase();

/**
 * Join the API base with a relative path (no leading slash).
 * Guards against double slashes and works for both absolute and "/api/v1" bases.
 *
 * @example
 *   apiUrl(PATHS.me) // "/api/v1/user/me" (dev via rewrite) or "https://…/user/me"
 */
export function apiUrl(relativePath: string): string {
  return `${API_BASE}/${stripLeading(relativePath)}`;
}

/* ────────────────────────────────────────────────────────────────────────────
   Typed endpoint map (plan-aligned)
   ──────────────────────────────────────────────────────────────────────────── */

type PathFn = (id: string) => string;

const E = env();

// Recovery codes: allow explicit overrides, else derive generate from base.
const REC_CODES_BASE = E.NEXT_PUBLIC_RECOVERY_CODES_LIST_PATH ?? E.NEXT_PUBLIC_RECOVERY_CODES_PATH;
const REC_CODES_LIST = REC_CODES_BASE;
const REC_CODES_GENERATE =
  E.NEXT_PUBLIC_RECOVERY_CODES_GENERATE_PATH ??
  `${stripTrailing(REC_CODES_BASE)}/generate`;

// Password reset request (support alias var)
const PW_REQUEST = E.NEXT_PUBLIC_REQUEST_RESET_PATH ?? E.NEXT_PUBLIC_PW_RESET_REQUEST_PATH;
// Password reset confirm (support alias var)
const PW_CONFIRM = E.NEXT_PUBLIC_CONFIRM_RESET_PATH ?? E.NEXT_PUBLIC_PW_RESET_CONFIRM_PATH;

// Account deactivate/delete (support alias vars)
const ACCOUNT_DEACTIVATE = E.NEXT_PUBLIC_DEACTIVATE_USER_PATH ?? E.NEXT_PUBLIC_ACCOUNT_DEACTIVATE_PATH;
const ACCOUNT_DELETE = E.NEXT_PUBLIC_DELETE_USER_PATH ?? E.NEXT_PUBLIC_ACCOUNT_DELETE_PATH;

// Email change paths (support alias vars)
const EMAIL_START = E.NEXT_PUBLIC_EMAIL_CHANGE_START_PATH ?? E.NEXT_PUBLIC_CRED_EMAIL_START_PATH;
const EMAIL_CONFIRM = E.NEXT_PUBLIC_EMAIL_CHANGE_CONFIRM_PATH ?? E.NEXT_PUBLIC_CRED_EMAIL_CONFIRM_PATH;

// Change password (support alias var)
const PW_CHANGE = E.NEXT_PUBLIC_CHANGE_PASSWORD_PATH ?? E.NEXT_PUBLIC_CRED_PASSWORD_CHANGE_PATH;

// MFA reset start/confirm (support alias vars)
const MFA_RESET_START = E.NEXT_PUBLIC_MFA_REQUEST_RESET_PATH ?? E.NEXT_PUBLIC_MFA_RESET_START_PATH;
const MFA_RESET_CONFIRM = E.NEXT_PUBLIC_MFA_CONFIRM_RESET_PATH ?? E.NEXT_PUBLIC_MFA_RESET_CONFIRM_PATH;

export const PATHS = {
  // session & auth
  login: E.NEXT_PUBLIC_LOGIN_PATH,
  loginMfa: E.NEXT_PUBLIC_LOGIN_MFA_PATH,
  mfaLogin: E.NEXT_PUBLIC_MFA_LOGIN_PATH ?? E.NEXT_PUBLIC_LOGIN_MFA_PATH, // alias-friendly
  mfaVerify: E.NEXT_PUBLIC_MFA_VERIFY_PATH ?? E.NEXT_PUBLIC_LOGIN_MFA_PATH, // optional
  signup: E.NEXT_PUBLIC_SIGNUP_PATH,
  refresh: E.NEXT_PUBLIC_REFRESH_PATH,
  logout: E.NEXT_PUBLIC_LOGOUT_PATH,
  me: E.NEXT_PUBLIC_ME_PATH,

  // email verification
  verifyEmail: E.NEXT_PUBLIC_VERIFY_EMAIL_PATH,
  resendVerification: E.NEXT_PUBLIC_RESEND_VERIFICATION_PATH,

  // password reset (and aliases)
  pwResetRequest: PW_REQUEST,          // canonical key (kept for back-compat)
  pwResetConfirm: PW_CONFIRM,
  requestReset: PW_REQUEST,            // friendly alias many hooks use
  confirmReset: PW_CONFIRM,

  // credentials
  credPasswordChange: PW_CHANGE,
  changePassword: PW_CHANGE,           // alias
  credEmailStart: EMAIL_START,
  credEmailConfirm: EMAIL_CONFIRM,
  emailChangeStart: EMAIL_START,       // alias
  emailChangeConfirm: EMAIL_CONFIRM,   // alias

  // mfa lifecycle
  mfaEnable: E.NEXT_PUBLIC_MFA_ENABLE_PATH,
  mfaVerifyEnable: E.NEXT_PUBLIC_MFA_VERIFY_ENABLE_PATH,
  mfaDisable: E.NEXT_PUBLIC_MFA_DISABLE_PATH,

  // recovery codes
  recoveryCodesList: REC_CODES_LIST,
  recoveryCodesGenerate: REC_CODES_GENERATE,
  mfaRecoveryRedeem: E.NEXT_PUBLIC_MFA_RECOVERY_REDEEM_PATH,

  // mfa reset (lost 2FA)
  mfaResetStart: MFA_RESET_START,
  mfaResetVerify: E.NEXT_PUBLIC_MFA_RESET_VERIFY_PATH,
  mfaResetConfirm: MFA_RESET_CONFIRM,

  // step-up / reauth
  reauthPassword: E.NEXT_PUBLIC_REAUTH_PASSWORD_PATH,
  reauthMfa: E.NEXT_PUBLIC_REAUTH_MFA_PATH,
  reauthVerify: E.NEXT_PUBLIC_REAUTH_VERIFY_PATH,

  // sessions
  sessionsList: E.NEXT_PUBLIC_SESSIONS_LIST_PATH,
  sessionsRevoke: ((id: string) => `auth/sessions/${stripLeading(id)}`) as PathFn,
  sessionsRevokeOthers: E.NEXT_PUBLIC_SESSIONS_REVOKE_OTHERS_PATH,

  // trusted devices
  tdList: E.NEXT_PUBLIC_TD_LIST_PATH,
  tdRegister: E.NEXT_PUBLIC_TD_REGISTER_PATH,
  tdRevoke: ((id: string) => `auth/mfa/trusted-devices/${stripLeading(id)}`) as PathFn,

  // account lifecycle
  accountDeactivate: ACCOUNT_DEACTIVATE,
  accountDelete: ACCOUNT_DELETE,
  reactivateStart: E.NEXT_PUBLIC_REACTIVATE_START_PATH,
  reactivateConfirm: E.NEXT_PUBLIC_REACTIVATE_CONFIRM_PATH,

  // otp requests (deactivation / deletion)
  requestDeactivationOtp: E.NEXT_PUBLIC_REQUEST_DEACTIVATION_OTP_PATH,
  requestDeletionOtp: E.NEXT_PUBLIC_REQUEST_DELETION_OTP_PATH,

  // activity
  activityList: E.NEXT_PUBLIC_ACTIVITY_LIST_PATH,
  // alerts
  alertsSubscription: E.NEXT_PUBLIC_ALERT_SUBSCRIPTION_PATH,
  alertsSubscribe: E.NEXT_PUBLIC_ALERT_UPDATE_PATH,
  
  // UI route hints (stable client-side paths)
  settingsSecurity: "/settings/security",
  settingsActivity: "/settings/activity",
  settingsSessions: "/settings/sessions",
  settingsPassword: "/settings/security/password",
  settingsMfa: "/settings/security/mfa",
  settingsRecoveryCodes: "/settings/security/recovery-codes",
  settingsDevices: "/settings/security/devices",
  settingsAlerts: "/settings/alerts",
  settingsAccount: "/settings/account",
} as const;

export type Paths = typeof PATHS;

/* ────────────────────────────────────────────────────────────────────────────
   Test helper
   ──────────────────────────────────────────────────────────────────────────── */

export function __resetEnvCacheForTests__(): void {
  cached = null;
}

/* ────────────────────────────────────────────────────────────────────────────
   Startup assertion
   ──────────────────────────────────────────────────────────────────────────── */

/** Validate env at app bootstrap (throws in prod, logs in dev/test). */
export function assertPublicEnv(): void {
  void env(); // parsing performs validation and sets the cache
}
