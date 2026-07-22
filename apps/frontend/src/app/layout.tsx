import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/providers/app-providers";
import { LayoutShell } from "@/components/LayoutShell";
import { StructuredData } from "@/components/StructuredData";
import { CinematicPreloader } from "@/components/ui/overlays/CinematicPreloader";
import { AnimationDebug } from "@/components/dev/AnimationDebug";
import { WebVitals } from "@/components/WebVitals";
import { AnalyticsInit } from "@/lib/analytics";
import { inter, jetbrainsMono, playfairDisplay } from "@/lib/fonts";
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
    <html lang="en" dir="ltr" className={`${inter.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.hexastudio.net" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <noscript>
          <style>{`
            .js-only { display: none !important; }
          `}</style>
        </noscript>
        <AppProviders>
          <CinematicPreloader />
          <AnimationDebug />
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
        </AppProviders>
      </body>
    </html>
  );
}
