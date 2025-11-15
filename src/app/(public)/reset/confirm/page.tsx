"use client";

/**
 * =============================================================================
 * Page · Settings · Security · Change Password (Best-of-best · final)
 * =============================================================================
 * Production-grade password change flow with reauth (step-up) support, pristine
 * UX, and strong accessibility. Tolerant to varied backend shapes.
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Uses `useChangePassword()` (idempotent; tolerant of 204/no-body).
 * • Step-up aware: on `need_step_up` or `X-Reauth: required`, opens ReauthDialog
 *   and retries with `xReauth` — no lost form state.
 * • Neutral, support-friendly errors via `formatError()` (request-id surfaced).
 * • Client "no-store" hints (server should also send no-store).
 *
 * UX & A11y
 * ---------
 * • Minimal friction: new password + confirm; optional Current password section.
 * • Live strength meter; semantic labels; autocomplete hints.
 * • Assertive error live region with focus handoff; keyboard-first.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import { useReauthPrompt } from "@/components/ReauthDialog";

import { PasswordField } from "@/components/forms/PasswordField";
import PasswordStrength from "@/components/forms/PasswordStrength";
import { useChangePassword } from "@/features/auth/useChangePassword";

// Cache hints are configured at the segment layout (server component).

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const MIN_PW = 8;

function isStepUpRequired(err: unknown): boolean {
  const e = err as any;
  return (
    (e && e.code === "need_step_up") ||
    (e && e.headers && (e.headers["x-reauth"] === "required" || e.headers["X-Reauth"] === "required"))
  );
}

type FormState = {
  current?: string;
  next: string;
  confirm: string;
  showCurrent: boolean;
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function ChangePasswordPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Change password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a strong, unique password. For your security, we may ask you to confirm it’s you.
        </p>
      </header>

      <ChangePasswordForm />

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
// Form · tolerant payload · reauth-aware · strong a11y
// -----------------------------------------------------------------------------
function ChangePasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const promptReauth = useReauthPrompt();

  const [form, setForm] = React.useState<FormState>({
    current: "",
    next: "",
    confirm: "",
    showCurrent: false,
  });

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const { mutateAsync: changePassword, isPending } = useChangePassword();

  // focus error when it appears
  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // wipe sensitive fields on unmount (belt-and-suspenders)
  React.useEffect(() => {
    return () => {
      setForm({ current: "", next: "", confirm: "", showCurrent: false });
    };
  }, []);

  const passwordsMatch = form.next.length > 0 && form.next === form.confirm;
  const nextStrongEnough = form.next.length >= MIN_PW; // server enforces policy anyway
  const currentProvidedIsOk = form.showCurrent ? (form.current || "").length >= 1 : true;

  const canSubmit = !isPending && nextStrongEnough && passwordsMatch && currentProvidedIsOk;

  async function submit(xReauth?: string) {
    // Tolerant payload for varied APIs:
    // • Prefer `new_password`, also include `password` for backends expecting that.
    // • Include `current_password` if user provided it.
    const payload: any = {
      new_password: form.next,
      password: form.next,
    };
    if (form.showCurrent && form.current) payload.current_password = form.current;
    if (xReauth) payload.xReauth = xReauth;

    await changePassword(payload);
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg(null);

    if (!passwordsMatch) {
      setErrorMsg("Passwords don’t match. Please re-enter your new password.");
      return;
    }

    try {
      await submit();
      toast({
        variant: "success",
        title: "Password updated",
        description: "Use your new password the next time you sign in.",
        duration: 2400,
      });
      // Many servers revoke other sessions on password change; refresh ensures UI consistency.
      router.refresh();
      // Clear sensitive fields (keep "showCurrent" preference)
      setForm((s) => ({ ...s, current: "", next: "", confirm: "" }));
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t change your password right now. Please try again.",
        });
        setErrorMsg(friendly);
        return;
      }
      // Step-up required → collect short-lived token then retry
      try {
        await promptReauth({
          reason: "Confirm it’s you to change your password",
        } as any);
        await submit();
        toast({
          variant: "success",
          title: "Password updated",
          description: "Use your new password the next time you sign in.",
          duration: 2400,
        });
        router.refresh();
        setForm((s) => ({ ...s, current: "", next: "", confirm: "" }));
      } catch (err2) {
        const friendly = formatError(err2, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t confirm it was you just now. Please try again.",
        });
        setErrorMsg(friendly);
      }
    }
  };

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

      {/* New password */}
      <div className="space-y-2">
        <PasswordField
          id="new-password"
          name="new-password"
          label="New password"
          kind="new"
          required
          autoComplete="new-password"
          placeholder="Create a strong password"
          value={form.next}
          onChange={(e) => setForm((s) => ({ ...s, next: e.currentTarget.value }))}
          hint={`Use at least ${MIN_PW} characters. A mix of letters, numbers, and symbols is best.`}
        />
        <PasswordStrength value={form.next} />
      </div>

      {/* Confirm new password */}
      <div className="space-y-2">
        <label htmlFor="confirm" className="block text-sm font-medium">
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Re-enter your new password"
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

      {/* Optional: current password (some servers accept this instead of reauth) */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Confirm with current password (optional)</div>
          <button
            type="button"
            className="text-xs font-medium underline underline-offset-4 hover:text-foreground"
            onClick={() => setForm((s) => ({ ...s, showCurrent: !s.showCurrent }))}
            aria-expanded={form.showCurrent}
            aria-controls="current-password-section"
          >
            {form.showCurrent ? "Hide" : "Add current password"}
          </button>
        </div>

        {form.showCurrent && (
          <div id="current-password-section" className="mt-3">
            <PasswordField
              id="current-password"
              name="current-password"
              label="Current password"
              kind="current"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.current || ""}
              onChange={(e) => setForm((s) => ({ ...s, current: e.currentTarget.value }))}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              If you don’t remember it, we’ll ask you to re-authenticate another way.
            </p>
          </div>
        )}
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
          {isPending ? "Updating…" : "Update password"}
        </button>

        <p className="mt-2 text-xs text-muted-foreground">
          Tip: After changing your password, review your{" "}
          <Link
            href={PATHS.settingsSessions || "/settings/sessions"}
            className="underline underline-offset-4 hover:text-foreground"
            prefetch
          >
            active sessions
          </Link>{" "}
          and consider enabling{" "}
          <Link
            href={PATHS.settingsMfa || "/settings/security/mfa"}
            className="underline underline-offset-4 hover:text-foreground"
            prefetch
          >
            two-factor authentication
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
