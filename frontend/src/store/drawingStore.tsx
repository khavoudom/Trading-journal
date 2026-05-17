import { create } from 'zustand';
import type { DrawingBoardDrawing } from '@/types/drawing';
import { drawingService } from '@/services/drawingService';

interface DrawingState {
  drawings: DrawingBoardDrawing[];
  loading: boolean;
  error: string | null;
  fetchDrawings: (spaceId: string, date: string) => Promise<void>;
  addDrawing: (data: {
    spaceId: string;
    date: string;
    title?: string;
    sceneData: Record<string, unknown>;
  }) => Promise<DrawingBoardDrawing>;
  editDrawing: (
    id: string,
    data: Partial<Pick<DrawingBoardDrawing, 'title' | 'sceneData'>>,
    spaceId?: string,
  ) => Promise<void>;
  removeDrawing: (id: string, spaceId: string) => Promise<void>;
  fetchAllDrawings: (spaceId: string) => Promise<void>;
  clearDrawings: () => void;
}

export const useDrawingStore = create<DrawingState>()((set) => ({
  drawings: [],
  loading: false,
  error: null,

  fetchAllDrawings: async (spaceId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await drawingService.getAllDrawings(spaceId);
      set({ drawings: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch drawings', drawings: [], loading: false });
    }
  },

  fetchDrawings: async (spaceId: string, date: string) => {
    set({ loading: true, error: null });
    try {
      const data = await drawingService.getDrawingsByDate(spaceId, date);
      set({ drawings: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch drawings', drawings: [], loading: false });
    }
  },

  addDrawing: async (data) => {
    set({ error: null });
    try {
      const newDrawing = await drawingService.createDrawing(data);
      set((state) => ({ drawings: [newDrawing, ...state.drawings] }));
      return newDrawing;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create drawing' });
      throw err;
    }
  },

  editDrawing: async (id, data, spaceId) => {
    set({ error: null });
    try {
      const updated = await drawingService.updateDrawing(id, data, spaceId);
      set((state) => ({
        drawings: state.drawings.map((d) => (d.id === id ? updated : d)),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update drawing' });
      throw err;
    }
  },

  removeDrawing: async (id: string, spaceId: string) => {
    set({ error: null });
    try {
      await drawingService.deleteDrawing(id, spaceId);
      set((state) => ({
        drawings: state.drawings.filter((d) => d.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update drawing' });
      throw err;
    }
  },

  clearDrawings: () => {
    set({ drawings: [], error: null });
  },
}));
