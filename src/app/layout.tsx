// app/layout.tsx
/**
 * =============================================================================
 * Root Layout · App Router (best-of-best)
 * =============================================================================
 * Global HTML shell + providers. A11y-first, CSP-friendly, and font-optimized.
 */

import type { Metadata, Viewport } from "next";
import * as React from "react";
import { headers } from "next/headers";
import { Inter, JetBrains_Mono } from "next/font/google";

import { cn } from "@/lib/cn";
import Providers from "./providers";

// ————————————————————————————————————————————————————————————————
// Fonts (variables → use in your Tailwind theme as var(--font-sans/mono))
// ————————————————————————————————————————————————————————————————
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YourApp",
  description: "Secure, modern authentication flows",
  // metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // If you set a CSP with nonces in middleware/edge, you can forward it here.
  const nonce = headers().get("x-nonce") ?? undefined;

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-dvh bg-background text-foreground antialiased",
          "selection:bg-primary/10 selection:text-foreground",
          fontSans.variable,
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
        <Providers nonce={nonce}>
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

/**
 * Announces route changes to screen readers without visual noise.
 * Drop if you already have something similar in <Providers/>.
 */
function RouteAnnouncer() {
  const [message, setMessage] = React.useState<string>("");

  React.useEffect(() => {
    // Use document.title so you get meaningful page names.
    const announce = () => setMessage(document.title || "Page updated");
    announce();
    // Re-announce on history changes
    const onPop = () => announce();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
