import type { Metadata } from "next";
import { Suspense } from "react";
import { NewHomeHeroSkeleton } from "./_loading/NewHomeHeroSkeleton";
import { HomeClient } from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "HEXA STUDIO — Living Spaces Visualized",
  description:
    "Premium 3D architectural visualization studio. Photoreal, cinematic renders of living spaces that have not yet been built. Silent luxury design system with artisan glassmorphism.",
  alternates: { canonical: "https://hexastudio.net" },
  openGraph: {
    title: "HexaStudio — Living Spaces Visualized",
    description:
      "Premium 3D architectural visualization and spatial intelligence studio. Renders the spaces the world has not yet seen.",
    url: "https://hexastudio.net",
    siteName: "HexaStudio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://hexastudio.net/logo.svg",
        width: 1200,
        height: 630,
        alt: "HexaStudio — Living Spaces Visualized",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HexaStudio — Living Spaces Visualized",
    description:
      "Premium 3D architectural visualization and spatial intelligence studio. Renders the spaces the world has not yet seen.",
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
          first while the multi-MB hero canvas bundle loads in the background. */}
      <Suspense fallback={<NewHomeHeroSkeleton />}>
        <HomeClient />
      </Suspense>
    </div>
  );
}