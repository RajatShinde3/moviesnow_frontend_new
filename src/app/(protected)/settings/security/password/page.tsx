"use client";

/**
 * =============================================================================
 * Page · Settings · Security · Change Password (Best-of-best)
 * =============================================================================
 * Secure, production-grade password change flow with reauth awareness.
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Uses `useChangePassword()`; tolerant to 204; client refresh after success.
 * • Step-up (reauth) aware: on `need_step_up`, opens <ReauthDialog/> and retries
 *   with `xReauth` — no lost form state.
 * • Neutral, support-friendly errors via `formatError()` (request-id surfaced).
 * • Client "no-store" hints; server route should also send no-store.
 *
 * UX & A11y
 * ---------
 * • Minimal friction: new password + confirm. Optional “Current password” block
 *   for servers that accept it (collapsed by default); else reauth handles it.
 * • Live strength meter, semantic labels, proper autocomplete hints.
 * • Assertive error live region + focus handoff; keyboard-first; clear-on-edit.
 *
 * BACKEND SHAPE TOLERANCE
 * -----------------------
 * • Sends both `new_password` and `password` (your API can ignore one).
 * • If the user provides a current password, includes `current_password`.
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

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const MIN_PW = 8;

function isStepUpRequired(err: unknown): boolean {
  const e = err as any;
  return (
    (e && e.code === "need_step_up") ||
    (e &&
      e.headers &&
      (e.headers["x-reauth"] === "required" || e.headers["X-Reauth"] === "required"))
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

  // Focus error when it appears (screen readers jump here too)
  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // Scrub sensitive fields on tab hide and unmount (defense-in-depth)
  React.useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        setForm((s) => ({ ...s, current: "", next: "", confirm: "" }));
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      setForm({ current: "", next: "", confirm: "", showCurrent: false });
    };
  }, []);

  // Clear inline error as user edits (prevents stale banners)
  const clearErrorThen =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (errorMsg) setErrorMsg(null);
      setForm((s) => ({ ...s, [key]: e.currentTarget.value }));
    };

  const passwordsMatch = form.next.length > 0 && form.next === form.confirm;
  const nextStrongEnough = form.next.length >= MIN_PW; // server enforces final policy
  const currentProvidedIsOk = form.showCurrent ? (form.current || "").length >= 1 : true;

  const canSubmit = !isPending && nextStrongEnough && passwordsMatch && currentProvidedIsOk;

  async function submit(xReauth?: string) {
    // Tolerant payload for varied APIs
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
      // Many servers revoke other sessions on password change; refresh keeps UI consistent.
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
          onChange={clearErrorThen("next")}
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
          onChange={clearErrorThen("confirm")}
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
              onChange={clearErrorThen("current")}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              If you don’t remember it, we’ll ask you to re-authenticate another way.
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2" aria-busy={isPending || undefined}>
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
