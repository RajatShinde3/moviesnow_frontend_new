// features/auth/schemas.ts
import { z } from "zod";

/**
 * Auth Schemas — Backend-Aligned & Production-Grade (MoviesNow)
 * =============================================================================
 * Goals
 * - Strict client→server inputs (reject unknown fields) for safety.
 * - Permissive server responses when future fields may appear.
 * - Consistent normalization (trim/lowercase/OTP cleanup).
 * - Helpers that produce clean API payloads (drop client-only fields).
 * - 204-tolerant "OK" responses so hooks can handle JSON or empty body.
 *
 * Notes
 * - Server is the source of truth; client validation is UX/payload hygiene.
 * - Adjust policy bits (e.g., password rules) to mirror backend enforcement.
 */

/* ────────────────────────────────────────────────────────────────────────────
   Normalizers & atoms
   ──────────────────────────────────────────────────────────────────────────── */

const normalizeEmail = (v: unknown) => String(v ?? "").trim().toLowerCase();
/** Remove spaces/dashes and uppercase (OTP / backup code normalization). */
const normalizeCode = (v: unknown) => String(v ?? "").replace(/[\s-]+/g, "").toUpperCase();

export const MAX_PASSWORD_LENGTH = 72 as const; // bcrypt effective limit
export const MIN_PASSWORD_LENGTH = 8 as const;

export const EmailSchema = z
  .string()
  .trim()
  .min(3, "Email looks too short")
  .max(254, "Email is too long")
  .email("Enter a valid email")
  .transform((v) => v.toLowerCase());

export const TokenSchema = z
  .string()
  .trim()
  .min(1, "Missing token")
  .max(2048, "Token looks too long");

export const Otp6to8DigitsSchema = z.preprocess(
  (v) => normalizeCode(v),
  z.string().regex(/^[0-9]{6,8}$/, "Enter a valid code") // 6–8 digits (TOTP/SMS/Email)
);

export const BackupCodeSchema = z.preprocess(
  (v) => normalizeCode(v),
  z.string().regex(/^[A-Z0-9]{8,20}$/, "Enter a valid backup code")
);

export const PASSWORD_HINT =
  "Use 8+ chars with upper/lowercase, a number, and a symbol. No spaces." as const;

/** Strong password policy (bcrypt 72-byte limit). Adjust to match backend. */
export const PasswordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `At least ${MIN_PASSWORD_LENGTH} characters`)
  .max(MAX_PASSWORD_LENGTH, `At most ${MAX_PASSWORD_LENGTH} characters`)
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/\d/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a symbol")
  .refine((s) => !/\s/.test(s), "No spaces");

export const OkSchema = z.object({ ok: z.literal(true) }).passthrough();
/** Accept `{ ok: true }` **or** 204 No Content (undefined). */
export const OkMaybeSchema = z.union([OkSchema, z.undefined()]);
export type Ok = z.infer<typeof OkSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Tokens (shared)
   ──────────────────────────────────────────────────────────────────────────── */

// Accept common token field variants from different backends and normalize to
// `{ access_token }` so the rest of the app can rely on a single key.
export const LoginSuccessSchema = z.preprocess(
  (val) => {
    if (!val || typeof val !== "object") return val as any;
    const v = { ...(val as any) };
    if (!v.access_token) {
      const alt = v.accessToken ?? v.token;
      if (typeof alt === "string" && alt.length > 0) v.access_token = alt;
    }
    return v;
  },
  z
    .object({
      access_token: z.string(),
      refresh_token: z.string().optional(),
      token_type: z.literal("bearer").optional(),
      is_active: z.boolean().optional(),
    })
    .passthrough()
);
export type LoginSuccess = z.infer<typeof LoginSuccessSchema>;

export const TokenResponseSchema = LoginSuccessSchema;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;

