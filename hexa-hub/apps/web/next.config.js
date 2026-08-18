/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hexa-hub/types', 'recharts', 'react-smooth', 'react-redux', '@reduxjs/toolkit'],
  // ─── Image Optimization — explicit allowlist, no wildcards ───
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.hexastudio.net',
      },
      {
        protocol: 'https',
        hostname: 'hexastudio.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.hexastudio.net',
      },
      {
        protocol: 'https',
        hostname: 'sentry.io',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  // ─── Security Headers ────────────────────────────────────────────────────
  async headers() {
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' https://*.sentry.io https://*.hexastudio.net https://hexastudio.net https://challenges.cloudflare.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https: wss:",
          "media-src 'self' blob: https:",
          "connect-src 'self' https://api.hexastudio.net https://*.hexastudio.net https://*.sentry.io https://cloudflareinsights.com https://challenges.cloudflare.com https://*.cloudflare.com wss://api.hexastudio.net",
          "worker-src 'self' blob: https://*.cloudflare.com",
          "frame-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com https://hexastudio.net https://*.hexastudio.net",
          "frame-ancestors 'self' https://hexastudio.net https://*.hexastudio.net",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), xr-spatial-tracking=(self)',
      },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // ─── Redirects ───────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/app/web',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

module.exports = withBundleAnalyzer(nextConfig);
