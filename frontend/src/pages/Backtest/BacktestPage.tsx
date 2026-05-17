import { useState } from 'react';
import { History, TrendingUp } from 'lucide-react';
import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { BacktestForm } from './components/BacktestForm';
import { MetricGrid } from './components/MetricGrid';

interface BacktestResult {
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  avgReturn: number;
  maxDrawdown: number;
}

export default function BacktestPage() {
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [strategyName, setStrategyName] = useState('');

  const handleRun = (name: string) => {
    setStrategyName(name);
    setLoading(true);
    setTimeout(() => {
      setResult({
        winRate: 54.2,
        totalTrades: 142,
        profitFactor: 1.86,
        avgReturn: 2.4,
        maxDrawdown: -8.3,
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-subtle flex items-center justify-center">
              <History className="w-4 h-4 text-green" />
            </div>
            <div>
              <div
                className="text-[13px] font-bold text-text"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Backtest
              </div>
              <div className="text-[11px] text-text2">
                Test strategy rules against historical trade data
              </div>
            </div>
          </div>
        </PanelHeader>
        <PanelBody>
          <BacktestForm loading={loading} onRun={handleRun} />

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-lg">
              <History className="w-10 h-10 text-gray-500 mb-3 opacity-30" />
              <span className="text-xs text-gray-500">Upload a strategy rule set to begin</span>
              <span className="text-[10px] text-gray-500 mt-1 opacity-60">
                CSV or JSON format supported
              </span>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="w-8 h-8 text-green mb-3 animate-pulse" />
              <span className="text-xs text-gray-500">Running backtest...</span>
            </div>
          )}

          {result && <MetricGrid result={result} strategyName={strategyName} />}
        </PanelBody>
      </Panel>
    </div>
  );
}
