"use client";

/**
 * Header (Authenticated Shell)
 * =============================================================================
 * Responsibilities
 * - Consistent, responsive navigation bar for authenticated pages.
 * - Primary navigation, current-user info, safe logout action.
 *
 * Notable improvements
 * - A11y: “Skip to content”, unique menu id via useId(), aria-haspopup/expanded,
 *   ESC to close mobile menu, aria-live while signing out.
 * - Robustness: id collision safe, route-change menu close, SSR guards.
 * - Security/Privacy: no PII logging; logout relies on server HttpOnly cookies +
 *   client token clear inside `useLogout()`.
 */

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useMe } from "@/lib/useMe"; // { data?: { email?: string; name?: string }, ... }
import { useLogout } from "@/features/auth/useLogout";
import { useRecoveryCodesList } from "@/features/auth/useRecoveryCodesList";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "MoviesNow";

type NavLink = { href: string; label: string };

/** Top-level nav for signed-in users. Adjust to your product IA. */
const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/devices", label: "Devices" },
  { href: "/settings/sessions", label: "Sessions" },
  { href: "/settings/account", label: "Account" },
];

function useActiveHref() {
  const pathname = usePathname() || "/";
  return (href: string) => {
    if (href === "/") return pathname === "/";
    // treat section roots (e.g., /settings/*) as active
    return pathname === href || pathname.startsWith(href + "/");
  };
}

function Avatar({ email, name }: { email?: string | null; name?: string | null }) {
  const src = (name ?? email ?? APP_NAME ?? "?").trim();
  const initial = (src[0] ?? "?").toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-8 w-8 select-none items-center justify-center rounded-full bg-black text-sm font-semibold text-white"
      title={email || name || "Account"}
    >
      {initial}
    </span>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = useActiveHref();
  const menuUid = React.useId(); // unique per render tree
  const menuId = `primary-mobile-menu-${menuUid}`;

  const { data: me, isLoading: meLoading } = useMe();
  const logout = useLogout();
  const signedIn = !!me;
  const rc = useRecoveryCodesList({ enabled: signedIn });
  const mfaEnabled = rc.isSuccess ? (rc.data?.codes?.length ?? 0) > 0 : undefined;

  // Mobile menu state
  const [open, setOpen] = React.useState(false);
  const firstLinkRef = React.useRef<HTMLAnchorElement | null>(null);

  // Close menu on route changes
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Focus first link when opening the mobile menu
  React.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstLinkRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  // Close menu on ESC
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function onLogout() {
    try {
      await logout.mutateAsync();
    } finally {
      // Local auth is cleared in the hook; ensure user lands on login
      router.replace("/login");
    }
  }

  const userLabel = React.useMemo(() => {
    if (me?.name) return me.name;
    if (me?.email) return me.email;
    if (meLoading) return "Loading…";
    return "Account";
  }, [me?.name, me?.email, meLoading]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* Skip link for keyboard/screen reader users. Expect a <main id="main"> on pages. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-black focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            className="shrink-0 rounded px-1 py-0.5 text-base font-semibold hover:opacity-90"
            aria-label={`${APP_NAME} home`}
          >
            {APP_NAME}
          </Link>
        </div>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="ml-2 hidden flex-1 items-center gap-1 md:flex">
          {signedIn
            ? (
                NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cn(
                      "rounded px-2.5 py-1.5 text-sm transition",
                      isActive(l.href) ? "bg-black text-white" : "text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {l.label}
                  </Link>
                ))
              ) : (
                <Link href="/login" className="rounded px-2.5 py-1.5 text-sm text-gray-900 hover:bg-gray-100">
                  Log in
                </Link>
              )}
        </nav>

        {/* Spacer */}
        <div className="flex-1 md:hidden" />

        {/* User menu (details/summary) or auth CTAs */}
        {signedIn ? (
        <details className="relative group">
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center gap-2 rounded px-2 py-1.5",
              "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10"
            )}
            aria-label="Account menu"
            aria-haspopup="menu"
          >
            <Avatar email={me?.email} name={me?.name as any} />
            <span className="hidden text-sm md:inline">{userLabel}</span>
            <span
              aria-hidden="true"
              className="ml-1 hidden text-xs text-gray-500 md:inline group-open:rotate-180"
            >
              ▾
            </span>
          </summary>

          <div
            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border bg-white shadow-lg"
            role="menu"
          >
            <div className="px-3 py-2">
              <div className="truncate text-sm font-medium">{me?.name || "Signed in"}</div>
              <div className="truncate text-xs text-muted-foreground">{me?.email || "—"}</div>
            </div>
            <div className="border-t" />

            <div className="p-1" role="none">
              <Link
                href="/settings/account"
                role="menuitem"
                className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
              >
                Account settings
              </Link>
              <Link
                href="/settings/security"
                role="menuitem"
                className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
              >
                {mfaEnabled === false ? "Enable MFA" : "Security & MFA"}
              </Link>
              <Link
                href="/settings/sessions"
                role="menuitem"
                className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
              >
                Sessions
              </Link>
            </div>

            <div className="border-t" />

            <div className="p-1" role="none">
              <button
                type="button"
                onClick={onLogout}
                disabled={logout.isPending}
                role="menuitem"
                aria-live={logout.isPending ? "polite" : undefined}
                className={cn(
                  "flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm",
                  logout.isPending
                    ? "cursor-not-allowed bg-gray-100 text-gray-500"
                    : "text-red-600 hover:bg-gray-100"
                )}
              >
                <span>{logout.isPending ? "Signing out…" : "Sign out"}</span>
                {logout.isPending && <span className="text-[10px]">…</span>}
              </button>
            </div>
          </div>
        </details>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="rounded px-3 py-1.5 text-sm hover:bg-gray-100">Log in</Link>
            <Link href="/signup" className="rounded bg-black px-3 py-1.5 text-sm text-white hover:opacity-90">Sign up</Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((s) => !s)}
          className="ml-1 inline-flex items-center rounded px-2 py-1.5 text-sm hover:bg-gray-100 md:hidden"
        >
          Menu
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id={menuId}
        hidden={!open}
        className="border-t md:hidden"
        role="region"
        aria-label="Mobile navigation"
      >
        <nav className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6">
          <ul className="flex flex-col gap-1">
            {(signedIn ? NAV_LINKS : []).map((l, i) => (
              <li key={l.href}>
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={cn(
                    "block rounded px-3 py-2 text-sm",
                    isActive(l.href) ? "bg-black text-white" : "text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t pt-2">
              <button
                type="button"
                onClick={onLogout}
                disabled={logout.isPending}
                className={cn(
                  "w-full rounded px-3 py-2 text-left text-sm",
                  logout.isPending
                    ? "cursor-not-allowed bg-gray-100 text-gray-500"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                )}
                aria-live={logout.isPending ? "polite" : undefined}
              >
                {logout.isPending ? "Signing out…" : "Sign out"}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
