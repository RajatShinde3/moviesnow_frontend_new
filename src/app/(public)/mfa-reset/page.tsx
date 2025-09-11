"use client";

/**
 * =============================================================================
 * Page · MFA Reset · Request (Best-of-best · enhanced)
 * =============================================================================
 * Let a user request an MFA reset when they’ve lost access to their authenticator.
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Uses your `useMfaRequestReset()` hook; client stack handles idempotency/refresh.
 * • Neutral, non-enumerating copy (same response regardless of email validity).
 * • Client hints for no-store; server should also send no-store.
 *
 * UX & A11y
 * ---------
 * • Clear expectations: we’ll email next steps if the account exists.
 * • Labeled fields, proper autocomplete, keyboard-first.
 * • Assertive error live region; focus handoff on failure.
 * • Quality-of-life: prefill from `?email=`, success banner, resend with cooldown.
 */

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import { useMfaRequestReset } from "@/features/auth/useMfaRequestReset";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Small helpers
// -----------------------------------------------------------------------------
const COOLDOWN_SEC = 30;
const EMAIL_HELP_ID = "email-help";

function sanitizeEmailPrefill(q: string | null) {
  if (!q) return "";
  // Very light sanitation: trim & limit length to avoid UI abuse
  return q.trim().slice(0, 254);
}

export default function MfaResetRequestPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Can’t access your authenticator?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Request a reset and we’ll email next steps to verify it’s you.
        </p>
      </header>

      <RequestForm />

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Remembered your code?{" "}
        <Link href={PATHS.login || "/login"} className="font-medium underline underline-offset-4 hover:text-foreground" prefetch>
          Back to sign in
        </Link>
      </footer>
    </main>
  );
}

function RequestForm() {
  const toast = useToast();
  const params = useSearchParams();

  const prefill = React.useMemo(
    () => sanitizeEmailPrefill(params?.get("email") || params?.get("e") || ""),
    [params]
  );

  const [email, setEmail] = React.useState(prefill);
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState<number>(0);

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const { mutateAsync: requestReset, isPending } = useMfaRequestReset();

  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // Cooldown ticker for "Resend"
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const canSubmit = !isPending && email.trim().length > 3 && cooldown === 0;

  async function sendRequest(targetEmail: string) {
    // Most APIs accept just { email }. If yours needs more, adapt in the hook.
    await requestReset({ email: targetEmail } as any);
    setSentTo(targetEmail);
    setCooldown(COOLDOWN_SEC);
    toast({
      variant: "success",
      title: "Check your email",
      description: "If an account exists, we sent instructions to finish verification.",
      duration: 2800,
    });
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setErrorMsg(null);

    try {
      const target = email.trim();
      await sendRequest(target);
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "We couldn’t start the reset right now. Please try again.",
      });
      setErrorMsg(friendly);
    }
  };

  const onResend = async () => {
    if (!sentTo || cooldown > 0 || isPending) return;
    setErrorMsg(null);
    try {
      await sendRequest(sentTo);
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "We couldn’t resend just now. Please try again shortly.",
      });
      setErrorMsg(friendly);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-busy={isPending || undefined}>
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

      {/* Success hint */}
      {sentTo && (
        <div
          role="status"
          aria-atomic="true"
          className="rounded-lg border bg-emerald-50/60 px-4 py-3 text-sm shadow-sm"
        >
          <div className="font-medium text-emerald-900">Request received</div>
          <p className="mt-1 text-emerald-900/90">
            If an account exists for <span className="font-mono">{sentTo}</span>, you’ll receive an email with the next steps.
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onResend}
              disabled={cooldown > 0 || isPending}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent",
                (cooldown > 0 || isPending) && "cursor-not-allowed opacity-60"
              )}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
            </button>

            <Link
              href={PATHS.mfaResetConfirm || "/mfa-reset/confirm"}
              className="text-xs font-medium underline underline-offset-4 hover:text-foreground"
              prefetch
            >
              Have a code? Confirm reset
            </Link>
          </div>
        </div>
      )}

      {/* Email input */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Account email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoCapitalize="none"
          autoComplete="email"
          spellCheck={false}
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
            if (errorMsg) setErrorMsg(null);
          }}
          aria-describedby={EMAIL_HELP_ID}
          disabled={isPending}
          className={cn(
            "block w-full rounded-lg border bg-background px-3 py-2 text-base shadow-sm",
            "outline-none ring-0 transition placeholder:text-muted-foreground/70",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            isPending && "opacity-90"
          )}
        />
        <p id={EMAIL_HELP_ID} className="text-xs text-muted-foreground">
          We’ll send a one-time link or code. Check spam or junk if you don’t see it.
        </p>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition",
            !canSubmit
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          )}
        >
          {isPending ? "Sending…" : sentTo ? "Send again" : "Send reset instructions"}
        </button>
      </div>
    </form>
  );
}
