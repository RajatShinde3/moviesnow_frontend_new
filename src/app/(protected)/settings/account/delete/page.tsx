"use client";

/**
 * =============================================================================
 * Page · Settings · Account · Delete (Best-of-best)
 * =============================================================================
 * Permanently delete an account with strong safeguards:
 *   1) User acknowledges impact (typed confirm + checkbox) → request OTP
 *   2) User enters 6-digit OTP → finalize deletion
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Hooks:
 *     - `useRequestDeletionOtp()` → sends a one-time code to the account email
 *     - `useDeleteUser()`         → deletes the account (requires OTP)
 * • Step-up aware: on reauth demand, opens <ReauthDialog/> and retries with
 *   `xReauth`, preserving UI state.
 * • Neutral error copy via formatError(); subtle request-id surfacing.
 * • Client no-store hints (server should also send no-store).
 *
 * UX & ACCESSIBILITY
 * ------------------
 * • Guarded destructive pattern: typed confirm ("DELETE") + consent checkbox + OTP.
 * • Assertive inline error region, focus handoff for SR users.
 * • Keyboard-first; buttons disabled while pending; resend cooldown (if provided).
 *
 * POST-DELETE BEHAVIOR
 * --------------------
 * • Most servers revoke tokens immediately; AuthGate will redirect.
 * • As a fallback, we `window.location.replace(PATHS.afterDeletion || "/login")`.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";            // ✅ keep this path consistent with your file
import { useReauthDialog } from "@/components/ReauthDialog";
import { OtpInput } from "@/components/OtpInput";

import { useRequestDeletionOtp } from "@/features/auth/useRequestDeletionOtp";
import { useDeleteUser } from "@/features/auth/useDeleteUser";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
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

type Phase = "intro" | "otp" | "done";

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function DeleteAccountPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Delete account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is permanent and cannot be undone. We’ll ask you to confirm it’s you.
        </p>
      </header>
      <DeletePanel />
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
function DeletePanel() {
  const router = useRouter();
  const toast = useToast();
  const { open: openReauth } = useReauthDialog();

  const [phase, setPhase] = React.useState<Phase>("intro");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  // Step 1 (acknowledgement)
  const [confirmText, setConfirmText] = React.useState("");
  const [agree, setAgree] = React.useState(false);

  // Step 2 (OTP)
  const [otp, setOtp] = React.useState("");

  // Resend cooldown (seconds)
  const [cooldown, setCooldown] = React.useState<number>(0);

  // Hooks
  const { mutateAsync: requestOtp, isPending: isRequesting } = useRequestDeletionOtp();
  const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser();

  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // Cooldown ticker
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const canSendOtp = !isRequesting && agree && confirmText.trim().toUpperCase() === "DELETE";
  const isOtpValid = otp.replace(/\D/g, "").length === 6;
  const canResend = !isRequesting && cooldown <= 0;

  // -- Step 1: Send OTP (with step-up if required)
  async function sendOtp(nextToken?: string) {
    const payload: any = nextToken ? { xReauth: nextToken } : {};
    return await requestOtp(payload); // may return ACK with hint timings
  }

  async function onSendOtp() {
    setErrorMsg(null);
    try {
      const ack: any = await sendOtp();
      setPhase("otp");
      const cd = deriveCooldown(ack);
      if (cd > 0) setCooldown(cd);

      toast({
        variant: "success",
        title: "Check your email",
        description: "We sent a one-time code to confirm deletion.",
        duration: 2400,
      });
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t send a confirmation code right now. Please try again.",
        });
        setErrorMsg(friendly);
        return;
      }
      try {
        const token = await openReauth({ reason: "Confirm it’s you to request account deletion" } as any);
        if (!token) return;
        const ack: any = await sendOtp(token);
        setPhase("otp");
        const cd = deriveCooldown(ack);
        if (cd > 0) setCooldown(cd);

        toast({
          variant: "success",
          title: "Check your email",
          description: "We sent a one-time code to confirm deletion.",
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

  // -- Step 2: Finalize deletion (with step-up if required)
  async function finalizeDeletion(code: string, nextToken?: string) {
    const payload: any = { code };
    if (nextToken) payload.xReauth = nextToken;
    await deleteUser(payload);
  }

  async function onSubmitOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const code = otp.replace(/\D/g, "");
    if (code.length !== 6) {
      setErrorMsg("Enter the 6-digit code from your email.");
      return;
    }

    try {
      await finalizeDeletion(code);
      afterSuccess();
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "That code didn’t work. Request a new one and try again.",
        });
        setErrorMsg(friendly);
        setOtp("");
        return;
      }
      try {
        const token = await openReauth({ reason: "Confirm it’s you to permanently delete your account" } as any);
        if (!token) return;
        await finalizeDeletion(code, token);
        afterSuccess();
      } catch (err2) {
        const friendly = formatError(err2, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t confirm it was you just now. Please try again.",
        });
        setErrorMsg(friendly);
        setOtp("");
      }
    }
  }

  function afterSuccess() {
    setPhase("done");
    toast({
      variant: "success",
      title: "Account deleted",
      description: "We’re signing you out now.",
      duration: 2200,
    });

    // If tokens invalidate immediately, AuthGate will redirect on its own.
    // Best-effort fallback: navigate to a public route.
    const exitPath = (PATHS as any).afterDeletion || "/login";
    try {
      setTimeout(() => {
        window?.location?.replace(exitPath);
      }, 600); // give the toast a moment to render
    } catch {
      /* noop; AuthGate will handle logout redirection */
    }
  }

  const busy = isRequesting || isDeleting;

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

      {/* Phase: Intro / Acknowledgement */}
      {phase === "intro" && (
        <div className="rounded-xl border bg-destructive/5 p-5 shadow-sm">
          <div className="text-sm font-medium text-destructive">Before you delete</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li>Your account and associated data will be deleted permanently.</li>
            <li>Active sessions will be revoked. You’ll be signed out everywhere.</li>
            <li>This action cannot be undone.</li>
          </ul>

          {/* Confirm phrase + checkbox */}
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium" htmlFor="confirm-text">
              Type <span className="font-mono">DELETE</span> to confirm
            </label>
            <input
              id="confirm-text"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              value={confirmText}
              onChange={(e) => setConfirmText(e.currentTarget.value)}
              className={cn(
                "block w-full rounded-lg border bg-background px-3 py-2 text-base shadow-sm",
                "outline-none ring-0 transition placeholder:text-muted-foreground/70",
                "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
              )}
              placeholder="DELETE"
            />

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border"
                checked={agree}
                onChange={(e) => setAgree(e.currentTarget.checked)}
              />
              <span>I understand that deleting my account is permanent and cannot be undone.</span>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={onSendOtp}
              disabled={!canSendOtp}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:bg-destructive/90",
                !canSendOtp && "cursor-not-allowed opacity-75"
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
      {phase === "otp" && (
        <form onSubmit={onSubmitOtp} noValidate className="rounded-xl border p-5 shadow-sm">
          <div className="mb-3">
            <div className="text-sm font-medium">Enter the 6-digit code</div>
            <p className="text-xs text-muted-foreground">
              We sent it to your account email. Codes expire quickly.
            </p>
          </div>

          <div className="space-y-2">
            <OtpInput
              id="delete-otp"
              value={otp}
              onChange={setOtp}
              numInputs={6}
              inputMode="numeric"
              aria-describedby="delete-otp-help"
              autoFocus
            />
            <p id="delete-otp-help" className="text-xs text-muted-foreground">
              If it fails, wait for a new code and try again.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={isDeleting || !isOtpValid}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:bg-destructive/90",
                (isDeleting || !isOtpValid) && "cursor-not-allowed opacity-75"
              )}
            >
              {isDeleting ? "Deleting…" : "Permanently delete my account"}
            </button>
            <button
              type="button"
              onClick={onSendOtp}
              disabled={!canResend}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent",
                !canResend && "cursor-not-allowed opacity-60"
              )}
              aria-disabled={!canResend}
            >
              {isRequesting ? "Resending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
            <Link
              href={PATHS.settingsSecurity || "/settings/security"}
              className="ml-auto inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
              prefetch
            >
              Cancel
            </Link>
          </div>
        </form>
      )}

      {/* Phase: Done (brief fallback if AuthGate hasn't redirected yet) */}
      {phase === "done" && (
        <div className="rounded-xl border bg-card/50 p-5 text-sm shadow-sm">
          <div className="font-medium">Your account has been deleted.</div>
          <p className="mt-1 text-muted-foreground">
            We’re signing you out. If this page doesn’t change, you can continue below.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={(PATHS as any).afterDeletion || "/login"}
              className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
              prefetch
            >
              Go to sign in
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
              prefetch
            >
              Home
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
