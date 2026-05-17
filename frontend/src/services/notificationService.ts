import api from './api';

export interface Notification {
  id: string;
  userId: string;
  spaceId: string;
  type: 'alert' | 'reminder';
  category: string;
  title: string;
  description: string;
  status: string;
  linkPath: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  getBySpace: async (spaceId: string, unreadOnly = false): Promise<Notification[]> => {
    const { data } = await api.get('/notifications', {
      params: { spaceId, unread: unreadOnly || undefined },
    });
    return data;
  },

  create: async (payload: {
    spaceId: string;
    type: 'alert' | 'reminder';
    category: string;
    title: string;
    description?: string;
    linkPath?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> => {
    const { data } = await api.post('/notifications', payload);
    return data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  markAllRead: async (spaceId: string): Promise<void> => {
    await api.put('/notifications/read-all', { spaceId });
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  generateAlerts: async (spaceId: string): Promise<void> => {
    await api.post('/notifications/generate-alerts', { spaceId });
  },

  getAlertReads: async (spaceId: string): Promise<string[]> => {
    try {
      const { data } = await api.get('/settings', { params: { key: 'readAlertIds', spaceId } });
      return (data.value as string[]) ?? [];
    } catch {
      return [];
    }
  },

  setAlertRead: async (spaceId: string, alertIds: string[]): Promise<void> => {
    await api.post('/settings', { key: 'readAlertIds', value: alertIds, spaceId });
  },
};
