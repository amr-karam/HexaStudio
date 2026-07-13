import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@hexastudio/types", "@hexastudio/utils", "@hexastudio/ui"],
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei", "gsap"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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

export default nextConfig;
