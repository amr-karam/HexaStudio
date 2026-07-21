'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useCinematicCamera } from '@/features/scene/hooks/useCinematicCamera';
import { useScrollCamera, ScrollPathNode } from '@/features/scene/hooks/useScrollCamera';

/**
 * Stable scroll path defined at module scope to avoid re-creating on every render.
 * This prevents effect re-registration overhead.
 */
const HERO_PATH: ScrollPathNode[] = [
  { position: [8, 6, 8], lookAt: [0, 1, 0] },   // Start: Wide shot
  { position: [5, 4, 5], lookAt: [0, 1.2, 0] }, // Mid: Moving closer
  { position: [3, 2, 3], lookAt: [0, 1.5, 0] }, // Close: Focusing on detail
  { position: [0, 1, 5], lookAt: [0, 1, 0] },   // End: Frontal view
];

/**
 * CameraController manages the camera behavior based on the current page.
 * - Home Page: Uses scroll-linked cinematic path.
 * - Other Pages: Uses target-based transitions via useCinematicCamera.
 *
 * IMPORTANT: Both hooks are ALWAYS called to satisfy React Rules of Hooks.
 * An `enabled` flag gates their internal behaviour instead of conditionally
 * invoking them.  This prevents a runtime crash if `pathname` changes while
 * the component tree is mounted.
 */
export const CameraController = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const heroPath = useMemo(() => HERO_PATH, []);

  // Always call both hooks — enabled flag controls activation.
  useScrollCamera(heroPath, { enabled: isHomePage });
  useCinematicCamera(!isHomePage);

  return null;
};