export const RefreshResponseSchema = z
  .object({
    access_token: z.string(),
    token_type: z.literal("bearer").optional(),
  })
  .passthrough();
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Signup
   ──────────────────────────────────────────────────────────────────────────── */

export const signupFormSchema = z
  .object({
    full_name: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => {
        const t = String(v ?? "").trim();
        return t.length ? t : undefined;
      }),
    email: EmailSchema,
    password: PasswordSchema,
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .strict()
  .refine((v) => v.password === v.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });
export type SignupFormInput = z.infer<typeof signupFormSchema>;

export const signupApiSchema = z
  .object({
    full_name: z.string().optional(),
    email: EmailSchema,
    password: PasswordSchema,
  })
  .strict();
export type SignupApiPayload = z.infer<typeof signupApiSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Login (+ MFA)
   Routes:
     - POST /api/v1/auth/login       { email, password }
     - POST /api/v1/auth/mfa-login   { mfa_token, totp_code }
   ──────────────────────────────────────────────────────────────────────────── */

export const LoginSchema = z
  .object({
    email: EmailSchema,
    password: z.string().min(1, "Enter your password"),
  })
  .strict();
export type LoginInput = z.infer<typeof LoginSchema>;

export const MFALoginSchema = z
  .object({
    mfa_token: TokenSchema,
    totp_code: Otp6to8DigitsSchema,
  })
  .strict();
export type MFALoginInput = z.infer<typeof MFALoginSchema>;

export const LoginMFARequiredSchema = z
  .object({
    mfa_token: z.string(),
    mfa_required: z.literal(true).optional(),
  })
  .passthrough();
export type LoginMFARequired = z.infer<typeof LoginMFARequiredSchema>;

export const LoginResponseSchema = z.union([LoginSuccessSchema, LoginMFARequiredSchema]);
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Logout
   ──────────────────────────────────────────────────────────────────────────── */

export const LogoutResponseSchema = OkMaybeSchema;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Email verification
   ──────────────────────────────────────────────────────────────────────────── */

export const VerifyEmailQuerySchema = z.object({ token: TokenSchema }).strict();
export type VerifyEmailQuery = z.infer<typeof VerifyEmailQuerySchema>;
export const VerifyEmailResponseSchema = OkMaybeSchema;
export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;

export const ResendVerificationSchema = z.object({ email: EmailSchema }).strict();
export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>;
export const ResendVerificationResponseSchema = OkMaybeSchema;

/* ────────────────────────────────────────────────────────────────────────────
   Password reset
   ──────────────────────────────────────────────────────────────────────────── */

export const RequestPasswordResetSchema = z.object({ email: EmailSchema }).strict();
export type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;
export const RequestPasswordResetResponseSchema = OkMaybeSchema;

export const ConfirmPasswordResetSchema = z
  .object({
    token: TokenSchema,
    new_password: PasswordSchema,
    confirm_password: z.string(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.new_password !== v.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm_password"],
      });
    }
  });
export type ConfirmPasswordResetInput = z.infer<typeof ConfirmPasswordResetSchema>;

export const ConfirmPasswordResetPayloadSchema = ConfirmPasswordResetSchema.transform(
  ({ token, new_password }) => ({ token, new_password })
);
export type ConfirmPasswordResetPayload = z.infer<typeof ConfirmPasswordResetPayloadSchema>;
export const ConfirmPasswordResetResponseSchema = OkMaybeSchema;

/* ────────────────────────────────────────────────────────────────────────────
   Change password (authenticated)
   ──────────────────────────────────────────────────────────────────────────── */

export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    new_password: PasswordSchema,
    confirm_password: z.string(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.new_password === v.current_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password must be different",
        path: ["new_password"],
      });
    }
    if (v.new_password !== v.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm_password"],
      });
    }
  });
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const ChangePasswordPayloadSchema = ChangePasswordSchema.transform(
  ({ current_password, new_password }) => ({ current_password, new_password })
);
export type ChangePasswordPayload = z.infer<typeof ChangePasswordPayloadSchema>;
export const ChangePasswordResponseSchema = OkMaybeSchema;

