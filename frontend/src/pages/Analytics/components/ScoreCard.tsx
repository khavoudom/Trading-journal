import type { ReactNode } from 'react';

export function ScoreCard({
  icon,
  label,
  score,
}: {
  icon: ReactNode;
  label: string;
  score: number;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-green-subtle flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p
          className="text-2xl font-bold mt-0.5"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}
        >
          {score}%
        </p>
      </div>
    </div>
  );
}
