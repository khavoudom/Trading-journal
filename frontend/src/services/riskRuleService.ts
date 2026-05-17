import api from './api';
import type { RiskRule, CreateRiskRulePayload, UpdateRiskRulePayload } from '@/types/riskRule';

export const riskRuleService = {
  getAll: async (spaceId: string): Promise<RiskRule[]> => {
    const response = await api.get('/risk-rules', { params: { spaceId } });
    return response.data;
  },

  create: async (data: CreateRiskRulePayload): Promise<RiskRule> => {
    const response = await api.post('/risk-rules', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRiskRulePayload): Promise<RiskRule> => {
    const response = await api.put(`/risk-rules/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/risk-rules/${id}`);
  },
};
