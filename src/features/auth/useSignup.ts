// features/auth/useSignup.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { fetchJson, withIdempotency, type AppError } from "@/lib/api/client";
import { PATHS } from "@/lib/env";
import {
  signupFormSchema,
  signupApiSchema,
  type SignupFormInput,
  type SignupApiPayload,
  LoginSuccessSchema, // token-style success (immediate sign-in)
} from "@/features/auth/schemas";
import { setAccessToken } from "@/lib/api/tokens";

/**
 * =============================================================================
 * Auth › Signup (idempotent, 204-tolerant, union-safe)
 * =============================================================================
 * Endpoint
 *   POST `${PATHS.signup}`  →  `/api/v1/auth/signup`
 *
 * Behavior
 * - Validates **form input** first (can include confirm_password, etc.).
 * - Builds a **strict API payload** (drops confirm_password) so we only send
 *   intended fields to the backend.
 * - Sends an Idempotency-Key to guard against double-clicks and page refreshes.
 * - Tolerates `204 No Content` and small JSON ACKs.
 * - Accepts either:
 *     • Token success: `{ access_token, ... }` → stores token in memory.
 *     • Ack/pending verification: `{ ok?: true, requires_email_verification?, ... }`
 *       → normalized to `{ ok: true, ... }`.
 *
 * Reliability
 * - `retry: false` (react-query) to avoid accidental resubmits; the request
 *   itself is idempotent if a manual retry happens.
 */

/* --------------------------------- Schemas --------------------------------- */

const SignupAckSchema = z
  .object({
    ok: z.literal(true).optional(), // normalized to true later if absent
    user_id: z.string().optional(),
    requires_email_verification: z.boolean().optional(),
    next_steps: z.array(z.string()).optional(),
  })
  .passthrough();

/** Union of “token-style success” OR “ack/pending verification”. */
const SignupServerResponseSchema = z.union([LoginSuccessSchema, SignupAckSchema]);

export type SignupResult = z.infer<typeof SignupServerResponseSchema>;

/* ------------------------------- Local helper ------------------------------ */
/** Convert HeadersInit → Record<string,string> for `fetchJson` options. */
function headersToRecord(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h as Array<[string, string]>);
  return h as Record<string, string>;
}

/* ----------------------------------- Hook ---------------------------------- */

export function useSignup() {
  return useMutation<SignupResult, AppError | Error, SignupFormInput>({
    mutationKey: ["auth", "signup"],
    retry: false,
    mutationFn: async (input): Promise<SignupResult> => {
      // 1) Validate user-facing form (includes confirm_password, etc.)
      let form: SignupFormInput;
      try {
        form = signupFormSchema.parse(input);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const first =
            err.issues?.[0]?.message ??
            "Some fields look invalid. Please review and try again.";
          throw new Error(first);
        }
        throw err;
      }

      // 2) Build strict API payload (drop confirm_password); prefer full_name
      const payload: SignupApiPayload = signupApiSchema.parse({
        full_name: form.full_name ?? undefined,
        email: form.email,
        password: form.password,
      });

      // 3) Prepare headers from idempotency helper (type-safe for fetchJson)
      const headers = headersToRecord(withIdempotency().headers);

      // Helper to detect a 400/bad_request AppError
      const isBadRequest = (e: unknown) => {
        const obj = e as any;
        return !!obj && obj.name === "AppError" && (obj.status === 400 || obj.code === "bad_request");
      };

      // 4) POST; tolerate 204/No Content (fetchJson returns `undefined`).
      //    Fallbacks: some backends expect `name` instead of `full_name`, or no name at all.
      let raw: unknown | undefined;
      try {
        raw = await fetchJson<unknown | undefined>(PATHS.signup, {
          method: "POST",
          json: payload,
          headers,
          cache: "no-store",
        });
      } catch (err) {
        // If the only field at risk is `full_name`, retry with `name` and then without name.
        if ((form.full_name ?? undefined) && isBadRequest(err)) {
          try {
            const headers2 = headersToRecord(withIdempotency().headers);
            raw = await fetchJson<unknown | undefined>(PATHS.signup, {
              method: "POST",
              json: { name: form.full_name, email: form.email, password: form.password },
              headers: headers2,
              cache: "no-store",
            });
          } catch (err2) {
            if (isBadRequest(err2)) {
              const headers3 = headersToRecord(withIdempotency().headers);
              raw = await fetchJson<unknown | undefined>(PATHS.signup, {
                method: "POST",
                json: { email: form.email, password: form.password },
                headers: headers3,
                cache: "no-store",
              });
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }

      // 5) Normalize undefined (204) to a simple ack
      const data = raw ?? ({ ok: true } as const);

      // 6) Parse the union of server responses
      const parsed = SignupServerResponseSchema.parse(data);

      // 7) Side-effect for token success (immediate sign-in)
      const token =
        (parsed as any)?.access_token ??
        (parsed as any)?.token ??
        (parsed as any)?.accessToken ??
        null;

      if (typeof token === "string" && token.length > 0) {
        setAccessToken(token); // memory only
        return parsed;
      }

      // 8) Ensure `{ ok: true }` exists for ack branch to simplify UIs
      if (!("ok" in parsed)) {
        return { ok: true, ...(parsed as object) } as SignupResult;
      }
      return parsed;
    },
  });
}
