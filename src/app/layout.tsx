// app/layout.tsx
/**
 * =============================================================================
 * Root Layout · MoviesNow OTT Platform (Enterprise-Grade)
 * =============================================================================
 * Global HTML shell + providers. A11y-first, CSP-friendly, and font-optimized.
 *
 * Features:
 * - Optimized font loading with display: swap
 * - Comprehensive SEO metadata (Open Graph, Twitter Cards)
 * - PWA manifest integration
 * - Accessibility-first design (skip links, route announcer)
 * - CSP nonce support for inline scripts
 * - Performance-optimized viewport settings
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";
import * as React from "react";
import { headers } from "next/headers";
import { Inter, Bebas_Neue, JetBrains_Mono } from "next/font/google";

import { cn } from "@/lib/cn";
import Providers from "./providers";
import RouteAnnouncer from "@/components/RouteAnnouncer";

// ————————————————————————————————————————————————————————————————
// Fonts (Netflix-inspired typography for premium streaming experience)
// Primary: Inter (clean, modern sans-serif for body text)
// Display: Bebas Neue (bold, impactful for hero titles)
// Mono: JetBrains Mono (code/technical elements)
// Subset optimization for performance, swap for FOUT prevention
// ————————————————————————————————————————————————————————————————
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const fontDisplay = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
  weight: ["400"],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

// ————————————————————————————————————————————————————————————————
// Enterprise-Grade Metadata Configuration
// ————————————————————————————————————————————————————————————————
const APP_NAME = "MoviesNow";
const APP_DESCRIPTION = "Stream movies, TV shows, and exclusive originals. Your premium entertainment destination.";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://moviesnow.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: ["streaming", "movies", "TV shows", "entertainment", "OTT", "watch online"],
  authors: [{ name: "MoviesNow Team" }],
  creator: "MoviesNow",
  publisher: "MoviesNow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - Premium Streaming`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@moviesnow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification tokens here
    // google: "your-google-verification-token",
    // yandex: "your-yandex-verification-token",
  },
  category: "entertainment",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

// Helpful if you want to ensure dynamic rendering everywhere (optional)
// export const revalidate = 0;
// export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // If you set a CSP with nonces in middleware/edge, you can forward it here.
  const h = await headers();
  const nonce = h.get("x-nonce") ?? undefined;

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-dvh bg-background text-foreground antialiased",
          "selection:bg-primary/10 selection:text-foreground",
          fontSans.variable,
          fontDisplay.variable,
          fontMono.variable
        )}
      >
        {/* Skip link for keyboard/screen reader users */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to content
        </a>

        {/* App-wide providers (toasts, reauth dialog, themes, etc.) */}
        <Providers>
          {/* Route change announcer for SR users */}
          <RouteAnnouncer />

          {/* Keep page layouts in charge of their own headers/containers */}
          <div id="main" className="contents">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
