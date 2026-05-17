import api from './api';
import type { DayEvent } from '@/types/trade';

export const eventService = {
  getEventDates: async (spaceId: string, month: string): Promise<string[]> => {
    const response = await api.get('/events/dates', { params: { spaceId, month } });
    return response.data;
  },

  getEventsByDate: async (spaceId: string, date: string): Promise<DayEvent[]> => {
    const response = await api.get('/events', { params: { spaceId, date } });
    return response.data;
  },

  createEvent: async (data: {
    spaceId: string;
    date: string;
    title: string;
    content?: string;
  }): Promise<DayEvent> => {
    const response = await api.post('/events', data);
    return response.data;
  },

  updateEvent: async (
    id: string,
    data: Partial<Pick<DayEvent, 'title' | 'content'>>,
  ): Promise<DayEvent> => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string, spaceId: string): Promise<void> => {
    await api.delete(`/events/${id}`, { params: { spaceId } });
  },
};
