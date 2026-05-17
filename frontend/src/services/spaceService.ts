import api from './api';
import type { Space } from '@/types/trade';

export const spaceService = {
  getSpaces: async (): Promise<Space[]> => {
    const response = await api.get('/spaces');
    return response.data;
  },

  createSpace: async (name: string): Promise<Space> => {
    const response = await api.post('/spaces', { name });
    return response.data;
  },

  renameSpace: async (id: string, name: string): Promise<Space> => {
    const response = await api.patch(`/spaces/${id}`, { name });
    return response.data;
  },

  deleteSpace: async (id: string, password: string): Promise<void> => {
    await api.post(`/spaces/${id}/delete`, { password });
  },
};
