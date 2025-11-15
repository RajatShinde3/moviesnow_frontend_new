// app/page.tsx
/**
 * =============================================================================
 * Page · Home (Best-of-best)
 * =============================================================================
 * Polished, accessible landing hero with SEO (metadata + JSON-LD), safe CTAs,
 * and zero-layout-shift rendering.
 */

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import AuthCtas from "@/components/AuthCtas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "MoviesNow — Discover & track films",
  description: "Welcome to MoviesNow — create an account to explore, track, and save your favorite movies.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "MoviesNow",
    description: "Explore, track, and save your favorite movies.",
    url: siteUrl,
    siteName: "MoviesNow",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "MoviesNow", description: "Explore, track, and save your favorite movies." },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MoviesNow",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
} as const;

export default function HomePage() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate py-10 sm:py-14">
      {/* SEO: JSON-LD */}
      <Script id="moviesnow-website-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Decorative bg (no content impact) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-20 -z-10 blur-3xl"
        style={{
          maskImage: "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,1), transparent)",
        }}
      >
        <div className="mx-auto h-40 max-w-3xl bg-gradient-to-r from-primary/30 via-purple-400/20 to-emerald-400/20 opacity-50" />
      </div>

      <div className="mx-auto w-full max-w-5xl px-4">
        <header className="max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">Welcome</p>
          <h1 id="hero-title" className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Explore what to watch next — all in one place
          </h1>
          <p id="hero-desc" className="mt-3 text-sm text-muted-foreground sm:text-base">
            Sign up to build your watchlist, follow trends, and get personalized picks. Already a member? Jump back in.
          </p>
        </header>

        <AuthCtas />

        {/* Quick value props */}
        <ul className="mt-8 grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <li className="rounded-lg border bg-card/50 p-3 shadow-sm">
            🎯 Personalized watchlists
          </li>
          <li className="rounded-lg border bg-card/50 p-3 shadow-sm">
            🔔 New release alerts
          </li>
          <li className="rounded-lg border bg-card/50 p-3 shadow-sm">
            🎬 Trending picks daily
          </li>
        </ul>
      </div>
    </section>
  );
}
