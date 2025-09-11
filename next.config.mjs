/**
 * Next.js config
 * - Proxies API requests during development to your backend to avoid CORS.
 * - Reads `NEXT_PUBLIC_API_BASE_URL` (default: "/api/v1").
 * - Set `API_PROXY_TARGET` to your backend origin, e.g. "http://localhost:8000".
 *
 * Examples:
 *   # .env.local
 *   NEXT_PUBLIC_API_BASE_URL=/api/v1
 *   API_PROXY_TARGET=http://localhost:8000
 */

const isAbsoluteHttp = (v) => /^https?:\/\//i.test(v || "");
const stripTrailing = (s) => (s || "").replace(/\/+$/, "");
const stripLeading = (s) => (s || "").replace(/^\/+/, "");

// Conservative security headers (extend with CSP/HSTS when ready for prod-only HTTPS)
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
    // If API base is absolute, client will call cross-origin directly; no rewrite.
    if (isAbsoluteHttp(apiBase)) return [];

    // Otherwise proxy same-origin paths to your backend origin in dev.
    const devBackend = process.env.DEV_BACKEND; // legacy env name support
    const target = stripTrailing(devBackend || process.env.API_PROXY_TARGET || "http://localhost:8000");
    const base = `/${stripLeading(apiBase)}`; // ensure leading slash

    return [
      {
        source: `${base}/:path*`,
        destination: `${target}${base}/:path*`,
      },
    ];
  },

  async headers() {
    return [
      // Global conservative security headers
      { source: "/(.*)", headers: securityHeaders },
      // Helpful no-store hints on auth pages (client also sets no-store per request)
      { source: "/login", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/signup", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/verify-email", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
