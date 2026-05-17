import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import type { Trade, AnalyticsSummary } from '@/types/trade';
import type { RiskRule, RiskRuleName } from '@/types/riskRule';
import { RISK_RULE_META } from '@/types/riskRule';
import { useAuthStore } from '@/store/authStore';
import { useRiskRuleStore } from '@/store/riskRuleStore';
import { StatCard } from './components/StatCard';
import { RecentTrades } from './components/RecentTrades';
import { TradeJournal } from './components/TradeJournal';
import { PnLHeatmap } from './components/PnLHeatmap';
import { RiskBar } from './components/RiskBar';
import { formatUSD } from '@/utils/format';
import { CONTRACT_SIZES } from '@/constants/instruments';

interface DashboardPageProps {
  trades: Trade[];
  spaceId: string;
  analytics: AnalyticsSummary | null;
  isLoading: boolean;
  portfolioData: { date: string; value: number; profitLoss: number }[];
  portfolioChange: number;
}

interface RiskExposureRow {
  label: string;
  value: string;
  pct: number;
  color: string;
}

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getTradeDateKey = (trade: Trade) => getDateKey(new Date(trade.exitTime));

const getTradeExposure = (trade: Trade) =>
  Math.abs(trade.entryPrice * trade.quantity * (CONTRACT_SIZES[trade.instrument] || 1));

const getRiskColor = (pct: number) => {
  if (pct >= 100) return 'var(--orange)';
  if (pct >= 80) return 'var(--warning)';
  return 'var(--green)';
};

const formatRuleLimit = (rule: RiskRule) => {
  if (rule.unit === 'USD') return formatUSD(rule.value, { decimals: 0 });
  return `${rule.value.toLocaleString('en-US')} ${rule.unit}`;
};

const buildRiskExposureRows = (rules: RiskRule[], trades: Trade[]): RiskExposureRow[] => {
  const activeRules = rules.filter((rule) => rule.enabled);
  const closedTrades = trades.filter(
    (trade) => trade.status !== 'pending' && trade.status !== 'running',
  );
  const openTrades = trades.filter(
    (trade) => trade.status === 'pending' || trade.status === 'running',
  );
  const todayKey = getDateKey(new Date());
  const latestClosedTrade = [...closedTrades].sort(
    (a, b) => new Date(b.exitTime).getTime() - new Date(a.exitTime).getTime(),
  )[0];
  const activeDateKey = closedTrades.some((trade) => getTradeDateKey(trade) === todayKey)
    ? todayKey
    : latestClosedTrade
      ? getTradeDateKey(latestClosedTrade)
      : todayKey;
  const scopedClosedTrades = closedTrades.filter(
    (trade) => getTradeDateKey(trade) === activeDateKey,
  );
  const exposureTrades = openTrades.length > 0 ? openTrades : scopedClosedTrades;
  const activeDayPL = scopedClosedTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const exposure = exposureTrades.reduce((sum, trade) => sum + getTradeExposure(trade), 0);
  const maxQuantity = exposureTrades.reduce((max, trade) => Math.max(max, trade.quantity), 0);

  return activeRules.map((rule) => {
    const label = RISK_RULE_META[rule.name as RiskRuleName]?.label || rule.name;

    if (rule.name === 'daily_drawdown') {
      const drawdownUsed = Math.max(0, -activeDayPL);
      const pct = rule.value > 0 ? Math.min(100, (drawdownUsed / rule.value) * 100) : 0;
      return {
        label,
        value: `${formatUSD(drawdownUsed, { decimals: 0 })} / ${formatRuleLimit(rule)}`,
        pct,
        color: getRiskColor(pct),
      };
    }

    if (rule.name === 'max_position_size') {
      const pct = rule.value > 0 ? Math.min(100, (maxQuantity / rule.value) * 100) : 0;
      return {
        label,
        value: `${maxQuantity.toLocaleString('en-US')} / ${formatRuleLimit(rule)}`,
        pct,
        color: getRiskColor(pct),
      };
    }

    if (rule.name === 'correlated_exposure') {
      const pct = rule.value > 0 ? Math.min(100, (exposure / rule.value) * 100) : 0;
      return {
        label,
        value:
          rule.unit === 'USD'
            ? `${formatUSD(exposure, { decimals: 0 })} / ${formatRuleLimit(rule)}`
            : `${exposure.toLocaleString('en-US')} / ${formatRuleLimit(rule)}`,
        pct,
        color: getRiskColor(pct),
      };
    }

    return {
      label,
      value: `Not tracked / ${formatRuleLimit(rule)}`,
      pct: 0,
      color: 'var(--blue)',
    };
  });
};

