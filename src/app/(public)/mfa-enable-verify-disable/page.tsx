"use client";

/**
 * =============================================================================
 * Page · Settings · Security · MFA (Best-of-best · enhanced)
 * =============================================================================
 * A production-grade MFA settings experience for Next.js (App Router).
 *
 * What this page does
 * -------------------
 * • Enable MFA: calls `useMfaEnable()` to obtain { secret, otpauth_url }.
 *   - Renders a QR code (client-side) and manual key (masked by default),
 *     with reveal/copy affordances and setup guidance.
 *   - Verifies TOTP via `useMfaVerify()` and (optionally) registers this device
 *     as a Trusted Device immediately after success (fresh MFA).
 * • Disable MFA: calls `useMfaDisable()`; if step-up is required, opens
 *   <ReauthDialog /> and retries with `xReauth` — no lost state.
 * • Polished UX: assertive a11y error region, guarded submits, skeletons,
 *   keyboard-first, idempotent mutations, safe toasts, and cancel/start-over.
 *
 * Security & resilience
 * ---------------------
 * • Idempotency handled by hooks; trusted-device call uses `Idempotency-Key`.
 * • Step-up aware for destructive mutations (disable).
 * • Secrets never leave the page; QR is generated locally with `qrcode`.
 *
 * Integration notes
 * -----------------
 * 1) Ensure <ToastsRoot/> and <ReauthDialogProvider/> are mounted at app level.
 * 2) If you have a user store exposing `user.mfa_enabled`, we read it once
 *    for initial state; page still works state-driven without it.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { postMaybeJson } from "@/lib/api";
import { newIdemKeyWithPrefix } from "@/lib/api/idempotency";
import { formatError } from "@/lib/formatError";
import { PATHS } from "@/lib/env";

import OtpInput from "@/components/forms/OtpInput";
import { useToast } from "@/components/feedback/Toasts";
import { useReauthPrompt } from "@/components/ReauthDialog";

// Hooks (you provide)
import { useMfaEnable } from "@/features/auth/useMfaEnable";
import { useMfaVerify } from "@/features/auth/useMfaVerify";
import { useMfaDisable } from "@/features/auth/useMfaDisable";
import { useMe } from "@/features/auth/useMe";

// Optional store integration removed for hooks rules compliance; page is fully state-driven.

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Local types & helpers
// -----------------------------------------------------------------------------
type SetupState =
  | { phase: "idle" }                                                     // not in setup flow
  | { phase: "setup"; secret: string; otpauth_url?: string | null }      // QR + manual key step
  | { phase: "verified" };                                                // post-verify success

function normalizeTotp(input: string) {
  return input.replace(/\D/g, "").slice(0, 6);
}

// Generate QR code as data URL using the qrcode library
async function generateQrDataUrl(otpauthUrl: string): Promise<string | null> {
  try {
    const QRCode = (await import("qrcode")).default;
    const dataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
    return dataUrl;
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return null;
  }
}

function isStepUpRequired(err: unknown): boolean {
  const e = err as any;
  return (
    (e && e.code === "need_step_up") ||
    (e && e.headers && (e.headers["x-reauth"] === "required" || e.headers["X-Reauth"] === "required"))
  );
}

/** Fire-and-forget trusted-device registration after fresh MFA */
async function registerTrustedDeviceSafely(toast: ReturnType<typeof useToast>) {
  try {
    await postMaybeJson<undefined>(PATHS.tdRegister, undefined, {
      headers: {
        "Idempotency-Key": newIdemKeyWithPrefix("mfa-trust-after-verify"),
        "Cache-Control": "no-store",
      },
    });
    toast({
      variant: "success",
      title: "Device remembered",
      description: "We’ll ask for MFA less often on this device.",
      duration: 2200,
    });
  } catch {
    // Non-fatal; keep quiet to avoid noisy UX.
  }
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function MfaSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Two-factor authentication (MFA)</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add an extra layer of security to your account. Use an authenticator app to generate sign-in codes.
        </p>
      </header>
      <MfaSettings />
      <footer className="mt-10 text-sm text-muted-foreground">
        <Link
          href={PATHS.settingsSecurity || "/settings/security"}
          className="font-medium underline underline-offset-4 hover:text-foreground"
          prefetch
        >
          Back to Security
        </Link>
      </footer>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Main Component · Full MFA lifecycle (enable → verify → disable)
// -----------------------------------------------------------------------------
function MfaSettings() {
  const router = useRouter();
  const toast = useToast();
  const promptReauth = useReauthPrompt();

  // Fetch current user to check MFA status
  const { data: user, isLoading: isLoadingUser, refetch: refetchUser } = useMe();
  const [enabled, setEnabled] = React.useState<boolean>(false);

  const [setup, setSetup] = React.useState<SetupState>({ phase: "idle" });
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [totp, setTotp] = React.useState<string>(""); // verification code
  const [trustDevice, setTrustDevice] = React.useState<boolean>(false); // post-verify option
  const [revealKey, setRevealKey] = React.useState<boolean>(false); // mask manual key by default

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const { mutateAsync: enableMfa, isPending: isEnabling } = useMfaEnable();
  const verifyMutation = useMfaVerify();
  const { mutateAsync: verifyMfa, isPending: isVerifying, reset: resetVerify } = verifyMutation;
  const { mutateAsync: disableMfa, isPending: isDisabling } = useMfaDisable();

  // Sync enabled state with user data from backend
  React.useEffect(() => {
    if (user) {
      // Check both field names (backend uses is_2fa_enabled, mfa_enabled is a synonym)
      const mfaEnabled = !!(user.mfa_enabled ?? user.is_2fa_enabled ?? false);
      setEnabled(mfaEnabled);
      console.log("🔐 [MFA] User MFA status:", { mfa_enabled: user.mfa_enabled, is_2fa_enabled: user.is_2fa_enabled, computed: mfaEnabled });
    }
  }, [user]);

  // Check authentication on mount and redirect if not logged in
  React.useEffect(() => {
    const checkAuth = async () => {
      const { getAccessToken } = await import("@/lib/api/tokens");
      const token = getAccessToken();
      if (!token) {
        // Not authenticated - redirect to login
        router.push("/login?redirect=/mfa-enable-verify-disable");
      }
    };
    checkAuth();
  }, [router]);

  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // When we enter setup with an otpauth_url, generate a QR code (client-side)
  React.useEffect(() => {
    if (setup.phase !== "setup" || !setup.otpauth_url) {
      setQrDataUrl(null);
      return;
    }
    let alive = true;
    generateQrDataUrl(setup.otpauth_url).then((url) => {
      if (alive) setQrDataUrl(url);
    });
    return () => {
      alive = false;
    };
  }, [setup]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  async function startSetupWithOptionalStepUp() {
    setErrorMsg(null);
    try {
      const res = await enableMfa(); // expected: { secret, otpauth_url? }
      const secret = (res as any)?.secret ?? "";
      const otpauth_url = (res as any)?.otpauth_url ?? null;
      if (!secret) throw new Error("Missing secret in enable response.");
      setSetup({ phase: "setup", secret, otpauth_url });
      setTotp("");
      setRevealKey(false);
      toast({
        variant: "success",
        title: "MFA setup started",
        description: "Scan the QR code or enter the manual key below.",
        duration: 2200,
      });
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn't start MFA setup right now. Please try again.",
        });
        setErrorMsg(friendly);
        return;
      }
      try {
        await promptReauth({ reason: "Confirm it's you to enable MFA" } as any);
        const res = await enableMfa({} as any);
        const secret = (res as any)?.secret ?? "";
        const otpauth_url = (res as any)?.otpauth_url ?? null;
        if (!secret) throw new Error("Missing secret in enable response.");
        setSetup({ phase: "setup", secret, otpauth_url });
        setTotp("");
        setRevealKey(false);
        toast({
          variant: "success",
          title: "MFA setup started",
          description: "Scan the QR code or enter the manual key below.",
          duration: 2200,
        });
      } catch (err2) {
        const friendly = formatError(err2, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn't confirm it was you just now.",
        });
        setErrorMsg(friendly);
      }
    }
  }

  async function onEnable() {
    await startSetupWithOptionalStepUp();
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const code = normalizeTotp(totp);
      console.log("🔐 [MFA] Normalized code:", code, "length:", code.length);
      if (code.length !== 6) {
        console.log("🔐 [MFA] Code length invalid, returning");
        return;
      }

      // Check if user is authenticated before attempting verification
      const { getAccessToken } = await import("@/lib/api/tokens");
      const token = getAccessToken();
      console.log("🔐 [MFA] Access token present:", !!token);
      if (!token) {
        setErrorMsg("Your session expired. Please log in to continue, then return to this page to complete MFA setup.");
        // Redirect to login after showing error
        setTimeout(() => {
          router.push("/login?redirect=/mfa-enable-verify-disable");
        }, 3000);
        return;
      }

      // Verify the TOTP code
      const result = await verifyMfa({ code });

      setSetup({ phase: "verified" });
      setEnabled(true);

      // Refetch user data to sync MFA status
      await refetchUser();

      if (trustDevice) {
        registerTrustedDeviceSafely(toast).catch(() => void 0);
      }
      toast({
        variant: "success",
        title: "MFA enabled",
        description: "Your authenticator app is now linked.",
        duration: 2400,
      });
      router.prefetch(PATHS.settingsRecoveryCodes || "/settings/security/recovery-codes");
    } catch (err) {
      // Reset mutation state to stop "Verifying..." button state
      resetVerify();

      // Check for authentication errors
      const authError = (err as any)?.status === 401 || (err as any)?.code === "unauthorized";
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: authError
          ? "Your session expired. Please log in again and retry."
          : "That code didn't work. Check your authenticator and try again.",
      });
      setErrorMsg(friendly);
      setTotp("");
    }
  }

  async function onDisable() {
    setErrorMsg(null);
    try {
      await disableMfa({} as any); // attempt without step-up
      setEnabled(false);
      setSetup({ phase: "idle" });

      // Refetch user data to sync MFA status
      await refetchUser();

      toast({
        variant: "success",
        title: "MFA disabled",
        description: "You can re-enable it at any time.",
        duration: 2200,
      });
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn't disable MFA right now. Please try again.",
        });
        setErrorMsg(friendly);
        return;
      }
      try {
        const reauthToken = await promptReauth({ reason: "Confirm it's you to disable MFA" } as any);
        // Pass reauth token to disable MFA
        await disableMfa({ reauth_token: reauthToken } as any);
        setEnabled(false);
        setSetup({ phase: "idle" });

        // Refetch user data to sync MFA status
        await refetchUser();

        toast({
          variant: "success",
          title: "MFA disabled",
          description: "You can re-enable it at any time.",
          duration: 2200,
        });
      } catch (err2) {
        const friendly = formatError(err2, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn't confirm it was you just now.",
        });
        setErrorMsg(friendly);
      }
    }
  }

  function onCancelSetup() {
    setSetup({ phase: "idle" });
    setTotp("");
    setRevealKey(false);
    setErrorMsg(null);
  }

  async function onRestartSetup() {
    await startSetupWithOptionalStepUp();
  }

  const busy = isEnabling || isVerifying || isDisabling;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <section className="space-y-8" aria-busy={busy || undefined}>
      {/* Inline error (assertive, focuses on update) */}
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

      {/* Status / Primary actions */}
      <div className="rounded-xl border bg-card/50 p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Authenticator app (TOTP)</h2>
            <p className="text-sm text-muted-foreground">
              {enabled ? "Enabled · You’ll be asked for a code when signing in." : "Disabled · Add an extra step to protect your account."}
            </p>
          </div>
          <div className="mt-2 flex gap-2 sm:mt-0">
            {!enabled && setup.phase === "idle" ? (
              <button
                onClick={onEnable}
                disabled={isEnabling}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition",
                  isEnabling && "cursor-not-allowed opacity-75"
                )}
              >
                {isEnabling ? "Starting…" : "Enable MFA"}
              </button>
            ) : null}
            {enabled ? (
              <button
                onClick={onDisable}
                disabled={isDisabling}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent",
                  isDisabling && "cursor-not-allowed opacity-75"
                )}
              >
                {isDisabling ? "Disabling…" : "Disable MFA"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Setup flow */}
      {setup.phase === "setup" && (
        <div className="rounded-xl border p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold">Set up your authenticator</h3>
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, 1Password, etc.).
                If you can’t scan, enter the manual key below.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancelSetup}
                className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onRestartSetup}
                className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
              >
                Start over
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {/* QR code or fallback */}
            <div className="flex flex-col items-center justify-center rounded-lg border bg-accent/30 p-4">
              {setup.otpauth_url && qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR code for MFA setup"
                  className="h-40 w-40 rounded-md border bg-white p-2 shadow"
                />
              ) : setup.otpauth_url ? (
                <div className="w-full max-w-[180px]">
                  <div className="h-40 w-full animate-pulse rounded-md bg-muted" />
                  <div className="mt-2 text-center text-xs text-muted-foreground">Generating QR…</div>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  Your app can be set up using the manual key on the right.
                </div>
              )}
              {setup.otpauth_url ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard?.writeText(setup.otpauth_url || "");
                      toast({
                        variant: "success",
                        title: "Copied",
                        description: "otpauth URL copied to clipboard.",
                        duration: 1600,
                      });
                    } catch {
                      toast({
                        variant: "error",
                        title: "Copy failed",
                        description: "Select and copy the URL manually.",
                        duration: 1800,
                      });
                    }
                  }}
                  className="mt-3 text-xs font-medium underline underline-offset-4 hover:text-foreground"
                >
                  Copy otpauth URL
                </button>
              ) : null}
            </div>

            {/* Manual key (masked by default) */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase text-muted-foreground">Manual key</div>
                <button
                  type="button"
                  onClick={() => setRevealKey((v) => !v)}
                  className="text-xs font-medium underline underline-offset-4 hover:text-foreground"
                  aria-pressed={revealKey}
                  aria-controls="manual-key-block"
                >
                  {revealKey ? "Mask" : "Reveal"}
                </button>
              </div>
              <div
                id="manual-key-block"
                className={cn(
                  "mt-1 break-all rounded-md p-2 font-mono text-sm",
                  revealKey ? "bg-muted/50" : "bg-muted select-none blur-sm"
                )}
                aria-hidden={!revealKey}
              >
                {revealKey ? setup.secret : "•••• •••• •••• •••• ••••"}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard?.writeText(setup.secret);
                      toast({
                        variant: "success",
                        title: "Copied",
                        description: "Manual key copied to clipboard.",
                        duration: 1600,
                      });
                    } catch {
                      toast({
                        variant: "error",
                        title: "Copy failed",
                        description: "Select and copy the key manually.",
                        duration: 1800,
                      });
                    }
                  }}
                  disabled={!revealKey}
                  className={cn(
                    "inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent",
                    !revealKey && "cursor-not-allowed opacity-60"
                  )}
                >
                  Copy key
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Time-based (TOTP). If your app asks, choose 6 digits and 30-second interval.
              </p>
            </div>
          </div>

          {/* Verify form */}
          <form onSubmit={onVerify} noValidate className="mt-6 space-y-4" aria-busy={isVerifying || undefined}>
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium">
                Enter the 6-digit code from your app
              </label>
              <OtpInput
                id="otp"
                value={totp}
                onChange={(val) => setTotp(normalizeTotp(val))}
                length={6}
                numericOnly
                inputProps={{ "aria-describedby": "otp-help", inputMode: "numeric" } as any}
                autoFocus
              />
              <p id="otp-help" className="text-xs text-muted-foreground">
                Codes refresh every ~30 seconds. If verification fails, wait for the next code and try again.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex select-none items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.currentTarget.checked)}
                />
                <span>Remember this device after enabling</span>
              </label>

              <button
                type="submit"
                disabled={isVerifying || normalizeTotp(totp).length !== 6}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition",
                  (isVerifying || normalizeTotp(totp).length !== 6) && "cursor-not-allowed opacity-75"
                )}
              >
                {isVerifying ? "Verifying…" : "Verify & enable"}
              </button>
            </div>
          </form>

          <div className="mt-4 text-xs text-muted-foreground">
            Tip: After enabling,{" "}
            <Link
              href={PATHS.settingsRecoveryCodes || "/settings/security/recovery-codes"}
              className="underline underline-offset-4 hover:text-foreground"
              prefetch
            >
              save your recovery codes
            </Link>{" "}
            in a safe place. They let you sign in if you lose your phone.
          </div>
        </div>
      )}

      {/* Post-verify success callouts */}
      {setup.phase === "verified" && (
        <div className="rounded-xl border bg-emerald-50/40 p-5 text-sm shadow-sm">
          <div className="font-medium text-emerald-900">All set — MFA is enabled.</div>
          <p className="mt-1 text-emerald-900/90">
            We recommend saving your recovery codes now. You can also manage trusted devices.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={PATHS.settingsRecoveryCodes || "/settings/security/recovery-codes"}
              className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
              prefetch
            >
              View recovery codes
            </Link>
            <Link
              href={PATHS.settingsDevices || "/settings/security/devices"}
              className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
              prefetch
            >
              Manage trusted devices
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
