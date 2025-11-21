// app/page.tsx
/**
 * =============================================================================
 * Landing Page - Netflix-Quality Design
 * =============================================================================
 * Features:
 * - Full-screen hero with background video
 * - Feature sections with alternating layouts
 * - FAQ accordion
 * - SEO optimized with JSON-LD
 */

import type { Metadata } from "next";
import Script from "next/script";
import { LandingHero, FeatureSection, FAQSection } from "@/components/LandingHero";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "MoviesNow — Watch Movies & TV Shows Online",
  description: "Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV. Watch anywhere. Cancel anytime.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "MoviesNow — Watch Movies & TV Shows Online",
    description: "Stream unlimited movies and TV shows. Watch anywhere. Cancel anytime.",
    url: siteUrl,
    siteName: "MoviesNow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoviesNow — Watch Movies & TV Shows Online",
    description: "Stream unlimited movies and TV shows. Watch anywhere. Cancel anytime.",
  },
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
    <main className="bg-black">
      {/* SEO: JSON-LD */}
      <Script
        id="moviesnow-website-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <LandingHero
        title="Unlimited movies, TV shows, and more"
        description="Watch anywhere. Cancel anytime."
        backgroundImage="/hero-bg.jpg"
        showScrollIndicator={true}
      />

      {/* Divider */}
      <div className="h-2 bg-gray-900" />

      {/* Features Section */}
      <FeatureSection />

      {/* Divider */}
      <div className="h-2 bg-gray-900" />

      {/* FAQ Section */}
      <FAQSection />

      {/* Divider */}
      <div className="h-2 bg-gray-900" />

      {/* Footer CTA */}
      <section className="bg-black py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-4 text-2xl font-medium sm:text-3xl">
            Ready to watch? Get started today.
          </h2>
          <p className="mb-8 text-lg text-gray-300">
            Join millions of users streaming their favorite content.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/signup"
              className="rounded-md bg-red-600 px-8 py-3 text-lg font-semibold transition-colors hover:bg-red-700"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="rounded-md border-2 border-gray-500 px-8 py-3 text-lg font-semibold transition-colors hover:border-white"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
