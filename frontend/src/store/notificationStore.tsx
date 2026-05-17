import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  time?: string;
  timeEnd?: string;
  taskDate: string;
  type: string;
  read: boolean;
  receivedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },
}));
