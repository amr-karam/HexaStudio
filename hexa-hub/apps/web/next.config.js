/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hexa-hub/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          // Scripts: Next.js hydration payloads (self.__next_f) and JSON-LD require 'unsafe-inline'.
          // Nonce-based strict-dynamic is a future hardening item.
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io https://*.hexastudio.net https://hexastudio.net",
          // Styles: Tailwind + Google Fonts
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https: https://*.hexastudio.net https://hexastudio.net",
          "media-src 'self' blob: https:",
          // Connect: API + analytics + Sentry + Cloudflare
          "connect-src 'self' https://api.hexastudio.net https://*.hexastudio.net https://*.sentry.io https://cloudflareinsights.com https://challenges.cloudflare.com https://*.cloudflare.com wss://api.hexastudio.net ws://localhost:3000 http://localhost:3000",
          "worker-src 'self' blob: https://*.cloudflare.com",
          "frame-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com https://hexastudio.net https://*.hexastudio.net",
          "frame-ancestors 'self' https://hexastudio.net https://*.hexastudio.net",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), xr-spatial-tracking=(self)',
      },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
