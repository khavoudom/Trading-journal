import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { ClipboardCheck, Target } from 'lucide-react';
import type { Trade, AnalyticsSummary } from '@/types/trade';
import { ScoreCard } from './components/ScoreCard';
import { EquityCurveChart } from './components/EquityCurveChart';
import { TradeDistributionChart } from './components/TradeDistributionChart';
import { StrategyPerformanceChart } from './components/StrategyPerformanceChart';

interface AnalyticsPageProps {
  portfolioData: any[];
  trades: Trade[];
  analytics: AnalyticsSummary | null;
  disciplineScore: number;
  setupScore: number;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  portfolioData,
  trades,
  analytics,
  disciplineScore,
  setupScore,
}) => {
  const winLossData = [
    { name: 'Wins', value: analytics?.winningTrades || 0, color: 'var(--green)' },
    { name: 'Losses', value: analytics?.losingTrades || 0, color: 'var(--orange)' },
  ];

  const strategyData = trades
    .filter((t) => t.status !== 'pending' && t.status !== 'running')
    .reduce((acc: any[], trade: any) => {
      const existing = acc.find((s) => s.name === trade.strategy);
      if (existing) {
        existing.value += trade.profitLoss;
        existing.count += 1;
      } else {
        acc.push({ name: trade.strategy, value: trade.profitLoss, count: 1 });
      }
      return acc;
    }, []);

  return (
    <div className="space-y-6">
      {/* Discipline & Setup Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <ScoreCard
          icon={<ClipboardCheck className="w-5 h-5 text-green" />}
          label="Discipline Score"
          score={disciplineScore}
        />
        <ScoreCard
          icon={<Target className="w-5 h-5 text-green" />}
          label="Setup Compliance"
          score={setupScore}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Equity Curve */}
        <EquityCurveChart portfolioData={portfolioData} />

        {/* Win/Loss Distribution */}
        <Panel>
          <PanelHeader>
            <div className="text-[13px] font-bold text-text">Trade Distribution</div>
            <div className="text-[11px] text-text2">Win vs loss breakdown</div>
          </PanelHeader>
          <PanelBody>
            <TradeDistributionChart winLossData={winLossData} winRate={analytics?.winRate || 0} />
          </PanelBody>
        </Panel>

        {/* Strategy Performance */}
        <Panel>
          <PanelHeader>
            <div className="text-[13px] font-bold text-text">Strategy Performance</div>
            <div className="text-[11px] text-text2">P&L by strategy</div>
          </PanelHeader>
          <PanelBody>
            <StrategyPerformanceChart strategyData={strategyData} />
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
};

export default AnalyticsPage;
