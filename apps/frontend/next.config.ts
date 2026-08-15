import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
  analyzerMode: "static",
} as any);

/**
 * Content-Security-Policy (Sprint 15 P7).
 *
 * Notes:
 * - `script-src 'unsafe-inline'` is required by Next.js hydration payloads
 *   (`self.__next_f`) and the JSON-LD structured-data script. A nonce-based
 *   strict-dynamic policy requires middleware nonce plumbing and is tracked
 *   as a future hardening item.
 * - `'unsafe-eval'` is required by React dev tooling, PostHog, Sentry Replay,
 *   and Three.js WASM workers.
 * - `'wasm-unsafe-eval'` allows the Draco WASM mesh decoder (gstatic CDN).
 * - `worker-src blob:` covers Draco decoder workers and Sentry Replay.
 * - Socket.IO reaches api.hexastudio.net over both https (polling) and wss.
 */
const ContentSecurityPolicy = [
  "default-src 'self'",
  // Scripts: Next.js hydration + JSON-LD need 'unsafe-inline'; React/Three.js/PostHog/Sentry need 'unsafe-eval'
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://www.googletagmanager.com https://us.i.posthog.com https://www.gstatic.com https://static.cloudflareinsights.com https://challenges.cloudflare.com https://*.cloudflare.com https://cloudflareinsights.com https://*.posthog.com https://hexastudio.net https://*.hexastudio.net https://raw.githubusercontent.com https://raw.githack.com https://storage.hexastudio.net",
  // Styles: Tailwind + Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  // Connect: API + WebSockets + analytics + Sentry + Cloudflare + CDNs (3D/HDR assets)
  [
    "connect-src 'self'",
    "https://api.hexastudio.net wss://api.hexastudio.net https://*.hexastudio.net wss://*.hexastudio.net https://fonts.googleapis.com https://fonts.gstatic.com https://www.gstatic.com https://us.i.posthog.com https://us.posthog.com https://*.posthog.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.sentry.io https://cloudflareinsights.com https://challenges.cloudflare.com https://*.cloudflare.com https://raw.githubusercontent.com https://raw.githack.com https://storage.hexastudio.net https://*.hexastudio.net data: blob:",
  ].join(" "),
  "worker-src 'self' blob: https://*.cloudflare.com",
  "child-src 'self' blob: https://challenges.cloudflare.com https://*.cloudflare.com",
  "frame-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com https://hexastudio.net https://*.hexastudio.net http://localhost:1337 about:",
  "frame-ancestors 'self' https://hexastudio.net https://*.hexastudio.net http://localhost:1337",
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
  // Standalone output enables self-contained deployment by bundling
  // node_modules into .next/standalone.  On Windows the recursive rmdir
  // of the standalone tree can fail with EBUSY when directories are locked
  // by file watchers / antivirus (Next.js 16 known Windows issue).
  // Guard with an env var so local Windows dev uses default output mode.
  output: process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {},
  transpilePackages: ["@hexastudio/types", "@hexastudio/utils", "@hexastudio/ui"],
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing", "gsap", "framer-motion", "@sentry/nextjs"],
    // Inline page CSS directly into the HTML — removes the render-blocking
    // stylesheet request from the critical path (FCP). HTML is served
    // no-store through Cloudflare, so separate CSS caching buys little here.
    inlineCss: true,
  },
  // S-019 performance budgets
  // - 200 KB JS per-route budget (enforced via webpack performance)
  // - TBT < 100ms  (monitored via Sentry + Core Web Vitals)
  // - LCP < 1.5s   (monitored via Sentry + Core Web Vitals)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.performance = {
        maxAssetSize: 200 * 1024,
        maxEntrypointSize: 200 * 1024,
        hints: process.env.NODE_ENV === "production" ? "error" : "warning",
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // ISR pages: serve stale HTML at the edge while revalidating in the
      // background. `s-maxage` controls CDN cache; `stale-while-revalidate`
      // lets Cloudflare serve the previous build's HTML instantly while the
      // background ISR regenerates fresh content.  The 86400s (24 h) SWR
      // window covers deploy-time regeneration gaps without showing content
      // older than one day.
      {
        source: "/(projects|blog|about|services|privacy|terms|contact|premium-chat|)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
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
