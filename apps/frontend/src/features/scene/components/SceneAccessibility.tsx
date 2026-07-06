'use client';

import React, { useEffect, useRef } from 'react';
import { ProjectHotspot } from '@hexastudio/types';
import { useCameraStore } from '../store/camera-store';

interface SceneAccessibilityProps {
  hotspots?: ProjectHotspot[];
  projectTitle?: string;
}

/**
 * SceneAccessibility provides a semantic DOM parallel to the 3D scene.
 * This ensures that screen readers and keyboard users can navigate 
 * the 3D experience without needing a mouse.
 */
export const SceneAccessibility = ({ hotspots = [], projectTitle }: SceneAccessibilityProps) => {
  const { setTarget, currentTarget } = useCameraStore();
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentTarget && announcementRef.current) {
      const hotspot = hotspots.find(h => h.id === currentTarget);
      if (hotspot) {
        announcementRef.current.textContent = `Viewing ${hotspot.title}: ${hotspot.description}`;
      }
    }
  }, [currentTarget, hotspots]);

  const handleHotspotActivate = (hotspotId: string) => {
    setTarget(hotspotId);
  };

  return (
    <>
      <div className="sr-only" role="region" aria-label="3D Scene Viewer">
        <h2 id="scene-description" className="sr-only">
          Interactive 3D architectural visualization of {projectTitle || 'project'}
        </h2>
        <p className="sr-only" aria-live="polite" ref={announcementRef} />
        
        <nav aria-label="3D Scene Navigation" aria-describedby="scene-description">
          <h3 className="sr-only">Navigation Points</h3>
          <ul className="flex flex-col gap-4" role="list">
            {hotspots.map((hotspot) => (
              <li key={hotspot.id}>
                <button
                  onClick={() => handleHotspotActivate(hotspot.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleHotspotActivate(hotspot.id);
                    }
                  }}
                  className="focus:ring-2 focus:ring-accent outline-none p-2 text-left"
                  aria-label={`View ${hotspot.title}. ${hotspot.description}`}
                  aria-current={currentTarget === hotspot.id ? 'true' : undefined}
                  tabIndex={0}
                >
                  <span className="font-medium">{hotspot.title}</span>
                  <span className="block text-sm opacity-70">{hotspot.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sr-only mt-4" role="note">
          <p>Use Tab to navigate between viewpoints, Enter or Space to activate.</p>
          <p>Current view: {hotspots.find(h => h.id === currentTarget)?.title || 'Default view'}</p>
        </div>
      </div>

      <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--foreground)] focus:text-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
        Skip to main content
      </div>
    </>
  );
};
