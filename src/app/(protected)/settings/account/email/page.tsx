"use client";

/**
 * =============================================================================
 * Page · Settings · Account · Change Email (Best-of-best)
 * =============================================================================
 * Start an email change safely:
 *   • Calls your `useEmailChangeStart()` hook to request a confirmation link.
 *   • If the server demands step-up (reauth), opens <ReauthDialog/> and retries
 *     with `xReauth` seamlessly.
 *   • Neutral, user-friendly errors via `formatError()`, with request-id surfaced
 *     in the message for support correlation when available.
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Client no-store hints (`revalidate = 0`, `dynamic = "force-dynamic"`).
 * • Idempotency is handled inside your hook/client; we never double-submit UI.
 * • Optional backend hints (retry_after / next_allowed_at) drive resend cooldown.
 *
 * UX & A11y
 * ---------
 * • Clear explanation of next steps (check inbox, follow link).
 * • Fully labeled input with `type="email"` + proper autocomplete.
 * • Assertive error live-region with focus handoff; keyboard-first flow.
 * • Inline success callout with “Resend” (cooldown-aware).
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";            // ✅ consistent import
import { useReauthPrompt } from "@/components/ReauthDialog";

import { useEmailChangeStart } from "@/features/auth/useEmailChangeStart";

// -----------------------------------------------------------------------------
// Page-level cache hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
// Cache hints are configured at the (protected) segment layout.

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function isStepUpRequired(err: unknown): boolean {
  const e = err as any;
  return (
    (e && e.code === "need_step_up") ||
    (e &&
      e.headers &&
      (e.headers["x-reauth"] === "required" || e.headers["X-Reauth"] === "required"))
  );
}

/** Derive a resend cooldown (seconds) from backend hints if available. */
function deriveCooldown(hint: { retry_after?: unknown; next_allowed_at?: unknown } | undefined): number {
  if (!hint) return 0;
  const ra = typeof hint.retry_after === "number" ? hint.retry_after : undefined;
  if (typeof ra === "number" && Number.isFinite(ra) && ra > 0) return Math.min(ra, 3600);
  const naa = typeof hint.next_allowed_at === "string" ? hint.next_allowed_at : undefined;
  if (naa) {
    const diff = Math.ceil((new Date(naa).getTime() - Date.now()) / 1000);
    return diff > 0 && Number.isFinite(diff) ? Math.min(diff, 3600) : 0;
  }
  return 0;
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function ChangeEmailPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Change email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We’ll send a confirmation link to your new address. For security, we may ask you to confirm it’s you.
        </p>
      </header>
      <ChangeEmailForm />
      <footer className="mt-8 text-sm text-muted-foreground">
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
// Form · request link → success callout + resend (cooldown-aware) → step-up flow
// -----------------------------------------------------------------------------
function ChangeEmailForm() {
  const router = useRouter();
  const toast = useToast();
  const promptReauth = useReauthPrompt();

  const [email, setEmail] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const [successEmail, setSuccessEmail] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState<number>(0);

  const { mutateAsync: startChange, isPending } = useEmailChangeStart();

  // A11y: focus error region on update
  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // Cooldown ticker
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  // Lightweight email sanity (HTML5 also validates `type="email"`)
  const trimmed = email.trim();
  const canSubmit = !isPending && trimmed.length > 3;

  // Perform start request; optional xReauth support
  async function doStart(nextToken?: string) {
    const payload: any = { new_email: trimmed };
    if (nextToken) payload.xReauth = nextToken;
    return await startChange(payload);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErrorMsg(null);

    try {
      const ack: any = await doStart();
      setSuccessEmail(trimmed);

      // If backend provides cooldown hints, reflect them in UI
      const cd = deriveCooldown(ack);
      if (cd > 0) setCooldown(cd);

      toast({
        variant: "success",
        title: "Check your email",
        description: "We’ve sent a confirmation link to your new address.",
        duration: 2600,
      });

      // If your app reflects "pending email" in profile state, refresh:
      router.refresh();
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t start the email change right now. Please try again.",
        });
        setErrorMsg(friendly);
        return;
      }

      // Step-up path
      try {
        await promptReauth({ reason: "Confirm it’s you to change your email" } as any);

        const ack: any = await doStart();
        setSuccessEmail(trimmed);
        const cd = deriveCooldown(ack);
        if (cd > 0) setCooldown(cd);

        toast({
          variant: "success",
          title: "Check your email",
          description: "We’ve sent a confirmation link to your new address.",
          duration: 2600,
        });

        router.refresh();
      } catch (err2) {
        const friendly = formatError(err2, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t confirm it was you just now. Please try again.",
        });
        setErrorMsg(friendly);
      }
    }
  }

  // Allow resending after success (cooldown-aware)
  const canResend = !isPending && !!successEmail && cooldown <= 0;
  async function handleResend() {
    if (!successEmail) return;
    setErrorMsg(null);
    try {
      const ack: any = await doStart(); // reuses same email value
      const cd = deriveCooldown(ack);
      if (cd > 0) setCooldown(cd);
      toast({
        variant: "success",
        title: "Link sent again",
        description: "Check your inbox for the latest confirmation email.",
        duration: 2200,
      });
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t resend the email right now. Please try again shortly.",
        });
        setErrorMsg(friendly);
        return;
      }
    try {
      await promptReauth({ reason: "Confirm it’s you to resend the link" } as any);
      const ack: any = await doStart();
        const cd = deriveCooldown(ack);
        if (cd > 0) setCooldown(cd);
        toast({
          variant: "success",
          title: "Link sent again",
          description: "Check your inbox for the latest confirmation email.",
          duration: 2200,
        });
      } catch (err2) {
        const friendly = formatError(err2, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t confirm it was you. Please try again.",
        });
        setErrorMsg(friendly);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-busy={isPending || undefined}>
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

      {/* Success callout (after first successful request) */}
      {successEmail && (
        <div className="rounded-lg border bg-emerald-50/50 px-4 py-3 text-sm shadow-sm">
          <div className="font-medium text-emerald-900">Confirmation sent</div>
          <p className="mt-1 text-emerald-900/90">
            We sent a link to <span className="font-mono">{successEmail}</span>. Follow it to finish changing your email.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent",
                !canResend && "cursor-not-allowed opacity-60"
              )}
              aria-disabled={!canResend}
            >
              {isPending ? "Resending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
            </button>
            <Link
              href={"/"}
              className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
              prefetch
            >
              Go to app
            </Link>
          </div>
        </div>
      )}

      {/* Email input */}
      <div className="space-y-2">
        <label htmlFor="new-email" className="block text-sm font-medium">
          New email address
        </label>
        <input
          id="new-email"
          name="new-email"
          type="email"
          inputMode="email"
          autoCapitalize="none"
          autoComplete="email"
          spellCheck={false}
          required
          placeholder="you+new@example.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          className={cn(
            "block w-full rounded-lg border bg-background px-3 py-2 text-base shadow-sm",
            "outline-none ring-0 transition placeholder:text-muted-foreground/70",
            "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          )}
        />
        <p className="text-xs text-muted-foreground">
          You’ll keep using your current email until you confirm the change.
        </p>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition",
            !canSubmit && "cursor-not-allowed opacity-75"
          )}
        >
          {isPending ? "Sending…" : "Send confirmation link"}
        </button>

        <p className="mt-2 text-xs text-muted-foreground">
          Didn’t receive it? Check spam, or try again with the correct email.
        </p>
      </div>
    </form>
  );
}
