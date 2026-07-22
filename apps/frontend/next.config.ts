import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

/**
 * Content-Security-Policy (Sprint 15 P7).
 *
 * Notes:
 * - `script-src 'unsafe-inline'` is required by Next.js hydration payloads
 *   (`self.__next_f`) and the JSON-LD structured-data script. A nonce-based
 *   strict-dynamic policy requires middleware nonce plumbing and is tracked
 *   as a future hardening item.
 * - `'wasm-unsafe-eval'` allows the Draco WASM mesh decoder (gstatic CDN).
 * - `worker-src blob:` covers Draco decoder workers and Sentry Replay.
 * - Socket.IO reaches api.hexastudio.net over both https (polling) and wss.
 */
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://www.googletagmanager.com https://us.i.posthog.com https://www.gstatic.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  [
    "connect-src 'self'",
    "https://api.hexastudio.net wss://api.hexastudio.net",
    "https://fonts.googleapis.com https://fonts.gstatic.com https://www.gstatic.com",
    "https://us.i.posthog.com https://us.posthog.com https://*.posthog.com",
    "https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com",
    "https://*.sentry.io", "https://cloudflareinsights.com",
  ].join(" "),
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), xr-spatial-tracking=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@hexastudio/types", "@hexastudio/utils", "@hexastudio/ui"],
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei", "gsap"],
    // Inline page CSS directly into the HTML — removes the render-blocking
    // stylesheet request from the critical path (FCP). HTML is served
    // no-store through Cloudflare, so separate CSS caching buys little here.
    inlineCss: true,
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/portfolio", destination: "/projects", permanent: true },
      { source: "/portfolio/:path*", destination: "/projects/:path*", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "storage.hexastudio.net",
      },
      {
        protocol: "https",
        hostname: "*.hexastudio.net",
      },
      {
        protocol: "https",
        hostname: "minio.*",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
