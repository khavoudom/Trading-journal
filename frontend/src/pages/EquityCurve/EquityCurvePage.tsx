import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import type { Trade } from '@/types/trade';
import { EquityChart } from './components/EquityChart';
import { StatCards } from './components/StatCards';
import { INITIAL_BALANCE } from './utils/aggregation';
import { formatUSD } from '@/utils/format';

type ViewMode = 'daily' | 'weekly' | 'monthly';

interface EquityCurvePageProps {
  trades: Trade[];
  portfolioData: { date: string; value: number; profitLoss: number }[];
}

export default function EquityCurvePage({ trades, portfolioData }: EquityCurvePageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  const currentValue = useMemo(() => {
    if (viewMode === 'daily') {
      if (portfolioData.length === 0) return INITIAL_BALANCE;
      return portfolioData[portfolioData.length - 1].value;
    }
    // For weekly/monthly, compute from trades
    const closedTrades = trades.filter((t) => t.status !== 'pending');
    if (closedTrades.length === 0) return INITIAL_BALANCE;
    return closedTrades.reduce((sum, t) => sum + t.profitLoss, INITIAL_BALANCE);
  }, [viewMode, portfolioData, trades]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-md bg-green-subtle flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-green" />
        </div>
        <div>
          <h2
            className="text-lg font-semibold text-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Equity Curve
          </h2>
          <p className="text-xs text-text2">Account growth over time</p>
        </div>
      </div>

      <Panel>
        <PanelHeader>
          <div className="flex items-center gap-3">
            <span
              className="text-xl font-extrabold text-green"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {formatUSD(currentValue)}
            </span>
            <span className="text-[11px] text-text2">
              {viewMode === 'daily' ? 'Daily' : viewMode === 'weekly' ? 'Weekly' : 'Monthly'} view
            </span>
          </div>
          <div className="flex gap-1.5">
            {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                  viewMode === mode
                    ? 'bg-green-subtle text-green'
                    : 'bg-transparent text-gray-500 hover:text-text2'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </PanelHeader>
        <PanelBody>
          <EquityChart trades={trades} portfolioData={portfolioData} viewMode={viewMode} />
        </PanelBody>
      </Panel>

      {/* Summary stats */}
      {trades.length > 0 && <StatCards currentValue={currentValue} />}
    </div>
  );
}
