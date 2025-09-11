"use client";

/**
 * =============================================================================
 * Page · MFA Reset · Confirm (Best-of-best · enhanced)
 * =============================================================================
 * Complete the MFA reset using a link `?token=` from email, or by entering a
 * one-time verification code if your backend supports that pattern.
 *
 * BEHAVIOR
 * --------
 * • If `?token=` (or `?t=`) is present → auto-confirm on load (shows progress).
 * • If `?code=` (or `?c=`) is present → prefill + auto-submit code flow.
 * • Otherwise, show a code entry form using <OtpInput/> (6 digits by default).
 * • On success → toast + guide back to sign in (or security settings).
 *
 * SECURITY & UX
 * -------------
 * • Neutral, user-friendly error copy; no account enumeration.
 * • Assertive error live region; focus handoff; keyboard-first.
 * • Reminds the user to re-enable MFA after they regain access.
 * • Defensive normalization of inputs; resilient to API shape.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import OtpInput from "@/components/forms/OtpInput";

import { useMfaConfirmReset } from "@/features/auth/useMfaConfirmReset";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// Constants & helpers
// -----------------------------------------------------------------------------
const OTP_LEN = 6;
const DIGITS = /\D/g;

function normalizeDigits(x: string) {
  return x.replace(DIGITS, "").slice(0, OTP_LEN);
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function MfaResetConfirmPage() {
  const params = useSearchParams();
  const token = params?.get("token") || params?.get("t") || "";
  const codeParam = params?.get("code") || params?.get("c") || "";

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Confirm MFA reset</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We’re verifying it’s you so you can sign in without your authenticator.
        </p>
      </header>

      <ConfirmPanel initialToken={token} initialCode={codeParam} />

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium underline underline-offset-4 hover:text-foreground" prefetch>
          Back to sign in
        </Link>
      </footer>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Panel
// -----------------------------------------------------------------------------
function ConfirmPanel({ initialToken, initialCode }: { initialToken: string; initialCode: string }) {
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = React.useState<"token" | "code">(initialToken ? "token" : "code");
  const [code, setCode] = React.useState(normalizeDigits(initialCode || ""));
  const [verifyingToken, setVerifyingToken] = React.useState<boolean>(!!initialToken);
  const [done, setDone] = React.useState(false);

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const { mutateAsync: confirmReset, isPending } = useMfaConfirmReset();

  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // Auto-confirm if a token is present in the URL
  React.useEffect(() => {
    if (!initialToken) {
      setVerifyingToken(false);
      return;
    }
    if (mode !== "token") return;

    let cancelled = false;
    (async () => {
      setErrorMsg(null);
      setVerifyingToken(true);
      try {
        await confirmReset({ token: initialToken } as any);
        if (cancelled) return;
        finalizeSuccess();
      } catch (err) {
        if (cancelled) return;
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback:
            "We couldn’t confirm this link. It may have expired or was already used. You can try entering a code instead.",
        });
        setErrorMsg(friendly);
        setMode("code");
      } finally {
        if (!cancelled) setVerifyingToken(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialToken]);

  // Auto-submit if a valid code was prefilled via URL (?code= or ?c=)
  React.useEffect(() => {
    if (!initialToken && code && code.length === OTP_LEN && mode === "code") {
      void submitCode(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, code]);

  const isCodeValid = code.length === OTP_LEN;
  const busy = isPending || verifyingToken;

  async function submitCode(value: string) {
    setErrorMsg(null);
    try {
      await confirmReset({ code: normalizeDigits(value) } as any);
      finalizeSuccess();
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "That code didn’t work. Check the latest email and try again.",
      });
      setErrorMsg(friendly);
      setCode("");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isCodeValid || busy) return;
    await submitCode(code);
  }

  function finalizeSuccess() {
    setDone(true);
    toast({
      variant: "success",
      title: "MFA reset confirmed",
      description: "You can sign in without your authenticator now.",
      duration: 2600,
    });
    router.refresh?.();
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-emerald-50/60 p-5 text-sm shadow-sm">
        <div className="font-medium text-emerald-900">All set — MFA was reset.</div>
        <p className="mt-1 text-emerald-900/90">
          You can now sign in with your email and password. We recommend re-enabling MFA after you’re back in.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
            prefetch
          >
            Go to sign in
          </Link>
          <Link
            href={PATHS.settingsSecurity || "/settings/security"}
            className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
            prefetch
          >
            Security settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-busy={busy || undefined}>
      {/* Error banner (assertive live region) */}
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

      {/* Token flow progress */}
      {verifyingToken && (
        <div className="rounded-xl border bg-card/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm">Confirming your reset link…</div>
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-foreground/60" />
          </div>
        </div>
      )}

      {/* Code form (primary UI) */}
      {!verifyingToken && (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm font-medium">
              Enter the {OTP_LEN}-digit code
            </label>
            <OtpInput
              id="otp"
              value={code}
              onChange={(v) => setCode(normalizeDigits(v))}
              length={OTP_LEN}
              numericOnly
              inputProps={{ "aria-describedby": "otp-help", inputMode: "numeric" } as any}
              autoFocus={mode === "code"}
            />
            <p id="otp-help" className="text-xs text-muted-foreground">
              You’ll find this code in the latest email we sent for your MFA reset.
            </p>
          </div>

          <button
            type="submit"
            disabled={!isCodeValid || busy}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-lg border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition",
              (!isCodeValid || busy) && "cursor-not-allowed opacity-75"
            )}
          >
            {busy ? "Confirming…" : "Confirm reset"}
          </button>

          <div className="text-center text-xs text-muted-foreground">
            Didn’t get a code? Check spam, or{" "}
            <Link href="/mfa-reset" className="underline underline-offset-4 hover:text-foreground" prefetch>
              request a new email
            </Link>
            .
          </div>
        </form>
      )}
    </section>
  );
}
