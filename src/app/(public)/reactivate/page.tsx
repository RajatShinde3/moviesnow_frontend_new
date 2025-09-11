// app/(public)/reactivate/page.tsx
"use client";

/**
 * =============================================================================
 * Page · Reactivate Account (Request + Verify · Best-of-best)
 * =============================================================================
 * Flow
 * ----
 * 1) Request a reactivation code (email optional) via `useRequestReactivationOtp`.
 * 2) Verify the 6-digit code via `useReactivateAccount`.
 * 3) On success: toast + success banner + redirect to a sanitized target (default /login).
 *
 * Security
 * --------
 * • Sanitizes open-redirects (site-absolute only).
 * • Neutral, non-enumerating copy on request.
 * • Never logs sensitive values.
 *
 * UX & A11y
 * ----------
 * • A11y-first: labelled inputs, assertive error regions, `role="status"` success.
 * • Keyboard-friendly tablist (Left/Right) for Request / Verify.
 * • OtpInput supports paste + auto-advance. Buttons are disabled while pending.
 * • Nice touches: optional `?email=` prefill, resend with cooldown, focused errors.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import OtpInput from "@/components/forms/OtpInput";

import { useReactivationStart } from "@/features/auth/useReactivationStart";
import { useReactivateAccount } from "@/features/auth/useReactivateAccount";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// Types & helpers
// -----------------------------------------------------------------------------
type RequestValues = { email?: string };

function sanitizeRedirect(input: string | null | undefined, fallback = "/login"): string {
  if (!input) return fallback;
  if (input.startsWith("//")) return fallback;
  if (!input.startsWith("/")) return fallback;
  return input;
}

const COOLDOWN_SEC = 30;

function prefillEmailFromQuery(sp: ReturnType<typeof useSearchParams>) {
  const raw = sp?.get("email") || sp?.get("e") || "";
  return raw.trim().slice(0, 254);
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function ReactivatePage() {
  const sp = useSearchParams();
  const redirect = React.useMemo(
    () => sanitizeRedirect(sp.get("redirect"), PATHS.login || "/login"),
    [sp]
  );

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reactivate your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We’ll send a one-time code to confirm reactivation.
        </p>
      </header>
      <ReactivatePanel redirect={redirect} />
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Changed your mind?{" "}
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
// Panel · Request + Verify with tabs
// -----------------------------------------------------------------------------
function ReactivatePanel({ redirect }: { redirect: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();

  // Tabs
  const [mode, setMode] = React.useState<"request" | "verify">(
    sp.get("step") === "verify" ? "verify" : "request"
  );
  function onTabKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setMode((m) => (m === "request" ? "verify" : "request"));
    }
  }

  // ── Step 1: Request code ────────────────────────────────────────────────────
  const { register, handleSubmit, formState, setError } = useForm<RequestValues>({
    defaultValues: { email: prefillEmailFromQuery(sp) },
    mode: "onSubmit",
  });
  const requestOtp = useReactivationStart();

  // last successful/attempted email → used for messaging & resend
  const [lastEmail, setLastEmail] = React.useState<string>(prefillEmailFromQuery(sp));
  const [cooldown, setCooldown] = React.useState(0);
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const requestBusy = requestOtp.isPending;

  const onRequest = handleSubmit(async ({ email }) => {
    const target = (email ?? "").trim();
    try {
      await requestOtp.mutateAsync(target ? { email: target } : {});
      setLastEmail(target);
      setCooldown(COOLDOWN_SEC);
      toast({
        variant: "info",
        title: "If the email exists",
        description: "We’ve sent a reactivation code. Check your inbox and spam.",
        duration: 2800,
      });
    } catch (err) {
      // Anti-enumeration: treat most failures as success-equivalent, but still show a neutral toast.
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "If the email exists, we’ve sent a reactivation code.",
      });
      setLastEmail(target);
      toast({
        variant: "info",
        title: "If the email exists",
        description: friendly,
        duration: 2800,
      });
    } finally {
      setMode("verify");
    }
  });

  // ── Step 2: Verify/reactivate ───────────────────────────────────────────────
  const reactivate = useReactivateAccount();
  const [otp, setOtp] = React.useState("");
  const otpErrorRef = React.useRef<HTMLParagraphElement | null>(null);

  const verifyBusy = reactivate.isPending || reactivate.isSuccess;

  async function onVerify() {
    const clean = otp.replace(/\D+/g, "");
    if (!/^\d{6}$/.test(clean)) {
      if (otpErrorRef.current) {
        otpErrorRef.current.textContent = "Enter a valid 6-digit code.";
        otpErrorRef.current.focus();
      }
      return;
    }
    try {
      // Tolerant payload: send both shapes some APIs expect
      await reactivate.mutateAsync({ code: clean, otp: clean } as any);
      setOtp("");
      toast({ variant: "success", title: "Account reactivated" });
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "Invalid or expired code. Please try again.",
      });
      if (otpErrorRef.current) {
        otpErrorRef.current.textContent = friendly;
        otpErrorRef.current.focus();
      }
      toast({ variant: "error", title: "Reactivation failed", description: friendly });
    }
  }

  // Auto-redirect after success (with “Continue now” link)
  const redirectedRef = React.useRef(false);
  React.useEffect(() => {
    if (reactivate.isSuccess && !redirectedRef.current) {
      redirectedRef.current = true;
      const t = window.setTimeout(() => router.replace(redirect), 1200);
      return () => window.clearTimeout(t);
    }
  }, [reactivate.isSuccess, redirect, router]);

  return (
    <section className="space-y-6">
      {/* Success banner */}
      {reactivate.isSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border bg-emerald-50/70 px-4 py-3 text-sm shadow-sm"
        >
          <div className="font-medium text-emerald-900">Your account has been reactivated.</div>
          <p className="mt-1 text-emerald-900/90">Redirecting to sign in…</p>
          <div className="mt-2">
            <Link href={redirect} className="font-medium underline underline-offset-4 hover:text-foreground">
              Continue now
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Reactivation steps"
        className="rounded-lg border bg-muted/50 p-1"
        onKeyDown={onTabKeyDown}
      >
        <div className="grid grid-cols-2 gap-1">
          <button
            role="tab"
            id="tab-request"
            aria-controls="panel-request"
            aria-selected={mode === "request"}
            tabIndex={mode === "request" ? 0 : -1}
            type="button"
            onClick={() => setMode("request")}
            disabled={reactivate.isSuccess}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition",
              mode === "request" ? "bg-background shadow-sm" : "opacity-70 hover:opacity-100"
            )}
          >
            Request code
          </button>
          <button
            role="tab"
            id="tab-verify"
            aria-controls="panel-verify"
            aria-selected={mode === "verify"}
            tabIndex={mode === "verify" ? 0 : -1}
            type="button"
            onClick={() => setMode("verify")}
            disabled={reactivate.isSuccess}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition",
              mode === "verify" ? "bg-background shadow-sm" : "opacity-70 hover:opacity-100"
            )}
          >
            Enter code
          </button>
        </div>
      </div>

      {/* Panel · Request */}
      <div
        role="tabpanel"
        id="panel-request"
        aria-labelledby="tab-request"
        hidden={mode !== "request"}
        className="rounded-xl border bg-card/50 p-5 shadow-sm"
        aria-busy={requestBusy || undefined}
      >
        {requestOtp.isSuccess && (
          <div role="status" aria-live="polite" className="mb-3 rounded-md border bg-blue-50 px-3 py-2 text-sm text-blue-800">
            If the email exists, we’ve sent a reactivation code. Check your inbox (and spam).
          </div>
        )}

        {formState.errors.root?.message && (
          <div role="alert" className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formState.errors.root.message}
          </div>
        )}

        <form onSubmit={onRequest} noValidate className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Email <span className="opacity-60">(optional)</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              disabled={requestBusy}
              className={cn(
                "block w-full rounded-lg border bg-background px-3 py-2 text-base shadow-sm",
                "outline-none ring-0 transition placeholder:text-muted-foreground/70",
                "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
                formState.errors.email ? "border-destructive" : "border-input"
              )}
              {...register("email")}
              aria-invalid={!!formState.errors.email}
            />
          </div>

          <button
            type="submit"
            disabled={requestBusy || cooldown > 0}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition",
              requestBusy || cooldown > 0
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {requestBusy ? "Sending…" : cooldown > 0 ? `Send again in ${cooldown}s` : "Send code"}
          </button>

          <div className="pt-1 text-center text-xs text-muted-foreground">
            Already have a code?{" "}
            <button
              type="button"
              onClick={() => setMode("verify")}
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              Enter it
            </button>
          </div>
        </form>
      </div>

      {/* Panel · Verify */}
      <div
        role="tabpanel"
        id="panel-verify"
        aria-labelledby="tab-verify"
        hidden={mode !== "verify"}
        className="rounded-xl border bg-card/50 p-5 shadow-sm"
        aria-busy={verifyBusy || undefined}
      >
        {requestOtp.isSuccess && (
          <p role="status" aria-live="polite" className="mb-3 text-sm text-muted-foreground">
            We sent a code to your email{lastEmail ? ` (${lastEmail})` : ""}. Enter it below.
          </p>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium">One-time code</label>
          <OtpInput
            length={6}
            autoFocus
            value={otp}
            onChange={(v: string) => {
              setOtp(v.replace(/\D+/g, "").slice(0, 6));
              if (otpErrorRef.current) otpErrorRef.current.textContent = "";
            }}
            placeholder="•"
            inputClassName="text-lg"
            containerClassName="justify-between"
            disabled={verifyBusy}
          />
          <p
            ref={otpErrorRef}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className="min-h-[1rem] text-xs text-destructive"
          />
        </div>

        <button
          type="button"
          onClick={onVerify}
          disabled={verifyBusy || otp.replace(/\D+/g, "").length !== 6}
          className={cn(
            "mt-2 inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition",
            verifyBusy || otp.replace(/\D+/g, "").length !== 6
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {verifyBusy ? "Reactivating…" : "Reactivate account"}
        </button>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => void requestOtp.mutate(lastEmail ? { email: lastEmail } : {})}
            disabled={requestOtp.isPending || verifyBusy}
            className="underline underline-offset-4 hover:text-foreground disabled:opacity-60"
          >
            Resend code
          </button>
          <Link
            href={`${PATHS.login || "/login"}?redirect=${encodeURIComponent(redirect)}`}
            className="underline underline-offset-4 hover:text-foreground"
            prefetch
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
