import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@hexastudio/types", "@hexastudio/utils", "@hexastudio/ui"],
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei", "gsap"],
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
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
