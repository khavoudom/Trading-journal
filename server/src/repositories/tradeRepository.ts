import { getPrisma } from '@/database/prisma.js';
import { Prisma } from '@/generated/prisma/client.js';

type TradeRow = {
  id: string;
  userId: string;
  spaceId: string;
  instrument: string;
  side: string;
  strategy: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTime: Date;
  exitTime: Date;
  profitLoss: number;
  profitLossPercent: number;
  status: string;
  tags: Prisma.JsonValue;
  notes: string | null;
  screenshots: Prisma.JsonValue;
  emotion: string;
  planData: Prisma.JsonValue;
  setupData: Prisma.JsonValue;
};

interface TemplateTradeItem {
  itemId: string;
  label: string;
  type: 'checkbox' | 'text' | 'number';
  checked: boolean;
  value: string | null;
}

interface TemplateTradeAttachment {
  templateId: string;
  templateName: string;
  typeName: string;
  items: TemplateTradeItem[];
}

/** Normalize planData/setupData from DB — handle backward compat with old string[] format */
function normalizeTemplateData(value: Prisma.JsonValue): TemplateTradeAttachment[] {
  if (!value) return [];
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'templateId' in value[0]
  ) {
    return value as unknown as TemplateTradeAttachment[];
  }
  // Old format (string[]) — return empty, old data is not compatible
  return [];
}

const mapTrade = (row: TradeRow) => ({
  id: row.id,
  userId: row.userId,
  spaceId: row.spaceId,
  instrument: row.instrument,
  side: row.side as 'Long' | 'Short',
  strategy: row.strategy,
  entryPrice: row.entryPrice,
  exitPrice: row.exitPrice,
  quantity: row.quantity,
  entryTime: row.entryTime.toISOString(),
  exitTime: row.exitTime.toISOString(),
  profitLoss: row.profitLoss,
  profitLossPercent: row.profitLossPercent,
  status: row.status as 'pending' | 'running' | 'closed' | undefined,
  tags: row.tags as string[],
  notes: row.notes ?? undefined,
  screenshots: row.screenshots as string[],
  emotion: row.emotion,
  planData: normalizeTemplateData(row.planData),
  setupData: normalizeTemplateData(row.setupData),
});

/** Data access layer for trade records using Prisma. */
export const tradeRepository = {
  /** Returns all trades for a user within a space, ordered by entry time descending (trade day). */
  findAll: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    const rows = await prisma.trade.findMany({
      where: { userId, spaceId },
      orderBy: [{ entryTime: 'desc' }],
    });
    return rows.map(mapTrade);
  },

  /** Finds a single trade by ID, user, and space. */
  findById: async (id: string, userId: string, spaceId: string) => {
    const prisma = getPrisma();
    const row = await prisma.trade.findFirst({ where: { id, userId, spaceId } });
    return row ? mapTrade(row) : null;
  },

  /** Inserts a new trade record with all fields. */
  create: async (data: {
    id: string;
    userId: string;
    spaceId: string;
    instrument: string;
    side: string;
    strategy: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    entryTime: Date;
    exitTime: Date;
    profitLoss: number;
    profitLossPercent: number;
    status: string;
    tags: string[];
    notes?: string;
    screenshots: string[];
    emotion: string;
    planData: TemplateTradeAttachment[];
    setupData: TemplateTradeAttachment[];
  }) => {
    const prisma = getPrisma();
    const { planData, setupData, ...rest } = data;
    const row = await prisma.trade.create({
      data: {
        ...rest,
        planData: planData as unknown as Prisma.InputJsonValue,
        setupData: setupData as unknown as Prisma.InputJsonValue,
      },
    });
    return mapTrade(row as unknown as TradeRow);
  },

  /** Updates an existing trade record identified by id, userId, and spaceId. */
  update: async (data: {
    id: string;
    userId: string;
    spaceId: string;
    instrument: string;
    side: string;
    strategy: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    entryTime: Date;
    exitTime: Date;
    profitLoss: number;
    profitLossPercent: number;
    status: string;
    tags: string[];
    notes?: string;
    screenshots: string[];
    emotion: string;
    planData: TemplateTradeAttachment[];
    setupData: TemplateTradeAttachment[];
  }) => {
    const prisma = getPrisma();
    const { id, planData, setupData, ...rest } = data;
    await prisma.trade.update({
      where: { id },
      data: {
        ...rest,
        planData: planData as unknown as Prisma.InputJsonValue,
        setupData: setupData as unknown as Prisma.InputJsonValue,
      },
    });
  },

  /** Deletes a trade by ID, user, and space. Returns true if a row was deleted. */
  remove: async (id: string, userId: string, spaceId: string) => {
    const prisma = getPrisma();
    const row = await prisma.trade.findFirst({ where: { id, userId, spaceId } });
    if (!row) return false;
    await prisma.trade.delete({ where: { id } });
    return true;
  },

  /** Returns all raw trade rows for analytics computation. */
  findAllRaw: async (userId: string, spaceId: string): Promise<TradeRow[]> => {
    const prisma = getPrisma();
    const rows = await prisma.trade.findMany({
      where: { userId, spaceId },
    });
    return rows as unknown as TradeRow[];
  },

  /** Returns the trade with the highest profit for a user and space. */
  findBestTrade: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    const row = await prisma.trade.findFirst({
      where: { userId, spaceId, status: { notIn: ['pending', 'running'] } },
      orderBy: { profitLoss: 'desc' },
    });
    return row ? mapTrade(row) : null;
  },

  /** Returns the trade with the lowest profit (worst loss) for a user and space. */
  findWorstTrade: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    const row = await prisma.trade.findFirst({
      where: { userId, spaceId, status: { notIn: ['pending', 'running'] } },
      orderBy: { profitLoss: 'asc' },
    });
    return row ? mapTrade(row) : null;
  },

  /** Deletes all trades belonging to a user within a space. */
  deleteByUserAndSpace: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    await prisma.trade.deleteMany({ where: { spaceId, userId } });
  },
};
