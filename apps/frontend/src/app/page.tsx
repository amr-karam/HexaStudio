import type { Metadata } from "next";
import { NewHomeHero } from "@/features/portfolio/components/NewHomeHero";
import { NewHomeSections } from "@/features/portfolio/components/NewHomeSections";
import { HomeChapterRail } from "@/features/portfolio/components/HomeChapterRail";

export const metadata: Metadata = {
  title: "HEXA STUDIO — Architectural Visualization",
  description:
    "Premium 3D architectural visualization and spatial intelligence studio. Immersive renders, real-time WebGL experiences, and cinematic walkthroughs for ambitious projects.",
  openGraph: {
    title: "HexaStudio — Architectural Visualization Studio",
    description:
      "Immersive 3D architectural experiences and spatial intelligence for ambitious projects worldwide.",
    type: "website",
    url: "https://hexastudio.net",
    siteName: "HexaStudio",
    locale: "en_US",
    images: [
      {
        url: "https://hexastudio.net/logo.svg",
        width: 1200,
        height: 630,
        alt: "HexaStudio — Architectural Visualization Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HexaStudio — Architectural Visualization Studio",
    description:
      "Immersive 3D architectural experiences and spatial intelligence for ambitious projects worldwide.",
    images: ["https://hexastudio.net/logo.svg"],
    creator: "@hexastudio",
  },
};

export default async function HomePage() {
  return (
    <div className="bg-sl-void text-sl-alabaster">
      {/* CH. I — VISION (new single-canvas architectural plate hero) */}
      <NewHomeHero />

      {/* Below-the-fold sections (client-only hydration) */}
      <NewHomeSections />

      {/* Chapter navigation rail */}
      <HomeChapterRail />
    </div>
  );
}