export default function DashboardPage({
  trades,
  spaceId,
  analytics,
  isLoading,
  portfolioData,
  portfolioChange,
}: DashboardPageProps) {
  const { user } = useAuthStore();
  const { rules, fetchRules } = useRiskRuleStore();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetchRules(spaceId);
  }, [fetchRules, spaceId]);

  const avgRatio = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status !== 'pending' && t.status !== 'running');
    if (closedTrades.length === 0) return 0;
    const wins = closedTrades.filter((t) => t.profitLoss > 0);
    const losses = closedTrades.filter((t) => t.profitLoss < 0);
    if (losses.length === 0) return wins.length > 0 ? 999 : 0;
    const avgWin = wins.reduce((s, t) => s + t.profitLoss, 0) / wins.length;
    const avgLoss = Math.abs(losses.reduce((s, t) => s + t.profitLoss, 0) / losses.length);
    return avgLoss > 0 ? avgWin / avgLoss : 0;
  }, [trades]);

  const maxDrawdown = useMemo(() => {
    if (portfolioData.length === 0) return 0;
    let peak = portfolioData[0].value;
    let maxDd = 0;
    for (const p of portfolioData) {
      if (p.value > peak) peak = p.value;
      const dd = peak - p.value;
      if (dd > maxDd) maxDd = dd;
    }
    return -maxDd;
  }, [portfolioData]);

  const riskExposureRows = useMemo(() => buildRiskExposureRows(rules, trades), [rules, trades]);
  const riskAlertCount = riskExposureRows.filter((row) => row.pct >= 80).length;

  const formatCurrency = (val: number) => formatUSD(val, { showSign: true });

  return (
    <div className="space-y-6">
      {/* Greeting + Market Status */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[22px] font-extrabold tracking-[-0.5px]">
            {greeting}, {user?.username || 'Trader'} <span className="text-green">↗</span>
          </div>
          <div className="text-[13px] text-text2 mt-0.5">
            {analytics?.totalTrades || 0} trades this month ·{' '}
            {
              trades.filter(
                (t) => t.status !== 'pending' && t.status !== 'running' && t.profitLoss >= 0,
              ).length
            }{' '}
            winners · Win rate tracking
          </div>
        </div>
        <div className="hidden sm:flex gap-1.5">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-subtle text-green"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Market Open
          </span>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-subtle text-blue"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            NYSE
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          label="Net P&L (MTD)"
          value={formatCurrency(analytics?.totalProfitLoss || 0)}
          delta={portfolioChange >= 0 ? `${portfolioChange.toFixed(1)}%` : undefined}
          deltaUp={portfolioChange >= 0}
          deltaLabel="vs last month"
          color={(analytics?.totalProfitLoss ?? 0) >= 0 ? 'green' : 'red'}
          loading={isLoading}
        />
        <StatCard
          label="Win Rate"
          value={`${Math.round(analytics?.winRate || 0)}%`}
          delta={analytics?.winRate ? `${(analytics.winRate - 50).toFixed(1)}pp` : undefined}
          deltaUp={(analytics?.winRate || 0) >= 50}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          label="Avg R:R"
          value={(avgRatio || 0).toFixed(2)}
          delta={`${analytics?.totalTrades || 0} trades`}
          color="orange"
          loading={isLoading}
        />
        <StatCard
          label="Max Drawdown"
          value={formatCurrency(maxDrawdown)}
          color="purple"
          loading={isLoading}
        />
      </div>

      {/* Mid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Equity Curve */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-border">
            <div className="text-[13px] font-bold text-text">Equity curve</div>
            <div className="flex gap-1.5">
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${(analytics?.totalProfitLoss ?? 0) >= 0 ? 'bg-green-subtle text-green' : 'bg-red-subtle text-red'}`}
              >
                {formatCurrency(analytics?.totalProfitLoss || 0)}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-subtle text-blue cursor-pointer">
                30D
              </span>
            </div>
          </div>
          <div className="p-4.5">
            {portfolioData.length === 0 && !isLoading ? (
              <div className="flex items-center justify-center h-40 border border-dashed border-border rounded-lg">
                <span className="text-xs text-gray-500">No trade data yet</span>
              </div>
            ) : (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioData}>
                    <defs>
                      <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00e5a0" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#00e5a0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }: TooltipContentProps) => {
                        const point = payload?.[0];
                        const pointPayload = point?.payload as { date?: string } | undefined;
                        const value =
                          typeof point?.value === 'number'
                            ? point.value
                            : Number(point?.value || 0);

                        if (active && point) {
                          return (
                            <div className="bg-surface border border-border rounded-lg p-2.5 shadow-lg">
                              <div className="text-[11px] text-green font-medium">
                                {pointPayload?.date}
                              </div>
                              <div
                                className="text-sm font-bold text-text"
                                style={{ fontFamily: 'var(--font-mono)' }}
                              >
                                {formatUSD(value)}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#00e5a0"
                      strokeWidth={2}
                      fill="url(#eqGrad)"
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
            )}
            <div
              className="flex justify-between mt-2 text-[11px] text-text2"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span>May 1</span>
              <span>May 7</span>
              <span>May 14</span>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-border">
            <div className="text-[13px] font-bold text-text">Recent trades</div>
            <span
              onClick={() => navigate(`/space/${spaceId}/portfolio`)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-subtle text-blue cursor-pointer"
            >
              View all
            </span>
          </div>
          <div className="p-4.5">
            <RecentTrades trades={trades} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-3.5">
        {/* Trade Journal */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-border">
            <div className="text-[13px] font-bold text-text">Trade journal</div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-subtle text-green cursor-pointer">
              + Entry
            </span>
          </div>
          <div className="p-4.5">
            <TradeJournal trades={trades} />
          </div>
        </div>

        {/* Right Column: Heatmap + Risk */}
        <div className="flex flex-col gap-3.5">
          {/* P&L Heatmap */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-border">
              <div className="text-[13px] font-bold text-text">Monthly P&L heatmap</div>
              <div className="text-[11px] text-gray-500" style={{ fontFamily: 'var(--font-mono)' }}>
                MAY 2026
              </div>
            </div>
            <div className="p-4.5">
              <PnLHeatmap />
            </div>
          </div>

          {/* Risk Exposure */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-border">
              <div className="text-[13px] font-bold text-text">Risk exposure</div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  riskAlertCount > 0 ? 'bg-orange-subtle text-orange' : 'bg-green-subtle text-green'
                }`}
              >
                {riskAlertCount} alert{riskAlertCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="p-4.5 space-y-4">
              {riskExposureRows.length === 0 ? (
                <div className="flex items-center justify-center h-20 border border-dashed border-border rounded-lg">
                  <span className="text-xs text-gray-500">No active risk rules</span>
                </div>
              ) : (
                riskExposureRows.map((row) => (
                  <RiskBar
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    pct={row.pct}
                    color={row.color}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
