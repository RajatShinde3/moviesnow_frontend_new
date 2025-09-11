"use client";

/**
 * =============================================================================
 * Page · Login · MFA Challenge (Best-of-best · corrected)
 * =============================================================================
 * TOTP + Recovery Code verification during login, using your hooks end-to-end.
 *
 * SECURITY & WORKFLOW
 * -------------------
 * • Reads MFA challenge + intent from sessionStorage (set during /login).
 * • TOTP verification via `useMfaLogin()` (idempotent; resilient client).
 * • Recovery-code verification via `useRecoveryCodeRedeem()` (no ad-hoc client).
 * • On success:
 *     - (Optionally) registers a Trusted Device immediately (fresh MFA).
 *     - Redirects to a sanitized post-login path preserved from `/login`.
 *
 * UX & ACCESSIBILITY
 * ------------------
 * • Smart OTP input (paste, focus mgmt), assertive `aria-live` error region.
 * • Clear mode toggle (TOTP ↔ Recovery Code), keyboard-first friendly.
 * • Subtle request-id surfacing via `formatError()` for support.
 *
 * INTEGRATION NOTES
 * -----------------
 * 1) `/login` must have set sessionStorage:
 *    - "auth:mfa.challenge"   → opaque server challenge object
 *    - "auth:remember_device" → "1" | "0"
 *    - "auth:after_login"     → sanitized absolute path (e.g., "/settings")
 * 2) If challenge is missing/expired, we show a friendly message to go back to `/login`.
 * 3) Trusted device registration POSTs to `/mfa/trusted-devices/register`
 *    with an Idempotency-Key. Fire-and-forget; never blocks redirect.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { postMaybeJson } from "@/lib/api";
import { newIdemKeyWithPrefix } from "@/lib/api/idempotency";
import { formatError } from "@/lib/formatError";
import OtpInput from "@/components/forms/OtpInput";
import { useToast } from "@/components/feedback/Toasts";
import { PATHS } from "@/lib/env";

import { useMfaLogin } from "@/features/auth/useMfaLogin";
import { useRecoveryCodeRedeem } from "@/features/auth/useRecoveryCodeRedeem";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// SessionStorage keys (contract with /login page)
// -----------------------------------------------------------------------------
const SSKEY_MFA_CHALLENGE = "auth:mfa.challenge";
const SSKEY_REMEMBER_DEVICE = "auth:remember_device";
const SSKEY_AFTER_LOGIN_REDIRECT = "auth:after_login";

// Tiny safe wrappers around sessionStorage to avoid throwing.
const ss = {
  get(key: string) {
    try {
      if (typeof window !== "undefined") return sessionStorage.getItem(key);
    } catch {}
    return null;
  },
  set(key: string, value: string) {
    try {
      if (typeof window !== "undefined") sessionStorage.setItem(key, value);
    } catch {}
  },
  remove(key: string) {
    try {
      if (typeof window !== "undefined") sessionStorage.removeItem(key);
    } catch {}
  },
};

// -----------------------------------------------------------------------------
// Local UI state
// -----------------------------------------------------------------------------
type Mode = "totp" | "recovery";

// Normalize backup code: collapse spaces/hyphens and uppercase.
// (Server also normalizes; this reduces user error client-side.)
function normalizeBackupCode(input: string) {
  return input.replace(/[\s-]+/g, "").toUpperCase();
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function LoginMfaPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Two-step verification</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app or use a recovery code.
        </p>
      </header>
      <MfaForm />
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium underline underline-offset-4 hover:text-foreground"
          prefetch
        >
          Back to sign in
        </Link>
      </footer>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Form · TOTP + Recovery Code, Trust Registration, Redirect Continuity
// -----------------------------------------------------------------------------
function MfaForm() {
  const router = useRouter();
  const toast = useToast();

  const [bootstrapped, setBootstrapped] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("totp");
  const [totp, setTotp] = React.useState<string>("");
  const [recovery, setRecovery] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const { mutateAsync: mfaLogin, isPending: isVerifyingTotp } = useMfaLogin();
  const { mutateAsync: redeemRecoveryCode, isPending: isRedeemingRecovery } =
    useRecoveryCodeRedeem();

  // Pull ephemeral state from sessionStorage (one time)
  const challengeRef = React.useRef<any>(null);
  const rememberRef = React.useRef<boolean>(false);
  const afterLoginRef = React.useRef<string>("/");

  React.useEffect(() => {
    try {
      const raw = ss.get(SSKEY_MFA_CHALLENGE);
      challengeRef.current = raw ? JSON.parse(raw) : null;
    } catch {
      challengeRef.current = null;
    }
    rememberRef.current = ss.get(SSKEY_REMEMBER_DEVICE) === "1";
    const al = ss.get(SSKEY_AFTER_LOGIN_REDIRECT);
    if (al && al.startsWith("/")) afterLoginRef.current = al;
    setBootstrapped(true); // avoid initial flicker of the "expired" message
  }, []);

  // Focus the error container on new errors
  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  const hasChallenge = !!challengeRef.current;
  const isBusy = isVerifyingTotp || isRedeemingRecovery;

  // Validity gates
  const isTotpValid = totp.replace(/\D/g, "").length === 6;
  const isRecoveryValid = normalizeBackupCode(recovery).length >= 6; // server enforces strict length

  // Submit handler
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // If the MFA challenge is missing, guide user back to sign in
    if (!hasChallenge) {
      setErrorMsg("This verification step expired. Please sign in again to continue.");
      return;
    }

    try {
      if (mode === "totp") {
        const base: any = { ...(challengeRef.current || {}) };
        await mfaLogin({ ...base, totp } as any);
      } else {
        await redeemRecoveryCode({
          code: normalizeBackupCode(recovery),
          ...(challengeRef.current || {}),
        } as any);
      }

      // Success → clear ephemeral storage
      ss.remove(SSKEY_MFA_CHALLENGE);
      ss.remove(SSKEY_REMEMBER_DEVICE);
      // Keep SSKEY_AFTER_LOGIN_REDIRECT momentarily; harmless if left behind.

      // If user opted to remember device, register trust immediately (fire-and-forget)
      if (rememberRef.current) {
        registerTrustedDeviceSafely(toast).catch(() => void 0);
      }

      toast({
        variant: "success",
        title: "Verification successful",
        description: "You’re now signed in.",
        duration: 2200,
      });

      router.replace(afterLoginRef.current);
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback:
          mode === "totp"
            ? "That code didn’t look right. Check your authenticator and try again."
            : "That recovery code didn’t work. Make sure you haven’t used it already.",
      });
      setErrorMsg(friendly);
      // Reset only the active input to reduce friction
      if (mode === "totp") setTotp("");
      else setRecovery("");
    }
  };

  // Initial skeleton while we read sessionStorage to prevent flicker
  if (!bootstrapped) {
    return (
      <div className="rounded-lg border bg-card/50 p-5 text-sm shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted/70" />
      </div>
    );
  }

  // Missing challenge UX (graceful)
  if (!hasChallenge) {
    return (
      <div className="rounded-lg border px-4 py-6 text-sm shadow-sm">
        <p className="mb-4">
          This verification step has expired or is invalid. For your security, please start again.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg border px-4 py-2 font-medium hover:bg-accent"
          prefetch
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-busy={isBusy || undefined}>
      {/* Inline error (assertive live region; focuses on update) */}
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

      {/* Mode switcher */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {mode === "totp" ? "Enter the 6-digit code" : "Enter a recovery code"}
        </h2>
        <button
          type="button"
          className="text-sm font-medium underline underline-offset-4 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => {
            if (isBusy) return;
            setErrorMsg(null);
            setTotp("");
            setRecovery("");
            setMode((m) => (m === "totp" ? "recovery" : "totp"));
          }}
          disabled={isBusy}
        >
          {mode === "totp" ? "Use recovery code instead" : "Use authenticator code instead"}
        </button>
      </div>

      {/* Inputs */}
      {mode === "totp" ? (
        <div className="space-y-2">
          <label htmlFor="otp" className="block text-sm font-medium">
            Authentication code
          </label>
          <OtpInput
            id="otp"
            value={totp}
            onChange={setTotp}
            autoFocus
            length={6}
            numericOnly
            inputProps={{ "aria-describedby": "otp-help", inputMode: "numeric" } as any}
            disabled={isBusy}
          />
          <p id="otp-help" className="text-xs text-muted-foreground">
            Open your authenticator app to find this code. Codes refresh every ~30s.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="recovery" className="block text-sm font-medium">
            Recovery code
          </label>
          <input
            id="recovery"
            name="recovery"
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoComplete="one-time-code"
            spellCheck={false}
            required
            placeholder="e.g. WORD1-WORD2-WORD3"
            value={recovery}
            onChange={(e) => setRecovery(e.currentTarget.value)}
            className={cn(
              "block w-full rounded-lg border bg-background px-3 py-2 text-base shadow-sm",
              "outline-none ring-0 transition placeholder:text-muted-foreground/70",
              "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              isBusy && "cursor-not-allowed opacity-90"
            )}
            disabled={isBusy}
          />
          <p className="text-xs text-muted-foreground">
            Recovery codes are single-use. If you’re out of codes, you’ll need to request a reset.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={
            isBusy || (mode === "totp" ? !isTotpValid : !isRecoveryValid)
          }
          className={cn(
            "inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition",
            isBusy || (mode === "totp" ? !isTotpValid : !isRecoveryValid)
              ? "cursor-not-allowed border bg-muted text-muted-foreground"
              : "border bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          )}
        >
          {isBusy ? "Verifying…" : "Continue"}
        </button>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Can’t access your authenticator?{" "}
            <Link
              href="/mfa-reset" // implement if you support escalations
              className="underline underline-offset-4 hover:text-foreground"
              prefetch
            >
              Request an MFA reset
            </Link>
          </span>
          <Link
            href="/reset"
            className="underline underline-offset-4 hover:text-foreground"
            prefetch
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </form>
  );
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Attempt to register the current device as a trusted device.
 * Fire-and-forget after MFA success; never blocks UX.
 * Uses your `client` with an Idempotency-Key; ignores any errors.
 */
async function registerTrustedDeviceSafely(toast: ReturnType<typeof useToast>) {
  try {
    await postMaybeJson<undefined>("mfa/trusted-devices/register", undefined, {
      headers: {
        "Idempotency-Key": newIdemKeyWithPrefix("mfa-trust"),
        "Cache-Control": "no-store",
      },
    });
    toast({
      variant: "success",
      title: "Device remembered",
      description: "We’ll ask for MFA less often on this device.",
      duration: 2500,
    });
  } catch {
    // Non-fatal; keep quiet to avoid noisy UX.
  }
}
