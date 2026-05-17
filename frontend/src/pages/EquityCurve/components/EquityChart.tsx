import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import type { Trade } from '@/types/trade';
import { INITIAL_BALANCE, aggregateWeekly, aggregateMonthly } from '../utils/aggregation';
import { CustomTooltip } from './CustomTooltip';

type ViewMode = 'daily' | 'weekly' | 'monthly';

export function EquityChart({
  trades,
  portfolioData,
  viewMode,
}: {
  trades: Trade[];
  portfolioData: { date: string; value: number; profitLoss: number }[];
  viewMode: ViewMode;
}) {
  const chartData = useMemo(() => {
    if (viewMode === 'daily') {
      if (portfolioData.length === 0) return [];
      let peak = INITIAL_BALANCE;
      return portfolioData.map((d) => {
        if (d.value > peak) peak = d.value;
        const drawdown = peak - d.value;
        return { ...d, equity: d.value, drawdown, peak };
      });
    }
    if (viewMode === 'weekly') return aggregateWeekly(trades);
    return aggregateMonthly(trades);
  }, [viewMode, portfolioData, trades]);

  const isLoading = trades.length > 0 && portfolioData.length === 0;
  const isEmpty = trades.length === 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-100">
        <Loader2 className="w-6 h-6 text-green animate-spin" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-100 border border-dashed border-border rounded-lg">
        <span className="text-xs text-gray-500">No trade data yet</span>
      </div>
    );
  }

  return (
    <div className="h-100 w-full" style={{ minHeight: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <defs>
            <linearGradient id="eqGradFull" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e5a0" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#00e5a0" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#ff6b35" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.15}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="var(--muted)"
            fontSize={11}
            tickMargin={8}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted)"
            fontSize={11}
            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <ReferenceLine
            y={INITIAL_BALANCE}
            stroke="var(--border2)"
            strokeDasharray="4 4"
            strokeWidth={0.5}
          />
          <Area
            type="monotone"
            dataKey="drawdown"
            stroke="none"
            fill="url(#ddGrad)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="#00e5a0"
            strokeWidth={2}
            fill="url(#eqGradFull)"
            isAnimationActive={false}
            dot={false}
            activeDot={{
              r: 4,
              fill: '#00e5a0',
              stroke: '#00e5a0',
              strokeWidth: 2,
              strokeOpacity: 0.4,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
