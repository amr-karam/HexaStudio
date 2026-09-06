import type { Metadata } from "next";
import { Suspense } from "react";
import { NewHomeHeroSkeleton } from "./_loading/NewHomeHeroSkeleton";
import { HomeClient } from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "HEXA STUDIO — Architectural Visualization",
  description:
    "Premium 3D architectural visualization and spatial intelligence studio. Immersive renders, real-time WebGL experiences, and cinematic walkthroughs for ambitious projects.",
  alternates: { canonical: "https://hexastudio.net" },
  openGraph: {
    title: "HexaStudio — Architectural Visualization Studio",
    description:
      "Immersive 3D architectural experiences and spatial intelligence for ambitious projects worldwide.",
    url: "https://hexastudio.net",
    siteName: "HexaStudio",
    locale: "en_US",
    type: "website",
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
      {/* The heavy interactive layers (canvas hero, sections, rail) are
          code-split into a Client Component. Suspense renders the skeleton
          fallback during SSR/streaming, so the browser gets paintable HTML
          first while the multi-MB hero bundle loads in the background. */}
      <Suspense fallback={<NewHomeHeroSkeleton />}>
        <HomeClient />
      </Suspense>
    </div>
  );
}
