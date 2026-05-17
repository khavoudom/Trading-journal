import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@/errors/AppError.js';

// Mock all external dependencies
vi.mock('@/repositories/tradeRepository.js', () => ({
  tradeRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    findAllRaw: vi.fn(),
    findBestTrade: vi.fn(),
    findWorstTrade: vi.fn(),
  },
}));

vi.mock('@/validation/index.js', () => ({
  validate: vi.fn(),
}));

vi.mock('@/services/authorizationService.js', () => ({
  authorizationService: {
    ensureSpaceAccess: vi.fn(),
  },
}));

// uuid must be importable for createTrade — mock it
vi.mock('uuid', () => ({
  v4: () => 'fixed-uuid-123',
}));

import { tradeService } from '@/services/tradeService.js';
import { tradeRepository } from '@/repositories/tradeRepository.js';
import { validate } from '@/validation/index.js';
import { authorizationService } from '@/services/authorizationService.js';

const validTradeFormData = {
  instrument: 'XAUUSD',
  side: 'Long' as const,
  strategy: 'Breakout',
  entryPrice: 1900,
  exitPrice: 1920,
  quantity: 2,
  entryTime: '2024-01-15T09:00:00Z',
  exitTime: '2024-01-15T15:00:00Z',
  tags: ['gold', 'breakout'],
  notes: 'Good trade',
  screenshots: [],
  spaceId: 'space-1',
};

const validTrade = {
  id: 'fixed-uuid-123',
  ...validTradeFormData,
  profitLoss: 4000,
  profitLossPercent: 1.05,
};

