'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * HeroPlate — non-blocking, visibility-gated mounting shell for the interactive
 * "Architectural Plate" canvas. Renders nothing on the server; after hydration
 * it lazy-loads `HeroPlateCanvas` only when the user does not prefer reduced
 * motion, so the static SVG plate (`NewHomeHeroStatic`) remains the LCP element.
 *
 * @see ADR-019
 */
const HeroPlateCanvas = dynamic(
  () => import('@/features/portfolio/components/HeroPlateCanvas').then((m) => ({ default: m.HeroPlateCanvas })),
  { ssr: false, loading: () => null },
);

export function HeroPlate() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;
  return <HeroPlateCanvas />;
}
