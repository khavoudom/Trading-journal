import {
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  Flame,
  ShieldCheck,
  Trophy,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { CONTRACT_SIZES } from '@/constants/instruments';
import type { RiskRule } from '@/types/riskRule';
import type { Trade } from '@/types/trade';
import { formatUSD } from '@/utils/format';

export interface AlertAction {
  label: string;
  path: string;
  search?: string;
}

export interface AlertItem {
  id: string;
  type: 'positive' | 'negative' | 'info' | 'warning';
  icon: ReactNode;
  title: string;
  description: string;
  read?: boolean;
  action?: AlertAction;
}

const getTradeDateKey = (trade: Trade) => new Date(trade.exitTime).toISOString().slice(0, 10);

const getTradeExposure = (trade: Trade) =>
  Math.abs(trade.entryPrice * trade.quantity * (CONTRACT_SIZES[trade.instrument] || 1));

const getChecklistCompletion = (trade: Trade) => {
  const checklistItems = [...(trade.planData || []), ...(trade.setupData || [])].flatMap(
    (attachment) => attachment.items.filter((item) => item.type === 'checkbox'),
  );

  if (checklistItems.length === 0) return null;

  const completed = checklistItems.filter((item) => item.checked).length;
  return completed / checklistItems.length;
};

const getRiskViolations = (
  trade: Trade,
  rules: RiskRule[],
  dailyPL: Map<string, number>,
  dailyExposure: Map<string, number>,
) => {
  const activeRules = rules.filter((rule) => rule.enabled);
  const violations: string[] = [];
  const dateKey = getTradeDateKey(trade);

  for (const rule of activeRules) {
    if (rule.name === 'max_position_size' && trade.quantity > rule.value) {
      violations.push(`position size above ${rule.value} ${rule.unit}`);
    }

    if (rule.name === 'daily_drawdown' && (dailyPL.get(dateKey) || 0) < -Math.abs(rule.value)) {
      violations.push(`daily drawdown above ${formatUSD(rule.value, { decimals: 2 })}`);
    }

    if (
      rule.name === 'correlated_exposure' &&
      rule.unit === 'USD' &&
      (dailyExposure.get(dateKey) || 0) > rule.value
    ) {
      violations.push(`daily exposure above ${formatUSD(rule.value, { decimals: 2 })}`);
    }
  }

  return violations;
};

const getExecutionScore = (trade: Trade, violations: string[]) => {
  const checklistCompletion = getChecklistCompletion(trade);
  const checklistScore = checklistCompletion === null ? 50 : checklistCompletion * 100;
  const resultAdjustment = trade.profitLoss > 0 ? 10 : trade.profitLoss < 0 ? -10 : 0;

  return checklistScore + resultAdjustment - violations.length * 35;
};

export function buildAlertItems(trades: Trade[], rules: RiskRule[]): AlertItem[] {
  const items: AlertItem[] = [];

  if (trades.length === 0) {
    items.push({
      id: 'no-trades',
      type: 'info',
      icon: <Bell className="w-4 h-4" />,
      title: 'No trades yet',
      description: 'Start logging your trades to receive insights and alerts.',
      action: { label: 'Log your first trade', path: '/portfolio', search: 'newTrade' },
    });
    return items;
  }

  const sorted = [...trades]
    .filter((t) => t.status !== 'pending' && t.status !== 'running')
    .sort((a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime());

  if (sorted.length === 0) {
    items.push({
      id: 'no-closed-trades',
      type: 'info',
      icon: <Bell className="w-4 h-4" />,
      title: 'No closed trades yet',
      description: 'Close a trade to start receiving performance insights and alerts.',
      action: { label: 'View portfolio', path: '/portfolio' },
    });
    return items;
  }

  const lastTrade = sorted[sorted.length - 1];

  let currentStreak = 1;
  const lastIsWin = lastTrade.profitLoss >= 0;
  for (let i = sorted.length - 2; i >= 0; i--) {
    if (sorted[i].profitLoss >= 0 === lastIsWin) currentStreak++;
    else break;
  }

  let longestWin = 0;
  let longestLoss = 0;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prevWin = sorted[i - 1].profitLoss >= 0;
    const currWin = sorted[i].profitLoss >= 0;
    if (currWin === prevWin) {
      run++;
    } else {
      if (prevWin) longestWin = Math.max(longestWin, run);
      else longestLoss = Math.max(longestLoss, run);
      run = 1;
    }
  }
  if (sorted[sorted.length - 1].profitLoss >= 0) longestWin = Math.max(longestWin, run);
  else longestLoss = Math.max(longestLoss, run);

  const winningTrades = sorted.filter((t) => t.profitLoss > 0).length;
  const winRate = (winningTrades / sorted.length) * 100;
  const totalPL = sorted.reduce((sum, t) => sum + t.profitLoss, 0);
  const dailyPL = sorted.reduce((acc, trade) => {
    const dateKey = getTradeDateKey(trade);
    acc.set(dateKey, (acc.get(dateKey) || 0) + trade.profitLoss);
    return acc;
  }, new Map<string, number>());
  const dailyExposure = sorted.reduce((acc, trade) => {
    const dateKey = getTradeDateKey(trade);
    acc.set(dateKey, (acc.get(dateKey) || 0) + getTradeExposure(trade));
    return acc;
  }, new Map<string, number>());
  const tradeRiskData = sorted.map((trade) => {
    const violations = getRiskViolations(trade, rules, dailyPL, dailyExposure);
    return {
      trade,
      violations,
      score: getExecutionScore(trade, violations),
      checklistCompletion: getChecklistCompletion(trade),
    };
  });
  const biggestWinTrade = sorted.reduce(
    (best, t) => (t.profitLoss > (best?.profitLoss ?? -Infinity) ? t : best),
    sorted[0],
  );
  const biggestLossTrade = sorted.reduce(
    (worst, t) => (t.profitLoss < (worst?.profitLoss ?? Infinity) ? t : worst),
    sorted[0],
  );
  const bestExecution = tradeRiskData.reduce(
    (best, current) => (current.score > best.score ? current : best),
    tradeRiskData[0],
  );
  const worstExecution = tradeRiskData.reduce(
    (worst, current) => (current.score < worst.score ? current : worst),
    tradeRiskData[0],
  );
  const tradesWithRiskViolations = tradeRiskData.filter((item) => item.violations.length > 0);

  if (currentStreak >= 3 && lastIsWin) {
    items.push({
      id: 'win-streak',
      type: 'positive',
      icon: <Flame className="w-4 h-4" />,
      title: `${currentStreak}-trade winning streak!`,
      description: `You're on fire! Your current win streak is ${currentStreak} trades.`,
      action: { label: 'View trades', path: '/portfolio' },
    });
  }
  if (currentStreak >= 2 && !lastIsWin) {
    items.push({
      id: 'loss-streak',
      type: 'negative',
      icon: <Zap className="w-4 h-4" />,
      title: `${currentStreak}-trade losing streak`,
      description: `You've lost ${currentStreak} trades in a row. Consider reviewing your strategy.`,
      action: { label: 'Review analytics', path: '/analytics' },
    });
  }

  if (sorted.length >= 10 && sorted.length % 10 === 0) {
    items.push({
      id: 'trade-milestone',
      type: 'positive',
      icon: <Trophy className="w-4 h-4" />,
      title: `${sorted.length} trades logged!`,
      description: `You've reached ${sorted.length} total trades. Keep up the consistency.`,
    });
  }

  if (biggestWinTrade && biggestWinTrade.profitLoss > 0) {
    items.push({
      id: 'biggest-win',
      type: 'positive',
      icon: <Award className="w-4 h-4" />,
      title: 'Biggest winning trade',
      description: `Your largest profit was +${formatUSD(biggestWinTrade.profitLoss, { decimals: 2 })} on ${new Date(biggestWinTrade.exitTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
      action: {
        label: 'View trade',
        path: '/portfolio',
        search: `editTrade=${biggestWinTrade.id}`,
      },
    });
  }

  if (biggestLossTrade && biggestLossTrade.profitLoss < 0) {
    items.push({
      id: 'biggest-loss',
      type: 'negative',
      icon: <Zap className="w-4 h-4" />,
      title: 'Biggest losing trade',
      description: `Your largest loss was ${formatUSD(biggestLossTrade.profitLoss, { decimals: 2 })} on ${new Date(biggestLossTrade.exitTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
      action: {
        label: 'View trade',
        path: '/portfolio',
        search: `editTrade=${biggestLossTrade.id}`,
      },
    });
  }

  if (bestExecution && bestExecution.score >= 90 && bestExecution.violations.length === 0) {
    const checklistText =
      bestExecution.checklistCompletion === null
        ? 'No checklist was attached, and no active risk rules were violated.'
        : `${Math.round(bestExecution.checklistCompletion * 100)}% of checklist items were complete with no active risk rule violations.`;

    items.push({
      id: 'best-execution',
      type: 'positive',
      icon: <ShieldCheck className="w-4 h-4" />,
      title: 'Best execution quality',
      description: `${checklistText} P&L: ${formatUSD(bestExecution.trade.profitLoss, { showSign: true, decimals: 2 })}.`,
      action: {
        label: 'View trade',
        path: '/portfolio',
        search: `editTrade=${bestExecution.trade.id}`,
      },
    });
  }

  if (
    worstExecution &&
    (worstExecution.violations.length > 0 ||
      (worstExecution.checklistCompletion !== null && worstExecution.checklistCompletion < 0.5))
  ) {
    const reason =
      worstExecution.violations.length > 0
        ? worstExecution.violations.join(', ')
        : `${Math.round((worstExecution.checklistCompletion || 0) * 100)}% checklist completion`;

    items.push({
      id: 'worst-execution',
      type: 'warning',
      icon: <AlertTriangle className="w-4 h-4" />,
      title: 'Worst execution quality',
      description: `Review this trade: ${reason}. P&L: ${formatUSD(worstExecution.trade.profitLoss, { showSign: true, decimals: 2 })}.`,
      action: {
        label: 'Review trade',
        path: '/portfolio',
        search: `editTrade=${worstExecution.trade.id}`,
      },
    });
  }

  if (tradesWithRiskViolations.length > 0) {
    const latestViolation = tradesWithRiskViolations[tradesWithRiskViolations.length - 1];
    items.push({
      id: 'risk-rule-violations',
      type: 'warning',
      icon: <AlertTriangle className="w-4 h-4" />,
      title: `${tradesWithRiskViolations.length} trade${tradesWithRiskViolations.length === 1 ? '' : 's'} flagged by Risk Manager`,
      description: `Latest issue: ${latestViolation.violations.join(', ')}.`,
      action: { label: 'Open Risk Manager', path: '/risk-manager' },
    });
  }

  if (sorted.length >= 5 && winRate < 40) {
    items.push({
      id: 'low-winrate',
      type: 'warning',
      icon: <AlertTriangle className="w-4 h-4" />,
      title: `Win rate dropped to ${Math.round(winRate)}%`,
      description: `Only ${winningTrades} of ${sorted.length} trades are winners. Consider adjusting your entries.`,
      action: { label: 'Analyze strategies', path: '/analytics' },
    });
  }

  if (sorted.length >= 5 && winRate > 75) {
    items.push({
      id: 'high-winrate',
      type: 'positive',
      icon: <BarChart3 className="w-4 h-4" />,
      title: `Win rate at ${Math.round(winRate)}%`,
      description: `Excellent performance! ${winningTrades} of ${sorted.length} trades were winners.`,
    });
  }

  if (totalPL > 1000) {
    items.push({
      id: 'total-profit',
      type: 'positive',
      icon: <Trophy className="w-4 h-4" />,
      title: 'Total profit exceeds USD 1,000',
      description: `Your cumulative P&L is +${formatUSD(totalPL, { decimals: 2 })}. Outstanding result!`,
    });
  }

  const priority: Record<string, number> = { negative: 0, warning: 1, positive: 2, info: 3 };
  items.sort((a, b) => priority[a.type] - priority[b.type]);

  return items;
}
