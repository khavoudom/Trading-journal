import { create } from 'zustand';
import type { RiskRule, CreateRiskRulePayload, UpdateRiskRulePayload } from '@/types/riskRule';
import { riskRuleService } from '@/services/riskRuleService';

interface RiskRuleState {
  rules: RiskRule[];
  loading: boolean;
  error: string | null;
  fetchRules: (spaceId: string) => Promise<void>;
  addRule: (data: CreateRiskRulePayload) => Promise<void>;
  updateRule: (id: string, data: UpdateRiskRulePayload) => Promise<void>;
  removeRule: (id: string) => Promise<void>;
}

export const useRiskRuleStore = create<RiskRuleState>()((set) => ({
  rules: [],
  loading: false,
  error: null,

  fetchRules: async (spaceId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await riskRuleService.getAll(spaceId);
      set({ rules: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch risk rules', loading: false });
    }
  },

  addRule: async (data: CreateRiskRulePayload) => {
    set({ loading: true, error: null });
    try {
      const newRule = await riskRuleService.create(data);
      set((state) => ({ rules: [...state.rules, newRule], loading: false }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to create risk rule', loading: false });
      throw err;
    }
  },

  updateRule: async (id: string, data: UpdateRiskRulePayload) => {
    set({ error: null });
    try {
      const updated = await riskRuleService.update(id, data);
      set((state) => ({
        rules: state.rules.map((r) => (r.id === id ? updated : r)),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update risk rule' });
      throw err;
    }
  },

  removeRule: async (id: string) => {
    set({ error: null });
    try {
      await riskRuleService.remove(id);
      set((state) => ({
        rules: state.rules.filter((r) => r.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete risk rule' });
      throw err;
    }
  },
}));
