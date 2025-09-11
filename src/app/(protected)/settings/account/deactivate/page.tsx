"use client";

/**
 * =============================================================================
 * Page · Settings · Account · Deactivate (Best-of-best)
 * =============================================================================
 * Safely deactivate a user account with OTP confirmation and step-up (reauth).
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Step 1 → request OTP:   `useRequestDeactivationOtp()`
 * • Step 2 → confirm OTP:   `useDeactivateUser()`
 * • Step-up aware: if server signals reauth, opens <ReauthDialog/> and retries
 *   with `xReauth`, preserving UI state.
 * • Neutral, support-friendly errors via `formatError()` (request-id surfaced).
 * • Client no-store hints (server should also send no-store).
 *
 * UX & A11y
 * ---------
 * • Clear impact explanation, guarded destructive actions.
 * • Assertive error live-region with focus handoff (SR-friendly).
 * • Smart OTP input; optional resend cooldown when backend provides it.
 * • Keyboard-first: Enter submits, buttons disabled while pending.
 *
 * INTEGRATION NOTES
 * -----------------
 * • If `useRequestDeactivationOtp()` returns an ack like
 *     { retry_after?: number; next_allowed_at?: string }
 *   we use it to drive the UI cooldown. If not present, no cooldown is shown.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts"; // adjust import if your path differs
import { useReauthPrompt } from "@/components/ReauthDialog";
import OtpInput from "@/components/forms/OtpInput";

// Hooks
import { useRequestDeactivationOtp } from "@/features/auth/useRequestDeactivationOtp";
import { useDeactivateUser } from "@/features/auth/useDeactivateUser";

// -----------------------------------------------------------------------------
// Page-level cache hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function isStepUpRequired(err: unknown): boolean {
  const e = err as any;
  return (
    (e && e.code === "need_step_up") ||
    (e && e.headers && (e.headers["x-reauth"] === "required" || e.headers["X-Reauth"] === "required"))
  );
}

/** derive a cooldown (in seconds) from backend hints */
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

