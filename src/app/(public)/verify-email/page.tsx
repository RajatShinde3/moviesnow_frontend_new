"use client";

/**
 * =============================================================================
 * Page · Verify Email (Best-of-best · final)
 * =============================================================================
 * A polished email verification gate that supports:
 *  - Auto-verification when `?token=` (or `?t=`) is present.
 *  - Resend verification when the user didn't receive the link.
 *  - Prefilled target email via sessionStorage ("auth:verify.target_email") or ?email=.
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Hooks: `useEmailVerificationVerify`, `useEmailVerificationResend`.
 * • Neutral, support-friendly errors via `formatError()` (request-id surfaced).
 * • Client "no-store" hints; server route should also send no-store.
 *
 * UX & ACCESSIBILITY
 * ------------------
 * • Assertive `aria-live` inline error with focus handoff.
 * • Clear success/neutral messaging, keyboard-first friendly.
 * • Submit disabled while pending/invalid; Enter submits.
 * • 30s resend cooldown to prevent accidental spamming.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import { useEmailVerificationVerify } from "@/features/auth/useEmailVerificationVerify";
import { useEmailVerificationResend } from "@/features/auth/useEmailVerificationResend";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// sessionStorage key (populated during signup)
// -----------------------------------------------------------------------------
const SSKEY_VERIFY_EMAIL_TARGET = "auth:verify.target_email";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
/** Only allow same-origin, absolute paths like "/dashboard". */
function sanitizeNextPath(nextParam: string | null | undefined, fallback: string): string {
  if (!nextParam) return fallback;
  if (!nextParam.startsWith("/")) return fallback;
  if (nextParam.startsWith("//")) return fallback;
  if (nextParam.includes("://")) return fallback;
  return nextParam;
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function VerifyEmailPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Click the verification link we sent to your inbox. You can also resend it below.
        </p>
      </header>
      <VerifyEmailGate />
      <footer className="mt-8 text-center text-sm text-muted-foreground">
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
// Gate Component · Auto-verify (with token) + resend flow + cooldown
// -----------------------------------------------------------------------------
function VerifyEmailGate() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const token = params?.get("token") || params?.get("t") || null;
  const nextPath = React.useMemo(
    () => sanitizeNextPath(params?.get("next"), "/"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params?.get("next")]
  );

  const [email, setEmail] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  // Resend cooldown (seconds)
  const COOLDOWN = 30;
  const [cooldown, setCooldown] = React.useState<number>(0);
  const tickRef = React.useRef<number | null>(null);

  const { mutateAsync: verify, isPending: isVerifying } = useEmailVerificationVerify();
  const { mutateAsync: resend, isPending: isResending } = useEmailVerificationResend();

  // Prefill email from ?email= or sessionStorage (set by the signup page)
  React.useEffect(() => {
    if (email) return;
    const fromQuery = params?.get("email");
    if (fromQuery) {
      setEmail(fromQuery);
      return;
    }
    try {
      const saved = sessionStorage.getItem(SSKEY_VERIFY_EMAIL_TARGET);
      if (saved) setEmail(saved);
    } catch {
      /* non-fatal */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefetch post-verify target for snappier navigation
  React.useEffect(() => {
    router.prefetch?.(nextPath);
  }, [router, nextPath]);

  // Focus inline error when it appears
  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // Auto-verify when a token is present
  React.useEffect(() => {
    if (!token) return;
    (async () => {
      setErrorMsg(null);
      try {
        await verify({ token } as any);
        toast({
          variant: "success",
          title: "Email verified",
          description: "Thanks! Your email address is now verified.",
          duration: 2400,
        });
        // No longer need the stored email
        try {
          sessionStorage.removeItem(SSKEY_VERIFY_EMAIL_TARGET);
        } catch {}
        router.replace(nextPath);
      } catch (err) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback:
            "We couldn’t verify that link. It may have expired—try resending a new verification email.",
        });
        setErrorMsg(friendly);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Cooldown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    tickRef.current = window.setInterval(() => {
      setCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [cooldown]);

  const canResend = !isVerifying && !isResending && email.trim().length > 3 && cooldown === 0;

  const onResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canResend) return;
    setErrorMsg(null);
    try {
      await resend({ email: email.trim() } as any);
      toast({
        variant: "success",
        title: "Verification sent",
        description: "Check your inbox for a fresh link.",
        duration: 2400,
      });
      setCooldown(COOLDOWN);
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback:
          "We couldn’t resend the email right now. Please confirm your address and try again.",
      });
      setErrorMsg(friendly);
    }
  };

  return (
    <section
      className="rounded-lg border px-4 py-6 shadow-sm"
      aria-busy={isVerifying || undefined}
    >
      {/* Inline error banner */}
      <div
        ref={errorRef}
        tabIndex={errorMsg ? -1 : undefined}
        aria-live="assertive"
        className={cn(
          "mb-4 rounded-lg border px-4 py-3 text-sm shadow-sm",
          errorMsg ? "border-destructive/30 bg-destructive/10 text-destructive" : "hidden"
        )}
      >
        {errorMsg}
      </div>

      {/* Token-present progress state */}
      {token ? (
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">Verifying your email… This only takes a moment.</p>
          <div className="h-1 w-full overflow-hidden rounded bg-muted">
            <div className="h-full w-1/2 animate-[progress_1.2s_ease-in-out_infinite] bg-primary/70" />
          </div>
          <style jsx>{`
            @keyframes progress {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(20%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
          <p className="text-xs text-muted-foreground">
            If nothing happens, you can{" "}
            <Link href="/verify-email" className="underline underline-offset-4 hover:text-foreground">
              try again
            </Link>{" "}
            or request a new link below.
          </p>
        </div>
      ) : (
        // Gate / Resend flow
        <form onSubmit={onResend} noValidate className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Email address to verify
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
              onChange={(e) => setEmail(e.currentTarget.value)}
              className={cn(
                "block w-full rounded-lg border bg-background px-3 py-2 text-base shadow-sm",
                "outline-none ring-0 transition placeholder:text-muted-foreground/70",
                "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              )}
            />
            <p className="text-xs text-muted-foreground">
              We’ll send a fresh verification link to this address.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!canResend}
              className={cn(
                "inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition",
                !canResend
                  ? "cursor-not-allowed border bg-muted text-muted-foreground"
                  : "border bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              )}
            >
              {isResending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            Didn’t get it? Check your spam folder, or ensure the email is correct above.
          </div>
        </form>
      )}
    </section>
  );
}
