import { createDynamicComponent } from '@/lib/dynamic-component';
import type { ExperienceCanvasProps } from './components/ExperienceCanvas';

export const LazySceneCanvas = createDynamicComponent<ExperienceCanvasProps>(
  () => import('./components/ExperienceCanvas').then((mod) => ({ default: mod.ExperienceCanvas })),
  { ssr: false },
);

export { SceneErrorBoundary } from './components/SceneErrorBoundary';

export type { SceneViewState } from '@/types';
