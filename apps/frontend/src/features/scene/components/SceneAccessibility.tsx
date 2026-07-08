'use client';

import React, { useEffect, useRef } from 'react';
import { ProjectHotspot } from '@hexastudio/types';
import { useCameraStore } from '../store/camera-store';

interface SceneAccessibilityProps {
  hotspots?: ProjectHotspot[];
  projectTitle?: string;
}

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
                className="focus:ring-2 focus:ring-accent outline-none"
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