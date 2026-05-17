import type { Trade, TradeFormValues, AnalyticsSummary } from '@/types/trade.js';
import { v4 as uuidv4 } from 'uuid';
import { CONTRACT_SIZES } from '@/config/instruments.js';
import { tradeRepository } from '@/repositories/tradeRepository.js';
import { validate } from '@/validation/index.js';
import { createTradeSchema, updateTradeSchema } from '@/validation/tradeSchemas.js';
import { authorizationService } from '@/services/authorizationService.js';

/** Calculates dollar P&L and percentage P&L for a trade. */
const calculateProfitLoss = (
  trade: TradeFormValues,
): { profitLoss: number; profitLossPercent: number } => {
  const isLong = trade.side === 'Long';
  const priceDiff = isLong
    ? trade.exitPrice - trade.entryPrice
    : trade.entryPrice - trade.exitPrice;
  const contractSize = CONTRACT_SIZES[trade.instrument] || 1;
  const profitLoss = priceDiff * trade.quantity * contractSize;

  const profitLossPercent = trade.entryPrice > 0 ? (priceDiff / trade.entryPrice) * 100 : 0;

  return { profitLoss, profitLossPercent };
};

/** Business logic for CRUD operations and analytics on trades. */
export const tradeService = {
  /**
   * Returns all trades for a user within a space, ordered by entry time descending (trade day).
   */
  getAllTrades: async (userId: string, spaceId: string): Promise<Trade[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    return tradeRepository.findAll(userId, spaceId) as Promise<Trade[]>;
  },

  /**
   * Returns a single trade by ID, user, and space, or null if not found.
   */
  getTradeById: async (id: string, userId: string, spaceId: string): Promise<Trade | null> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    return tradeRepository.findById(id, userId, spaceId) as Promise<Trade | null>;
  },

  /**
   * Creates a new trade, computing P&L from the provided form values.
   */
  createTrade: async (tradeData: unknown, userId: string): Promise<Trade> => {
    const data = validate(createTradeSchema, tradeData);
    await authorizationService.ensureSpaceAccess(userId, data.spaceId);

    const id = uuidv4();
    const isOpen = data.status === 'pending' || data.status === 'running';
    const profitLoss = isOpen ? 0 : calculateProfitLoss(data).profitLoss;
    const profitLossPercent = isOpen ? 0 : calculateProfitLoss(data).profitLossPercent;

    const newTrade: Trade = {
      id,
      ...data,
      profitLoss,
      profitLossPercent,
    };

    await tradeRepository.create({
      id,
      userId,
      spaceId: data.spaceId,
      instrument: newTrade.instrument,
      side: newTrade.side,
      strategy: newTrade.strategy,
      entryPrice: newTrade.entryPrice,
      exitPrice: newTrade.exitPrice,
      quantity: newTrade.quantity,
      entryTime: new Date(newTrade.entryTime),
      exitTime: new Date(newTrade.exitTime),
      profitLoss: newTrade.profitLoss,
      profitLossPercent: newTrade.profitLossPercent,
      status: newTrade.status || 'closed',
      tags: newTrade.tags,
      notes: newTrade.notes,
      screenshots: newTrade.screenshots || [],
      emotion: newTrade.emotion || 'neutral',
      planData: newTrade.planData ?? [],
      setupData: newTrade.setupData ?? [],
    });

    return newTrade;
  },

  /**
   * Updates an existing trade, recalculating P&L if price, quantity, or side changed.
   * Returns null if the trade does not exist.
   */
  updateTrade: async (
    id: string,
    tradeData: unknown,
    userId: string,
    spaceId: string,
  ): Promise<Trade | null> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);

    const existingTrade = await tradeService.getTradeById(id, userId, spaceId);
    if (!existingTrade) return null;

    const validated = validate(updateTradeSchema, tradeData);
    const updatedData = { ...existingTrade, ...validated } as Trade;

    const needsRecalc =
      validated.entryPrice !== undefined ||
      validated.exitPrice !== undefined ||
      validated.quantity !== undefined ||
      validated.side !== undefined;
    const isOpen = updatedData.status === 'pending' || updatedData.status === 'running';

    if (needsRecalc && !isOpen) {
      const { profitLoss, profitLossPercent } = calculateProfitLoss({
        instrument: updatedData.instrument,
        side: updatedData.side,
        strategy: updatedData.strategy,
        entryPrice: updatedData.entryPrice,
        exitPrice: updatedData.exitPrice,
        quantity: updatedData.quantity,
        entryTime: updatedData.entryTime,
        exitTime: updatedData.exitTime,
        tags: updatedData.tags,
        notes: updatedData.notes,
        screenshots: updatedData.screenshots || [],
        spaceId: updatedData.spaceId,
      });
      updatedData.profitLoss = profitLoss;
      updatedData.profitLossPercent = profitLossPercent;
    } else if (isOpen) {
      updatedData.profitLoss = 0;
      updatedData.profitLossPercent = 0;
    }

    await tradeRepository.update({
      id,
      userId,
      spaceId,
      instrument: updatedData.instrument,
      side: updatedData.side,
      strategy: updatedData.strategy,
      entryPrice: updatedData.entryPrice,
      exitPrice: updatedData.exitPrice,
      quantity: updatedData.quantity,
      entryTime: new Date(updatedData.entryTime),
      exitTime: new Date(updatedData.exitTime),
      profitLoss: updatedData.profitLoss,
      profitLossPercent: updatedData.profitLossPercent,
      status: updatedData.status || 'closed',
      tags: updatedData.tags,
      notes: updatedData.notes,
      screenshots: updatedData.screenshots || [],
      emotion: updatedData.emotion || 'neutral',
      planData: updatedData.planData || [],
      setupData: updatedData.setupData || [],
    });

    return updatedData;
  },

  /**
   * Deletes a trade by ID, user, and space. Returns true if a row was removed.
   */
  deleteTrade: async (id: string, userId: string, spaceId: string): Promise<boolean> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    return tradeRepository.remove(id, userId, spaceId);
  },

  /**
   * Computes and returns an analytics summary (win rate, P&L, best/worst trade) for the user's trades in a space.
   */
  getAnalyticsSummary: async (userId: string, spaceId: string): Promise<AnalyticsSummary> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);

    const allTrades = await tradeRepository.findAllRaw(userId, spaceId);
    const trades = allTrades.filter((t) => t.status !== 'pending' && t.status !== 'running');

    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfitLoss: 0,
        averageProfitLoss: 0,
        bestTrade: null,
        worstTrade: null,
      };
    }

    const winningTrades = trades.filter((trade) => trade.profitLoss > 0).length;
    const losingTrades = trades.filter((trade) => trade.profitLoss <= 0).length;
    const totalProfitLoss = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const averageProfitLoss = totalProfitLoss / trades.length;

    const bestTradeRow = await tradeRepository.findBestTrade(userId, spaceId);
    const worstTradeRow = await tradeRepository.findWorstTrade(userId, spaceId);

    return {
      totalTrades: trades.length,
      winRate: parseFloat(((winningTrades / trades.length) * 100).toFixed(2)),
      winningTrades,
      losingTrades,
      totalProfitLoss,
      averageProfitLoss,
      bestTrade: bestTradeRow as Trade | null,
      worstTrade: worstTradeRow as Trade | null,
    };
  },
};
