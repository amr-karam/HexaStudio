import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { Navbar } from "@/components/ui/nav/Navbar";
import { Footer } from "@/components/ui/Footer";
import { StructuredData } from "@/components/StructuredData";
import { PageTransition } from "@/components/PageTransition";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { BackToTop } from "@/components/BackToTop";
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

export const metadata: Metadata = {
  title: {
    default: "HexaStudio — 3D Architectural Visualization",
    template: "%s | HexaStudio",
  },
  description:
    "HexaStudio blends technical precision with cinematic storytelling, creating immersive 3D architectural experiences for the world's most ambitious projects.",
  keywords: [
    "architecture",
    "visualization",
    "3D rendering",
    "architectural design",
    "HexaStudio",
  ],
  openGraph: {
    title: "HexaStudio — 3D Architectural Visualization",
    description:
      "Blending technical precision with cinematic storytelling for immersive 3D architectural experiences.",
    url: "https://hexastudio.net",
    siteName: "HexaStudio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HexaStudio — 3D Architectural Visualization",
    description:
      "Blending technical precision with cinematic storytelling for immersive 3D architectural experiences.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>
          <StructuredData />
          <CustomCursor />
          <SmoothScroll>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--foreground)] focus:text-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              Skip to content
            </a>
            <Navbar />
            <PageTransition>
              <main id="main-content">{children}</main>
            </PageTransition>
            <Footer />
          </SmoothScroll>
          <BackToTop />
        </AppProviders>
      </body>
    </html>
  );
}
