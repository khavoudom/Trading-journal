import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { CustomTooltip } from './CustomTooltip';

export function EquityCurveChart({ portfolioData }: { portfolioData: any[] }) {
  return (
    <Panel className="lg:col-span-2">
      <PanelHeader>
        <div className="text-[13px] font-bold text-text">Equity Curve</div>
        <div className="text-[11px] text-text2">Portfolio value over time</div>
      </PanelHeader>
      <PanelBody>
        <div className="h-80 w-full mt-2 relative" style={{ minWidth: 0, minHeight: '320px' }}>
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
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
                tickFormatter={(str) =>
                  new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                }
              />
              <YAxis
                stroke="var(--muted)"
                fontSize={11}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00e5a0"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={2}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PanelBody>
    </Panel>
  );
}
