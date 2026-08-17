import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/providers/app-providers";
import { LayoutShell } from "@/components/LayoutShell";
import { StructuredData } from "@/components/StructuredData";
import { CinematicPreloader } from "@/components/ui/overlays/CinematicPreloader";
import { WebVitals } from "@/components/WebVitals";
import { LivePreview } from "@/components/LivePreview";
import { AnalyticsInit } from "@/lib/analytics";
import { Suspense } from "react";
import "./globals.css";
import { AnimationDebugLoader } from "@/components/dev/AnimationDebugLoader";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050508" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "HexaStudio — 3D Architectural Visualization & Spatial Intelligence",
    template: "%s | HexaStudio",
  },
  description:
    "HexaStudio. Living Spaces. Visualized. Immersive 3D architectural experiences and spatial intelligence for ambitious projects.",
  keywords: [
    "HexaStudio",
    "architecture",
    "visualization",
    "3D rendering",
    "spatial intelligence",
    "design studio",
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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="preconnect" href="https://api.hexastudio.net" />
        <link rel="dns-prefetch" href="//api.hexastudio.net" />
        {/* Analytics / monitoring origins (scripts are injected on idle) */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preconnect" href="https://us.i.posthog.com" />
        <link rel="dns-prefetch" href="//us.i.posthog.com" />
        {/* Hero font files — start download immediately, skipping the CSS→font
            discovery waterfall. Latin variable subsets only (Inter = body/hero,
            Playfair Display = headings, Cormorant Garamond = Silent Luxury
            headings incl. italic, Jost = Silent Luxury body). JetBrains Mono
            loads on demand. */}
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
        {/* Cormorant Garamond — Silent Luxury heading font (normal + italic latin
            subsets; italic is used by the hero headline accent word). */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/cormorantgaramond/v21/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSo.woff2"
          crossOrigin="anonymous"
        />
        {/* Jost — Silent Luxury body font (latin subset). */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/jost/v20/92zatBhPNqw73oTd4g.woff2"
          crossOrigin="anonymous"
        />
        {/* Non-blocking font CSS — preloaded as stylesheet and promoted to
            rel="stylesheet" on load so it never blocks rendering. Font woff2
            files are already preloaded above, so fonts render from cache once
            @font-face rules arrive. display=swap keeps text visible in fallback
            fonts during the async fetch. */}
        {/* eslint-disable @next/next/no-page-custom-font -- Pages-Router rule: in App Router the root layout IS the correct global location for font stylesheets (next/font/google is disabled: build machines have no Google Fonts API access). */}
        {/* Non-blocking font CSS — load the css2 stylesheet as a print
            stylesheet (non-blocking for screen), then promote it to media="all"
            via an inline script. display=swap keeps text visible in fallback
            fonts. The woff2 preloads above start font downloads immediately,
            so no separate <link rel="preload" as="style"> is needed: the print
            stylesheet fetch starts on HTML parse and the browser coalesces it
            with the flight-payload head link. */}
        <link
          rel="stylesheet"
          media="print"
          id="gf-css"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Playfair+Display:wght@400..900&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Jost:wght@200..500&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: "document.getElementById('gf-css').media='all';",
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <noscript>
          <style>{`
            .js-only { display: none !important; }
          `}</style>
        </noscript>
        <AppProviders>
          <CinematicPreloader />
          {process.env.NODE_ENV === 'development' && <AnimationDebugLoader />}
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
