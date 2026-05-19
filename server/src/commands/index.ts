import 'dotenv/config';
import { getPrisma, disconnectPrisma } from '@/database/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { CONTRACT_SIZES } from '@/config/instruments.js';
import { logger } from '@/utils/logger.js';

type CommandHandler = (args: string[]) => Promise<void>;

interface Command {
  name: string;
  description: string;
  handler: CommandHandler;
}

const commands: Command[] = [];

function register(command: Command) {
  commands.push(command);
}

// ── schedule:clear ──────────────────────────────────────────────
register({
  name: 'schedule:clear',
  description: 'Delete all calendar events, drawings, and drawing board drawings.',
  async handler(_args: string[]) {
    const prisma = getPrisma();

    logger.info('CMD', 'Deleting all drawing board drawings...');
    const deletedBoardDrawings = await prisma.drawingBoardDrawing.deleteMany();
    logger.info('CMD', `  → ${deletedBoardDrawings.count} drawing board drawings deleted`);

    logger.info('CMD', 'Deleting all calendar drawings...');
    const deletedCalendarDrawings = await prisma.calendarDrawing.deleteMany();
    logger.info('CMD', `  → ${deletedCalendarDrawings.count} calendar drawings deleted`);

    logger.info('CMD', 'Deleting all calendar events...');
    const deletedEvents = await prisma.calendarEvent.deleteMany();
    logger.info('CMD', `  → ${deletedEvents.count} calendar events deleted`);

    logger.info('CMD', 'Schedule cleared successfully.');
  },
});

// ── trade:seed ──────────────────────────────────────────────────
const INSTRUMENTS = Object.keys(CONTRACT_SIZES);

const STRATEGIES = [
  'Trend Following',
  'Breakout',
  'Reversal',
  'Scalping',
  'Swing Trading',
  'Momentum',
  'Mean Reversion',
  'Gap Trading',
];

const EMOTIONS = ['neutral', 'confident', 'anxious', 'excited', 'frustrated', 'disciplined'];

const TAGS_POOL = [
  'earnings',
  'news',
  'FOMC',
  'pre-market',
  'post-market',
  'high-volume',
  'low-volume',
  'gap-up',
  'gap-down',
  'range-bound',
  'breakout-failure',
  'follow-through',
  'partial',
  'full-size',
  'good-entry',
  'bad-entry',
  'managed-well',
  'revenge',
  'fomo',
];

/**
 * Pick a random element from an array.
 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Random float between min and max, rounded to `decimals` places.
 */
function randFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

/**
 * Calculate P&L the same way tradeService does.
 */
function calcPL(instrument: string, side: string, entry: number, exit: number, qty: number) {
  const isLong = side === 'Long';
  const priceDiff = isLong ? exit - entry : entry - exit;
  const contractSize = CONTRACT_SIZES[instrument] || 1;
  const profitLoss = priceDiff * qty * contractSize;
  const profitLossPercent = entry > 0 ? (priceDiff / entry) * 100 : 0;
  return { profitLoss, profitLossPercent };
}

/**
 * Generate a deterministic-ish but realistic trade row.
 * i ranges 0..99 to spread dates and vary outcomes.
 */
