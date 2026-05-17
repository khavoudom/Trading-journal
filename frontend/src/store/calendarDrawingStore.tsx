import { create } from 'zustand';
import type { CalendarDrawing } from '@/types/drawing';
import { calendarDrawingService } from '@/services/drawingService';

interface CalendarDrawingState {
  drawings: CalendarDrawing[];
  loading: boolean;
  error: string | null;
  fetchDrawings: (spaceId: string, date: string) => Promise<void>;
  addDrawing: (data: {
    spaceId: string;
    date: string;
    title?: string;
    sceneData: Record<string, unknown>;
  }) => Promise<CalendarDrawing>;
  editDrawing: (
    id: string,
    data: Partial<Pick<CalendarDrawing, 'title' | 'sceneData'>>,
    spaceId?: string,
  ) => Promise<void>;
  removeDrawing: (id: string, spaceId: string) => Promise<void>;
  fetchAllDrawings: (spaceId: string) => Promise<void>;
  clearDrawings: () => void;
}

let fetchDrawingsRequestId = 0;

export const useCalendarDrawingStore = create<CalendarDrawingState>()((set) => ({
  drawings: [],
  loading: false,
  error: null,

  fetchAllDrawings: async (spaceId: string) => {
    set({ loading: true, error: null, drawings: [] });
    try {
      const data = await calendarDrawingService.getAllDrawings(spaceId);
      set({ drawings: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch drawings', drawings: [], loading: false });
    }
  },

  fetchDrawings: async (spaceId: string, date: string) => {
    const requestId = ++fetchDrawingsRequestId;
    set({ loading: true, error: null, drawings: [] });
    try {
      const data = await calendarDrawingService.getDrawingsByDate(spaceId, date);
      if (requestId === fetchDrawingsRequestId) {
        set({ drawings: data, loading: false });
      }
    } catch (err: any) {
      if (requestId === fetchDrawingsRequestId) {
        set({ error: err.message || 'Failed to fetch drawings', drawings: [], loading: false });
      }
    }
  },

  addDrawing: async (data) => {
    set({ error: null });
    try {
      const newDrawing = await calendarDrawingService.createDrawing(data);
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
      const updated = await calendarDrawingService.updateDrawing(id, data, spaceId);
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
      await calendarDrawingService.deleteDrawing(id, spaceId);
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
