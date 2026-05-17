import { Activity } from 'lucide-react';

export function EquityCurvePreview() {
  return (
    <div className="bg-surface2 border border-border rounded-lg p-4">
      <div className="text-[11px] font-bold text-text mb-2 flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-green" />
        Hypothetical Equity Curve
      </div>
      <div className="h-30 flex items-end gap-0.75">
        {Array.from({ length: 30 }).map((_, i) => {
          const h = 20 + Math.sin(i * 0.5) * 20 + (i / 30) * 40 + Math.random() * 10;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-xs"
              style={{
                height: `${h}%`,
                background: i > 15 ? 'var(--green)' : 'var(--green-subtle)',
                opacity: 0.6 + (i / 30) * 0.4,
              }}
            />
          );
        })}
      </div>
      <div
        className="flex justify-between mt-2 text-[10px] text-text2"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <span>Entry</span>
        <span>Exit</span>
      </div>
    </div>
  );
}
