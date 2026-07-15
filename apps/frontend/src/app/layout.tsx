import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { Navbar } from "@/components/ui/nav/Navbar";
import { Footer } from "@/components/ui/Footer";
import { StructuredData } from "@/components/StructuredData";
import { PageTransition } from "@/components/PageTransition";
import { SmoothScrollWrapper } from "@/components/SmoothScrollWrapper";
import { CustomCursor } from "@/components/CustomCursor";
import { BackToTop } from "@/components/BackToTop";
import { CinematicPreloader } from "@/components/ui/overlays/CinematicPreloader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050508" },
  ],
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>
          <CinematicPreloader />
          <StructuredData />
          <CustomCursor />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--foreground)] focus:text-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            Skip to content
          </a>
          <SmoothScrollWrapper>
            <Navbar />
            <PageTransition>
              <main id="main-content" tabIndex={-1}>{children}</main>
            </PageTransition>
            <Footer />
          </SmoothScrollWrapper>
          <BackToTop />
        </AppProviders>
      </body>
    </html>
  );
}
