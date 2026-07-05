'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useCinematicCamera } from '@/features/scene/hooks/useCinematicCamera';
import { useScrollCamera, ScrollPathNode } from '@/features/scene/hooks/useScrollCamera';

/**
 * CameraController manages the camera behavior based on the current page.
 * - Home Page: Uses scroll-linked cinematic path.
 * - Other Pages: Uses target-based transitions via useCinematicCamera.
 */
export const CameraController = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (isHomePage) {
    // Define the cinematic scroll path for the Home Hero
    const heroPath: ScrollPathNode[] = [
      { position: [8, 6, 8], lookAt: [0, 1, 0] },   // Start: Wide shot
      { position: [5, 4, 5], lookAt: [0, 1.2, 0] }, // Mid: Moving closer
      { position: [3, 2, 3], lookAt: [0, 1.5, 0] }, // Close: Focusing on detail
      { position: [0, 1, 5], lookAt: [0, 1, 0] },   // End: Frontal view
    ];
    useScrollCamera(heroPath);
  } else {
    useCinematicCamera();
  }

  return null;
};
