'use client';

export type XRSessionMode = 'ar' | 'vr';
export type XRSessionStatus = 'idle' | 'requesting' | 'active' | 'ended' | 'unsupported';

export interface XRStoreState {
  mode: XRSessionMode | null;
  status: XRSessionStatus;
  isSupported: boolean;
  error: string | null;
  modelLoaded: boolean;
  modelProgress: number;
  controllerConnected: boolean;
  handTracking: boolean;
}
