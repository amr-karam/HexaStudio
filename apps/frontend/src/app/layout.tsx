import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/providers/app-providers";
import { LayoutShell } from "@/components/LayoutShell";
import { StructuredData } from "@/components/StructuredData";
import { CinematicPreloader } from "@/components/ui/overlays/CinematicPreloader";
import { AnimationDebug } from "@/components/dev/AnimationDebug";
import { WebVitals } from "@/components/WebVitals";
import { LivePreview } from "@/components/LivePreview";
import { AnalyticsInit } from "@/lib/analytics";
import { Suspense } from "react";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050508" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "HexaStudio — 3D Architectural Visualization",
    template: "%s | HexaStudio",
  },
  description:
    "Living Spaces. Visualized. Immersive 3D architectural experiences for the world's most ambitious projects.",
  keywords: [
    "architecture",
    "visualization",
    "3D rendering",
    "architectural design",
    "HexaStudio",
  ],
  alternates: {
    canonical: "https://hexastudio.net",
    languages: {
      en: "https://hexastudio.net",
      "x-default": "https://hexastudio.net",
    },
  },
  openGraph: {
    title: "HexaStudio — Living Spaces. Visualized.",
    description:
      "Living Spaces. Visualized. Immersive 3D architectural experiences for the world's most ambitious projects.",
    url: "https://hexastudio.net",
    siteName: "HexaStudio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HexaStudio — Living Spaces. Visualized.",
    description:
      "Living Spaces. Visualized. Immersive 3D architectural experiences for the world's most ambitious projects.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.hexastudio.net" />
        {/* Hero font files — start download immediately, skipping the CSS→font
            discovery waterfall. Latin variable subsets only (Inter = body/hero,
            Playfair Display = headings). JetBrains Mono loads on demand. */}
        {/* eslint-disable @next/next/google-font-preconnect -- false positive: the preconnect to fonts.gstatic.com is present above; the rule does not detect it. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/playfairdisplay/v40/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgA.woff2"
          crossOrigin="anonymous"
        />
        {/* Non-blocking font CSS — preloaded as stylesheet, promoted to
            rel="stylesheet" by the inline script below. Font woff2 files
            are already preloaded above, so fonts render from cache once
            @font-face rules arrive. display=swap keeps text visible in
            fallback fonts during the async fetch. */}
        {/* eslint-disable @next/next/no-page-custom-font -- Pages-Router rule: in App Router the root layout IS the correct global location for font stylesheets (next/font/google is disabled: build machines have no Google Fonts API access). */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Playfair+Display:wght@400..900&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){var l=document.querySelector('link[rel="preload"][as="style"][href*="fonts.googleapis.com"]');if(l){l.onload=function(){l.rel="stylesheet";l.onload=null}}}`,
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Playfair+Display:wght@400..900&display=swap"
          />
        </noscript>
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <noscript>
          <style>{`
            .js-only { display: none !important; }
          `}</style>
        </noscript>
        <AppProviders>
          <CinematicPreloader />
          {process.env.NODE_ENV === 'development' && <AnimationDebug />}
          <StructuredData />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--foreground)] focus:text-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            Skip to content
          </a>
          <LayoutShell>{children}</LayoutShell>
          <Suspense fallback={null}>
            <AnalyticsInit />
          </Suspense>
          <WebVitals />
          <LivePreview />
        </AppProviders>
      </body>
    </html>
  );
}
