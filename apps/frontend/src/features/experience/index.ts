/**
 * The Living Blueprint experience layer (ADR-008, sprints S-015 → S-018).
 *
 * S-015 exposes the hero scene only. The persistent stage arrives in S-016.
 */
import { createDynamicComponent } from '@/lib/dynamic-component';

export const LazyBlueprintHero = createDynamicComponent(
  () => import('./components/BlueprintHeroScene'),
  { ssr: false },
);

export {
  HERO_VORTEX,
  ARCHITECTURE_GRID,
  TRANSITION_DISSOLVE,
  SPLINE_SETS,
  getSplineSet,
  morphSplineFields,
  morph,
  nearestSegment,
  getNearestPoint,
} from './engine/SplineField';

export type {
  SplineFieldData,
  SplineDef,
  BakedSplineField,
  SplineSetName,
  NearestSplinePoint,
} from './engine/SplineField';

export {
  ParticleSimulation,
  createParticleSimulation,
  TEXTURE_SIZE,
} from './engine/ParticleSimulation';

export type {
  ParticleSimulationHandle,
  SimulationParams,
  RenderParams,
} from './engine/ParticleSimulation';

export { DEFAULT_SIM_PARAMS } from './engine/ParticleSimulation';

export { ForceField } from './engine/ForceField';
export type { ForceFieldConfig } from './engine/ForceField';
