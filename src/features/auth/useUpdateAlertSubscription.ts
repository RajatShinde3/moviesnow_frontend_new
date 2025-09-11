// features/auth/useUpdateAlertSubscription.ts
"use client";

/**
 * useUpdateAlertSubscription
 * =============================================================================
 * Update alert/notification preferences (idempotent, optimistic, tolerant).
 *
 * Backend alignment
 * - Endpoint: POST /api/v1/auth/alerts/subscribe   (path is env-driven)
 * - Body:     Partial<Record<string, boolean>>      (non-empty)
 * - Reauth:   Optional `reauth_token` (query) if your backend requires step-up
 * - Idempotency: Always sends Idempotency-Key to dedupe retries / double-clicks
 *
 * Response tolerance
 * - 204 No Content            → normalized to { ok: true }
 * - { ok: true }              → normalized to { ok: true }
 * - { subscription: {...} }   → normalized to the flat map
 * - { ...flatMap }            → normalized to the flat map
 *
 * UX
 * - Optimistic patch + rollback on error
 * - Cache consistency: we refresh the subscription query on settle
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postMaybeJson, withIdempotency, type EnrichedHTTPError } from "@/lib/api";
import { PATHS } from "@/lib/env";
import { z } from "zod";

/* ---------------------------------- Path ---------------------------------- */

const ALERT_UPDATE_PATH = PATHS.alertsSubscribe as string;

/* --------------------------- Query key (shared) --------------------------- */

const SUBSCRIPTION_QK = ["auth", "alerts", "subscription"] as const;

/* ----------------------------- Core schemas ------------------------------ */

/** A flat map of preference flags */
export const AlertPrefsSchema = z.record(z.string(), z.boolean());
export type AlertSubscription = z.infer<typeof AlertPrefsSchema>;

/** Accept a partial patch (non-empty) and an optional step-up token (query) */
export const AlertPrefsUpdateInputSchema = z.object({
  patch: AlertPrefsSchema.refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one preference must be provided",
  }),
  reauth_token: z.string().min(1).optional(),
}).strict();

export type AlertPrefsUpdateInput = z.infer<typeof AlertPrefsUpdateInputSchema>;

/** Server can reply with many shapes; keep it tolerant */
const OkOnlySchema = z.object({ ok: z.literal(true) }).strict();
const WrappedSchema = z.object({ subscription: AlertPrefsSchema }).strict();

type RawResponse =
  | z.infer<typeof OkOnlySchema>
  | z.infer<typeof WrappedSchema>
  | AlertSubscription
  | undefined;

/** Public, normalized result */
export type AlertUpdateResult = { ok: true } | AlertSubscription;

/* ------------------------------ Narrowing -------------------------------- */

/**
 * Normalize different server responses to a stable shape.
 * We use schema-based narrowing (not `"in"` checks) to avoid TS false positives
 * when the union includes `Record<string, boolean>`.
 */
function normalizeResult(resp: RawResponse): AlertUpdateResult {
  if (resp == null) return { ok: true } as const; // 204
  const ok = OkOnlySchema.safeParse(resp);
  if (ok.success) return { ok: true } as const;

  const wrapped = WrappedSchema.safeParse(resp);
  if (wrapped.success) return wrapped.data.subscription;

  // Last: assume a flat map (record of booleans); schema-enforced elsewhere
  return resp as AlertSubscription;
}

/* --------------------- Helpers: headers type adapter ---------------------- */
/** Convert HeadersInit → Record<string,string> for our client options. */
function headersToRecord(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h);
  return h as Record<string, string>;
}

/* ---------------------------------- Hook ---------------------------------- */

type Ctx = { previous?: AlertSubscription | undefined };

export function useUpdateAlertSubscription() {
  const qc = useQueryClient();

  return useMutation<AlertUpdateResult, EnrichedHTTPError, AlertPrefsUpdateInput, Ctx>({
    mutationKey: ["auth", "alerts", "subscribe"],

    // Optimistic update for snappy UX; rollback on error
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: SUBSCRIPTION_QK });
      const previous = qc.getQueryData<AlertSubscription>(SUBSCRIPTION_QK);

      // Apply local patch
      const next: AlertSubscription = { ...(previous ?? {}), ...variables.patch };
      qc.setQueryData(SUBSCRIPTION_QK, next);

      return { previous };
    },

    mutationFn: async (variables) => {
      const { patch, reauth_token } = AlertPrefsUpdateInputSchema.parse(variables);

      const searchParams = reauth_token
        ? new URLSearchParams({ reauth_token })
        : undefined;

      // `withIdempotency()` returns RequestInit (HeadersInit). Adapt to the
      // client option type (Record<string,string>) to avoid TS incompatibility.
      const idem = withIdempotency();
      const opts = {
        headers: headersToRecord(idem.headers),
        ...(searchParams ? { searchParams } as const : {}),
      };

      const raw = await postMaybeJson<unknown>(ALERT_UPDATE_PATH, patch, opts);

      // Accept 204 / ok / wrapped / flat map
      const parsed = (
        raw === undefined
          ? undefined
          : (raw as RawResponse)
      );

      return normalizeResult(parsed);
    },

    onError: (_err, _vars, ctx) => {
      // Rollback optimistic cache
      if (ctx?.previous) qc.setQueryData(SUBSCRIPTION_QK, ctx.previous);
    },

    onSuccess: (result) => {
      // If server returned a concrete map, set it now (keeps UI consistent)
      if (!("ok" in result)) {
        qc.setQueryData(SUBSCRIPTION_QK, result);
      }
    },

    onSettled: () => {
      // Ensure eventual consistency
      qc.invalidateQueries({ queryKey: SUBSCRIPTION_QK });
    },
  });
}
