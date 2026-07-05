'use client';

import React from 'react';
import { ProjectHotspot } from '@hexastudio/types';
import { useCameraStore } from '../store/camera-store';

interface SceneAccessibilityProps {
  hotspots?: ProjectHotspot[];
}

/**
 * SceneAccessibility provides a semantic DOM parallel to the 3D scene.
 * This ensures that screen readers and keyboard users can navigate 
 * the 3D experience without needing a mouse.
 */
export const SceneAccessibility = ({ hotspots = [] }: SceneAccessibilityProps) => {
  const { setTarget } = useCameraStore();

  return (
    <div className="sr-only">
      <nav aria-label="3D Scene Navigation">
        <ul className="flex flex-col gap-4">
          {hotspots.map((hotspot) => (
            <li key={hotspot.id}>
              <button
                onClick={() => setTarget(hotspot.id)}
                className="focus:ring-2 focus:ring-accent outline-none"
                aria-label={`Explore ${hotspot.title}: ${hotspot.description}`}
              >
                {hotspot.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