describe('tradeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authorizationService.ensureSpaceAccess).mockImplementation(
      async (_userId: string, spaceId: string) => {
        if (!spaceId) throw new AppError('spaceId is required', 400);
        return {} as any;
      },
    );
  });

  describe('getAllTrades', () => {
    it('returns all trades for a user and space', async () => {
      const mockTrades = [validTrade];
      vi.mocked(tradeRepository.findAll).mockResolvedValue(mockTrades as any);

      const result = await tradeService.getAllTrades('user-1', 'space-1');

      expect(tradeRepository.findAll).toHaveBeenCalledWith('user-1', 'space-1');
      expect(result).toEqual(mockTrades);
    });

    it('throws when spaceId is missing', async () => {
      await expect(tradeService.getAllTrades('user-1', '')).rejects.toThrow(AppError);
      await expect(tradeService.getAllTrades('user-1', '')).rejects.toThrow('spaceId is required');
    });
  });

  describe('getTradeById', () => {
    it('returns a trade by id', async () => {
      vi.mocked(tradeRepository.findById).mockResolvedValue(validTrade as any);

      const result = await tradeService.getTradeById('trade-1', 'user-1', 'space-1');

      expect(tradeRepository.findById).toHaveBeenCalledWith('trade-1', 'user-1', 'space-1');
      expect(result).toEqual(validTrade);
    });

    it('returns null when trade not found', async () => {
      vi.mocked(tradeRepository.findById).mockResolvedValue(null);

      const result = await tradeService.getTradeById('nonexistent', 'user-1', 'space-1');
      expect(result).toBeNull();
    });

    it('throws when spaceId is missing', async () => {
      await expect(tradeService.getTradeById('id', 'user-1', '')).rejects.toThrow(
        'spaceId is required',
      );
    });
  });

  describe('createTrade', () => {
    it('computes P&L for a Long trade and creates it', async () => {
      // XAUUSD contract size = 100
      // Long: (exit - entry) * qty * contractSize = (1920 - 1900) * 2 * 100 = 4000
      // Percent: (20 / 1900) * 100 = 1.0526... → toFixed(2) already applied in service? No, raw is stored
      vi.mocked(validate).mockReturnValue(validTradeFormData);
      vi.mocked(tradeRepository.create).mockResolvedValue(undefined);

      const result = await tradeService.createTrade(validTradeFormData, 'user-1');

      expect(validate).toHaveBeenCalled();
      expect(result.id).toBe('fixed-uuid-123');
      expect(result.profitLoss).toBe(4000);
      expect(result.profitLossPercent).toBeCloseTo(1.05, 1);
      expect(tradeRepository.create).toHaveBeenCalledTimes(1);
    });

    it('computes P&L for a Short trade', async () => {
      const shortTradeData = {
        ...validTradeFormData,
        side: 'Short' as const,
        entryPrice: 1920,
        exitPrice: 1900,
      };
      vi.mocked(validate).mockReturnValue(shortTradeData);

      const result = await tradeService.createTrade(shortTradeData, 'user-1');

      // Short: (entry - exit) * qty * contractSize = (1920 - 1900) * 2 * 100 = 4000
      expect(result.profitLoss).toBe(4000);
    });

    it('uses contract size 1 for unknown instruments', async () => {
      const unknownData = {
        ...validTradeFormData,
        instrument: 'UNKNOWN',
        entryPrice: 10,
        exitPrice: 15,
        quantity: 1,
      };
      vi.mocked(validate).mockReturnValue(unknownData);

      const result = await tradeService.createTrade(unknownData, 'user-1');

      expect(result.profitLoss).toBe(5); // (15-10) * 1 * 1 = 5
    });

    it('handles zero entryPrice for profitLossPercent', async () => {
      const zeroEntry = {
        ...validTradeFormData,
        entryPrice: 0,
        exitPrice: 100,
        quantity: 1,
        instrument: 'TEST',
      };
      vi.mocked(validate).mockReturnValue(zeroEntry);

      const result = await tradeService.createTrade(zeroEntry, 'user-1');

      // profitLoss = (100 - 0) * 1 * 1 = 100
      // profitLossPercent = 0 (entryPrice > 0 guard)
      expect(result.profitLoss).toBe(100);
      expect(result.profitLossPercent).toBe(0);
    });

    it('throws when validation fails', async () => {
      vi.mocked(validate).mockImplementation(() => {
        throw new AppError('Validation failed', 400);
      });

      await expect(tradeService.createTrade({} as any, 'user-1')).rejects.toThrow(AppError);
      expect(tradeRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateTrade', () => {
    it('recalculates P&L when price fields change', async () => {
      // start with existingTrade having different prices
      vi.mocked(tradeRepository.findById).mockResolvedValue({
        id: 'trade-1',
        instrument: 'XAUUSD',
        side: 'Long',
        entryPrice: 1900,
        exitPrice: 1910,
        quantity: 1,
        strategy: 'Scalp',
        entryTime: '2024-01-15T09:00:00Z',
        exitTime: '2024-01-15T15:00:00Z',
        tags: [],
        screenshots: [],
        spaceId: 'space-1',
        profitLoss: 1000,
        profitLossPercent: 0.53,
      } as any);

      vi.mocked(validate).mockReturnValue({ exitPrice: 1920 }); // update only exitPrice
      vi.mocked(tradeRepository.update).mockResolvedValue(undefined);

      const result = await tradeService.updateTrade(
        'trade-1',
        { exitPrice: 1920 },
        'user-1',
        'space-1',
      );

      // New P&L: (1920 - 1900) * 1 * 100 = 2000
      expect(result!.profitLoss).toBe(2000);
    });

    it('keeps existing P&L when price/quantity/side are unchanged', async () => {
      vi.mocked(tradeRepository.findById).mockResolvedValue({
        id: 'trade-1',
        instrument: 'XAUUSD',
        side: 'Long',
        entryPrice: 1900,
        exitPrice: 1910,
        quantity: 1,
        strategy: 'Scalp',
        entryTime: '2024-01-15T09:00:00Z',
        exitTime: '2024-01-15T15:00:00Z',
        tags: [],
        screenshots: [],
        spaceId: 'space-1',
        profitLoss: 1000,
        profitLossPercent: 0.53,
      } as any);

      vi.mocked(validate).mockReturnValue({ notes: 'Updated notes' });
      vi.mocked(tradeRepository.update).mockResolvedValue(undefined);

      const result = await tradeService.updateTrade(
        'trade-1',
        { notes: 'Updated notes' },
        'user-1',
        'space-1',
      );

      // P&L unchanged
      expect(result!.profitLoss).toBe(1000);
      expect(result!.profitLossPercent).toBe(0.53);
    });

    it('returns null when trade does not exist', async () => {
      vi.mocked(tradeRepository.findById).mockResolvedValue(null);

      const result = await tradeService.updateTrade('nonexistent', {} as any, 'user-1', 'space-1');
      expect(result).toBeNull();
    });

    it('throws when spaceId is missing', async () => {
      await expect(tradeService.updateTrade('id', {} as any, 'user-1', '')).rejects.toThrow(
        'spaceId is required',
      );
    });
  });

  describe('deleteTrade', () => {
    it('deletes a trade and returns true', async () => {
      vi.mocked(tradeRepository.remove).mockResolvedValue(true);

      const result = await tradeService.deleteTrade('trade-1', 'user-1', 'space-1');

      expect(tradeRepository.remove).toHaveBeenCalledWith('trade-1', 'user-1', 'space-1');
      expect(result).toBe(true);
    });

    it('throws when spaceId is missing', async () => {
      await expect(tradeService.deleteTrade('id', 'user-1', '')).rejects.toThrow(
        'spaceId is required',
      );
    });
  });

  describe('getAnalyticsSummary', () => {
    it('returns zeros when there are no trades', async () => {
      vi.mocked(tradeRepository.findAllRaw).mockResolvedValue([]);

      const result = await tradeService.getAnalyticsSummary('user-1', 'space-1');

      expect(result).toEqual({
        totalTrades: 0,
        winRate: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfitLoss: 0,
        averageProfitLoss: 0,
        bestTrade: null,
        worstTrade: null,
      });
    });

    it('computes analytics for mixed trades', async () => {
      const mockTrades = [
        { profitLoss: 500 },
        { profitLoss: -200 },
        { profitLoss: 300 },
        { profitLoss: 0 },
      ];
      vi.mocked(tradeRepository.findAllRaw).mockResolvedValue(mockTrades as any);
      vi.mocked(tradeRepository.findBestTrade).mockResolvedValue(mockTrades[0] as any);
      vi.mocked(tradeRepository.findWorstTrade).mockResolvedValue(mockTrades[1] as any);

      const result = await tradeService.getAnalyticsSummary('user-1', 'space-1');

      expect(result.totalTrades).toBe(4);
      expect(result.winningTrades).toBe(2);
      expect(result.losingTrades).toBe(2); // 0 counts as losing (profitLoss <= 0)
      expect(result.winRate).toBe(50); // 2/4 * 100
      expect(result.totalProfitLoss).toBe(600);
      expect(result.averageProfitLoss).toBe(150);
      expect(result.bestTrade).toEqual(mockTrades[0]);
      expect(result.worstTrade).toEqual(mockTrades[1]);
    });

    it('returns 0% win rate for all losing trades', async () => {
      vi.mocked(tradeRepository.findAllRaw).mockResolvedValue([
        { profitLoss: -100 },
        { profitLoss: -200 },
      ] as any);
      vi.mocked(tradeRepository.findBestTrade).mockResolvedValue({ profitLoss: -100 } as any);
      vi.mocked(tradeRepository.findWorstTrade).mockResolvedValue({ profitLoss: -200 } as any);

      const result = await tradeService.getAnalyticsSummary('user-1', 'space-1');

      expect(result.winRate).toBe(0);
      expect(result.winningTrades).toBe(0);
      expect(result.losingTrades).toBe(2);
    });

    it('throws when spaceId is missing', async () => {
      await expect(tradeService.getAnalyticsSummary('user-1', '')).rejects.toThrow(
        'spaceId is required',
      );
    });
  });
});
