import { formatUSD } from '@/utils/format';

export function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface border border-border rounded-lg p-2.5 shadow-lg text-xs">
        <p className="text-green font-medium mb-0.5">{label}</p>
        <p className="font-bold text-text" style={{ fontFamily: 'var(--font-mono)' }}>
          {formatUSD(data.equity ?? data.value)}
        </p>
        {data.drawdown != null && data.drawdown > 0 && (
          <p className="text-orange mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
            DD: -{formatUSD(Math.round(data.drawdown))}
          </p>
        )}
      </div>
    );
  }
  return null;
}
