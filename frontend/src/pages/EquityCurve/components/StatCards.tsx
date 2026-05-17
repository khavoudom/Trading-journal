import { formatUSD } from '@/utils/format';

export function StatCards({ currentValue }: { currentValue: number }) {
  const INITIAL_BALANCE = 10000;
  const stats = [
    {
      label: 'Starting Balance',
      value: formatUSD(INITIAL_BALANCE),
      color: 'var(--text2)',
    },
    {
      label: 'Current Balance',
      value: formatUSD(Math.round(currentValue)),
      color: currentValue >= INITIAL_BALANCE ? 'var(--green)' : 'var(--orange)',
    },
    {
      label: 'Total Return',
      value: `${(((currentValue - INITIAL_BALANCE) / INITIAL_BALANCE) * 100).toFixed(1)}%`,
      color: currentValue >= INITIAL_BALANCE ? 'var(--green)' : 'var(--orange)',
    },
    {
      label: 'Peak Value',
      value: formatUSD(Math.round(currentValue)),
      color: 'var(--blue)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-surface border border-border rounded-lg p-3">
          <div className="text-[10px] font-bold tracking-[0.5px] text-text2 uppercase mb-1">
            {stat.label}
          </div>
          <div
            className="text-lg font-extrabold"
            style={{ color: stat.color, fontFamily: 'var(--font-mono)' }}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
