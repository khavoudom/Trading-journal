interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
  deltaLabel?: string;
  color: 'green' | 'blue' | 'orange' | 'purple' | 'red';
  loading?: boolean;
}

const colorMap = {
  green: { bar: 'var(--green)', text: 'var(--green)', bg: 'var(--green-subtle)' },
  blue: { bar: 'var(--blue)', text: 'var(--blue)', bg: 'var(--blue-subtle)' },
  orange: { bar: 'var(--orange)', text: 'var(--orange)', bg: 'var(--orange-subtle)' },
  purple: { bar: 'var(--purple)', text: 'var(--purple)', bg: 'var(--purple-subtle)' },
  red: { bar: 'var(--red)', text: 'var(--red)', bg: 'var(--red-subtle)' },
};

export function StatCard({
  label,
  value,
  delta,
  deltaUp,
  deltaLabel,
  color,
  loading,
}: StatCardProps) {
  const c = colorMap[color];

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 relative overflow-hidden">
        <div className="h-0.5 absolute top-0 left-0 right-0" style={{ background: c.bar }} />
        <div className="animate-pulse space-y-2 mt-2">
          <div className="h-3 bg-border rounded w-1/3" />
          <div className="h-7 bg-border rounded w-2/3" />
          <div className="h-3 bg-border rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 relative overflow-hidden">
      <div className="h-0.5 absolute top-0 left-0 right-0" style={{ background: c.bar }} />
      <div className="text-[11px] font-bold tracking-[0.5px] text-text2 uppercase mb-2">
        {label}
      </div>
      <div
        className="text-2xl font-extrabold tracking-[-1px]"
        style={{ color: c.text, fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </div>
      {delta && (
        <div
          className="text-[11px] mt-1"
          style={{ color: deltaUp ? 'var(--green)' : 'var(--text2)' }}
        >
          {deltaUp ? '↑' : '↓'} {delta} {deltaLabel}
        </div>
      )}
    </div>
  );
}
