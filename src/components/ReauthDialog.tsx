"use client";

/**
 * ReauthDialog (+ Provider & Hook)
 * =============================================================================
 * Accessible, production-grade modal for **step-up reauthentication** before
 * sensitive actions (e.g., change email, view recovery codes, delete account).
 *
 * What’s included
 * -----------------------------------------------------------------------------
 * - <ReauthDialogInner/>  : the UI/flow (password or MFA).
 * - <ReauthProvider/>     : mounts a single dialog instance at app root.
 * - useReauthPrompt()     : returns callable `prompt(opts)`; resolves on success,
 *                           rejects with Error("reauth-cancelled") on cancel.
 *
 * Backend hooks (expected; you already have these):
 * - useReauthWithPassword({ password })
 * - useReauthWithMfa({ code })
 * - useReauthVerify({ reauth_token })  // optional finalize step
 *
 * A11y & UX
 * -----------------------------------------------------------------------------
 * - Focus trap, ESC to close, restore focus to the opener, aria-modal semantics.
 * - Body scroll lock while open (no background scroll).
 * - Clear, user-safe errors via `formatError()` (RFC7807 + requestId).
 * - Cancelable by design; caller decides when to require reauth.
 *
 * Security
 * -----------------------------------------------------------------------------
 * - Never logs secrets. Password/OTP fields are hardened and normalized.
 *
 * Usage
 * -----------------------------------------------------------------------------
 * // app/layout.tsx
 * import { ReauthProvider } from "@/components/ReauthDialog";
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <ReauthProvider>{children}</ReauthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 *
 * // In a page or component
 * import { useReauthPrompt } from "@/components/ReauthDialog";
 * const promptReauth = useReauthPrompt();
 * await promptReauth({ reason: "To revoke a device, please confirm it’s you.", methods: ["password","mfa"] });
 */

import * as React from "react";
import { cn } from "@/lib/cn";
import formatError from "@/lib/formatError";
import { useReauthWithPassword } from "@/features/auth/useReauthWithPassword";
import { useReauthWithMfa } from "@/features/auth/useReauthWithMfa";
import type { EnrichedHTTPError } from "@/lib/api";

type Method = "password" | "mfa";

export type ReauthDialogProps = {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Called on cancel/close (does NOT imply success). */
  onClose: () => void;
  /** Called when reauth completes successfully with the reauth token. */
  onSuccess?: (token: string) => void;
  /** Restrict available methods (default: both). First item is preferred tab. */
  methods?: Method[];
  /** Optional explanation shown below the title. */
  reason?: string;
  /** Override primary CTA text. */
  actionLabel?: string;
};

export type ReauthPromptOptions = Pick<
  ReauthDialogProps,
  "methods" | "reason" | "actionLabel"
>;

function isHttpError(e: unknown): e is EnrichedHTTPError {
  return !!e && typeof e === "object" && "response" in e;
}

/** Extract a reauth token from various backend response shapes. */
function pickReauthToken(x: unknown): string | null {
  if (!x || typeof x !== "object") return null;
  const anyX = x as any;
  return anyX.reauth_token ?? anyX.token ?? anyX.challenge_token ?? null;
}

const CODE_LENGTH = 6;

/* =============================================================================
 * Dialog (inner)
 * ==========================================================================*/
