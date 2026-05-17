export function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-surface2 border border-border rounded-lg p-3">
      <div className="text-[10px] font-bold tracking-[0.5px] text-text2 uppercase mb-1">
        {label}
      </div>
      <div className="text-lg font-extrabold" style={{ color, fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
    </div>
  );
}
