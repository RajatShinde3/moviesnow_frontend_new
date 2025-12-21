"use client";

/**
 * =============================================================================
 * Page · Login (Best-of-best)
 * =============================================================================
 * Production-grade login page for Next.js (App Router), aligned with your
 * backend workflow and frontend libs.
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Uses your `useLogin()` (idempotent; client handles refresh, tolerant of 204).
 * • No user-enumeration: neutral error copy via `formatError()`.
 * • Client-side no-store hints; server should also send no-store headers.
 * • Safe redirect: accepts only same-origin absolute paths from `?next=`.
 *
 * WORKFLOW (MFA-AWARE)
 * --------------------
 * • If tokens are returned → toast → redirect to `next || PATHS.afterLogin || "/"`.
 * • If an MFA challenge is returned:
 *      - Persist raw challenge in sessionStorage ("auth:mfa.challenge")
 *      - Persist "remember this device" intent ("auth:remember_device")
 *      - Persist safe post-login redirect target ("auth:after_login")
 *      - Navigate to `PATHS.loginMfa || "/login/mfa"`
 *   The MFA page will register a trusted device right after success.
 *
 * UX & ACCESSIBILITY
 * ------------------
 * • Fully labeled fields; proper `autocomplete`; assertive inline error region.
 * • Submit disabled while pending/invalid; Enter submits.
 * • Focus moves to the error banner on failure.
 * • Subtle support reference (request id via `formatError`).
 *
 * INTEGRATION NOTES
 * -----------------
 * 1) Ensure `<ToastsRoot />` and `<ReauthDialogProvider />` are mounted in `app/providers.tsx`.
 * 2) Add response headers for `/login` in `next.config.js` (Cache-Control: no-store).
 * 3) `/login/mfa` must read sessionStorage keys below (challenge, remember intent, after-login).
 */

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { PATHS } from "@/lib/env";
import { cn } from "@/lib/cn";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import { PasswordField } from "@/components/forms/PasswordField";
import { useLogin } from "@/features/auth/useLogin";
import { useEmailVerificationResend } from "@/features/auth/useEmailVerificationResend";

// -----------------------------------------------------------------------------
// Cache hints (client-side). Server should also send `Cache-Control: no-store`.
// -----------------------------------------------------------------------------

// Note: metadata cannot be exported from client components; handled by segment layout.

// -----------------------------------------------------------------------------
// sessionStorage keys for MFA handoff + redirect continuity
// -----------------------------------------------------------------------------
const SSKEY_MFA_CHALLENGE = "auth:mfa.challenge";      // JSON of server challenge
const SSKEY_REMEMBER_DEVICE = "auth:remember_device";   // "1" | "0"
const SSKEY_AFTER_LOGIN_REDIRECT = "auth:after_login";  // e.g. "/settings"

