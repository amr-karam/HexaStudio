import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
  analyzerMode: "static" as const,
});

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
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://www.googletagmanager.com https://us.i.posthog.com https://www.gstatic.com https://static.cloudflareinsights.com https://challenges.cloudflare.com https://*.cloudflare.com https://cloudflareinsights.com https://*.posthog.com https://hexastudio.net https://*.hexastudio.net https://storage.hexastudio.net",
  // Styles: Tailwind + Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  // Connect: API + WebSockets + analytics + Sentry + Cloudflare + CDNs (3D/HDR assets)
  // Local origins match default API_BASE_URL (`http://api.localhost`) and Nest on :4000.
  [
    "connect-src 'self'",
    "http://api.localhost ws://api.localhost http://localhost:4000 ws://localhost:4000 http://127.0.0.1:4000 ws://127.0.0.1:4000",
    "https://api.hexastudio.net wss://api.hexastudio.net https://*.hexastudio.net wss://*.hexastudio.net https://fonts.googleapis.com https://fonts.gstatic.com https://www.gstatic.com https://us.i.posthog.com https://us.posthog.com https://*.posthog.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.sentry.io https://cloudflareinsights.com https://challenges.cloudflare.com https://*.cloudflare.com https://storage.hexastudio.net https://*.hexastudio.net data: blob:",
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
  // Standalone output for containerized SSR deployment.
  // Static export (`output: 'export'`) is used for GitHub Pages when
  // GITHUB_PAGES env var is set to "true" by the Actions Pages workflow.
  output:
    process.env.GITHUB_PAGES === "true"
      ? "export"
      : process.env.NEXT_OUTPUT_STANDALONE === "true"
        ? "standalone"
        : undefined,
  trailingSlash: process.env.GITHUB_PAGES === "true" ? true : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@hexastudio/types", "@hexastudio/utils", "@hexastudio/ui"],
  // Remove console.log in production to reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: [
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "lucide-react",
      "framer-motion",
      "clsx",
      "tailwind-merge",
      "sonner",
      "@reduxjs/toolkit",
      "@tanstack/react-query",
      "react-icons",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-slot",
    ],
    scrollRestoration: true,
    // S-019: CSS is served as an external stylesheet — NOT inlined via
    // `inlineCss`/`optimizeCss` (those inlined the full ~180 KB Tailwind sheet into
    // both the <head> <style> and the RSC flight string, bloating initial HTML to
    // ~560 KB). External CSS is still render-blocking (it blocks FCP via the
    // CSSOM), so a `postbuild` step (scripts/inject-preloads.mjs) inlines only the
    // critical above-the-fold CSS (~4-5 KB) and loads the remainder with
    // `media="print" onload=...` so it never blocks first paint — keeping FCP low
    // without reintroducing the inline bloat or FOUC/CLS regressions.
  },
  // S-019 performance budgets
  // - JS per-route/entrypoint budget enforced via webpack performance hints
  // - FCP < 1.6s, LCP < 2.5s, TBT < 200ms (Lighthouse; monitored via Sentry + CWV)
  // - Critical CSS inlined post-build so the 182 KB Tailwind sheet stays non-blocking
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.performance = {
        maxAssetSize: 6 * 1024 * 1024,
        maxEntrypointSize: 6 * 1024 * 1024,
        hints: "warning",
        assetFilter: (assetFilename: string) => {
          return assetFilename.endsWith(".js") || assetFilename.endsWith(".css");
        },
      };
    }
    // Optimization: minimize main-thread work by reducing script parse time
    if (!isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Three.js core — largest 3D payload (~0.7 MB), shared by all WebGL routes
          threejsCore: {
            test: /[\\/]node_modules[\\/](three|three-stdlib|troika-three-text|troika-three-utils)[\\/]/,
            name: 'threejs-core',
            priority: 30,
          },
          // React Three Fiber + Drei — R3F renderer layer
          threejsR3F: {
            test: /[\\/]node_modules[\\/](@react-three\/fiber|@react-three\/drei)[\\/]/,
            name: 'threejs-r3f',
            priority: 25,
          },
          // @react-three/xr — WebXR runtime, only on /xr-viewer and portal review
          threejsXR: {
            test: /[\\/]node_modules[\\/](@react-three\/xr|webxr-layers-polyfill)[\\/]/,
            name: 'threejs-xr',
            priority: 20,
          },
          // @iwer hand-tracking — ~4.6 MB, only needed in VR/AR sessions
          threejsIwer: {
            test: /[\\/]node_modules[\\/]@iwer[\\/]/,
            name: 'threejs-iwer',
            priority: 15,
          },
          // Post-processing / shaders / 3D extras
          threejsExtras: {
            test: /[\\/]node_modules[\\/](postprocessing|n8ao|monogrid|@pmndrs|@bufbuild)[\\/]/,
            name: 'threejs-extras',
            priority: 15,
          },
          // Animation / motion libraries
          animations: {
            test: /[\\/]node_modules[\\/](gsap|framer-motion|lenis|motion)[\\/]/,
            name: 'animations',
            priority: 10,
          },
          // Sentry — separate from app code, loaded asynchronously in prod
          sentry: {
            test: /[\\/]node_modules[\\/](@sentry)[\\/]/,
            name: 'sentry',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
  async headers() {
    return [
      // ISR pages: serve stale HTML at the edge while revalidating in the
      // background. `s-maxage` controls CDN cache; `stale-while-revalidate`
      // lets Cloudflare serve the previous build's HTML instantly while the
      // background ISR regenerates fresh content.  The 86400s (24 h) SWR
      // window covers deploy-time regeneration gaps without showing content
      // older than one day.
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/(projects|blog|about|services|privacy|terms|contact|premium-chat)",
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
      { source: "/work", destination: "/projects", permanent: true },
      { source: "/work/:path*", destination: "/projects/:path*", permanent: true },
    ];
  },
  async rewrites() {
    return [
      // Browsers unconditionally request /favicon.ico regardless of the
      // <link rel="icon"> declaration — serve the SVG icon instead of a 404.
      { source: "/favicon.ico", destination: "/favicon.svg" },
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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
};

export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  {
    silent: true,
    // Source map uploads only run in production CI (requires SENTRY_AUTH_TOKEN).
    // In PR builds or local dev, org/project/auth are undefined so the plugin
    // automatically skips upload — no suppress option needed.
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  }
);
