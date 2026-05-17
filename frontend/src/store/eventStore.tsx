import { create } from 'zustand';
import type { DayEvent } from '@/types/trade';
import { eventService } from '@/services/eventService';

interface EventState {
  events: DayEvent[];
  eventDates: string[];
  loading: boolean;
  error: string | null;
  fetchEvents: (spaceId: string, date: string) => Promise<void>;
  fetchEventDates: (spaceId: string, month: string) => Promise<void>;
  addEvent: (data: {
    spaceId: string;
    date: string;
    title: string;
    content?: string;
  }) => Promise<void>;
  removeEvent: (id: string, spaceId: string) => Promise<void>;
  clearEvents: () => void;
}

let fetchEventsRequestId = 0;

export const useEventStore = create<EventState>()((set) => ({
  events: [],
  eventDates: [],
  loading: false,
  error: null,

  fetchEvents: async (spaceId: string, date: string) => {
    const requestId = ++fetchEventsRequestId;
    set({ loading: true, error: null, events: [] });
    try {
      const data = await eventService.getEventsByDate(spaceId, date);
      if (requestId === fetchEventsRequestId) {
        set({ events: data, loading: false });
      }
    } catch (err: any) {
      if (requestId === fetchEventsRequestId) {
        set({ error: err.message || 'Failed to fetch events', events: [], loading: false });
      }
    }
  },

  fetchEventDates: async (spaceId: string, month: string) => {
    try {
      const dates = await eventService.getEventDates(spaceId, month);
      set({ eventDates: dates });
    } catch {
      set({ eventDates: [] });
    }
  },

  addEvent: async (data) => {
    set({ error: null });
    try {
      const newEvent = await eventService.createEvent(data);
      set((state) => ({ events: [newEvent, ...state.events] }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to create event' });
      throw err;
    }
  },

  removeEvent: async (id: string, spaceId: string) => {
    set({ error: null });
    try {
      await eventService.deleteEvent(id, spaceId);
      set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete event' });
      throw err;
    }
  },

  clearEvents: () => {
    set({ events: [], eventDates: [], error: null });
  },
}));