// -----------------------------------------------------------------------------
// Local form state
// -----------------------------------------------------------------------------
type FormState = {
  email: string;
  password: string;
  rememberDevice: boolean;
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
/** Allow only internal absolute paths (no protocol, no `//`, no schemes). */
function sanitizeNextPath(nextParam: string | null | undefined): string | null {
  if (!nextParam) return null;
  if (!nextParam.startsWith("/")) return null;
  if (nextParam.startsWith("//")) return null;
  if (nextParam.includes("://")) return null;
  return nextParam;
}

/** Detect common MFA challenge shapes if the API doesn't return tokens yet. */
function isMfaChallenge(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  // Common server patterns
  return Boolean(
    obj.challenge ||
      obj.mfa ||
      obj.mfa_required === true ||
      obj.next_step === "mfa" ||
      obj.type === "mfa_challenge"
  );
}

/** Tiny safe wrappers around sessionStorage to avoid throwing. */
const ss = {
  set(key: string, value: string) {
    try {
      if (typeof window !== "undefined") sessionStorage.setItem(key, value);
    } catch { /* no-op */ }
  },
  get(key: string) {
    try {
      if (typeof window !== "undefined") return sessionStorage.getItem(key);
    } catch { /* no-op */ }
    return null;
  },
};

// -----------------------------------------------------------------------------
// Page Component
// -----------------------------------------------------------------------------
export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back. Please enter your credentials.
        </p>
      </header>

      <LoginForm />

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Don’t have an account?{" "}
        <Link
          className="font-medium underline underline-offset-4 hover:text-foreground"
          href="/signup"
          prefetch
        >
          Create one
        </Link>
      </footer>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Client Form · MFA-aware login with pristine UX & safe redirects
// -----------------------------------------------------------------------------
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Prefill email from query (?email, ?e, ?u) if provided.
  const prefillEmail =
    params?.get("email") || params?.get("e") || params?.get("u") || "";

  const [form, setForm] = React.useState<FormState>({
    email: prefillEmail,
    password: "",
    rememberDevice: false,
  });

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const { mutateAsync: login, isPending } = useLogin();
  const { mutateAsync: resendVerify, isPending: isResending } = useEmailVerificationResend();
  const [needsEmailVerification, setNeedsEmailVerification] = React.useState(false);

  // Compute & persist a safe "next" path so the MFA step can reuse it.
  const postLoginPathRef = React.useRef<string>(
    sanitizeNextPath(params?.get("next")) || "/"
  );

  React.useEffect(() => {
    ss.set(SSKEY_AFTER_LOGIN_REDIRECT, postLoginPathRef.current);
  }, []);

  // Focus the inline error region whenever a new error message appears.
  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // Belt-and-suspenders: wipe password on unmount.
  React.useEffect(() => {
    return () => setForm((s) => ({ ...s, password: "" }));
  }, []);

  // Minimal email check for quick feedback (server is the source of truth).
  const emailLooksOk = form.email.trim().length > 3 && form.email.includes("@");
  const canSubmit = !isPending && emailLooksOk && form.password.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg(null);

    const payload = {
      email: form.email.trim(),
      password: form.password,
    };

    try {
      const res: any = await login(payload);

      // Success: token returned → signed in.
      if (res && typeof res.access_token === "string") {
        // Note: useLogin hook already refetches user data in onSuccess
        toast({
          variant: "success",
          title: "Signed in",
          description: "Welcome back!",
          duration: 2500,
        });

        // Wait a tick for the query to refetch before navigating
        await new Promise(resolve => setTimeout(resolve, 100));
        router.replace(postLoginPathRef.current);
        return;
      }

      // MFA required: persist handoff + go to MFA page.
      if (isMfaChallenge(res) || res) {
        ss.set(SSKEY_MFA_CHALLENGE, JSON.stringify(res ?? {}));
        ss.set(SSKEY_REMEMBER_DEVICE, form.rememberDevice ? "1" : "0");
        // SSKEY_AFTER_LOGIN_REDIRECT already set on mount.
        router.replace("/mfa");
        return;
      }

      // Defensive fallback: treat as challenge if ambiguous.
      ss.set(SSKEY_MFA_CHALLENGE, JSON.stringify(res ?? {}));
      ss.set(SSKEY_REMEMBER_DEVICE, form.rememberDevice ? "1" : "0");
      router.replace("/mfa");
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true, // subtle "Ref: abcd123" for support
        maskServerErrors: true,
        statusMessages: { 401: "Email or password is incorrect." },
        preferCodeCopy: false,
        fallback:
          "We couldn’t sign you in. Please check your details and try again.",
      });
      setErrorMsg(friendly);
      // Clear password on error to reduce shoulder-surfing risk.
      setForm((s) => ({ ...s, password: "" }));

      // If backend indicates unverified email, offer quick resend + guidance
      if ((err as any)?.code === "email_unverified") {
        setNeedsEmailVerification(true);
        try {
          ss.set(SSKEY_AFTER_LOGIN_REDIRECT, postLoginPathRef.current);
          ss.set("auth:verify.target_email", form.email.trim());
        } catch { /* non-fatal */ }
      } else {
        setNeedsEmailVerification(false);
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
      aria-busy={isPending || undefined}
    >
      {/* Inline error banner (neutral copy; assertive live region) */}
      <div
        ref={errorRef}
        tabIndex={errorMsg ? -1 : undefined}
        aria-live="assertive"
        className={cn(
          "rounded-lg border px-4 py-3 text-sm shadow-sm",
          errorMsg ? "border-destructive/30 bg-destructive/10 text-destructive" : "hidden"
        )}
      >
        {errorMsg}
      </div>

      {needsEmailVerification && (
        <div className="rounded-lg border bg-amber-50/60 px-4 py-3 text-xs text-amber-900">
          <div className="mb-1 font-medium">Verify your email to continue.</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                const target = form.email.trim();
                if (!target) return;
                try {
                  await resendVerify({ email: target } as any);
                  toast({
                    variant: "success",
                    title: "Verification sent",
                    description: "Check your inbox for the verification email.",
                    duration: 2600,
                  });
                } catch (e) {
                  toast({ variant: "error", title: "Could not resend", description: formatError(e), duration: 2600 });
                }
              }}
              disabled={isResending || form.email.trim().length < 3}
              className={cn(
                "inline-flex items-center justify-center rounded border bg-background px-2.5 py-1 text-xs font-medium shadow-sm transition",
                isResending ? "opacity-70" : "hover:bg-accent"
              )}
            >
              {isResending ? "Resending…" : "Resend verification email"}
            </button>
            <Link href="/verify-email" className="underline underline-offset-4 hover:text-foreground">
              Open verification page
            </Link>
          </div>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          type="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setForm((s) => ({ ...s, email: v }));
          }}
          autoFocus
          aria-invalid={form.email.length > 0 && !emailLooksOk ? true : undefined}
          className={cn(
            "block w-full rounded-lg border bg-background px-3 py-2 text-base shadow-sm",
            "outline-none ring-0 transition placeholder:text-muted-foreground/70",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            isPending && "cursor-wait opacity-90"
          )}
          disabled={isPending}
        />
      </div>

      {/* Password (uses your PasswordField component with built-in a11y) */}
      <div className="space-y-2">
        <PasswordField
          id="password"
          name="password"
          label="Password"
          kind="current"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setForm((s) => ({ ...s, password: v }));
          }}
          hint="Use your account password. Forgot it? Reset below."
          disabled={isPending}
        />
      </div>

      {/* Remember device (MFA trust intent) + Forgot link */}
      <div className="flex items-center justify-between">
        <label className="inline-flex select-none items-center gap-2 text-sm">
          <input
            id="remember-device"
            name="remember-device"
            type="checkbox"
            className="h-4 w-4 rounded border"
            checked={form.rememberDevice}
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              setForm((s) => ({ ...s, rememberDevice: checked }));
            }}
            disabled={isPending}
          />
          <span>Remember this device</span>
        </label>

        <Link
          className="text-sm font-medium underline underline-offset-4 hover:text-foreground"
          href="/reset/request"
          prefetch
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition",
            !canSubmit
              ? "cursor-not-allowed border bg-muted text-muted-foreground"
              : "border bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          )}
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-2 text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link className="underline underline-offset-4 hover:text-foreground" href="/terms">
            Terms
          </Link>{" "}
          and{" "}
          <Link className="underline underline-offset-4 hover:text-foreground" href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
