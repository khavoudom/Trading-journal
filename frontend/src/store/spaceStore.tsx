import { create } from 'zustand';
import type { Space } from '@/types/trade';
import { spaceService } from '@/services/spaceService';

interface SpaceState {
  spaces: Space[];
  currentSpaceId: string | null;
  loading: boolean;
  error: string | null;
  setCurrentSpace: (id: string) => void;
  createSpace: (name: string) => Promise<Space>;
  deleteSpace: (id: string, password: string) => Promise<void>;
  renameSpace: (id: string, name: string) => Promise<void>;
  fetchSpaces: () => Promise<void>;
}

const STORAGE_KEY = 'currentSpaceId';

export const useSpaceStore = create<SpaceState>()((set, get) => ({
  spaces: [],
  currentSpaceId: localStorage.getItem(STORAGE_KEY),
  loading: false,
  error: null,

  setCurrentSpace: (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    set({ currentSpaceId: id });
  },

  createSpace: async (name: string): Promise<Space> => {
    const newSpace = await spaceService.createSpace(name);
    set((state) => ({ spaces: [...state.spaces, newSpace] }));
    return newSpace;
  },

  deleteSpace: async (id: string, password: string) => {
    await spaceService.deleteSpace(id, password);
    set((state) => {
      const filtered = state.spaces.filter((s) => s.id !== id);
      if (filtered.length > 0 && id === state.currentSpaceId) {
        localStorage.setItem(STORAGE_KEY, filtered[0].id);
        return { spaces: filtered, currentSpaceId: filtered[0].id };
      }
      return { spaces: filtered };
    });
  },

  renameSpace: async (id: string, name: string) => {
    const updated = await spaceService.renameSpace(id, name);
    set((state) => ({
      spaces: state.spaces.map((s) => (s.id === id ? updated : s)),
    }));
  },

  fetchSpaces: async () => {
    const { spaces, currentSpaceId } = get();
    if (spaces.length > 0 && currentSpaceId) return;

    set({ loading: true, error: null });
    try {
      const data = await spaceService.getSpaces();
      if (data.length > 0) {
        const stored = localStorage.getItem(STORAGE_KEY);
        const stillValid = stored && data.some((s) => s.id === stored);
        if (!stillValid) {
          localStorage.setItem(STORAGE_KEY, data[0].id);
          set({ spaces: data, currentSpaceId: data[0].id, loading: false });
        } else {
          set({ spaces: data, loading: false });
        }
      } else {
        set({ spaces: data, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch spaces', loading: false });
    }
  },
}));
