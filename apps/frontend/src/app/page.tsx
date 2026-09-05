import type { Metadata } from "next";
import dynamic from "next/dynamic";

// Lazy-load the heavy canvas hero (RAF loop + Framer Motion) and the
// below-the-fold section blocks. The hero chunk (Three.js + R3F + Framer
// Motion) is several MB — deferring it to after idle keeps the critical
// rendering path lean and lets the page reach TTI faster.
const NewHomeHero = dynamic(
  () => import("@/features/portfolio/components/NewHomeHero"),
  { ssr: false, loading: () => <NewHomeHeroSkeleton /> },
);
const NewHomeSectionsDyn = dynamic(
  () => import("@/features/portfolio/components/NewHomeSections").then((m) => m.NewHomeSections),
  { ssr: false },
);
const HomeChapterRailDyn = dynamic(
  () => import("@/features/portfolio/components/HomeChapterRail").then((m) => m.HomeChapterRail),
  { ssr: false },
);

/** Skeleton shown while the canvas hero hydrates. */
function NewHomeHeroSkeleton() {
  return (
    <section
      aria-label="Loading"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-sl-void"
    >
      <div className="font-serif text-3xl font-light text-sl-gold-subtle/60">
        Loading…
      </div>
    </section>
  );
}

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
      {/* CH. I — VISION (new single-canvas architectural plate hero) */}{" "}
      <NewHomeHero />

      {/* Below-the-fold sections (client-only hydration, lazy-loaded) */}{" "}
      <NewHomeSectionsDyn />

      {/* Chapter navigation rail (lazy-loaded) */}{" "}
      <HomeChapterRailDyn />
    </div>
  );
}
