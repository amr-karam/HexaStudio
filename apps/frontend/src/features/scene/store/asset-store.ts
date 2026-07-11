import { create } from 'zustand';

interface AssetState {
  loadingProgress: number;
  loaded: number;
  total: number;
  setProgress: (progress: number) => void;
  setCounts: (loaded: number, total: number) => void;
}

export const useAssetStore = create<AssetState>((set) => ({
  loadingProgress: 0,
  loaded: 0,
  total: 0,
  setProgress: (progress) => set({ loadingProgress: progress }),
  setCounts: (loaded, total) => set({ loaded, total }),
}));
