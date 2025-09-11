"use client";

/**
 * SettingsTabs
 * =============================================================================
 * Accessible, route-aware “tabs” for settings sections (page navigation).
 *
 * Why this component (design goals)
 * -----------------------------------------------------------------------------
 * - **Semantics-first**: This is page navigation, not ARIA tabs. We use <nav>,
 *   real <a> links, and `aria-current="page"`.
 * - **Responsive**: Compact <select> on mobile, horizontal pills on desktop.
 * - **Predictable routing**: Highlights by exact or “section root” match.
 * - **State preservation**: Optional query-string and hash preservation.
 * - **Hardened inputs**: Hrefs are sanitized to site-absolute paths.
 *
 * Key props
 * -----------------------------------------------------------------------------
 * - items:            Array<{ href, label, icon?, badge?, disabled? }>
 * - preserveSearch:   Keep current query string (default false)
 * - preserveHash:     Keep current URL hash (default false)
 * - forceExactMatch:  Match only exact path, not path prefix (default false)
 * - prefetch:         Next.js Link prefetch toggle (default true)
 * - onTabChange:      Callback when active tab changes
 *
 * Usage
 * -----------------------------------------------------------------------------
 * <SettingsTabs />
 * <SettingsTabs
 *   items={[
 *     { href: "/settings/account",  label: "Account" },
 *     { href: "/settings/security", label: "Security" },
 *     { href: "/settings/devices",  label: "Devices",  badge: 2 },
 *     { href: "/settings/sessions", label: "Sessions" },
 *   ]}
 *   preserveSearch
 *   preserveHash
 * />
 */

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------
 * Types
 * --------------------------------------------------------------------------*/

export type SettingsTabItem = {
  /** Absolute path for the destination (e.g., "/settings/security"). */
  href: string;
  /** Visible label. Keep it short. */
  label: string;
  /** Optional decorative icon. */
  icon?: React.ReactNode;
  /** Optional badge (count or small label). */
  badge?: number | string;
  /** Disable navigation for this item (renders muted, not focusable). */
  disabled?: boolean;
};

export type SettingsTabsProps = {
  /** Items to render; defaults to the canonical /settings sections. */
  items?: ReadonlyArray<SettingsTabItem>;
  /** Preserve the current query string when navigating. Default: false. */
  preserveSearch?: boolean;
  /** Preserve the current hash (#anchor) when navigating. Default: false. */
  preserveHash?: boolean;
  /** Match only exact path (no section prefix matching). Default: false. */
  forceExactMatch?: boolean;
  /** Next.js Link prefetch toggle for desktop links. Default: true. */
  prefetch?: boolean;
  /** nav aria-label; default: "Settings sections". */
  ariaLabel?: string;
  /** SSR & testing: control the select element id. */
  selectId?: string;
  /** Called when the active tab changes (after route commit). */
  onTabChange?: (href: string) => void;
  /** Extra classes for the outer container. */
  className?: string;
  /** Test id on the outer container. */
  "data-testid"?: string;
};

/* ----------------------------------------------------------------------------
 * Defaults & utils
 * --------------------------------------------------------------------------*/

