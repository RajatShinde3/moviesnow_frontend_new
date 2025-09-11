"use client";

/**
 * =============================================================================
 * Page · Settings · Security Alerts (Best-of-best)
 * =============================================================================
 * Manage email-based security alerts (new sign-ins, MFA changes, etc.).
 *
 * SECURITY & RESILIENCE
 * ---------------------
 * • Reads current settings via `useAlertSubscription()`.
 * • Saves updates via `useUpdateAlertSubscription()` (idempotent client).
 * • Step-up aware: if the API signals reauth, opens <ReauthDialog /> and retries
 *   with `xReauth` — your edits are preserved.
 * • Neutral, user-friendly errors via `formatError()`; request-id surfaced subtly.
 *
 * UX & A11y
 * ---------
 * • Clear master toggle (Email security alerts) + granular categories.
 * • Dirty-state detection (order-insensitive) with Save/Cancel controls.
 * • Assertive inline error region; focus handoff on failures.
 * • Keyboard-first friendly; all inputs labeled; live regions used correctly.
 *
 * API SHAPE TOLERANCE
 * -------------------
 * Supports common response shapes like:
 *   1) { email: boolean, categories?: Record<string, boolean> }
 *   2) { channels: { email: boolean }, categories?: Record<string, boolean> }
 *   3) { categories: Record<string, boolean> }
 * We normalize on read, and on save we reconstruct using the *original* shape.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { PATHS } from "@/lib/env";
import { formatError } from "@/lib/formatError";
import { useToast } from "@/components/feedback/Toasts";
import { useReauthPrompt } from "@/components/ReauthDialog";

import { useAlertSubscription } from "@/features/auth/useAlertSubscription";
import { useUpdateAlertSubscription } from "@/features/auth/useUpdateAlertSubscription";

// -----------------------------------------------------------------------------
// Page-level cache hints (client-side). Server should also send no-store.
// -----------------------------------------------------------------------------
export const revalidate = 0;
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// Types & helpers
// -----------------------------------------------------------------------------
type NormalizedCategory = {
  key: string;
  label: string;
  hint?: string;
  value: boolean;
};
type NormalizedModel = {
  // null when API exposes only categories (no channel-level email toggle)
  channelEmail: boolean | null;
  categories: NormalizedCategory[];
};

// Known category labels — we only show toggles for keys found in the API,
// but we provide friendly labels for popular keys.
const CATEGORY_LABELS: Record<string, { label: string; hint?: string }> = {
  sign_in: { label: "New sign-ins", hint: "Notify on successful sign-ins." },
  suspicious_activity: { label: "Suspicious activity", hint: "Notify on risky/blocked attempts." },
  new_device: { label: "New trusted device", hint: "Notify when a new device is remembered." },
  password_change: { label: "Password changed", hint: "Notify when your password changes." },
  mfa_disabled: { label: "MFA disabled", hint: "Notify when 2FA is turned off." },
  email_change: { label: "Email changed", hint: "Notify when your email address changes." },
};

// Treat common “reauth needed” shapes uniformly
function isStepUpRequired(err: unknown): boolean {
  const e = err as any;
  return (
    (e && e.code === "need_step_up") ||
    (e &&
      e.headers &&
      (e.headers["x-reauth"] === "required" || e.headers["X-Reauth"] === "required"))
  );
}

// Normalize server payload into UI model, and remember the shape so we can
// reconstruct an update payload that matches what the API expects.
type ShapeTag =
  | { tag: "email_bool_categories_record" }            // { email: boolean, categories?: Record }
  | { tag: "channels_email_categories_record" }        // { channels: { email: boolean }, categories?: Record }
  | { tag: "categories_record" }                       // { categories: Record }
  | { tag: "unknown" };                                 // fallback (best effort)

function normalizeFromServer(res: any): { model: NormalizedModel; shape: ShapeTag; original: any } {
  // Case 1: { email: boolean, categories? }
  if (res && typeof res === "object" && typeof res.email === "boolean") {
    const categoriesObj = res.categories && typeof res.categories === "object" ? res.categories : {};
    return {
      shape: { tag: "email_bool_categories_record" },
      original: res,
      model: {
        channelEmail: !!res.email,
        categories: toNormalizedCategoryList(categoriesObj),
      },
    };
  }

  // Case 2: { channels: { email: boolean }, categories? }
  if (res && typeof res === "object" && res.channels && typeof res.channels.email === "boolean") {
    const categoriesObj = res.categories && typeof res.categories === "object" ? res.categories : {};
    return {
      shape: { tag: "channels_email_categories_record" },
      original: res,
      model: {
        channelEmail: !!res.channels.email,
        categories: toNormalizedCategoryList(categoriesObj),
      },
    };
  }

  // Case 3: { categories: Record<string, boolean> }
  if (res && typeof res === "object" && res.categories && typeof res.categories === "object") {
    return {
      shape: { tag: "categories_record" },
      original: res,
      model: {
        channelEmail: null,
        categories: toNormalizedCategoryList(res.categories),
      },
    };
  }

  // Fallback — coerce any top-level boolean fields into categories
  if (res && typeof res === "object") {
    const categories: Record<string, boolean> = {};
    for (const k of Object.keys(res)) {
      if (typeof (res as any)[k] === "boolean") categories[k] = !!(res as any)[k];
    }
    if (Object.keys(categories).length > 0) {
      return {
        shape: { tag: "unknown" },
        original: res,
        model: { channelEmail: null, categories: toNormalizedCategoryList(categories) },
      };
    }
  }

  // Last resort — empty model
  return {
    shape: { tag: "unknown" },
    original: res ?? null,
    model: { channelEmail: null, categories: [] },
  };
}

function toNormalizedCategoryList(rec: Record<string, boolean>): NormalizedCategory[] {
  // Keep a stable order: preferred labels first, then any remaining keys alphabetically.
  const preferred = Object.keys(CATEGORY_LABELS).filter((k) => typeof rec[k] === "boolean");
  const others = Object.keys(rec)
    .filter((k) => !preferred.includes(k) && typeof rec[k] === "boolean")
    .sort((a, b) => a.localeCompare(b));

  const keys = [...preferred, ...others];
  return keys.map((key) => {
    const meta =
      CATEGORY_LABELS[key] ||
      { label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) };
    return { key, label: meta.label, hint: meta.hint, value: !!rec[key] };
  });
}

// Build an update payload that matches the server’s original shape
function buildUpdatePayload(shape: ShapeTag, original: any, model: NormalizedModel): any {
  switch (shape.tag) {
    case "email_bool_categories_record": {
      const next = { ...(original || {}) };
      if (model.channelEmail !== null) next.email = !!model.channelEmail;
      if (Array.isArray(model.categories)) {
        next.categories = { ...(original?.categories || {}) };
        for (const c of model.categories) next.categories[c.key] = !!c.value;
      }
      return next;
    }
    case "channels_email_categories_record": {
      const next = { ...(original || {}) };
      if (!next.channels) next.channels = {};
      if (model.channelEmail !== null) next.channels.email = !!model.channelEmail;
      if (Array.isArray(model.categories)) {
        next.categories = { ...(original?.categories || {}) };
        for (const c of model.categories) next.categories[c.key] = !!c.value;
      }
      return next;
    }
    case "categories_record": {
      const next = { ...(original || {}) };
      next.categories = { ...(original?.categories || {}) };
      for (const c of model.categories) next.categories[c.key] = !!c.value;
      return next;
    }
    case "unknown": {
      // Best effort: mirror original and overlay booleans we recognize
      const next = { ...(original || {}) };
      for (const c of model.categories) next[c.key] = !!c.value;
      // Respect top-level/channeled email if present in original
      if (Object.prototype.hasOwnProperty.call(original || {}, "email") && model.channelEmail !== null) {
        next.email = !!model.channelEmail;
      }
      if (
        original?.channels &&
        Object.prototype.hasOwnProperty.call(original.channels, "email") &&
        model.channelEmail !== null
      ) {
        next.channels = { ...(original.channels || {}), email: !!model.channelEmail };
      }
      return next;
    }
  }
}

// Deep-ish equality for dirty-state (order-insensitive for categories)
function modelEquals(a: NormalizedModel, b: NormalizedModel) {
  if (a.channelEmail !== b.channelEmail) return false;
  if (a.categories.length !== b.categories.length) return false;
  const map = new Map(a.categories.map((c) => [c.key, !!c.value]));
  for (const c of b.categories) {
    if (!map.has(c.key) || map.get(c.key) !== !!c.value) return false;
  }
  return true;
}

// -----------------------------------------------------------------------------
// Page component
// -----------------------------------------------------------------------------
export default function AlertsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Security alerts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Get notified about important activity on your account. Change these anytime.
        </p>
      </header>
      <AlertsPanel />
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
// Alerts panel (load → edit → save; reauth-aware)
// -----------------------------------------------------------------------------
function AlertsPanel() {
  const router = useRouter();
  const toast = useToast();
  const promptReauth = useReauthPrompt();

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const errorRef = React.useRef<HTMLDivElement | null>(null);

  // fetching + saving
  const { mutateAsync: fetchSub, isPending: isFetching } = useAlertSubscription();
  const { mutateAsync: updateSub, isPending: isSaving } = useUpdateAlertSubscription();

  // original shape/payload (to reconstruct updates) + current UI model
  const originalRef = React.useRef<any>(null);
  const shapeRef = React.useRef<ShapeTag>({ tag: "unknown" });

  const [model, setModel] = React.useState<NormalizedModel>({
    channelEmail: null,
    categories: [],
  });
  const [pristineModel, setPristineModel] = React.useState<NormalizedModel>(model); // for Cancel

  // on-mount load
  React.useEffect(() => {
    (async () => {
      setErrorMsg(null);
      try {
        const res = await fetchSub({} as any);
        const { model: norm, shape, original } = normalizeFromServer(res);
        originalRef.current = original;
        shapeRef.current = shape;
        setModel(norm);
        setPristineModel(norm);
      } catch (err) {
        if (isStepUpRequired(err)) {
          try {
            await promptReauth({
              reason: "Confirm it’s you to view security alerts",
            } as any);
            const res = await fetchSub({} as any);
            const { model: norm, shape, original } = normalizeFromServer(res);
            originalRef.current = original;
            shapeRef.current = shape;
            setModel(norm);
            setPristineModel(norm);
          } catch (err2) {
            const friendly = formatError(err2, {
              includeRequestId: true,
              maskServerErrors: true,
              fallback: "We couldn’t confirm it was you just now.",
            });
            setErrorMsg(friendly);
          }
          return;
        }
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t load your alert preferences right now.",
        });
        setErrorMsg(friendly);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (errorMsg && errorRef.current) errorRef.current.focus();
  }, [errorMsg]);

  const isDirty = React.useMemo(() => !modelEquals(model, pristineModel), [model, pristineModel]);

  async function save(nextToken?: string) {
    const payload = buildUpdatePayload(shapeRef.current, originalRef.current, model);
    await updateSub({ ...(payload || {}), ...(nextToken ? { xReauth: nextToken } : {}) } as any);

    // Sync pristine to model + refresh
    setPristineModel(model);
    originalRef.current = { ...(originalRef.current || {}), ...(payload || {}) };
    toast.success({
      title: "Preferences saved",
      description: "Your security alerts have been updated.",
      duration: 2200,
    });
    router.refresh();
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isDirty || isSaving) return;
    setErrorMsg(null);
    try {
      await save();
    } catch (err) {
      if (!isStepUpRequired(err)) {
        const friendly = formatError(err, {
          includeRequestId: true,
          maskServerErrors: true,
          fallback: "We couldn’t save your preferences right now. Please try again.",
        });
        setErrorMsg(friendly);
        return;
      }
      try {
        await promptReauth({
          reason: "Confirm it’s you to update security alerts",
        } as any);
        await save();
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

  function onCancel() {
    setModel(pristineModel);
    setErrorMsg(null);
  }

  const busy = isFetching || isSaving;

  return (
    <section className="space-y-6" aria-busy={busy || undefined}>
      {/* Inline error (assertive live region) */}
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

      {/* Card */}
      <form onSubmit={onSave} className="rounded-xl border p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Email security alerts</h2>
          <p className="text-sm text-muted-foreground">
            Choose which activities trigger an email. You can change these anytime.
          </p>
        </div>

        {/* Loading skeleton (gentle, while we fetch first view) */}
        {model.categories.length === 0 && model.channelEmail === null && isFetching ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />
            ))}
          </div>
        ) : (
          <>
            {/* Master channel toggle, if API exposes it */}
            {model.channelEmail !== null && (
              <label className="mb-3 flex items-start gap-3 rounded-lg border p-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border"
                  checked={!!model.channelEmail}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, channelEmail: e.currentTarget.checked }))
                  }
                  aria-describedby="alerts-master-hint"
                />
                <div>
                  <div className="text-sm font-medium">Enable security emails</div>
                  <div id="alerts-master-hint" className="text-xs text-muted-foreground">
                    Turn all security notifications on or off. You can still fine-tune below.
                  </div>
                </div>
              </label>
            )}

            {/* Category toggles */}
            <div className="mt-4 space-y-2">
              {model.categories.length > 0 ? (
                model.categories.map((c) => (
                  <label key={c.key} className="flex items-start gap-3 rounded-lg border p-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border"
                      checked={c.value}
                      onChange={(e) =>
                        setModel((m) => ({
                          ...m,
                          categories: m.categories.map((x) =>
                            x.key === c.key ? { ...x, value: e.currentTarget.checked } : x
                          ),
                        }))
                      }
                      aria-describedby={c.hint ? `${c.key}-hint` : undefined}
                    />
                    <div>
                      <div className="text-sm font-medium">{c.label}</div>
                      {c.hint ? (
                        <div id={`${c.key}-hint`} className="text-xs text-muted-foreground">
                          {c.hint}
                        </div>
                      ) : null}
                    </div>
                  </label>
                ))
              ) : (
                <div className="rounded-lg border bg-card/50 p-3 text-sm text-muted-foreground">
                  No granular categories were provided by the server. You can still control the
                  master toggle above.
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className={cn(
              "inline-flex items-center justify-center rounded-lg border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition",
              (!isDirty || isSaving) && "cursor-not-allowed opacity-75"
            )}
            aria-disabled={!isDirty || isSaving}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={!isDirty || isSaving}
            className={cn(
              "inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent",
              (!isDirty || isSaving) && "cursor-not-allowed opacity-75"
            )}
            aria-disabled={!isDirty || isSaving}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
