import type { RiskRuleName, RiskRuleUnit } from '@/types/riskRule';
import { RISK_RULE_META } from '@/types/riskRule';
import { TrendingDown, Maximize2, Sliders, PieChart } from 'lucide-react';
import { formatUSD } from '@/utils/format';

const RULE_ICONS: Record<RiskRuleName, React.ReactNode> = {
  daily_drawdown: <TrendingDown className="w-4 h-4" />,
  max_position_size: <Maximize2 className="w-4 h-4" />,
  max_leverage: <Sliders className="w-4 h-4" />,
  correlated_exposure: <PieChart className="w-4 h-4" />,
};

const RULE_COLORS: Record<RiskRuleName, string> = {
  daily_drawdown: 'orange',
  max_position_size: 'blue',
  max_leverage: 'purple',
  correlated_exposure: 'green',
};

export function RiskOverviewCard({
  name,
  value,
  unit,
  enabled,
}: {
  name: RiskRuleName;
  value: number;
  unit: RiskRuleUnit;
  enabled: boolean;
}) {
  const meta = RISK_RULE_META[name];
  const color = RULE_COLORS[name];
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    green: { bg: 'bg-green-subtle', text: 'text-green', border: 'border-l-green' },
    blue: { bg: 'bg-blue-subtle', text: 'text-blue', border: 'border-l-blue' },
    orange: { bg: 'bg-orange-subtle', text: 'text-orange', border: 'border-l-orange' },
    purple: { bg: 'bg-purple-subtle', text: 'text-purple', border: 'border-l-purple' },
  };
  const c = colorMap[color];

  if (!enabled) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 border-l-4 border-l-border opacity-40">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-surface2 flex items-center justify-center text-gray-500">
            {RULE_ICONS[name]}
          </div>
          <span className="text-[11px] text-gray-500">{meta.label}</span>
        </div>
        <div className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-mono)' }}>
          Disabled
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface border border-border rounded-xl p-4 border-l-4 ${c.border}`}>
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center ${c.text}`}>
          {RULE_ICONS[name]}
        </div>
        <span className="text-[11px] font-bold text-text">{meta.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-lg font-extrabold"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}
        >
          {unit === 'USD' ? formatUSD(value) : value.toLocaleString()}
        </span>
        <span className="text-[11px] text-text2">{unit}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
        <span className="text-[10px] text-green font-medium">Active</span>
      </div>
    </div>
  );
}
