// app/page.tsx
/**
 * =============================================================================
 * Landing Page - World-Class Premium Design
 * =============================================================================
 * Features:
 * - Full-screen hero with parallax effects
 * - Advanced animations with framer-motion
 * - Glassmorphism and gradient effects
 * - Interactive particle background
 * - Smooth scroll animations
 * - Mobile-optimized with touch interactions
 * - SEO optimized with JSON-LD
 */

import type { Metadata } from "next";
import Script from "next/script";
import { AnimeSugeNav } from "@/components/AnimeSugeNav";
import { AnimeSugeHome } from "@/components/AnimeSugeHome";
import { WorldClassFooter } from "@/components/WorldClassFooter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "MoviesNow — Stream Unlimited Movies & TV Shows | Premium Entertainment",
  description: "Stream unlimited movies and TV shows in 4K quality. Watch anywhere on your phone, tablet, laptop, and TV. Start your free 30-day trial today. No credit card required.",
  keywords: ["movies", "tv shows", "streaming", "entertainment", "netflix alternative", "4k streaming"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "MoviesNow — Stream Unlimited Movies & TV Shows",
    description: "Premium streaming service with unlimited movies and TV shows. Watch anywhere. Cancel anytime. Start your free 30-day trial.",
    url: siteUrl,
    siteName: "MoviesNow",
    type: "website",
    images: [{
      url: `${siteUrl}/og-image.jpg`,
      width: 1200,
      height: 630,
      alt: "MoviesNow Streaming Service"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoviesNow — Stream Unlimited Movies & TV Shows",
    description: "Premium streaming with unlimited content. Start your free 30-day trial today.",
    images: [`${siteUrl}/og-image.jpg`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MoviesNow",
  url: siteUrl,
  description: "Premium streaming service for movies and TV shows",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
  offers: {
    "@type": "Offer",
    price: "0.00",
    priceCurrency: "USD",
    description: "30-day free trial",
    availability: "https://schema.org/InStock"
  }
} as const;

export default function HomePage() {
  return (
    <>
      {/* SEO: JSON-LD */}
      <Script
        id="moviesnow-website-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* AnimeSuge-Style Navigation */}
      <AnimeSugeNav />

      {/* Main Content - AnimeSuge Design */}
      <AnimeSugeHome />

      {/* World-Class Footer */}
      <WorldClassFooter />
    </>
  );
}
