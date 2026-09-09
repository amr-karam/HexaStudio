"use client";

import dynamic from "next/dynamic";

/**
 * S-023 deferral: CinematicPreloader is a client island (uses Framer Motion).
 *
 * This wrapper dynamically imports the preloader with ssr: false so its
 * Framer Motion bundle is deferred until after critical paint, keeping
 * LCP and TBT low on non-hero pages.
 */
const CinematicPreloader = dynamic(
  () =>
    import("@/components/ui/overlays/CinematicPreloader").then((m) => ({
      default: m.CinematicPreloader,
    })),
  { ssr: false },
);

export function LazyCinematicPreloader() {
  return <CinematicPreloader />;
}
