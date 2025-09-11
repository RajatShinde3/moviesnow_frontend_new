// next.config.ts
/**
 * Next.js config — production-friendly with a CORS-free dev proxy
 * =============================================================================
 * How this is intended to work (matches src/lib/env.ts):
 *
 * DEV (recommended):
 *   • Leave NEXT_PUBLIC_API_BASE_URL **unset**.
 *   • The client uses API_BASE="/api" and paths like "api/v1/...".
 *   • Browser calls /api/api/v1/* (same-origin) → rewritten to http://localhost:8000/api/v1/*.
 *   • No CORS headaches; cookies work.
 *
 * PROD (direct mode):
 *   • Set NEXT_PUBLIC_API_BASE_URL to an **absolute** URL (e.g., https://api.example.com).
 *   • Rewrites are disabled; browser calls the API origin directly.
 *   • Ensure your backend CORS is configured if cross-origin is required.
 *
 * Notes:
 *   • Do NOT set NEXT_PUBLIC_API_BASE_URL to a relative value like "/api" or "/api/v1".
 *     Your env validator rejects that (by design).
 *   • Keep only this config file; remove any next.config.js/.mjs to avoid conflicts.
 *   • Add CSP/HSTS once you’ve verified HTTPS end-to-end and reviewed your asset graph.
 */

import type { NextConfig } from "next";

/** True when a value is an absolute http/https URL. */
function isAbsoluteUrl(v?: string): boolean {
  return !!v && /^https?:\/\//i.test(v.trim());
}

/** Normalize a backend origin (strip trailing slash). */
function normalizeOrigin(v?: string): string {
  const s = (v ?? "").trim();
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

/** Backend used by the dev proxy (same-origin in the browser). */
const DEV_BACKEND = normalizeOrigin(process.env.DEV_BACKEND ?? "http://localhost:8000");

/** Safe, non-breaking security headers (extend later with CSP/COOP/COEP as needed). */
const securityHeaders: Array<{ key: string; value: string }> = [
  { key: "X-Frame-Options", value: "DENY" }, // clickjacking defense
  { key: "X-Content-Type-Options", value: "nosniff" }, // block MIME sniffing
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
  // Enable HSTS only when EVERYTHING (app + assets + API) is HTTPS in prod:
  // { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: {
    // Re-enable lint checks in builds
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Re-enable type checking in builds
    ignoreBuildErrors: false,
  },

  /** Apply conservative security headers across the app. */
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },

  /**
   * Dev proxy: keep browser calls same-origin to avoid CORS.
   *
   * Client (with API_BASE="/api" by default) calls:    /api/api/v1/...
   * This rewrite matches:                              /api/:path*
   * And proxies to:                                    http://localhost:8000/:path*
   * Example: /api/api/v1/user/me → http://localhost:8000/api/v1/user/me
   *
   * If NEXT_PUBLIC_API_BASE_URL is an ABSOLUTE URL → rewrites are disabled (direct mode).
   */
  async rewrites() {
    const publicBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
    const isAbsolute = !!publicBase && /^https?:\/\//i.test(publicBase);
    if (isAbsolute) {
      // Direct mode (cross-origin) → no proxy.
      return [];
    }
    // Dev proxy: mirror the /api/v1/* prefix you use on the backend.
    return [
      {
        source: "/api/v1/:path*",
        destination: `${DEV_BACKEND}/api/v1/:path*`,
      },
    ];
  }

};

export default nextConfig;
