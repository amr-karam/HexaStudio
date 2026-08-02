import { create } from 'zustand';

export type LightingPreset = 'daylight' | 'golden_hour' | 'cyberpunk' | 'gallery';
export type MaterialPreset = 'obsidian_marble' | 'warm_oak' | 'brushed_titanium' | 'raw_concrete';

export interface SpatialDesignBrief {
  atmosphere: string;
  recommendedLighting: LightingPreset;
  recommendedMaterial: MaterialPreset;
  colorPalette: string[];
  designRationale: string;
}

interface DesignerStoreState {
  activeLighting: LightingPreset;
  activeMaterial: MaterialPreset;
  activeBrief: SpatialDesignBrief | null;
  isOpen: boolean;
  setLighting: (preset: LightingPreset) => void;
  setMaterial: (preset: MaterialPreset) => void;
  setBrief: (brief: SpatialDesignBrief | null) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
}

export const useDesignerStore = create<DesignerStoreState>((set) => ({
  activeLighting: 'daylight',
  activeMaterial: 'obsidian_marble',
  activeBrief: null,
  isOpen: false,
  setLighting: (preset) => set({ activeLighting: preset }),
  setMaterial: (preset) => set({ activeMaterial: preset }),
  setBrief: (brief) => set({ activeBrief: brief }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
}));
