'use client';

import { ExperienceCanvas, ExperienceCanvasProps } from './ExperienceCanvas';

/**
 * SceneCanvas delegates to ExperienceCanvas.
 * This is the lazy-loaded entry point for the 3D scene (SSR disabled).
 */
export default function SceneCanvas(props: ExperienceCanvasProps) {
  return <ExperienceCanvas {...props} />;
}
