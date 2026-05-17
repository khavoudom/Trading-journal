export function RiskBar({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-text2">{label}</span>
        <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color }}>
          {value}
        </span>
      </div>
      <div className="h-1 bg-surface2 rounded-xs overflow-hidden">
        <div
          className="h-full rounded-xs"
          style={{ width: `${pct}%`, background: color, transition: 'width 600ms ease' }}
        />
      </div>
    </div>
  );
}
