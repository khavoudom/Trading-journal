import { startOfWeek, endOfWeek, format } from 'date-fns';
import type { Trade } from '@/types/trade';

export const INITIAL_BALANCE = 10000;

export function aggregateWeekly(
  trades: Trade[],
): { date: string; equity: number; drawdown: number; peak: number }[] {
  const closed = trades.filter((t) => t.status !== 'pending');
  if (closed.length === 0) return [];

  const sorted = [...closed].sort(
    (a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime(),
  );

  const weeks: Map<string, number> = new Map();
  const weekEnds: Map<string, Date> = new Map();
  for (const trade of sorted) {
    const d = new Date(trade.exitTime);
    const weekStart = startOfWeek(d, { weekStartsOn: 1 });
    const key = format(weekStart, 'yyyy-MM-dd');
    weeks.set(key, (weeks.get(key) || 0) + trade.profitLoss);
    weekEnds.set(key, endOfWeek(d, { weekStartsOn: 1 }));
  }

  let cumulative = INITIAL_BALANCE;
  let peak = INITIAL_BALANCE;
  const result: { date: string; equity: number; drawdown: number; peak: number }[] = [];

  for (const [key, pnl] of weeks) {
    cumulative += pnl;
    if (cumulative > peak) peak = cumulative;
    const dd = peak - cumulative;
    result.push({
      date: format(weekEnds.get(key)!, 'MMM d'),
      equity: cumulative,
      drawdown: dd,
      peak,
    });
  }

  return result;
}

export function aggregateMonthly(
  trades: Trade[],
): { date: string; equity: number; drawdown: number; peak: number }[] {
  const closed = trades.filter((t) => t.status !== 'pending');
  if (closed.length === 0) return [];

  const sorted = [...closed].sort(
    (a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime(),
  );

  const months: Map<string, number> = new Map();
  for (const trade of sorted) {
    const d = new Date(trade.exitTime);
    const key = format(d, 'yyyy-MM');
    months.set(key, (months.get(key) || 0) + trade.profitLoss);
  }

  let cumulative = INITIAL_BALANCE;
  let peak = INITIAL_BALANCE;
  const result: { date: string; equity: number; drawdown: number; peak: number }[] = [];

  for (const [key, pnl] of months) {
    cumulative += pnl;
    if (cumulative > peak) peak = cumulative;
    const dd = peak - cumulative;
    result.push({
      date: format(new Date(key + '-01'), 'MMM yyyy'),
      equity: cumulative,
      drawdown: dd,
      peak,
    });
  }

  return result;
}
