"use client";

/**
 * =============================================================================
 * Page · Settings · Security · Recovery Codes (Best-of-best)
 * =============================================================================
 * Manage single-use recovery codes:
 *  • Secure viewing (step-up/reauth when required)
 *  • Reveal/Mask toggle to reduce shoulder-surfing risk
 *  • Copy all / Download .txt / Print (client-side, no server roundtrips)
 *  • Regenerate (step-up protected) with clear warnings and confirmations
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Hooks: `useRecoveryCodesList`, `useRecoveryCodesGenerate` (idempotent client).
 * • Step-up aware: if listing/generating requires reauth, opens <ReauthDialog/> and
 *   retries with `xReauth`.
 * • Neutral error copy via `formatError()` with subtle request-id surfacing.
 * • Sensitive UI: re-masks codes when the tab is hidden and on unmount.
 *
 * UX & A11y
 * ---------
 * • Assertive inline error region with focus handoff (screen reader friendly).
 * • Clear empty/safe states using <EmptyState />; keyboard-first friendly.
 * • Action buttons disabled when unsafe (e.g., while masked).
 * • Shortcut: when revealed, Cmd/Ctrl + C copies all codes.
 */

import * as React from "react";
import { cn } from "@/lib/cn";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import EmptyState from "@/components/feedback/EmptyState";
import { useReauthPrompt } from "@/components/ReauthDialog";

import { useRecoveryCodesList } from "@/features/auth/useRecoveryCodesList";
import { useRecoveryCodesGenerate } from "@/features/auth/useRecoveryCodesGenerate";

// -----------------------------------------------------------------------------
// Page-level caching hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

type CodesState =
  | { status: "idle"; codes: string[] | null }
  | { status: "loading"; codes: string[] | null }
  | { status: "ready"; codes: string[] };

/** Detect normalized “step-up required” */
function isStepUpRequired(err: unknown): boolean {
  const e = err as any;
  return (
    (e && e.code === "need_step_up") ||
    (e &&
      e.headers &&
      (e.headers["x-reauth"] === "required" || e.headers["X-Reauth"] === "required"))
  );
}

/** Tolerant extractor: supports {codes}, {data}, {items}, or a bare array */
function extractCodes(res: any): string[] {
  if (Array.isArray(res)) return res.map((x) => String(x ?? ""));
  const arr = (res?.codes ?? res?.data ?? res?.items ?? []) as unknown;
  return Array.isArray(arr) ? arr.map((x) => String(x ?? "")) : [];
}

export default function RecoveryCodesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Recovery codes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Recovery codes let you sign in if you lose access to your authenticator. Each code can be
          used once. Store them in a safe place.
        </p>
      </header>
      <RecoveryCodesPanel />
    </main>
  );
}