function makeTrade(i: number, userId: string, spaceId: string) {
  const instrument = pick(INSTRUMENTS);
  const side: 'Long' | 'Short' = Math.random() > 0.5 ? 'Long' : 'Short';
  const strategy = pick(STRATEGIES);
  const emotion = pick(EMOTIONS);

  // Pick a random tag count (1-3)
  const tagCount = Math.floor(Math.random() * 3) + 1;
  const tags: string[] = [];
  for (let t = 0; t < tagCount; t++) {
    const tag = pick(TAGS_POOL);
    if (!tags.includes(tag)) tags.push(tag);
  }

  // Realistic price & quantity per instrument
  let entryPrice: number;
  let quantity: number;
  switch (instrument) {
    case 'SPY':
      entryPrice = randFloat(430, 600);
      quantity = randFloat(10, 200, 0);
      break;
    case 'NQ':
      entryPrice = randFloat(15000, 22000, 1);
      quantity = randFloat(1, 20, 0);
      break;
    case 'GC':
      entryPrice = randFloat(1800, 2800, 1);
      quantity = randFloat(1, 20, 0);
      break;
    case 'CL':
      entryPrice = randFloat(60, 130, 1);
      quantity = randFloat(1, 30, 0);
      break;
    case 'EURUSD':
      entryPrice = randFloat(1.02, 1.2, 4);
      quantity = randFloat(1000, 50000, 0);
      break;
    case 'GBPUSD':
      entryPrice = randFloat(1.15, 1.4, 4);
      quantity = randFloat(1000, 50000, 0);
      break;
    case 'BTC':
      entryPrice = randFloat(30000, 120000, 0);
      quantity = randFloat(0.1, 5, 2);
      break;
    case 'XAUUSD':
      entryPrice = randFloat(1800, 2800, 1);
      quantity = randFloat(1, 30, 0);
      break;
    case 'NASDAQ':
      entryPrice = randFloat(15000, 22000, 1);
      quantity = randFloat(1, 30, 0);
      break;
    default:
      entryPrice = randFloat(50, 500);
      quantity = randFloat(10, 200, 0);
  }

  // ~60% win rate, randomize exit price
  const isWin = Math.random() < 0.6;
  const priceMovePct = isWin
    ? randFloat(0.3, 4.0) // winner
    : randFloat(-4.0, -0.3); // loser
  const exitPrice = parseFloat(
    (entryPrice + (side === 'Long' ? 1 : -1) * entryPrice * (priceMovePct / 100)).toFixed(
      instrument === 'EURUSD' || instrument === 'GBPUSD' ? 4 : 2,
    ),
  );

  // Status: ~70% closed, 20% running, 10% pending
  let status: 'closed' | 'running' | 'pending';
  const roll = Math.random();
  if (roll < 0.7) status = 'closed';
  else if (roll < 0.9) status = 'running';
  else status = 'pending';

  // Spread dates over the past 60 days
  const daysAgo = 60 - i;
  const entryTime = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000 * 0.3);
  const exitTime = new Date(entryTime.getTime() + Math.random() * 86400000 * 2 + 3600000);

  const pl =
    status === 'closed'
      ? calcPL(instrument, side, entryPrice, exitPrice, quantity)
      : { profitLoss: 0, profitLossPercent: 0 };

  return {
    id: uuidv4(),
    userId,
    spaceId,
    instrument,
    side,
    strategy,
    entryPrice,
    exitPrice,
    quantity,
    entryTime,
    exitTime,
    profitLoss: pl.profitLoss,
    profitLossPercent: pl.profitLossPercent,
    status,
    tags,
    emotion,
  };
}

register({
  name: 'trade:seed',
  description:
    'Seed 100 random trades for a user. Usage: npm run cmd -- trade:seed <userId> <spaceId>',
  async handler(args: string[]) {
    const [userId, spaceId] = args;

    if (!userId || !spaceId) {
      logger.error('CMD', 'Usage: npm run cmd -- trade:seed <userId> <spaceId>');
      process.exit(1);
    }

    const prisma = getPrisma();

    // Verify user and space exist
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      logger.error('CMD', `User "${userId}" not found.`);
      process.exit(1);
    }
    const space = await prisma.space.findFirst({ where: { id: spaceId, userId } });
    if (!space) {
      logger.error('CMD', `Space "${spaceId}" not found for user "${userId}".`);
      process.exit(1);
    }

    logger.info(
      'CMD',
      `Seeding 100 trades for user "${user.username}" / space "${space.name}" ...`,
    );

    const trades = Array.from({ length: 100 }, (_, i) => makeTrade(i, userId, spaceId));

    // Insert in batches of 20 for efficiency
    const BATCH = 20;
    for (let i = 0; i < trades.length; i += BATCH) {
      const batch = trades.slice(i, i + BATCH);
      await prisma.trade.createMany({ data: batch });
      logger.info('CMD', `  → inserted ${Math.min(i + BATCH, trades.length)} / 100 trades`);
    }

    // Count closed / winning
    const closed = trades.filter((t) => t.status === 'closed');
    const winners = closed.filter((t) => t.profitLoss > 0);
    logger.info('CMD', 'Done.');
    logger.info(
      'CMD',
      `  Total: 100 trades (${trades.filter((t) => t.status === 'closed').length} closed, ${trades.filter((t) => t.status === 'running').length} running, ${trades.filter((t) => t.status === 'pending').length} pending)`,
    );
    logger.info(
      'CMD',
      `  Closed win rate: ${closed.length > 0 ? Math.round((winners.length / closed.length) * 100) : 0}% (${winners.length}W / ${closed.length - winners.length}L)`,
    );
  },
});

// ── Runner ──────────────────────────────────────────────────────
async function main() {
  const [, , commandName, ...args] = process.argv;

  if (!commandName || commandName === 'list') {
    console.log('\n  Available commands:\n');
    for (const cmd of commands) {
      console.log(`  ${cmd.name.padEnd(28)} ${cmd.description}`);
    }
    console.log();
    process.exit(0);
  }

  const cmd = commands.find((c) => c.name === commandName);
  if (!cmd) {
    console.error(`\n  Unknown command: "${commandName}"`);
    console.error('  Run "artisan list" to see available commands.\n');
    process.exit(1);
  }

  try {
    await cmd.handler(args);
  } catch (err) {
    logger.error('CMD', 'Command failed: %O', err);
    process.exit(1);
  } finally {
    await disconnectPrisma();
  }
}

main();
