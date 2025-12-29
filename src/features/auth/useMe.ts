// features/auth/useMe.ts
"use client";

/**
 * =============================================================================
 * Auth › Get current user data (with MFA status)
 * =============================================================================
 * @endpoint GET /api/v1/user/me
 * @returns Current authenticated user's profile including mfa_enabled status
 */

import { useQuery } from "@tanstack/react-query";
import { fetchJson, type AppError } from "@/lib/api/client";
import { env } from "@/lib/env";

/* ────────────────────────────────────────────────────────────────────────────
   Path (SSR-safe env)
   ──────────────────────────────────────────────────────────────────────────── */

const RAW_ME_PATH = env().NEXT_PUBLIC_ME_PATH ?? "api/v1/user/me";
export const ME_PATH = RAW_ME_PATH.replace(/^\/+/, "");

/* ────────────────────────────────────────────────────────────────────────────
   User type
   ──────────────────────────────────────────────────────────────────────────── */

export interface User {
  id: string;
  email: string;
  username?: string | null;
  full_name?: string | null;
  is_verified?: boolean;
  is_email_verified?: boolean;
  is_active?: boolean;
  is_superuser?: boolean;
  created_at?: string;
  updated_at?: string | null;

  // MFA fields (backend returns is_2fa_enabled, mfa_enabled is an alias)
  is_2fa_enabled?: boolean;
  mfa_enabled?: boolean; // synonym of is_2fa_enabled

  // Optional profile fields
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
}

/* ────────────────────────────────────────────────────────────────────────────
   Hook
   ──────────────────────────────────────────────────────────────────────────── */

export function useMe() {
  return useQuery<User, AppError>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const user = await fetchJson<User>(ME_PATH, {
        method: "GET",
        cache: "no-store",
      });
      return user;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry 401s
  });
}