function RecoveryCodesPanel() {
  const toast = useToast();
  const promptReauth = useReauthPrompt();

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  const [viewNeedsReauth, setViewNeedsReauth] = React.useState(false);
  const [state, setState] = React.useState<CodesState>({ status: "idle", codes: null });
  const [revealed, setRevealed] = React.useState(false);

  const { mutateAsync: listCodes, isPending: isListing } = useRecoveryCodesList();
  const { mutateAsync: generateCodes, isPending: isGenerating } = useRecoveryCodesGenerate();

  const listId = React.useId(); // tie reveal button to list for a11y

  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  // Mask codes when the tab is hidden (reduces shoulder-surfing risk)
  React.useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") setRevealed(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Clear codes + remask on unmount (extra belt-and-suspenders)
  React.useEffect(() => {
    return () => {
      setRevealed(false);
      setState({ status: "idle", codes: null });
    };
  }, []);

  // Global shortcut: when revealed, Cmd/Ctrl + C copies all
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (revealed && meta && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        void copyAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, state]);

  // Initial load
  React.useEffect(() => {
    (async () => {
      setState((s) => ({ ...s, status: "loading" }));
      setErrorMsg(null);
      try {
        const res = await listCodes({} as any);
        const codes = extractCodes(res);
        setState({ status: "ready", codes });
        setViewNeedsReauth(false);
        setRevealed(false);
      } catch (err) {
        if (isStepUpRequired(err)) {
          setViewNeedsReauth(true);
          setState({ status: "idle", codes: null });
          setRevealed(false);
          return;
        }
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t load your recovery codes right now.",
        });
        setErrorMsg(friendly);
        setState({ status: "idle", codes: null });
        setRevealed(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReauthView() {
    setErrorMsg(null);
    try {
      await promptReauth({ reason: "Confirm it’s you to view recovery codes" } as any);
      const res = await listCodes({} as any);
      const codes = extractCodes(res);
      setState({ status: "ready", codes });
      setViewNeedsReauth(false);
      setRevealed(false);
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "We couldn’t confirm it was you just now.",
      });
      setErrorMsg(friendly);
    }
  }

  async function handleRegenerate() {
    setErrorMsg(null);

    const ok = window.confirm(
      "Regenerate recovery codes?\n\nYour existing codes will stop working. Make sure to save the new set immediately."
    );
    if (!ok) return;

    try {
      // Most backends require step-up here; request proactively.
      await promptReauth({
        reason: "Confirm it’s you to regenerate recovery codes",
      } as any);

      const res = await generateCodes({} as any);
      const codes = extractCodes(res);
      setState({ status: "ready", codes });
      setRevealed(true); // reveal freshly-generated set for quick saving

      toast({
        variant: "success",
        title: "Recovery codes regenerated",
        description: "Save the new codes in a secure place.",
        duration: 2600,
      });
    } catch (err) {
      const friendly = formatError(err, {
        includeRequestId: true,
        maskServerErrors: true,
        fallback: "We couldn’t regenerate your codes right now. Please try again.",
      });
      setErrorMsg(friendly);
    }
  }

  async function copyAll() {
    const codes = state.codes ?? [];
    if (!codes.length || !revealed) return;

    const text = codes.join("\n");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast({
        variant: "success",
        title: "Copied",
        description: "All recovery codes copied to clipboard.",
        duration: 1800,
      });
    } catch {
      setErrorMsg("Copy failed. Try selecting the codes and copy manually.");
    }
  }

  function downloadTxt() {
    const codes = state.codes ?? [];
    if (!codes.length || !revealed) return;

    const text = codes.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function printCodes() {
    const codes = state.codes ?? [];
    if (!codes.length || !revealed) return;

    const text = codes.join("\n");
    const w = window.open("", "print-recovery-codes", "width=600,height=800");
    if (!w) return;
    w.document.write(`
      <!doctype html>
      <title>Recovery codes</title>
      <meta charset="utf-8" />
      <style>
        body { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; padding: 24px; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        pre { font-size: 14px; white-space: pre-wrap; word-break: break-word; }
        .note { font-size: 12px; color: #444; margin-top: 12px; }
      </style>
      <h1>Recovery codes</h1>
      <pre>${text.replace(/</g, "&lt;")}</pre>
      <div class="note">Keep these codes safe. Each code can be used only once.</div>
    `);
    w.document.close();
    w.focus();
    w.print();
  }

  const isBusy = isListing || isGenerating || state.status === "loading";
  const hasCodes = state.status === "ready" && (state.codes?.length ?? 0) > 0;

  return (
    <section className="space-y-6" aria-busy={isBusy || undefined}>
      {/* Inline error (assertive, focuses on update) */}
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

      {/* Reauth callout when viewing requires step-up */}
      {viewNeedsReauth && (
        <div className="rounded-xl border bg-accent/30 p-5 text-sm shadow-sm">
          <div className="font-medium">Confirm it’s you</div>
          <p className="mt-1 text-muted-foreground">
            For your security, please confirm your identity to view recovery codes.
          </p>
          <div className="mt-3">
            <button
              onClick={handleReauthView}
              disabled={isListing}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition",
                isListing && "cursor-not-allowed opacity-75"
              )}
            >
              {isListing ? "Opening…" : "Confirm & view codes"}
            </button>
          </div>
        </div>
      )}

      {/* Placeholder while loading / no data */}
      {!viewNeedsReauth && state.status !== "ready" && (
        <div className="rounded-xl border bg-card/50 p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">
            {isBusy ? "Loading your recovery codes…" : "No codes to display."}
          </div>
        </div>
      )}

      {/* Codes panel */}
      {!viewNeedsReauth && state.status === "ready" && (
        <div className="rounded-xl border p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Your recovery codes</h2>
              <p className="text-sm text-muted-foreground">
                Save these somewhere safe. Each code works once.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-2 flex flex-wrap gap-2 sm:mt-0">
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
                aria-pressed={revealed}
                aria-controls={listId}
                aria-label={revealed ? "Mask codes" : "Reveal codes"}
              >
                {revealed ? "Mask" : "Reveal"}
              </button>
              <button
                onClick={copyAll}
                disabled={!hasCodes || !revealed}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent",
                  (!hasCodes || !revealed) && "cursor-not-allowed opacity-60"
                )}
              >
                Copy
              </button>
              <button
                onClick={downloadTxt}
                disabled={!hasCodes || !revealed}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent",
                  (!hasCodes || !revealed) && "cursor-not-allowed opacity-60"
                )}
              >
                Download .txt
              </button>
              <button
                onClick={printCodes}
                disabled={!hasCodes || !revealed}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent",
                  (!hasCodes || !revealed) && "cursor-not-allowed opacity-60"
                )}
              >
                Print
              </button>
            </div>
          </div>

          {/* Codes grid or empty state */}
          {hasCodes ? (
            <div className={cn("relative rounded-md", !revealed && "overflow-hidden")}>
              {!revealed && (
                <div
                  className="absolute inset-0 z-10 grid place-items-center bg-background/60 backdrop-blur-sm"
                  aria-hidden
                >
                  <span className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
                    Codes hidden — click Reveal
                  </span>
                </div>
              )}
              <ul
                id={listId}
                className={cn(
                  "grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3",
                  !revealed && "select-none blur-sm"
                )}
                aria-live="polite"
                aria-label="Recovery codes"
                aria-hidden={!revealed}
              >
                {state.codes!.map((c, i) => (
                  <li key={`${c}-${i}`} className="rounded-md border bg-muted/40 p-2 font-mono text-sm">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState
              title="No recovery codes"
              description="Generate a new set to use in case you lose access to your authenticator app."
              actions={[{
                label: isGenerating ? "Generating…" : "Generate codes",
                onClick: handleRegenerate,
                disabled: isGenerating,
                variant: "primary",
              }]}
            />
          )}

          {/* Danger zone: regenerate */}
          <div className="mt-6 rounded-lg border bg-destructive/5 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-destructive">Regenerate recovery codes</div>
                <p className="text-xs text-muted-foreground">
                  This will invalidate your existing codes immediately.
                </p>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:bg-destructive/90",
                  isGenerating && "cursor-not-allowed opacity-75"
                )}
              >
                {isGenerating ? "Regenerating…" : "Regenerate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
