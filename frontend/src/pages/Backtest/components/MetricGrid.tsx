import { MetricCard } from './MetricCard';
import { EquityCurvePreview } from './EquityCurvePreview';

interface BacktestResult {
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  avgReturn: number;
  maxDrawdown: number;
}

export function MetricGrid({
  result,
  strategyName,
}: {
  result: BacktestResult;
  strategyName: string;
}) {
  return (
    <>
      <div className="mb-6">
        <div className="text-[11px] font-bold tracking-[0.5px] text-text2 uppercase mb-2">
          Results for: {strategyName}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard label="Win Rate" value={`${result.winRate}%`} color="var(--blue)" />
          <MetricCard
            label="Total Trades"
            value={result.totalTrades.toString()}
            color="var(--blue)"
          />
          <MetricCard
            label="Profit Factor"
            value={result.profitFactor.toFixed(2)}
            color="var(--green)"
          />
          <MetricCard label="Avg Return" value={`+${result.avgReturn}%`} color="var(--green)" />
          <MetricCard label="Max Drawdown" value={`${result.maxDrawdown}%`} color="var(--orange)" />
        </div>
      </div>
      <EquityCurvePreview />
    </>
  );
}
