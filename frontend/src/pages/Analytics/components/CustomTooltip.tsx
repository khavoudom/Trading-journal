import { formatUSD } from '@/utils/format';

export function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border rounded-lg p-2.5 shadow-lg">
        <p className="text-xs text-green mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-text" style={{ fontFamily: 'var(--font-mono)' }}>
          {formatUSD(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}
