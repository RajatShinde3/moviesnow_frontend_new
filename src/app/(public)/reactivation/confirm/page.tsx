// app/(public)/reactivate/confirm/page.tsx
"use client";

/**
 * =============================================================================
 * Page · Reactivation · Confirm (Best-of-best)
 * =============================================================================
 * Complete the reactivation using a token link or a 6-digit code.
 *
 * Behavior
 * --------
 * • If `?token=` (or `?t=`) is present → auto-attempt confirmation on mount.
 * • Otherwise (or if token fails), show a code-entry form using <OtpInput/>.
 * • On success → toast + safe redirect (sanitized site-absolute path).
 *
 * Security & UX
 * -------------
 * • Neutral, support-friendly errors via `formatError()` (with subtle Ref).
 * • A11y-first: assertive error region w/ focus handoff; keyboard-first flow.
 * • Never logs sensitive values; they live only in local state.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import { OtpInput } from "@/components/OtpInput";

import { useReactivateAccount } from "@/features/auth/useReactivateAccount";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
type Mode = "token" | "code";

function sanitizeRedirect(input: string | null | undefined, fallback = "/login") {
  if (!input) return fallback;
  if (input.startsWith("//")) return fallback;
  if (!input.startsWith("/")) return fallback;
  return input;
}

function normalizeCode(s: string) {
  return s.replace(/\D+/g, "").slice(0, 6);
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function ReactivationConfirmPage() {
  const params = useSearchParams();
  const token = params?.get("token") || params?.get("t") || "";
  const codeParam = params?.get("code") || "";
  const redirect = sanitizeRedirect(params?.get("redirect"), PATHS.login || "/login");

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Confirm reactivation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We’re verifying it’s you so you can access your account again.
        </p>
      </header>

      <ConfirmPanel initialToken={token} initialCode={codeParam} redirect={redirect} />

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <Link
          href={PATHS.login || "/login"}
          className="font-medium underline underline-offset-4 hover:text-foreground"
          prefetch
        >
          Back to sign in
        </Link>
      </footer>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Panel
// -----------------------------------------------------------------------------
function ConfirmPanel({
  initialToken,
  initialCode,
  redirect,
}: {
  initialToken: string;
  initialCode: string;
  redirect: string;
}) {
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = React.useState<Mode>(initialToken ? "token" : "code");
  const [code, setCode] = React.useState(() => normalizeCode(initialCode || ""));
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);
  const [done, setDone] = React.useState(false);

  const { mutateAsync: reactivate, isPending } = useReactivateAccount();

  // Focus the error banner when it appears
  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // Auto-confirm with token if present
  React.useEffect(() => {
    if (mode !== "token" || !initialToken) return;

    let cancelled = false;
    (async () => {
      setErrorMsg(null);
      try {
        await reactivate({ token: initialToken } as any);
        if (!cancelled) finalizeSuccess();
      } catch (err) {
        if (cancelled) return;
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback:
            "We couldn’t confirm this link. It may have expired or was already used. You can try entering a code instead.",
        });
        setErrorMsg(friendly);
        setMode("code");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialToken]);

  // (Nice touch) If a valid code was provided via query (?code=) and there is no token,
  // try confirming automatically once.
  const triedAutoCodeRef = React.useRef(false);
  React.useEffect(() => {
    if (mode !== "code" || triedAutoCodeRef.current) return;
    const c = normalizeCode(code);
    if (c.length === 6) {
      triedAutoCodeRef.current = true;
      void onSubmitCode(c, { silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const isCodeValid = normalizeCode(code).length === 6;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmitCode(normalizeCode(code));
  }

  async function onSubmitCode(clean: string, opts?: { silent?: boolean }) {
    setErrorMsg(null);
    try {
      // Tolerant payload for varied APIs (send both `code` and `otp`)
      await reactivate({ code: clean, otp: clean } as any);
      finalizeSuccess();
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "That code didn’t work. Check the latest email and try again.",
      });
      if (!opts?.silent) {
        setErrorMsg(friendly);
        setCode("");
      }
    }
  }

  function finalizeSuccess() {
    setDone(true);
    toast({
      variant: "success",
      title: "Account reactivated",
      description: "Welcome back! You can sign in again.",
      duration: 2400,
    });

    // Gentle redirect to sign-in (or a sanitized destination)
    const t = setTimeout(() => {
      router.replace(redirect);
    }, 1200);
    // optional refresh to re-sync any client state
    router.refresh?.();
    return () => clearTimeout(t);
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-emerald-50/60 p-5 text-sm shadow-sm" role="status" aria-live="polite">
        <div className="font-medium text-emerald-900">All set — your account is active again.</div>
        <p className="mt-1 text-emerald-900/90">
          For best security, consider enabling two-factor authentication before your next sign-in.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Link
            href={PATHS.settingsSecurity || "/settings/security"}
            className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
            prefetch
          >
            Security settings
          </Link>
          <Link
            href={redirect}
            className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent"
            prefetch
          >
            Continue now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-busy={isPending || undefined}>
      {/* Inline error banner (assertive live region) */}
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

      {/* Code entry (primary UI if no token / token failed) */}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="otp" className="block text-sm font-medium">
            Enter the 6-digit code
          </label>
          <OtpInput
            id="otp"
            value={code}
            onChange={(v) => setCode(normalizeCode(v))}
            numInputs={6}
            inputMode="numeric"
            aria-describedby="otp-help"
            autoFocus={mode === "code"}
          />
          <p id="otp-help" className="text-xs text-muted-foreground">
            You’ll find this code in the latest email we sent for reactivation.
          </p>
        </div>

        <button
          type="submit"
          disabled={!isCodeValid || isPending}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-lg border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition",
            (!isCodeValid || isPending) && "cursor-not-allowed opacity-75"
          )}
        >
          {isPending ? "Confirming…" : "Confirm reactivation"}
        </button>

        <div className="text-center text-xs text-muted-foreground">
          Didn’t get a code? Check spam, or{" "}
          <Link
            href={PATHS.reactivate || "/reactivate"}
            className="underline underline-offset-4 hover:text-foreground"
            prefetch
          >
            request a new email
          </Link>
          .
        </div>
      </form>
    </section>
  );
}
