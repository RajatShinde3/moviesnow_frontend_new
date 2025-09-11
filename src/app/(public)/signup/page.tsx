"use client";

/**
 * =============================================================================
 * Page · Signup (Best-of-best · final)
 * =============================================================================
 * Production-grade signup page for Next.js (App Router), aligned with your
 * backend workflow and frontend libs.
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Uses `useSignup()` (idempotent; resilient to 204/no-body; refresh handled client-side).
 * • Neutral, user-friendly errors via `formatError()` (no enumeration).
 * • Client-side no-store hints; server route should also send no-store.
 * • Lightweight honeypot to dampen basic bot abuse (graceful no-op).
 *
 * WORKFLOW
 * --------
 * • On success:
 *    - If `email_verified` is false/unknown → persist target email for the verify gate
 *      and redirect to `/verify-email`.
 *    - If verified → toast and redirect to `PATHS.afterLogin` (or `/`).
 *
 * UX & ACCESSIBILITY
 * ------------------
 * • Labeled inputs, proper `autocomplete`, and keyboard-first flow.
 * • Live password strength meter; confirm-password inline hint.
 * • Assertive `aria-live` error region; focus handoff on failures.
 * • Submit disabled while pending/invalid; Enter key submits.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import { PasswordField } from "@/components/forms/PasswordField";
import PasswordStrength from "@/components/forms/PasswordStrength";
import { useSignup } from "@/features/auth/useSignup";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// sessionStorage keys (handoff to verify-email gate)
// -----------------------------------------------------------------------------
const SSKEY_VERIFY_EMAIL_TARGET = "auth:verify.target_email";

// -----------------------------------------------------------------------------
// Local form state
// -----------------------------------------------------------------------------
type FormState = {
  email: string;
  password: string;
  confirm: string;
  acceptTos: boolean;
};

export default function SignupPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It takes less than a minute. We’ll ask you to verify your email next.
        </p>
      </header>
      <SignupForm />
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="font-medium underline underline-offset-4 hover:text-foreground"
          href="/login"
          prefetch
        >
          Sign in
        </Link>
      </footer>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Form · Idempotent, a11y-first, with strength meter and verify handoff
// -----------------------------------------------------------------------------
function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const [form, setForm] = React.useState<FormState>({
    email: "",
    password: "",
    confirm: "",
    acceptTos: false,
  });

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  // Simple honeypot to reduce trivial bot submissions
  const [hp, setHp] = React.useState("");

  const { mutateAsync: signup, isPending } = useSignup();

  // Prefill from ?email= when arriving from other flows
  React.useEffect(() => {
    const q = params?.get("email");
    if (q && !form.email) setForm((s) => ({ ...s, email: q }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefetch verify-email for snappier handoff
  React.useEffect(() => {
    const next = PATHS.verifyEmail || "/verify-email";
    // @ts-expect-error -- prefetch may be undefined in some Next runtimes
    router.prefetch?.(next);
  }, [router]);

  // Focus inline error when it appears
  React.useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errorMsg]);

  const passwordsMatch = form.password.length > 0 && form.password === form.confirm;
  const canSubmit =
    !isPending &&
    form.email.trim().length > 3 &&
    form.password.length >= 8 && // conservative local check; server enforces full policy
    passwordsMatch &&
    form.acceptTos;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    if (!passwordsMatch) {
      setErrorMsg("Passwords don’t match. Please re-enter your password.");
      return;
    }
    if (!form.acceptTos) {
      setErrorMsg("Please accept the Terms to continue.");
      return;
    }

    // If honeypot is filled, pretend success and move on (no server call)
    if (hp) {
      return handoffToVerify(form.email.trim().toLowerCase());
    }

    try {
      const res = await signup({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      } as any);

      // Heuristic: check common shapes for verified flag; fallback to AuthGate.
      const emailVerified =
        (res && (res as any).email_verified === true) ||
        (res && (res as any).user && (res as any).user.email_verified === true);

      if (!emailVerified) {
        handoffToVerify(form.email.trim().toLowerCase());
        return;
      }

      toast({
        variant: "success",
        title: "Welcome!",
        description: "Your account is ready.",
        duration: 2500,
      });
      router.replace(PATHS.afterLogin || "/");
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback:
          "We couldn’t create your account right now. Please check your details and try again.",
      });
      setErrorMsg(friendly);
    }
  }

  function handoffToVerify(email: string) {
    // Store target email so /verify-email can render and prefill resend (best effort)
    try {
      sessionStorage.setItem(SSKEY_VERIFY_EMAIL_TARGET, email);
    } catch {
      /* non-fatal */
    }

    toast({
      variant: "success",
      title: "Account created",
      description: "We’ve sent a verification link to your email.",
      duration: 3000,
    });

    const next = PATHS.verifyEmail || "/verify-email";
    router.replace(`${next}?email=${encodeURIComponent(email)}`);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-busy={isPending || undefined}>
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
          autoCapitalize="none"
          autoComplete="email"
          spellCheck={false}
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.currentTarget.value }))}
          onInput={(e) => {
            // Trim leading spaces early; keep internal spaces for native validation
            const v = (e.currentTarget.value || "").replace(/^\s+/, "");
            if (v !== e.currentTarget.value) {
              setForm((s) => ({ ...s, email: v }));
            }
          }}
          autoFocus
          className={cn(
            "block w-full rounded-lg border bg-background px-3 py-2 text-base shadow-sm",
            "outline-none ring-0 transition placeholder:text-muted-foreground/70",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          )}
        />

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

      {/* Password */}
      <div className="space-y-2">
        <PasswordField
          id="password"
          name="password"
          label="Password"
          kind="new"
          required
          autoComplete="new-password"
          placeholder="Create a strong password"
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.currentTarget.value }))}
          hint="Use at least 8 characters; a mix of letters, numbers, and symbols is best."
        />
        {/* Live strength meter (policy-aware component) */}
        <PasswordStrength value={form.password} />
      </div>

      {/* Confirm password */}
      <div className="space-y-2">
        <label htmlFor="confirm" className="block text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Re-enter your password"
          value={form.confirm}
          onChange={(e) => setForm((s) => ({ ...s, confirm: e.currentTarget.value }))}
          className={cn(
            "block w-full rounded-lg border bg-background px-3 py-2 text-base shadow-sm",
            "outline-none ring-0 transition placeholder:text-muted-foreground/70",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          )}
          aria-invalid={form.confirm.length > 0 && !passwordsMatch ? true : undefined}
          aria-describedby={!passwordsMatch ? "confirm-help" : undefined}
        />
        {!passwordsMatch && form.confirm.length > 0 ? (
          <p id="confirm-help" className="text-xs text-destructive">
            The passwords don’t match.
          </p>
        ) : null}
      </div>

      {/* Terms */}
      <div className="flex items-start justify-between gap-3">
        <label htmlFor="tos" className="flex cursor-pointer select-none items-start gap-2 text-sm">
          <input
            id="tos"
            name="tos"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border"
            checked={form.acceptTos}
            onChange={(e) => setForm((s) => ({ ...s, acceptTos: e.currentTarget.checked }))}
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
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
          {isPending ? "Creating your account…" : "Create account"}
        </button>

        <p className="mt-2 text-xs text-muted-foreground">
          We’ll send a verification email after you sign up. You can’t use all features until your email is verified.
        </p>
      </div>
    </form>
  );
}
