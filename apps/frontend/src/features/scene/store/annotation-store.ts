import { create } from 'zustand';

export interface SpatialPin {
  id: string;
  x: number; // Percentage X position on viewport
  y: number; // Percentage Y position on viewport
  title: string;
  author: string;
  comment: string;
  timestamp: string;
  resolved: boolean;
}

interface AnnotationStoreState {
  pins: SpatialPin[];
  isAddingPin: boolean;
  activePinId: string | null;
  addPin: (pin: Omit<SpatialPin, 'id' | 'timestamp' | 'resolved'>) => void;
  toggleResolvePin: (id: string) => void;
  setIsAddingPin: (adding: boolean) => void;
  setActivePinId: (id: string | null) => void;
}

const INITIAL_PINS: SpatialPin[] = [
  {
    id: 'pin-1',
    x: 42,
    y: 35,
    title: 'Glass Reflection Spec',
    author: 'Client (Horizon Capital)',
    comment: 'Can we increase the reflectivity of the west-facing curtain wall glass for sunset renders?',
    timestamp: '2 hours ago',
    resolved: false,
  },
  {
    id: 'pin-2',
    x: 68,
    y: 58,
    title: 'Timber Slats Spacing',
    author: 'Lead Architect',
    comment: 'Warm oak timber slats verified with 50mm architectural spacing.',
    timestamp: 'Yesterday',
    resolved: true,
  },
];

export const useAnnotationStore = create<AnnotationStoreState>((set) => ({
  pins: INITIAL_PINS,
  isAddingPin: false,
  activePinId: null,
  addPin: (pinData) =>
    set((state) => ({
      pins: [
        ...state.pins,
        {
          ...pinData,
          id: `pin-${Date.now()}`,
          timestamp: 'Just now',
          resolved: false,
        },
      ],
      isAddingPin: false,
    })),
  toggleResolvePin: (id) =>
    set((state) => ({
      pins: state.pins.map((p) => (p.id === id ? { ...p, resolved: !p.resolved } : p)),
    })),
  setIsAddingPin: (adding) => set({ isAddingPin: adding }),
  setActivePinId: (id) => set({ activePinId: id }),
}));
