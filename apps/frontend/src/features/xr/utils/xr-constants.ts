'use client';

export type XRSessionMode = 'ar' | 'vr';
export type XRSessionStatus = 'idle' | 'requesting' | 'active' | 'ended' | 'unsupported';
export type ARPlacementPhase = 'idle' | 'placing' | 'placed' | 'adjusting';

export interface XRStoreState {
  mode: XRSessionMode | null;
  status: XRSessionStatus;
  isSupported: boolean;
  error: string | null;
  modelLoaded: boolean;
  modelProgress: number;
  controllerConnected: boolean;
  handTracking: boolean;
  placementPhase: ARPlacementPhase;
  placementPosition: { x: number; y: number; z: number } | null;
  placementRotation: { x: number; y: number; z: number; w: number } | null;
}