type Phase = "intro" | "code" | "done";

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function DeactivateAccountPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Deactivate account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Deactivating disables sign-ins and most notifications. You can reactivate later from your email.
        </p>
      </header>
      <DeactivatePanel />
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
// Panel · Acknowledgement → OTP → Finalize (reauth-aware, cooldown support)
// -----------------------------------------------------------------------------
function DeactivatePanel() {
  const router = useRouter();
  const toast = useToast();
  const promptReauth = useReauthPrompt();

  const [phase, setPhase] = React.useState<Phase>("intro");

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const [otpCode, setOtpCode] = React.useState("");
  const [cooldown, setCooldown] = React.useState<number>(0); // seconds remaining for resend

  const { mutateAsync: requestOtp, isPending: isRequesting } = useRequestDeactivationOtp();
  const { mutateAsync: deactivate, isPending: isDeactivating } = useDeactivateUser();

  // A11y: focus error region on change
  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // Cooldown ticker
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  // --- Step 1: request OTP (with optional step-up)
  async function sendOtp(nextToken?: string) {
    const payload: any = nextToken ? { xReauth: nextToken } : {};
    // Return whatever the hook returns (may be undefined)
    return await requestOtp(payload);
  }

  async function handleSendCode() {
    setErrorMsg(null);
    try {
      const ack: any = await sendOtp();
      setPhase("code");

      // Optional cooldown support when backend provides hints
      const cd = deriveCooldown(ack);
      if (cd > 0) setCooldown(cd);

      toast({
        variant: "success",
        title: "Check your email",
        description: "We sent a one-time code to confirm deactivation.",
        duration: 2400,
      });
    } catch (err) {
      // If not a step-up case, surface neutral error
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t start deactivation right now. Please try again.",
        });
        setErrorMsg(friendly);
        return;
      }
      // Step-up required → prompt and retry
      try {
        await promptReauth({ reason: "Confirm it’s you to deactivate your account" } as any);
        const ack: any = await sendOtp();
        setPhase("code");
        const cd = deriveCooldown(ack);
        if (cd > 0) setCooldown(cd);
        toast({
          variant: "success",
          title: "Check your email",
          description: "We sent a one-time code to confirm deactivation.",
          duration: 2400,
        });
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

  // --- Step 2: finalize deactivation
  async function finalize(code: string) {
    const payload: any = { code };
    return await deactivate(payload);
  }

  async function handleDeactivate(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const code = otpCode.replace(/\D/g, "");
    if (code.length !== 6) {
      setErrorMsg("Enter the 6-digit code from your email.");
      return;
    }

    try {
      await finalize(code);
      afterSuccess();
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t deactivate your account with that code. Try again.",
        });
        setErrorMsg(friendly);
        setOtpCode("");
        return;
      }
      // Step-up path
      try {
        await promptReauth({ reason: "Confirm it’s you to finish deactivation" } as any);
        await finalize(code);
        afterSuccess();
      } catch (err2) {
        const friendly = formatError(err2, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t confirm it was you just now. Please try again.",
        });
        setErrorMsg(friendly);
        setOtpCode("");
      }
    }
  }

  function afterSuccess() {
    setPhase("done");
    // Clear sensitive input
    setOtpCode("");
    toast({
      variant: "success",
      title: "Account deactivated",
      description: "You can reactivate later from your email.",
      duration: 2600,
    });
    // Most servers revoke sessions; refresh keeps shell/UI consistent either way.
    router.refresh();
  }

  const busy = isRequesting || isDeactivating;
  const canResend = !isRequesting && cooldown <= 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <section className="space-y-6" aria-busy={busy || undefined}>
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

      {/* Phase: Intro / explanation */}
      {phase === "intro" && (
        <div className="rounded-xl border bg-destructive/5 p-5 shadow-sm">
          <div className="text-sm font-medium text-destructive">Before you deactivate</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li>Sign-ins will be disabled until you reactivate.</li>
            <li>You may still receive critical security emails where required.</li>
            <li>You can reactivate later from the email on this account.</li>
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleSendCode}
              disabled={isRequesting}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:bg-destructive/90",
                isRequesting && "cursor-not-allowed opacity-75"
              )}
            >
              {isRequesting ? "Sending code…" : "Send confirmation code"}
            </button>
            <Link
              href={PATHS.settingsSecurity || "/settings/security"}
              className="inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
              prefetch
            >
              Cancel
            </Link>
          </div>
        </div>
      )}

      {/* Phase: OTP entry */}
      {phase === "code" && (
        <form onSubmit={handleDeactivate} noValidate className="rounded-xl border p-5 shadow-sm">
          <div className="mb-3">
            <div className="text-sm font-medium">Enter the 6-digit code</div>
            <p className="text-xs text-muted-foreground">We sent it to your account email.</p>
          </div>

          <div className="space-y-2">
            <OtpInput
              value={otpCode}
              onChange={setOtpCode}
              length={6}
              numericOnly
              ariaLabel="One-time code"
              autoFocus
            />
            <p id="deactivate-otp-help" className="text-xs text-muted-foreground">
              Codes expire quickly. If it fails, request a new one and try again.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={isDeactivating || otpCode.replace(/\D/g, "").length !== 6}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:bg-destructive/90",
                (isDeactivating || otpCode.replace(/\D/g, "").length !== 6) && "cursor-not-allowed opacity-75"
              )}
            >
              {isDeactivating ? "Deactivating…" : "Deactivate account"}
            </button>

            <button
              type="button"
              onClick={handleSendCode}
              disabled={!canResend}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent",
                !canResend && "cursor-not-allowed opacity-60"
              )}
              aria-disabled={!canResend}
            >
              {isRequesting
                ? "Resending…"
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend code"}
            </button>
          </div>
        </form>
      )}

      {/* Phase: Done */}
      {phase === "done" && (
        <div className="rounded-xl border bg-card/50 p-5 text-sm shadow-sm">
          <div className="font-medium">Your account has been deactivated.</div>
          <p className="mt-1 text-muted-foreground">
            You won’t be able to sign in until you reactivate. When you’re ready, start reactivation below.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/reactivation"
              className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
              prefetch
            >
              Start reactivation
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
              prefetch
            >
              Go to sign in
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
