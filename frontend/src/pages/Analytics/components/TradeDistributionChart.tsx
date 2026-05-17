import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface WinLossData {
  name: string;
  value: number;
  color: string;
}

export function TradeDistributionChart({
  winLossData,
  winRate,
}: {
  winLossData: WinLossData[];
  winRate: number;
}) {
  return (
    <div
      className="h-64 w-full flex items-center justify-center relative"
      style={{ minWidth: 0, minHeight: '256px' }}
    >
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <PieChart>
          <Pie
            data={winLossData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {winLossData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--text)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center pointer-events-none">
        <span
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}
        >
          {winRate.toFixed(2)}%
        </span>
        <span className="text-[10px] text-gray-500">Win Rate</span>
      </div>
    </div>
  );
}
