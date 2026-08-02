import { create } from 'zustand';

export type ViewProjectionMode = '2D_floorplan' | '3D_perspective';

export interface SpatialLayer {
  id: 'structural' | 'lighting' | 'furniture' | 'hvac';
  label: string;
  desc: string;
  icon: string;
  color: string;
  visible: boolean;
}

interface LayerStoreState {
  viewMode: ViewProjectionMode;
  layers: SpatialLayer[];
  layerOpacity: number;
  isOpen: boolean;
  setViewMode: (mode: ViewProjectionMode) => void;
  toggleLayer: (layerId: SpatialLayer['id']) => void;
  setLayerOpacity: (opacity: number) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
}

const INITIAL_LAYERS: SpatialLayer[] = [
  {
    id: 'structural',
    label: 'Structural Core',
    desc: 'Columns, load-bearing walls, slab geometry & foundation',
    icon: '🧱',
    color: '#3B82F6', // Blue
    visible: true,
  },
  {
    id: 'lighting',
    label: 'Lighting & Electrical',
    desc: 'Fixtures, recessed LED strips, circuits & optical spotlights',
    icon: '💡',
    color: '#F59E0B', // Amber
    visible: true,
  },
  {
    id: 'furniture',
    label: 'Interior Furnishings',
    desc: 'Custom millwork, marble islands, seating & architectural decor',
    icon: '🛋️',
    color: '#10B981', // Emerald
    visible: true,
  },
  {
    id: 'hvac',
    label: 'HVAC & Mechanical',
    desc: 'Ventilation ducts, climate diffusers, plumbing & MEP conduits',
    icon: '🌀',
    color: '#8B5CF6', // Purple
    visible: false,
  },
];

export const useLayerStore = create<LayerStoreState>((set) => ({
  viewMode: '3D_perspective',
  layers: INITIAL_LAYERS,
  layerOpacity: 1.0,
  isOpen: false,
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)),
    })),
  setLayerOpacity: (opacity) => set({ layerOpacity: opacity }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
}));
