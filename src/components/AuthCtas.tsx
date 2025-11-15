"use client";

import * as React from "react";
import Link from "next/link";
import { useMe } from "@/lib/useMe";
import { useRecoveryCodesList } from "@/features/auth/useRecoveryCodesList";

export default function AuthCtas() {
  const { data: me } = useMe();
  const signedIn = !!me;
  const rc = useRecoveryCodesList({ enabled: signedIn });
  const mfaEnabled = rc.isSuccess ? (rc.data?.codes?.length ?? 0) > 0 : undefined;

  if (!signedIn) {
    return (
      <div className="mt-6 flex flex-wrap gap-3" aria-describedby="hero-desc">
        <Link
          href="/signup"
          prefetch
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Create your account"
        >
          Get started
        </Link>
        <Link
          href="/login"
          prefetch
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Sign in"
        >
          Log in
        </Link>
        <Link
          href="/browse"
          prefetch
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Browse popular movies"
        >
          Browse movies
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3" aria-describedby="hero-desc">
      <Link
        href="/settings/security"
        prefetch
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        aria-label="Open security settings"
      >
        {mfaEnabled === false ? "Enable MFA" : "Security settings"}
      </Link>
      <Link
        href="/settings/sessions"
        prefetch
        className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        aria-label="Manage sessions"
      >
        Sessions
      </Link>
      <Link
        href="/browse"
        prefetch
        className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        aria-label="Browse popular movies"
      >
        Browse movies
      </Link>
    </div>
  );
}

