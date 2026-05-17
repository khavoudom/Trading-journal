import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';

export function StrategyPerformanceChart({ strategyData }: { strategyData: any[] }) {
  return (
    <div className="h-64 w-full mt-2 relative" style={{ minWidth: 0, minHeight: '256px' }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart data={strategyData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.15}
            vertical={false}
          />
          <XAxis dataKey="name" stroke="var(--muted)" fontSize={11} />
          <YAxis stroke="var(--muted)" fontSize={11} />
          <Tooltip
            cursor={false}
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
            }}
          />
          <Bar dataKey="value" name="P&L" radius={[4, 4, 0, 0]}>
            {strategyData.map((entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? 'var(--green)' : 'var(--orange)'}
                stroke="none"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
