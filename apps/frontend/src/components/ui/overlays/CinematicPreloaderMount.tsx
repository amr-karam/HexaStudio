'use client';

import dynamic from 'next/dynamic';

const CinematicPreloader = dynamic(
  () => import("@/components/ui/overlays/CinematicPreloader").then(m => ({ default: m.CinematicPreloader })),
  { ssr: false },
);

export function CinematicPreloaderMount() {
  return <CinematicPreloader />;
}
