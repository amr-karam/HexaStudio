import { createDynamicComponent } from '@/lib/dynamic-component';

export const LazySceneCanvas = createDynamicComponent(
  () => import('./components/SceneCanvas'),
  { ssr: false },
);

export { ExperienceCanvas } from './components/ExperienceCanvas';
export { SceneErrorBoundary } from './components/SceneErrorBoundary';

export type { SceneViewState } from '@/types';
