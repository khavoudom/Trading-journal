import api from './api';
import type { CalendarDrawing, DrawingBoardDrawing } from '@/types/drawing';

export const drawingService = {
  getAllDrawings: async (spaceId: string): Promise<DrawingBoardDrawing[]> => {
    const response = await api.get('/drawings/all', { params: { spaceId } });
    return response.data;
  },

  getDrawingsByDate: async (spaceId: string, date: string): Promise<DrawingBoardDrawing[]> => {
    const response = await api.get('/drawings', { params: { spaceId, date } });
    return response.data;
  },

  getDrawing: async (id: string, spaceId: string): Promise<DrawingBoardDrawing> => {
    const response = await api.get(`/drawings/${id}`, { params: { spaceId } });
    return response.data;
  },

  createDrawing: async (data: {
    spaceId: string;
    date: string;
    title?: string;
    sceneData: Record<string, unknown>;
  }): Promise<DrawingBoardDrawing> => {
    const response = await api.post('/drawings', data);
    return response.data;
  },

  updateDrawing: async (
    id: string,
    data: Partial<Pick<DrawingBoardDrawing, 'title' | 'sceneData'>>,
    spaceId?: string,
  ): Promise<DrawingBoardDrawing> => {
    const response = await api.put(`/drawings/${id}`, data, {
      params: { spaceId },
    });
    return response.data;
  },

  deleteDrawing: async (id: string, spaceId: string): Promise<void> => {
    await api.delete(`/drawings/${id}`, { params: { spaceId } });
  },
};

export const calendarDrawingService = {
  getAllDrawings: async (spaceId: string): Promise<CalendarDrawing[]> => {
    const response = await api.get('/calendar-drawings/all', { params: { spaceId } });
    return response.data;
  },

  getDrawingsByDate: async (spaceId: string, date: string): Promise<CalendarDrawing[]> => {
    const response = await api.get('/calendar-drawings', { params: { spaceId, date } });
    return response.data;
  },

  getDrawingDates: async (spaceId: string, month: string): Promise<string[]> => {
    const response = await api.get('/calendar-drawings/dates', { params: { spaceId, month } });
    return response.data;
  },

  getDrawing: async (id: string, spaceId: string): Promise<CalendarDrawing> => {
    const response = await api.get(`/calendar-drawings/${id}`, { params: { spaceId } });
    return response.data;
  },

  createDrawing: async (data: {
    spaceId: string;
    date: string;
    title?: string;
    sceneData: Record<string, unknown>;
  }): Promise<CalendarDrawing> => {
    const response = await api.post('/calendar-drawings', data);
    return response.data;
  },

  updateDrawing: async (
    id: string,
    data: Partial<Pick<CalendarDrawing, 'title' | 'sceneData'>>,
    spaceId?: string,
  ): Promise<CalendarDrawing> => {
    const response = await api.put(`/calendar-drawings/${id}`, data, {
      params: { spaceId },
    });
    return response.data;
  },

  deleteDrawing: async (id: string, spaceId: string): Promise<void> => {
    await api.delete(`/calendar-drawings/${id}`, { params: { spaceId } });
  },
};
