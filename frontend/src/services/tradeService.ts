import api from './api';
import type { Trade, TradeFormValues, AnalyticsSummary } from '@/types/trade';

export const tradeService = {
  // Get all trades
  getTrades: async (spaceId: string): Promise<Trade[]> => {
    const response = await api.get('/trades', { params: { spaceId } });
    return response.data;
  },

  // Get trade by ID
  getTradeById: async (id: string, spaceId: string): Promise<Trade> => {
    const response = await api.get(`/trades/${id}`, { params: { spaceId } });
    return response.data;
  },

  // Create new trade
  createTrade: async (tradeData: TradeFormValues): Promise<Trade> => {
    const response = await api.post('/trades', tradeData);
    return response.data;
  },

  // Update existing trade
  updateTrade: async (id: string, tradeData: Partial<TradeFormValues>): Promise<Trade> => {
    const response = await api.put(`/trades/${id}`, tradeData);
    return response.data;
  },

  // Delete trade
  deleteTrade: async (id: string, spaceId: string): Promise<void> => {
    await api.delete(`/trades/${id}`, { params: { spaceId } });
  },

  // Get analytics summary
  getAnalyticsSummary: async (spaceId: string): Promise<AnalyticsSummary> => {
    const response = await api.get('/trades/analytics/summary', { params: { spaceId } });
    return response.data;
  },
};
