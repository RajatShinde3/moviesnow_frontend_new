"use client";

/**
 * =============================================================================
 * Page · Password Reset · Request (Best-of-best · final)
 * =============================================================================
 * Lets a user request a password reset link/code. Neutral responses (no account
 * enumeration), resilient request hook, and a smooth handoff to /reset/confirm.
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Uses idempotent `usePasswordResetRequest()`; tolerant of 204/no-body.
 * • Neutral success copy (same UX regardless of account existence).
 * • Client "no-store" hints (server route should also send no-store).
 * • Honeypot field to reduce simple bot abuse (graceful no-op).
 *
 * WORKFLOW
 * --------
 * • Submit email → toast “If this email is registered…” → persist email in
 *   sessionStorage → route to `/reset/confirm?email=...` (for no-SS fallback).
 *
 * UX & A11y
 * ---------
 * • Fully labeled input; keyboard-first; assertive aria-live error region.
 * • Submit disabled while pending/invalid; Enter submits.
 * • Focus handoff to the error banner on failure.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import { PATHS } from "@/lib/env";
import { usePasswordResetRequest } from "@/features/auth/usePasswordResetRequest";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// sessionStorage key to hand off the email to /reset/confirm
const SSKEY_RESET_EMAIL = "auth:reset.email";

export default function ResetRequestPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we’ll send a reset link or code.
        </p>
      </header>
      <ResetRequestForm />
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          className="font-medium underline underline-offset-4 hover:text-foreground"
          href="/login"
          prefetch
        >
          Back to sign in
        </Link>
      </footer>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Form · Neutral success, idempotent, A11y-first
// -----------------------------------------------------------------------------
function ResetRequestForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const [email, setEmail] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  // Simple honeypot (hidden field). If filled, we short-circuit as "success".
  const [hp, setHp] = React.useState("");

  const { mutateAsync: requestReset, isPending } = usePasswordResetRequest();

  // Prefill from ?email= if present (e.g., user returned from confirm page)
  React.useEffect(() => {
    const q = params?.get("email");
    if (q && !email) setEmail(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preload the confirm step route for snappy navigation
  React.useEffect(() => {
    const next = PATHS.resetConfirm || "/reset/confirm";
    // router.prefetch is safe; if unsupported it’s a no-op
    // @ts-expect-error -- prefetch may be undefined in some Next runtimes
    router.prefetch?.(next);
  }, [router]);

  // Focus the inline error region whenever a new error appears
  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  const trimmed = email.trim();
  const normalized = trimmed.toLowerCase();
  const canSubmit = !isPending && trimmed.length > 3;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setErrorMsg(null);

    // If the honeypot is filled, pretend success and move on (bot noise reduction)
    if (hp) {
      persistAndRedirect(normalized);
      return;
    }

    try {
      await requestReset({ email: normalized } as any);

      persistAndRedirect(normalized);
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "We couldn’t start a reset right now. Please try again in a moment.",
      });
      setErrorMsg(friendly);
    }
  };

  function persistAndRedirect(addr: string) {
    // Persist email for the confirm step (best effort)
    try {
      sessionStorage.setItem(SSKEY_RESET_EMAIL, addr);
    } catch {
      /* non-fatal */
    }

    toast({
      variant: "success",
      title: "Check your email",
      description: "If this address is registered, you’ll receive a reset link or code.",
      duration: 3200,
    });

    const next = PATHS.resetConfirm || "/reset/confirm";
    // Include ?email= for environments where sessionStorage is disabled
    router.replace(`${next}?email=${encodeURIComponent(addr)}`);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-busy={isPending || undefined}>
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

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          onInput={(e) => {
            // Strip leading spaces early; leave inner spaces for the browser’s own validation to flag
            const v = (e.currentTarget.value || "").replace(/^\s+/, "");
            if (v !== e.currentTarget.value) setEmail(v);
          }}
          autoFocus
          aria-describedby="email-help"
          className={cn(
            "block w-full rounded-lg border bg-background px-3 py-2 text-base shadow-sm",
            "outline-none ring-0 transition placeholder:text-muted-foreground/70",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          )}
        />
        <p id="email-help" className="text-xs text-muted-foreground">
          We’ll email instructions to reset your password.
        </p>

        {/* Honeypot (hidden from users; basic bot trap) */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="new-password"
          aria-hidden="true"
          className="hidden"
          value={hp}
          onChange={(e) => setHp(e.currentTarget.value)}
        />
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
          {isPending ? "Sending…" : "Send reset link"}
        </button>
      </div>
    </form>
  );
}
