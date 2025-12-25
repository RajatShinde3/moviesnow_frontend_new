/**
 * =============================================================================
 * Next.js Configuration — MoviesNow OTT Platform (Enterprise-Grade)
 * =============================================================================
 *
 * Production-ready configuration with:
 * - API proxy for development (avoids CORS issues)
 * - Comprehensive security headers (OWASP best practices)
 * - Performance optimizations (image CDN, bundle analysis)
 * - PWA support configuration
 * - Caching strategies for static assets
 *
 * Environment Variables:
 *   NEXT_PUBLIC_API_BASE_URL  - API base path (default: "/api/v1")
 *   API_PROXY_TARGET          - Backend URL for dev proxy (default: "http://localhost:8000")
 *   NEXT_PUBLIC_CDN_URL       - CDN URL for static assets (optional)
 *   ANALYZE                   - Enable bundle analyzer (set to "true")
 */

const isProduction = process.env.NODE_ENV === "production";
const isAbsoluteHttp = (v) => /^https?:\/\//i.test(v || "");
const stripTrailing = (s) => (s || "").replace(/\/+$/, "");
const stripLeading = (s) => (s || "").replace(/^\/+/, "");

// ─────────────────────────────────────────────────────────────
// Security Headers (OWASP Best Practices)
// ─────────────────────────────────────────────────────────────
const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser features
  {
    key: "Permissions-Policy",
    value: "accelerometer=(), autoplay=(self), camera=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(self), fullscreen=(self), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(self), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), xr-spatial-tracking=()"
  },
  // Disable DNS prefetching for privacy
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // XSS Protection (legacy browsers)
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

// Production-only headers (HTTPS required)
const productionSecurityHeaders = [
  ...securityHeaders,
  // HSTS - Force HTTPS (2 years, include subdomains, preload eligible)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  },
];

// Cache headers for different asset types
const cacheHeaders = {
  // Static assets with content hash - cache for 1 year
  immutable: [
    { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
  ],
  // Static pages - cache for 1 hour, revalidate
  static: [
    { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
  ],
  // Dynamic/auth pages - no caching
  noStore: [
    { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
    { key: "Pragma", value: "no-cache" },
    { key: "Expires", value: "0" },
  ],
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─────────────────────────────────────────────────────────────
  // Core Configuration
  // ─────────────────────────────────────────────────────────────
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header for security

  // ─────────────────────────────────────────────────────────────
  // Image Optimization (for movie posters, thumbnails)
  // ─────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ─────────────────────────────────────────────────────────────
  // Compression & Performance
  // ─────────────────────────────────────────────────────────────
  compress: true,

  // ─────────────────────────────────────────────────────────────
  // Experimental Features (stable for Next.js 15)
  // ─────────────────────────────────────────────────────────────
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // API Rewrites (Development Proxy)
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // Security & Caching Headers
  // ─────────────────────────────────────────────────────────────
  async headers() {
    const headers = isProduction ? productionSecurityHeaders : securityHeaders;

    return [
      // Global security headers
      { source: "/(.*)", headers },

      // Static assets with content hash - immutable caching
      {
        source: "/_next/static/:path*",
        headers: cacheHeaders.immutable,
      },

      // Public static files
      {
        source: "/static/:path*",
        headers: cacheHeaders.immutable,
      },

      // Fonts
      {
        source: "/fonts/:path*",
        headers: cacheHeaders.immutable,
      },

      // Auth-related pages - never cache
      { source: "/login", headers: cacheHeaders.noStore },
      { source: "/signup", headers: cacheHeaders.noStore },
      { source: "/verify-email", headers: cacheHeaders.noStore },
      { source: "/reset/:path*", headers: cacheHeaders.noStore },
      { source: "/mfa/:path*", headers: cacheHeaders.noStore },
      { source: "/settings/:path*", headers: cacheHeaders.noStore },
      { source: "/admin/:path*", headers: cacheHeaders.noStore },

      // Service worker and manifest
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/site.webmanifest",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
    ];
  },

  // ─────────────────────────────────────────────────────────────
  // Redirects (SEO & Legacy URL handling)
  // ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect trailing slashes
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
    ];
  },

  // ─────────────────────────────────────────────────────────────
  // Webpack Configuration
  // ─────────────────────────────────────────────────────────────
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