/* ────────────────────────────────────────────────────────────────────────────
   Reauth (step-up)
   Routes:
     - POST /api/v1/auth/reauth/password { password }
     - POST /api/v1/auth/reauth/mfa      { totp_code | backup_code }
     - POST /api/v1/auth/reauth/verify   (Authorization: Bearer <reauth>)
   ──────────────────────────────────────────────────────────────────────────── */

export const ReauthPasswordSchema = z
  .object({ password: z.string().min(1, "Enter your password") })
  .strict();
export type ReauthPasswordInput = z.infer<typeof ReauthPasswordSchema>;

/** Response from /reauth/password */
export const ReauthPasswordResponseSchema = z
  .object({
    reauth_token: z.string(),
    expires_in: z.number().int().positive(),
  })
  .strict();

/** Support numeric OTP or backup code; backend picks precedence. */
export const ReauthMfaSchema = z
  .object({
    totp_code: Otp6to8DigitsSchema.optional(),
    backup_code: BackupCodeSchema.optional(),
  })
  .strict()
  .refine((v) => !!v.totp_code || !!v.backup_code, {
    message: "Enter a code",
    path: ["totp_code"],
  });
export type ReauthMfaInput = z.infer<typeof ReauthMfaSchema>;

/** Response from /reauth/mfa */
export const ReauthMfaResponseSchema = z
  .object({
    reauth_token: z.string(),
    expires_in: z.number().int().positive(),
  })
  .strict();

/** Response from /reauth/verify (token supplied via Authorization header) */
export const ReauthVerifyResponseSchema = z
  .object({
    ok: z.literal(true),
    token_type: z.literal("reauth"),
    expires_in: z.number().int().min(0),
  })
  .strict();

/* ────────────────────────────────────────────────────────────────────────────
   MFA lifecycle
   ──────────────────────────────────────────────────────────────────────────── */

export const MfaEnableResponseSchema = z
  .object({
    secret: z.string(),
    otpauth_url: z.string().url().optional(),
    provisioning_uri: z.string().optional(),
    qr_svg: z.string().optional(),
  })
  .passthrough();
export type MfaEnableResponse = z.infer<typeof MfaEnableResponseSchema>;

export const MfaVerifySchema = z.object({ totp_code: Otp6to8DigitsSchema }).strict();
export type MfaVerifyInput = z.infer<typeof MfaVerifySchema>;
export const MfaVerifyResponseSchema = OkMaybeSchema;

export const MfaDisableResponseSchema = OkMaybeSchema;

export const MfaRequestResetSchema = z
  .object({ email: EmailSchema })
  .partial() // some servers infer email from auth context
  .strict();
export type MfaRequestResetInput = z.infer<typeof MfaRequestResetSchema>;
export const MfaRequestResetResponseSchema = OkMaybeSchema;

export const MfaConfirmResetSchema = z.object({ token: TokenSchema }).strict();
export type MfaConfirmResetInput = z.infer<typeof MfaConfirmResetSchema>;
export const MfaConfirmResetResponseSchema = OkMaybeSchema;

/* ────────────────────────────────────────────────────────────────────────────
   Recovery codes
   ──────────────────────────────────────────────────────────────────────────── */

export const RecoveryCodesSchema = z
  .object({ codes: z.array(z.string().min(6)).default([]) })
  .passthrough();
export type RecoveryCodes = z.infer<typeof RecoveryCodesSchema>;
export const RecoveryCodesGenerateResponseSchema = RecoveryCodesSchema;
export const RecoveryCodesListResponseSchema = RecoveryCodesSchema;

export const RecoveryCodeRedeemSchema = z
  .object({ code: BackupCodeSchema }) // normalize + validate
  .strict();