function ReauthDialogInner({
  open,
  onClose,
  onSuccess,
  methods,
  reason,
  actionLabel,
}: ReauthDialogProps) {
  // Normalize method choices; prefer the first provided
  const tabs = React.useMemo<Method[]>(
    () => (methods?.length ? methods : (["password", "mfa"] as Method[])),
    [methods]
  );
  const [tab, setTab] = React.useState<Method>(tabs[0] ?? "password");

  // Reset internal state whenever opened or method set changes
  React.useEffect(() => {
    if (!open) return;
    setTab(tabs[0] ?? "password");
    setPassword("");
    setCode("");
    setErr(null);
  }, [open, tabs]);

  // State
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [srStatus, setSrStatus] = React.useState(""); // screen-reader status

  // Hooks (network)
  const pw = useReauthWithPassword();
  const otp = useReauthWithMfa();

  const busy = pw.isPending || otp.isPending;

  // Focus refs & trap
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);

  // Capture opener to restore focus
  React.useEffect(() => {
    if (!open) return;
    openerRef.current = (document.activeElement as HTMLElement) ?? null;
  }, [open]);

  // Focus first input when opening
  React.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, tab]);

  // ESC to close
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Basic focus trap (cycle tabbables within the panel)
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const tabbables = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
      );
      if (!tabbables.length) return;
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Body scroll lock while open; restore focus to opener on close
  React.useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
      // Restore focus for keyboard users
      openerRef.current?.focus?.();
    };
  }, [open]);

  // Backdrop click closes (keeps flow cancelable)
  function onBackdropMouseDown(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // Submit
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSrStatus("");

    try {
      let reauthToken: string | null = null;

      if (tab === "password") {
        if (!password) {
          const m = "Please enter your current password.";
          setErr(m);
          setSrStatus(m);
          return;
        }
        const res = await pw.mutateAsync({ password });
        reauthToken = pickReauthToken(res);
        if (!reauthToken) {
          throw new Error("Not a reauth token");
        }
      } else {
        const normalized = code.replace(/\D+/g, "");
        if (normalized.length !== CODE_LENGTH) {
          const m = `Enter the ${CODE_LENGTH}-digit code from your authenticator.`;
          setErr(m);
          setSrStatus(m);
          return;
        }
        const res = await otp.mutateAsync({ code: normalized });
        reauthToken = pickReauthToken(res);
        if (!reauthToken) {
          throw new Error("Not a reauth token");
        }
      }

      // Success - pass the reauth token
      setPassword("");
      setCode("");
      setSrStatus("Reauthentication successful.");
      onSuccess?.(reauthToken);
      onClose();
    } catch (e: any) {
      const msg = isHttpError(e) ? formatError(e) : e?.message || "Reauthentication failed. Try again.";
      setErr(msg);
      setSrStatus(msg);
    }
  }

  const errId = err ? "reauth-error" : undefined;
  const hintId = tab === "mfa" ? "reauth-hint" : undefined;

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 hidden items-center justify-center md:p-4",
        open && "flex"
      )}
      onMouseDown={onBackdropMouseDown}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Live region for status/errors (off-screen) */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {srStatus}
      </div>

      {/* Dialog panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reauth-title"
        aria-describedby={err ? errId : hintId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b px-4 py-3">
          <div>
            <h2 id="reauth-title" className="text-base font-semibold">
              Confirm it’s you
            </h2>
            {reason ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{reason}</p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">
                For security, please verify your identity to continue.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm hover:bg-gray-100"
            aria-label="Close reauthentication dialog"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex items-center gap-1 border-b px-3 pt-2">
            {tabs.map((m) => (
              <button
                key={m}
                type="button"
                className={cn(
                  "rounded px-3 py-1.5 text-xs",
                  tab === m ? "bg-black text-white" : "hover:bg-gray-100"
                )}
                aria-pressed={tab === m}
                onClick={() => setTab(m)}
                disabled={busy}
              >
                {m === "password" ? "Password" : "Authenticator code"}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <form onSubmit={submit} className="space-y-3 px-4 py-4">
          {err && (
            <div
              id={errId}
              role="alert"
              aria-live="assertive"
              className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {err}
            </div>
          )}

          {tab === "password" ? (
            <div className="space-y-1">
              <label htmlFor="reauth-password" className="block text-sm font-medium">
                Current password
              </label>
              <input
                id="reauth-password"
                ref={inputRef}
                type="password"
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                required
                aria-invalid={!!err && tab === "password" ? true : undefined}
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label htmlFor="reauth-code" className="block text-sm font-medium">
                6-digit code
              </label>
              <input
                id="reauth-code"
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={CODE_LENGTH}
                disabled={busy}
                required
                aria-describedby={hintId}
                aria-invalid={!!err && tab === "mfa" ? true : undefined}
                pattern="\d{6}"
              />
              <p id={hintId} className="text-[11px] text-muted-foreground">
                Open your authenticator app and enter the current {CODE_LENGTH}-digit code.
              </p>
            </div>
          )}

          <div className="mt-2 flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className={cn(
                "rounded px-3 py-2 text-sm",
                busy ? "cursor-not-allowed bg-gray-100 text-gray-500" : "hover:bg-gray-50"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              aria-busy={busy || undefined}
              className={cn(
                "rounded px-3 py-2 text-sm text-white",
                busy ? "cursor-not-allowed bg-gray-400" : "bg-black hover:opacity-90"
              )}
            >
              {busy
                ? "Verifying…"
                : actionLabel ?? (tab === "password" ? "Verify with password" : "Verify with code")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =============================================================================
 * Provider & Hook
 * ==========================================================================*/

const ReauthCtx = React.createContext<((opts?: ReauthPromptOptions) => Promise<string>) | null>(null);

/**
 * ReauthProvider
 * Mount once near the app root. Exposes a callable `prompt` via context and
 * renders a single ReauthDialog instance controlled by that prompt.
 */
export function ReauthProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [opts, setOpts] = React.useState<ReauthPromptOptions | undefined>(undefined);

  // Promise resolvers for the calling site
  const resolveRef = React.useRef<((token: string) => void) | null>(null);
  const rejectRef = React.useRef<((err: unknown) => void) | null>(null);

  const prompt = React.useCallback((o?: ReauthPromptOptions) => {
    setOpts(o);
    setOpen(true);
    return new Promise<string>((resolve, reject) => {
      resolveRef.current = resolve;
      rejectRef.current = reject;
    });
  }, []);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    // Reject with a recognizable error; callers may ignore/catch it.
    rejectRef.current?.(new Error("reauth-cancelled"));
    resolveRef.current = null;
  }, []);

  const handleSuccess = React.useCallback((token: string) => {
    setOpen(false);
    resolveRef.current?.(token);
    resolveRef.current = null;
  }, []);

  return (
    <ReauthCtx.Provider value={prompt}>
      {children}
      <ReauthDialogInner
        open={open}
        onClose={handleClose}
        onSuccess={handleSuccess}
        methods={opts?.methods}
        reason={opts?.reason}
        actionLabel={opts?.actionLabel}
      />
    </ReauthCtx.Provider>
  );
}

/**
 * useReauthPrompt()
 * Returns a callable `prompt(options)` that opens the dialog and resolves on
 * success (rejects on cancel). Must be used under <ReauthProvider/>.
 */
export function useReauthPrompt() {
  const ctx = React.useContext(ReauthCtx);
  if (!ctx) throw new Error("useReauthPrompt must be used within <ReauthProvider>.");
  return ctx;
}

// Keep default export as the raw dialog (useful for tests/storybook)
export default ReauthDialogInner as React.FC<ReauthDialogProps>;
