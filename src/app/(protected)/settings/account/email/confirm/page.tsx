"use client";

/**
 * =============================================================================
 * Page · Settings · Account · Confirm Email Change (Best-of-best)
 * =============================================================================
 * Confirms an email change using a one-time token from the user's inbox.
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Reads ?token= (or ?t= fallback) from the URL — trimmed and minimally validated.
 * • Calls your `useEmailChangeConfirm()` to finalize the change.
 * • Step-up aware: if the server demands reauth, opens <ReauthDialog/> and retries
 *   with `xReauth` transparently.
 * • Neutral errors via `formatError()`; request-id surfaced for support.
 * • Client "no-store" hints; backend should also send Cache-Control: no-store.
 *
 * UX & A11y
 * ---------
 * • Inline assertive error region with focus handoff.
 * • Keyboard-first, no surprises; shows success card with next steps.
 * • Dev-safe: guard against React strict/dev double-effect invocation.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/Toasts";
import { useReauthDialog } from "@/components/ReauthDialog";

import { useEmailChangeConfirm } from "@/features/auth/useEmailChangeConfirm";

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
    (e &&
      e.headers &&
      (e.headers["x-reauth"] === "required" || e.headers["X-Reauth"] === "required"))
  );
}

/** tiny heuristic: clearly broken tokens (empty/too short) show a friendlier message */
function isTokenObviouslyBad(t: string) {
  return !t || t.trim().length < 8;
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function EmailChangeConfirmPage() {
  const params = useSearchParams();
  // Accept ?token= or ?t=; searchParams are already decoded by Next
  const token = (params?.get("token") || params?.get("t") || "").trim();

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Confirm email change</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We’re updating your account email. This keeps your sign-ins and alerts up to date.
        </p>
      </header>

      <ConfirmPanel token={token} />

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <Link
          href={PATHS.afterLogin || "/"}
          className="font-medium underline underline-offset-4 hover:text-foreground"
          prefetch
        >
          Go to app
        </Link>
      </footer>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Panel · calls hook → handles step-up → success/failure views
// -----------------------------------------------------------------------------
function ConfirmPanel({ token }: { token: string }) {
  const router = useRouter();
  const toast = useToast();
  const { open: openReauth } = useReauthDialog();

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const { mutateAsync: confirm, isPending } = useEmailChangeConfirm();

  // Focus live-region when an error appears
  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // Guard against double-run in dev strict mode
  const hasRunRef = React.useRef(false);

  // Main effect: confirm on mount with the token
  React.useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    let cancelled = false;

    const run = async () => {
      setErrorMsg(null);

      if (isTokenObviouslyBad(token)) {
        setErrorMsg(
          "This link is missing a valid token. Please open the latest email and try again."
        );
        return;
      }

      try {
        await confirm({ token } as any);
        if (cancelled) return;
        setDone(true);

        toast({
          variant: "success",
          title: "Email updated",
          description: "Your account email has been changed successfully.",
          duration: 2400,
        });

        // Refresh any cached user/profile state that includes the email
        router.refresh();
      } catch (err) {
        if (!isStepUpRequired(err)) {
          const friendly = formatError(err, {
            includeRequestId: true,
            maskServerErrors: true,
            fallback:
              "We couldn’t confirm this link. It may have expired or was already used.",
          });
          setErrorMsg(friendly);
          return;
        }

        // Step-up path (rare for confirm endpoints, but supported)
        try {
          const tokenReauth = await openReauth({
            reason: "Confirm it’s you to finish changing your email",
          } as any);
          if (!tokenReauth) return;
          await confirm({ token, xReauth: tokenReauth } as any);
          if (cancelled) return;

          setDone(true);
          toast({
            variant: "success",
            title: "Email updated",
            description: "Your account email has been changed successfully.",
            duration: 2400,
          });
          router.refresh();
        } catch (err2) {
          const friendly = formatError(err2, {
            includeRequestId: true,
            maskServerErrors: true,
            fallback:
              "We couldn’t confirm it was you just now. Please retry from the latest email.",
          });
          setErrorMsg(friendly);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // UI
  return (
    <section className="space-y-6" aria-busy={isPending || undefined}>
      {/* Inline error (assertive live region; focuses on update) */}
      <div
        ref={errorRef}
        tabIndex={errorMsg ? -1 : undefined}
        aria-live="assertive"
        className={cn(
          "rounded-lg border px-4 py-3 text-sm shadow-sm",
          errorMsg
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "hidden"
        )}
      >
        {errorMsg}
      </div>

      {/* Status / Result */}
      {!done ? (
        <div className="rounded-xl border bg-card/50 p-5 text-sm shadow-sm">
          <div className="font-medium">Confirming your change…</div>
          <p className="mt-1 text-muted-foreground">
            This usually takes a moment. If nothing happens, you can safely close
            this tab and try again later.
          </p>

          {/* Optional: quick actions if token is clearly missing/bad */}
          {isTokenObviouslyBad(token) && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={PATHS.settingsAccount || "/settings/account"}
                className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
                prefetch
              >
                Back to Account settings
              </Link>
              <Link
                href={PATHS.afterLogin || "/"}
                className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
                prefetch
              >
                Go to app
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-emerald-50/50 p-5 text-sm shadow-sm">
          <div className="font-medium text-emerald-900">
            All set — your email was updated.
          </div>
          <p className="mt-1 text-emerald-900/90">
            You’ll use your new email the next time you sign in. If you didn’t
            request this, update your password and review your sessions.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={PATHS.settingsSecurity || "/settings/security"}
              className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
              prefetch
            >
              Review security settings
            </Link>
            <Link
              href={PATHS.settingsSessions || "/settings/sessions"}
              className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
              prefetch
            >
              View active sessions
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