export type RecoveryCodeRedeemInput = z.infer<typeof RecoveryCodeRedeemSchema>;
export const RecoveryCodeRedeemResponseSchema = z.union([OkMaybeSchema, LoginSuccessSchema]);

/* ────────────────────────────────────────────────────────────────────────────
   Trusted devices
   ──────────────────────────────────────────────────────────────────────────── */

export const TrustedDeviceSchema = z
  .object({
    device_id: z.string(),
    label: z.string().optional(),
    created_at: z.string().datetime().optional(),
    last_used_at: z.string().datetime().optional(),
    user_agent: z.string().optional(),
    current: z.boolean().optional(),
  })
  .passthrough();
export type TrustedDevice = z.infer<typeof TrustedDeviceSchema>;

export const TrustedDeviceRegisterSchema = z
  .object({
    device_label: z
      .string()
      .optional()
      .transform((v) => {
        const t = String(v ?? "").trim();
        return t.length ? t : undefined;
      }),
  })
  .strict();
export type TrustedDeviceRegisterInput = z.infer<typeof TrustedDeviceRegisterSchema>;

export const TrustedDeviceRegisterResponseSchema = z.union([TrustedDeviceSchema, OkMaybeSchema]);
export const TrustedDevicesListResponseSchema = z.array(TrustedDeviceSchema);
export const TrustedDeviceRevokeResponseSchema = OkMaybeSchema;
export const TrustedDevicesRevokeAllResponseSchema = OkMaybeSchema;

/* ────────────────────────────────────────────────────────────────────────────
   Sessions
   ──────────────────────────────────────────────────────────────────────────── */

export const SessionSchema = z
  .object({
    jti: z.string(),
    current: z.boolean().optional(),
    created_at: z.string().datetime().optional(),
    last_seen_at: z.string().datetime().optional(),
    ip: z.string().optional(),
    user_agent: z.string().optional(),
    geo: z
      .object({ country: z.string().optional(), city: z.string().optional() })
      .partial()
      .optional(),
  })
  .passthrough();
export type Session = z.infer<typeof SessionSchema>;

export const SessionsListResponseSchema = z.array(SessionSchema);
export const SessionRevokeResponseSchema = OkMaybeSchema;
export const SessionsRevokeAllResponseSchema = OkMaybeSchema;
export const SessionsRevokeOthersResponseSchema = OkMaybeSchema;

/* ────────────────────────────────────────────────────────────────────────────
   Activity & Alerts
   ──────────────────────────────────────────────────────────────────────────── */