const DEFAULT_ITEMS: SettingsTabItem[] = [
  { href: "/settings/account", label: "Account" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/devices", label: "Devices" },
  { href: "/settings/sessions", label: "Sessions" },
];

/** Only allow site-absolute paths like "/settings/…" (defensive). */
function sanitizePath(p: string, fallback = "/"): string {
  if (!p) return fallback;
  const s = p.trim();
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return fallback;
}

/** Section matching helper. */
function isActivePath(current: string, href: string, exact: boolean): boolean {
  if (!current) return false;
  if (exact) return current === href;
  return current === href || current.startsWith(href + "/");
}

/** Read current hash on client; SSR-safe. */
function useHash(): string {
  const [hash, setHash] = React.useState("");
  React.useEffect(() => {
    const h = typeof window !== "undefined" ? window.location.hash : "";
    setHash(h && h !== "#" ? h : "");
  }, []);
  return hash;
}

/* ----------------------------------------------------------------------------
 * Component
 * --------------------------------------------------------------------------*/

export default function SettingsTabs({
  items = DEFAULT_ITEMS,
  preserveSearch = false,
  preserveHash = false,
  forceExactMatch = false,
  prefetch = true,
  ariaLabel = "Settings sections",
  selectId,
  onTabChange,
  className,
  "data-testid": testId,
}: SettingsTabsProps) {
  const pathname = usePathname() || "";
  const search = useSearchParams();
  const router = useRouter();
  const hash = useHash();

  // Sanitize all hrefs once (defensive programming)
  const safeItems = React.useMemo(
    () =>
      items.map((it) => ({
        ...it,
        href: sanitizePath(it.href),
      })),
    [items]
  );

  const activeHref =
    safeItems.find((i) => isActivePath(pathname, i.href, forceExactMatch))?.href ??
    safeItems[0]?.href ??
    "/";

  // Build next URL with optional search/hash preservation
  const buildHref = React.useCallback(
    (href: string) => {
      const base = sanitizePath(href);
      const qs = preserveSearch ? search?.toString() : "";
      const h = preserveHash ? hash : "";
      let out = base;
      if (qs) out += `?${qs}`;
      if (h) out += h;
      return out;
    },
    [preserveSearch, preserveHash, search, hash]
  );

  // Fire onTabChange when route actually changes to a different active tab
  const lastActiveRef = React.useRef(activeHref);
  React.useEffect(() => {
    if (activeHref !== lastActiveRef.current) {
      lastActiveRef.current = activeHref;
      onTabChange?.(activeHref);
    }
  }, [activeHref, onTabChange]);

  const computedSelectId = selectId || "settings-tabs";

  return (
    <div
      className={cn("w-full border-b bg-white/80 backdrop-blur", className)}
      data-testid={testId}
    >
      {/* Mobile: compact select */}
      <div className="mx-auto block w-full max-w-6xl px-4 py-2 sm:px-6 md:hidden">
        <label htmlFor={computedSelectId} className="sr-only">
          {ariaLabel}
        </label>
        <select
          id={computedSelectId}
          className={cn(
            "block w-full rounded border bg-white px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-black/10"
          )}
          value={activeHref}
          onChange={(e) => {
            const next = buildHref(e.target.value);
            // replace to avoid stacking history for simple tab switches
            router.replace(next);
          }}
        >
          {safeItems.map((it) => (
            <option key={it.href} value={it.href} disabled={it.disabled}>
              {it.label}
              {typeof it.badge !== "undefined" ? ` (${String(it.badge)})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: horizontal nav */}
      <div className="mx-auto hidden w-full max-w-6xl px-4 sm:px-6 md:block">
        <nav aria-label={ariaLabel} className="flex items-center gap-1 overflow-x-auto py-2">
          {safeItems.map((it) => {
            const active = isActivePath(pathname, it.href, forceExactMatch);

            // Disabled item renders as non-interactive pill (not focusable)
            if (it.disabled) {
              return (
                <span
                  key={it.href}
                  aria-disabled="true"
                  className={cn("select-none rounded px-3 py-1.5 text-sm", "text-gray-400")}
                  title="Unavailable"
                >
                  {it.icon && <span aria-hidden className="mr-1.5">{it.icon}</span>}
                  <span>{it.label}</span>
                  {typeof it.badge !== "undefined" && (
                    <span
                      className={cn(
                        "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5",
                        "text-[10px] font-medium bg-gray-200 text-gray-800"
                      )}
                      aria-label={
                        typeof it.badge === "number" ? `${it.badge} items` : String(it.badge)
                      }
                    >
                      {String(it.badge)}
                    </span>
                  )}
                </span>
              );
            }

            const content = (
              <>
                {it.icon && <span aria-hidden className="mr-1.5">{it.icon}</span>}
                <span>{it.label}</span>
                {typeof it.badge !== "undefined" && (
                  <span
                    className={cn(
                      "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5",
                      "text-[10px] font-medium",
                      active ? "bg-white/20 text-white" : "bg-gray-200 text-gray-800"
                    )}
                    aria-label={
                      typeof it.badge === "number" ? `${it.badge} items` : String(it.badge)
                    }
                  >
                    {String(it.badge)}
                  </span>
                )}
              </>
            );

            return (
              <Link
                key={it.href}
                href={buildHref(it.href)}
                aria-current={active ? "page" : undefined}
                prefetch={prefetch}
                className={cn(
                  "rounded px-3 py-1.5 text-sm transition",
                  active ? "bg-black text-white" : "text-gray-900 hover:bg-gray-100"
                )}
              >
                {content}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
