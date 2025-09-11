"use client";

/**
 * =============================================================================
 * Page · Reactivation · Start (Best-of-best)
 * =============================================================================
 * Request reactivation for a deactivated account.
 *
 * • Uses your `useReactivationStart()` hook.
 * • Neutral copy: same UX whether or not the email exists (anti-enumeration).
 * • A11y: assertive error region, labeled input, guarded submit.
 * • Polished UX: safe redirect propagation, keyboard-first, subtle success.
 */

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";

import { useReactivationStart } from "@/features/auth/useReactivationStart";

// -----------------------------------------------------------------------------
// Cache hints (client-side). Server route should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function sanitizeRedirect(input: string | null | undefined, fallback = "/login") {
  if (!input) return fallback;
  if (input.startsWith("//")) return fallback;
  if (!input.startsWith("/")) return fallback;
  return input;
}

export default function ReactivationStartPage() {
  const sp = useSearchParams();
  const redirect = sanitizeRedirect(sp?.get("redirect"), PATHS.login || "/login");

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reactivate your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We’ll email instructions to verify it’s you.
        </p>
      </header>

      <StartForm redirect={redirect} />

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <Link
          href={`${PATHS.login || "/login"}?redirect=${encodeURIComponent(redirect)}`}
          className="font-medium underline underline-offset-4 hover:text-foreground"
          prefetch
        >
          Back to sign in
        </Link>
      </footer>
    </main>
  );
}

function StartForm({ redirect }: { redirect: string }) {
  const toast = useToast();

  const [email, setEmail] = React.useState("");
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  // Simple bot honeypot (ignored by humans/screen readers)
  const [hp, setHp] = React.useState("");

  const { mutateAsync: start, isPending } = useReactivationStart();

  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  const normalizedEmail = email.trim().toLowerCase();
  const canSubmit = !isPending && normalizedEmail.length > 3 && !hp;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setErrorMsg(null);

    try {
      // Most APIs accept just { email }. Your hook can adapt if needed.
      await start({ email: normalizedEmail } as any);
      setSentTo(normalizedEmail);
      toast({
        variant: "success",
        title: "Check your email",
        description:
          "If an account is deactivated for this address, we sent instructions.",
        duration: 2600,
      });
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "We couldn’t start reactivation right now. Please try again.",
      });
      setErrorMsg(friendly);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-busy={isPending || undefined}>
      {/* Inline error banner (assertive live region; focuses on update) */}
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

      {/* Success callout (neutral; anti-enumeration) */}
      {sentTo && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border bg-emerald-50/60 px-4 py-3 text-sm shadow-sm"
        >
          <div className="font-medium text-emerald-900">Request received</div>
          <p className="mt-1 text-emerald-900/90">
            If your account is deactivated, you’ll receive an email at{" "}
            <span className="font-mono">{sentTo}</span> with the next steps.
          </p>
          <div className="mt-2 text-xs">
            Already got a code?{" "}
            <Link
              href={`${PATHS.reactivateConfirm || "/reactivate/confirm"}?redirect=${encodeURIComponent(
                redirect
              )}`}
              className="underline underline-offset-4 hover:text-foreground"
              prefetch
            >
              Enter it here
            </Link>
            .
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
          onChange={(e) => setEmail(e.currentTarget.value)}
          aria-describedby="email-help"
          className={cn(
            "block w-full rounded-lg border bg-background px-3 py-2 text-base shadow-sm",
            "outline-none ring-0 transition placeholder:text-muted-foreground/70",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          )}
        />
        <p id="email-help" className="text-xs text-muted-foreground">
          We’ll send a one-time link or code. Check spam or junk if you don’t see it.
        </p>

        {/* Honeypot (hidden from users; simple bot mitigation) */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.currentTarget.value)}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-lg border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition",
            !canSubmit && "cursor-not-allowed opacity-75"
          )}
        >
          {isPending ? "Sending…" : "Send reactivation email"}
        </button>
      </div>
    </form>
  );
}
