import { createDynamicComponent } from '@/lib/dynamic-component';
import type { ExperienceCanvasProps } from './components/ExperienceCanvas';

export const LazySceneCanvas = createDynamicComponent<ExperienceCanvasProps>(
  () => import('./components/ExperienceCanvas').then((mod) => ({ default: mod.ExperienceCanvas })),
  { ssr: false },
);

export { SceneErrorBoundary } from './components/SceneErrorBoundary';
export { DesignerModeConfigurator } from './components/DesignerModeConfigurator';
export { useDesignerStore } from './store/designer-store';
export { SpatialLayerToggle } from './components/SpatialLayerToggle';
export { useLayerStore } from './store/layer-store';

export type { SceneViewState } from '@/types';
