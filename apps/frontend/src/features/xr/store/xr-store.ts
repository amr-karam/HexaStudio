'use client';

import { create } from 'zustand';
import { XRSessionMode, XRSessionStatus, ARPlacementPhase, XRStoreState } from '../utils/xr-constants';

interface XRActions {
  setMode: (mode: XRSessionMode | null) => void;
  setStatus: (status: XRSessionStatus) => void;
  setSupported: (supported: boolean) => void;
  setError: (error: string | null) => void;
  setModelLoaded: (loaded: boolean) => void;
  setModelProgress: (progress: number) => void;
  setControllerConnected: (connected: boolean) => void;
  setHandTracking: (enabled: boolean) => void;
  setPlacementPhase: (phase: ARPlacementPhase) => void;
  setPlacementPosition: (pos: { x: number; y: number; z: number } | null) => void;
  setPlacementRotation: (rot: { x: number; y: number; z: number; w: number } | null) => void;
  reset: () => void;
}

type XRStore = XRStoreState & XRActions;

const initialState: XRStoreState = {
  mode: null,
  status: 'idle',
  isSupported: false,
  error: null,
  modelLoaded: false,
  modelProgress: 0,
  controllerConnected: false,
  handTracking: false,
  placementPhase: 'idle',
  placementPosition: null,
  placementRotation: null,
};

export const useXRStore = create<XRStore>((set) => ({
  ...initialState,
  setMode: (mode) => set({ mode }),
  setStatus: (status) => set({ status }),
  setSupported: (isSupported) => set({ isSupported }),
  setError: (error) => set({ error }),
  setModelLoaded: (modelLoaded) => set({ modelLoaded }),
  setModelProgress: (modelProgress) => set({ modelProgress }),
  setControllerConnected: (controllerConnected) => set({ controllerConnected }),
  setHandTracking: (handTracking) => set({ handTracking }),
  setPlacementPhase: (placementPhase) => set({ placementPhase }),
  setPlacementPosition: (placementPosition) => set({ placementPosition }),
  setPlacementRotation: (placementRotation) => set({ placementRotation }),
  reset: () => set(initialState),
}));
