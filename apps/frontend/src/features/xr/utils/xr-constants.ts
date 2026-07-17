'use client';

export type XRSessionMode = 'ar' | 'vr';
export type XRSessionStatus = 'idle' | 'requesting' | 'active' | 'ended' | 'unsupported';
export type ARPlacementPhase = 'idle' | 'placing' | 'placed' | 'adjusting';

export interface Collaborator {
  id: string;
  user: string;
  mode: 'ar' | 'vr';
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number; w: number };
  lastSeen: number;
}

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
  collaborators: Record<string, Collaborator>;
  collabConnected: boolean;
}
