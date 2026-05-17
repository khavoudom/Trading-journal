import { create } from 'zustand';
import type { Trade } from '@/types/trade';
import { tradeService } from '@/services/tradeService';

interface TradeState {
  trades: Trade[];
  loading: boolean;
  error: string | null;
  fetchTrades: (spaceId: string) => Promise<void>;
  addTrade: (trade: Omit<Trade, 'id' | 'profitLoss' | 'profitLossPercent'>) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string, spaceId: string) => Promise<void>;
  refreshTrades: (spaceId: string) => Promise<void>;
}

export const useTradeStore = create<TradeState>()((set, get) => ({
  trades: [],
  loading: false,
  error: null,

  fetchTrades: async (spaceId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await tradeService.getTrades(spaceId);
      set({ trades: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch trades', loading: false });
    }
  },

  addTrade: async (tradeData) => {
    set({ loading: true, error: null });
    try {
      const newTrade = await tradeService.createTrade(tradeData);
      set((state) => ({ trades: [...state.trades, newTrade], loading: false }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to add trade', loading: false });
      throw err;
    }
  },

  updateTrade: async (id: string, tradeData: Partial<Trade>) => {
    set({ loading: true, error: null });
    try {
      const updatedTrade = await tradeService.updateTrade(id, tradeData);
      set((state) => ({
        trades: state.trades.map((trade) => (trade.id === id ? updatedTrade : trade)),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update trade', loading: false });
      throw err;
    }
  },

  deleteTrade: async (id: string, spaceId: string) => {
    set({ loading: true, error: null });
    try {
      await tradeService.deleteTrade(id, spaceId);
      set((state) => ({
        trades: state.trades.filter((trade) => trade.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete trade', loading: false });
      throw err;
    }
  },

  refreshTrades: async (spaceId: string) => {
    await get().fetchTrades(spaceId);
  },
}));
