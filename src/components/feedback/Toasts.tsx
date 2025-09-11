"use client";

/**
 * Toasts (Provider + Hook + Renderer)
 * =============================================================================
 * A production-grade, accessible toast system for Next.js (App Router).
 *
 * Highlights
 * - <ToastsRoot/> mounts a Provider + Renderer; `useToast()` works app-wide.
 * - Variants: "success" | "error" | "warning" | "info" | "default".
 * - a11y: polite/assertive live regions, keyboard (ESC), focusable actions.
 * - UX: per-toast auto-dismiss with hover-pause, optional progress bar,
 *   reduced-motion aware; bounded queue with key-based de-duplication.
 */

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/cn";

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export type ToastAction = {
  label: string;
  onClick: () => void | Promise<void>;
  ariaLabel?: string;
};

export type ToastOptions = {
  id?: string;
  /** If another toast with the same `key` exists, we UPDATE it instead. */
  key?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss in ms (default 4000). 0 disables auto-dismiss. */
  duration?: number;
  /** Show a progress bar (default true when duration > 0). */
  showProgress?: boolean;
  action?: ToastAction;
  onClose?: () => void;
};

export type ToastUpdate = Partial<
  Omit<ToastOptions, "id" | "key" | "onClose"> & { /** restart timer & re-open */ forceShow?: boolean }
>;

type ToastInstance = {
  id: string;
  key?: string;
  title?: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
  showProgress?: boolean;
  action?: ToastAction;
  onClose?: () => void;

  createdAt: number;
  /** Remaining ms until auto-dismiss (0 = no auto-dismiss). */
  remaining: number;

  /** For exit animation. */
  visible: boolean;
};

type ToastAPI = {
  toast: {
    (opts?: ToastOptions): string;
    success: (opts?: ToastOptions) => string;
    error: (opts?: ToastOptions) => string;
    warning: (opts?: ToastOptions) => string;
    info: (opts?: ToastOptions) => string;
    update: (id: string, patch: ToastUpdate) => void;
    dismiss: (id?: string) => void; // if no id → dismiss all
    clear: () => void; // immediate removal, no animation
  };
};

