import { v4 as uuidv4 } from 'uuid';
import { notificationRepository } from '@/repositories/notificationRepository.js';
import { tradeRepository } from '@/repositories/tradeRepository.js';
import { validate } from '@/validation/index.js';
import { Prisma } from '@/generated/prisma/client.js';
import { createNotificationSchema } from '@/validation/notificationSchemas.js';
import { AppError } from '@/errors/AppError.js';
import { authorizationService } from '@/services/authorizationService.js';
import type { Notification } from '@/types/notification.js';

const mapNotification = (row: any): Notification => ({
  id: row.id,
  userId: row.userId,
  spaceId: row.spaceId,
  type: row.type,
  category: row.category,
  title: row.title,
  description: row.description ?? '',
  status: row.status,
  linkPath: row.linkPath ?? null,
  metadata: row.metadata ?? {},
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const notificationService = {
  getBySpace: async (userId: string, spaceId: string): Promise<Notification[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const rows = await notificationRepository.findBySpace(userId, spaceId);
    return rows.map(mapNotification);
  },

  getUnreadBySpace: async (userId: string, spaceId: string): Promise<Notification[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const rows = await notificationRepository.findUnreadBySpace(userId, spaceId);
    return rows.map(mapNotification);
  },

  create: async (payload: unknown, userId: string): Promise<Notification> => {
    const data = validate(createNotificationSchema, payload);
    await authorizationService.ensureSpaceAccess(userId, data.spaceId);
    const id = uuidv4();
    const row = await notificationRepository.create({
      id,
      userId,
      spaceId: data.spaceId,
      type: data.type,
      category: data.category,
      title: data.title,
      description: data.description,
      status: data.status ?? 'unread',
      linkPath: data.linkPath ?? null,
      metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
    });
    return mapNotification(row);
  },

  createRaw: async (data: {
    userId: string;
    spaceId: string;
    type: string;
    category: string;
    title: string;
    description?: string;
    linkPath?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> => {
    const id = uuidv4();
    const row = await notificationRepository.create({
      id,
      userId: data.userId,
      spaceId: data.spaceId,
      type: data.type,
      category: data.category,
      title: data.title,
      description: data.description ?? '',
      status: 'unread',
      linkPath: data.linkPath ?? null,
      metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
    });
    return mapNotification(row);
  },

  markAsRead: async (id: string, userId: string): Promise<Notification> => {
    const existing = await notificationRepository.findById(id, userId);
    if (!existing) throw new AppError('Notification not found', 404);
    const row = await notificationRepository.markRead(id, userId);
    return mapNotification(row);
  },

  markAllRead: async (userId: string, spaceId: string): Promise<void> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    await notificationRepository.markAllRead(userId, spaceId);
  },

  delete: async (id: string, userId: string): Promise<void> => {
    const deleted = await notificationRepository.remove(id, userId);
    if (!deleted) throw new AppError('Notification not found', 404);
  },

  /**
   * Generates alert notifications from trade data and replaces existing alerts for the space.
   * Mirrors the computation logic from AlertsPage.tsx.
   */
  generateAlerts: async (userId: string, spaceId: string): Promise<void> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const allTrades = await tradeRepository.findAllRaw(userId, spaceId);
    const trades = allTrades.filter((t) => t.status !== 'pending' && t.status !== 'running');

    // Delete existing alerts for this space (will be regenerated)
    await notificationRepository.deleteByType(userId, spaceId, 'alert');

    if (trades.length === 0) return;

    const sorted = [...trades].sort(
      (a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime(),
    );

    const winningTrades = trades.filter((t) => t.profitLoss > 0).length;
    const winRate = (winningTrades / trades.length) * 100;
    const totalPL = trades.reduce((sum, t) => sum + t.profitLoss, 0);

    const lastTrade = sorted[sorted.length - 1];
    let currentStreak = 1;
    const lastIsWin = lastTrade.profitLoss >= 0;
    for (let i = sorted.length - 2; i >= 0; i--) {
      if (sorted[i].profitLoss >= 0 === lastIsWin) currentStreak++;
      else break;
    }

    const alerts: Array<{
      id: string;
      userId: string;
      spaceId: string;
      type: string;
      category: string;
      title: string;
      description: string;
      status: string;
      linkPath: string | null;
      metadata: Prisma.InputJsonValue;
    }> = [];

    if (currentStreak >= 3 && lastIsWin) {
      alerts.push({
        id: uuidv4(),
        userId,
        spaceId,
        type: 'alert',
        category: 'win_streak',
        title: `${currentStreak}-trade winning streak!`,
        description: `You're on fire! Your current win streak is ${currentStreak} trades.`,
        status: 'unread',
        linkPath: '/portfolio',
        metadata: { streak: currentStreak },
      });
    }

    if (currentStreak >= 2 && !lastIsWin) {
      alerts.push({
        id: uuidv4(),
        userId,
        spaceId,
        type: 'alert',
        category: 'loss_streak',
        title: `${currentStreak}-trade losing streak`,
        description: `You've lost ${currentStreak} trades in a row. Consider reviewing your strategy.`,
        status: 'unread',
        linkPath: '/analytics',
        metadata: { streak: currentStreak },
      });
    }

    if (trades.length >= 10 && trades.length % 10 === 0) {
      alerts.push({
        id: uuidv4(),
        userId,
        spaceId,
        type: 'alert',
        category: 'milestone',
        title: `${trades.length} trades logged!`,
        description: `You've reached ${trades.length} total trades. Keep up the consistency.`,
        status: 'unread',
        linkPath: null,
        metadata: { tradeCount: trades.length },
      });
    }

    // Biggest win
    const biggestWinTrade = sorted.reduce(
      (best, t) => (t.profitLoss > best.profitLoss ? t : best),
      sorted[0],
    );
    if (biggestWinTrade && biggestWinTrade.profitLoss > 0) {
      alerts.push({
        id: uuidv4(),
        userId,
        spaceId,
        type: 'alert',
        category: 'biggest_win',
        title: 'Biggest winning trade',
        description: `Your largest profit was +$${biggestWinTrade.profitLoss.toFixed(2)} on ${new Date(biggestWinTrade.exitTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
        status: 'unread',
        linkPath: null,
        metadata: { tradeId: biggestWinTrade.id, profitLoss: biggestWinTrade.profitLoss },
      });
    }

    // Biggest loss
    const biggestLossTrade = sorted.reduce(
      (worst, t) => (t.profitLoss < worst.profitLoss ? t : worst),
      sorted[0],
    );
    if (biggestLossTrade && biggestLossTrade.profitLoss < 0) {
      alerts.push({
        id: uuidv4(),
        userId,
        spaceId,
        type: 'alert',
        category: 'biggest_loss',
        title: 'Biggest losing trade',
        description: `Your largest loss was ${biggestLossTrade.profitLoss.toFixed(2)} on ${new Date(biggestLossTrade.exitTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
        status: 'unread',
        linkPath: null,
        metadata: { tradeId: biggestLossTrade.id, profitLoss: biggestLossTrade.profitLoss },
      });
    }

    if (trades.length >= 5 && winRate < 40) {
      alerts.push({
        id: uuidv4(),
        userId,
        spaceId,
        type: 'alert',
        category: 'low_winrate',
        title: `Win rate dropped to ${Math.round(winRate)}%`,
        description: `Only ${winningTrades} of ${trades.length} trades are winners. Consider adjusting your entries.`,
        status: 'unread',
        linkPath: '/analytics',
        metadata: { winRate: Math.round(winRate) },
      });
    }

    if (trades.length >= 5 && winRate > 75) {
      alerts.push({
        id: uuidv4(),
        userId,
        spaceId,
        type: 'alert',
        category: 'high_winrate',
        title: `Win rate at ${Math.round(winRate)}%`,
        description: `Excellent performance! ${winningTrades} of ${trades.length} trades were winners.`,
        status: 'unread',
        linkPath: null,
        metadata: { winRate: Math.round(winRate) },
      });
    }

    if (totalPL > 1000) {
      alerts.push({
        id: uuidv4(),
        userId,
        spaceId,
        type: 'alert',
        category: 'total_profit',
        title: 'Total profit exceeds USD 1,000',
        description: `Your cumulative P&L is +$${totalPL.toFixed(2)}. Outstanding result!`,
        status: 'unread',
        linkPath: null,
        metadata: { totalPL },
      });
    }

    if (alerts.length > 0) {
      await notificationRepository.createMany(alerts);
    }
  },
};