export const ActivityEventSchema = z
  .object({
    id: z.string().optional(),
    action: z.string(),
    created_at: z.string().datetime(),
    ip: z.string().optional(),
    user_agent: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;

export const ActivityListResponseSchema = z.array(ActivityEventSchema);

export const AlertSubscriptionSchema = z
  .object({
    email_login: z.boolean().default(true),
    email_new_device: z.boolean().default(true),
    email_suspicious_activity: z.boolean().default(true),
    marketing: z.boolean().optional(),
  })
  .passthrough();
export type AlertSubscription = z.infer<typeof AlertSubscriptionSchema>;
export const AlertSubscriptionGetResponseSchema = AlertSubscriptionSchema;
/** Payload is strict (reject unknown flags). */
export const AlertSubscriptionUpdateSchema = z
  .object({
    email_login: z.boolean().optional(),
    email_new_device: z.boolean().optional(),
    email_suspicious_activity: z.boolean().optional(),
    marketing: z.boolean().optional(),
  })
  .strict();
export const AlertSubscriptionUpdateResponseSchema = AlertSubscriptionSchema;

/* ────────────────────────────────────────────────────────────────────────────
   Email change (authenticated)
   ──────────────────────────────────────────────────────────────────────────── */
/**
 * Start email change
 * -----------------------------------------------------------------------------
 * Request (strict):
 *   { new_email, reauth_token? }
 *  - `new_email` is normalized via EmailSchema (trim + lowercase).
 *  - `reauth_token` is optional: some backends accept it in the body in addition
 *    to (or instead of) the X-Reauth header.
 *
 * Response (permissive):
 *   { ok: true, pending_email?: string, ...future fields }
 */
export const EmailChangeStartSchema = z
  .object({
    new_email: EmailSchema,
    reauth_token: z.string().min(1).optional(),
  })
  .strict();
export type EmailChangeStartInput = z.infer<typeof EmailChangeStartSchema>;

export const EmailChangeStartResponseSchema = z
  .object({
    ok: z.literal(true),
    pending_email: EmailSchema.optional(),
  })
  .passthrough();
export type EmailChangeStartResponse = z.infer<typeof EmailChangeStartResponseSchema>;

/**
 * Confirm email change
 * -----------------------------------------------------------------------------
 * Request (strict):
 *   { token }
 *
 * Response (permissive):
 *   { ok: true, email?: string, ...future fields }
 */
export const EmailChangeConfirmSchema = z.object({ token: TokenSchema }).strict();
export type EmailChangeConfirmInput = z.infer<typeof EmailChangeConfirmSchema>;

export const EmailChangeConfirmResponseSchema = z
  .object({
    ok: z.literal(true),
    email: EmailSchema.optional(),
  })
  .passthrough();
export type EmailChangeConfirmResponse = z.infer<typeof EmailChangeConfirmResponseSchema>;

/* ────────────────────────────────────────────────────────────────────────────
   Account lifecycle (deactivate / delete / reactivate)
   ──────────────────────────────────────────────────────────────────────────── */

export const GenericOtpSchema = z.preprocess(
  (v) => normalizeCode(v),
  z.string().min(4, "Enter the code").max(12, "Code looks too long")
);

export const RequestDeactivationOtpSchema = z.object({ email: EmailSchema }).partial().strict();
export type RequestDeactivationOtpInput = z.infer<typeof RequestDeactivationOtpSchema>;
export const RequestDeactivationOtpResponseSchema = OkMaybeSchema;

export const DeactivateUserSchema = z.object({ otp: GenericOtpSchema }).strict();
export type DeactivateUserInput = z.infer<typeof DeactivateUserSchema>;
export const DeactivateUserResponseSchema = OkMaybeSchema;

export const RequestDeletionOtpSchema = z.object({ email: EmailSchema }).partial().strict();
export type RequestDeletionOtpInput = z.infer<typeof RequestDeletionOtpSchema>;
export const RequestDeletionOtpResponseSchema = OkMaybeSchema;

export const DeleteUserSchema = z.object({ otp: GenericOtpSchema }).strict();
export type DeleteUserInput = z.infer<typeof DeleteUserSchema>;
export const DeleteUserResponseSchema = OkMaybeSchema;

export const RequestReactivationOtpSchema = z.object({ email: EmailSchema }).partial().strict();
export type RequestReactivationOtpInput = z.infer<typeof RequestReactivationOtpSchema>;
export const RequestReactivationOtpResponseSchema = OkMaybeSchema;

export const ReactivateAccountSchema = z.object({ otp: GenericOtpSchema }).strict();
export type ReactivateAccountInput = z.infer<typeof ReactivateAccountSchema>;
export const ReactivateAccountResponseSchema = OkMaybeSchema;

/* ────────────────────────────────────────────────────────────────────────────
   Helpers to build API payloads (drop client-only fields)
   ──────────────────────────────────────────────────────────────────────────── */

export function toConfirmPasswordResetPayload(
  input: ConfirmPasswordResetInput
): ConfirmPasswordResetPayload {
  return { token: input.token, new_password: input.new_password };
}

export function toChangePasswordPayload(input: ChangePasswordInput): ChangePasswordPayload {
  return { current_password: input.current_password, new_password: input.new_password };
}