/* ────────────────────────────────────────────────────────────────────────────
 * Utilities
 * ────────────────────────────────────────────────────────────────────────── */

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 4000;

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function useReducedMotion() {
  const [reduced, set] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => set(!!m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Context + Provider (single canonical store)
 * ────────────────────────────────────────────────────────────────────────── */

const ToastContext = React.createContext<ToastAPI | null>(null);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastInstance[]>([]);
  const reduced = useReducedMotion();

  // live regions (SR announce)
  const lastPoliteRef = React.useRef("");
  const lastAssertiveRef = React.useRef("");

  const show = React.useCallback((opts?: ToastOptions): string => {
    const {
      id = uid(),
      key,
      variant = "default",
      duration = DEFAULT_DURATION,
      title,
      description,
      action,
      onClose,
      showProgress,
    } = opts ?? {};

    let resultId = id;

    setToasts(prev => {
      // dedupe by key: update existing, return its id
      if (key) {
        const i = prev.findIndex(t => t.key === key);
        if (i >= 0) {
          const existing = prev[i];
          resultId = existing.id;
          const next: ToastInstance = {
            ...existing,
            ...opts,
            id: existing.id,
            variant: opts?.variant ?? existing.variant,
            createdAt: existing.createdAt,
            remaining: typeof duration === "number" && duration > 0 ? duration : 0,
            visible: true,
          };
          const out = [...prev];
          out[i] = next;
          return out;
        }
      }

      const instance: ToastInstance = {
        id,
        key,
        title,
        description,
        variant,
        duration,
        showProgress,
        action,
        onClose,
        createdAt: Date.now(),
        remaining: typeof duration === "number" && duration > 0 ? duration : 0,
        visible: true,
      };

      const out = [instance, ...prev];
      // enforce bounded queue; if we drop extras, call their onClose
      const trimmed = out.slice(0, MAX_TOASTS);
      out.slice(MAX_TOASTS).forEach(t => t.onClose?.());
      return trimmed;
    });

    // SR announce
    const msg = [title, description].filter(Boolean).join(". ");
    if (variant === "error") lastAssertiveRef.current = msg;
    else lastPoliteRef.current = msg;

    return resultId;
  }, []);

  const update = React.useCallback((id: string, patch: ToastUpdate) => {
    setToasts(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const duration = patch.duration ?? (t.duration ?? DEFAULT_DURATION);
        const shouldRestart =
          patch.forceShow ||
          "title" in patch ||
          "description" in patch ||
          "variant" in patch ||
          ("duration" in patch && duration > 0);

        return {
          ...t,
          ...patch,
          variant: patch.variant ?? t.variant,
          remaining: shouldRestart ? Math.max(0, duration) : t.remaining,
          visible: true,
        };
      })
    );
  }, []);

  const dismiss = React.useCallback((id?: string) => {
    setToasts(prev => prev.map(t => (id && t.id !== id ? t : { ...t, visible: false })));
  }, []);

  const clear = React.useCallback(() => setToasts([]), []);

  // remove fully hidden toasts after exit animation
  React.useEffect(() => {
    if (!toasts.length) return;
    const timeout = window.setTimeout(() => {
      setToasts(prev => {
        const removed: ToastInstance[] = [];
        const kept = prev.filter(t => {
          if (!t.visible) {
            removed.push(t);
            return false;
          }
          return true;
        });
        removed.forEach(t => t.onClose?.());
        return kept;
      });
    }, reduced ? 0 : 250);
    return () => window.clearTimeout(timeout);
  }, [toasts, reduced]);

  // tiny event bridge for renderer
  React.useEffect(() => {
    const onReq = () => window.dispatchEvent(new CustomEvent("toast-store", { detail: toasts }));
    window.addEventListener("toast-request", onReq);
    window.dispatchEvent(new CustomEvent("toast-store", { detail: toasts }));
    return () => window.removeEventListener("toast-request", onReq);
  }, [toasts]);

  // keyboard: ESC → dismiss latest
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setToasts(prev => {
        const firstVisible = prev.find(t => t.visible);
        if (!firstVisible) return prev;
        return prev.map(t => (t.id === firstVisible.id ? { ...t, visible: false } : t));
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = React.useMemo<ToastAPI>(
    () => ({
      toast: Object.assign(show, {
        success: (opts?: ToastOptions) => show({ variant: "success", ...opts }),
        error: (opts?: ToastOptions) => show({ variant: "error", ...opts }),
        warning: (opts?: ToastOptions) => show({ variant: "warning", ...opts }),
        info: (opts?: ToastOptions) => show({ variant: "info", ...opts }),
        update,
        dismiss,
        clear,
      }),
    }),
    [show, update, dismiss, clear]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* SR live regions */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {lastPoliteRef.current}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {lastAssertiveRef.current}
      </div>
    </ToastContext.Provider>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Hook
 * ────────────────────────────────────────────────────────────────────────── */

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastsRoot />");
  return ctx.toast;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Toaster (UI renderer; mount once)
 * ────────────────────────────────────────────────────────────────────────── */

export function Toaster({
  position = "top-right",
  className,
}: {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [toasts, setToasts] = React.useState<ToastInstance[]>([]);
  const reduced = useReducedMotion();

  const ctx = React.useContext(ToastContext);

  React.useEffect(() => {
    setMounted(true);
    const onStore = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as ToastInstance[] | undefined;
      if (Array.isArray(detail)) setToasts(detail);
    };
    window.addEventListener("toast-store", onStore as EventListener);
    window.dispatchEvent(new CustomEvent("toast-request"));
    return () => window.removeEventListener("toast-store", onStore as EventListener);
  }, []);

  if (!ctx) {
    // fail-soft: wrap a provider if someone mounted Toaster alone
    return (
      <ToastProvider>
        <Toaster position={position} className={className} />
      </ToastProvider>
    );
  }

  return mounted
    ? createPortal(
        <div
          className={cn(
            "pointer-events-none fixed z-[100] flex flex-col gap-2 p-4",
            position.includes("top") ? "top-0" : "bottom-0",
            position.includes("right") ? "right-0 items-end" : "left-0 items-start",
            className
          )}
        >
          {toasts.map(t => (
            <ToastItem key={t.id} t={t} reduced={reduced} />
          ))}
        </div>,
        document.body
      )
    : null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Internal rendering
 * ────────────────────────────────────────────────────────────────────────── */

function iconFor(variant: ToastVariant) {
  const base = "inline-block h-4 w-4";
  switch (variant) {
    case "success":
      return <span className={base} aria-hidden>✅</span>;
    case "error":
      return <span className={base} aria-hidden>⛔</span>;
    case "warning":
      return <span className={base} aria-hidden>⚠️</span>;
    case "info":
      return <span className={base} aria-hidden>ℹ️</span>;
    default:
      return <span className={base} aria-hidden>🔔</span>;
  }
}

function bgFor(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return "border-emerald-200 bg-emerald-50";
    case "error":
      return "border-red-200 bg-red-50";
    case "warning":
      return "border-amber-200 bg-amber-50";
    case "info":
      return "border-blue-200 bg-blue-50";
    default:
      return "border-gray-200 bg-white";
  }
}

/** Per-toast countdown with hover-pause; calls onElapsed when it hits 0. */
function useCountdown({
  durationMs,
  initiallyRemainingMs,
  pausedExternally = false,
  onElapsed,
}: {
  durationMs: number;
  initiallyRemainingMs: number;
  pausedExternally?: boolean;
  onElapsed: () => void;
}) {
  const [remaining, setRemaining] = React.useState(initiallyRemainingMs);
  const [paused, setPaused] = React.useState(false);
  const tickRef = React.useRef<number | null>(null);
  const lastTsRef = React.useRef<number | null>(null);

  // reset when props change (e.g., update(forceShow) or duration change)
  React.useEffect(() => {
    setRemaining(initiallyRemainingMs);
    setPaused(false);
    lastTsRef.current = null;
  }, [initiallyRemainingMs, durationMs]);

  const stop = React.useCallback(() => {
    if (tickRef.current != null) window.cancelAnimationFrame(tickRef.current);
    tickRef.current = null;
    lastTsRef.current = null;
  }, []);

  const loop = React.useCallback((ts: number) => {
    if (paused || pausedExternally || remaining <= 0) return;
    if (lastTsRef.current == null) lastTsRef.current = ts;
    const dt = ts - lastTsRef.current;
    lastTsRef.current = ts;
    setRemaining(r => {
      const next = Math.max(0, r - dt);
      if (next === 0) onElapsed();
      return next;
    });
    tickRef.current = window.requestAnimationFrame(loop);
  }, [paused, pausedExternally, remaining, onElapsed]);

  React.useEffect(() => {
    if (durationMs <= 0 || initiallyRemainingMs <= 0) return;
    tickRef.current = window.requestAnimationFrame(loop);
    return stop;
  }, [durationMs, initiallyRemainingMs, loop, stop]);

  return {
    remaining,
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
  };
}

function ToastItem({ t, reduced }: { t: ToastInstance; reduced: boolean }) {
  const api = useToast();

  const hasTimer = (t.duration ?? DEFAULT_DURATION) > 0;
  const progressEnabled = hasTimer && (t.showProgress ?? true);

  const { remaining, onMouseEnter, onMouseLeave } = useCountdown({
    durationMs: t.duration ?? DEFAULT_DURATION,
    initiallyRemainingMs: t.remaining,
    pausedExternally: !t.visible, // stop if closing
    onElapsed: () => {
      if (hasTimer) api.dismiss(t.id);
    },
  });

  const close = () => api.dismiss(t.id);
  const pct = hasTimer ? Math.max(0, Math.min(100, (remaining / (t.duration ?? DEFAULT_DURATION)) * 100)) : 0;

  const role: React.AriaRole = t.variant === "error" ? "alert" : "status";
  const ariaLive: React.AriaAttributes["aria-live"] = t.variant === "error" ? "assertive" : "polite";

  return (
    <div
      role={role}
      aria-live={ariaLive}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-md border shadow-md",
        bgFor(t.variant),
        reduced
          ? "transition-none"
          : "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
        "will-change-transform"
      )}
      data-state={t.visible ? "open" : "closed"}
    >
      <div className="flex items-start gap-3 p-3">
        <div className="mt-0.5">{iconFor(t.variant)}</div>
        <div className="min-w-0 flex-1">
          {t.title && <div className="truncate text-sm font-medium">{t.title}</div>}
          {t.description && <div className="mt-0.5 line-clamp-3 text-xs text-gray-700">{t.description}</div>}
          {t.action && (
            <div className="mt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await t.action?.onClick?.();
                  } finally {
                    api.dismiss(t.id);
                  }
                }}
                aria-label={t.action.ariaLabel || t.action.label}
                className="rounded bg-black px-2 py-1 text-xs font-medium text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
              >
                {t.action.label}
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close notification"
          className="rounded px-1.5 py-1 text-xs text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
        >
          ✕
        </button>
      </div>

      {progressEnabled && (
        <div className="h-1 w-full bg-black/5">
          <div
            className="h-1 bg-black/50 transition-[width]"
            style={{ width: `${pct}%` }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Default export: Provider + Renderer wrapper
 * ────────────────────────────────────────────────────────────────────────── */

type RootProps = React.ComponentProps<typeof Toaster> & { children?: React.ReactNode };

export default function ToastsRoot({ children, ...props }: RootProps) {
  return (
    <ToastProvider>
      {children}
      <Toaster {...props} />
    </ToastProvider>
  );
}
