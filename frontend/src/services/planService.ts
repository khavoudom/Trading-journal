import api from './api';
import type { PlanData } from '@/types/trade';

export const planService = {
  getPlan: async (spaceId: string): Promise<PlanData> => {
    const response = await api.get('/plan', { params: { spaceId } });
    return response.data;
  },
  savePlan: async (spaceId: string, plan: PlanData): Promise<void> => {
    await api.put('/plan', { ...plan, spaceId });
  },
};
