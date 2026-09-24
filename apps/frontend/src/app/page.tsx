import type { Metadata } from "next";
import { Suspense } from "react";
import NewHomeHeroStatic from "@/components/NewHomeHeroStatic";
import { HomeClient } from "@/components/HomeClient";
import { AppProviders } from "@/providers/app-providers";

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
      {/* SSR hero: the headline, type stack, and the gold "Architectural Plate"
          render immediately in the HTML (LCP-critical), with zero JS. The
          real-time canvas mounts later as a non-blocking enhancement. */}
      <NewHomeHeroStatic />

      {/* Below-fold interactive layers are code-split into a Client Component
          and streamed in after first paint. */}
      <Suspense fallback={null}>
        <AppProviders>
          <HomeClient />
        </AppProviders>
      </Suspense>
    </div>
  );
}
