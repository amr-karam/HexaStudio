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

export { HERO_VORTEX } from './engine/SplineField';
export type { SplineFieldData } from './engine/SplineField';
