import { useState } from 'react';
import { Upload } from 'lucide-react';

export function BacktestForm({
  loading,
  onRun,
}: {
  loading: boolean;
  onRun: (strategyName: string) => void;
}) {
  const [strategyName, setStrategyName] = useState('');

  return (
    <div className="flex items-center gap-3 mb-6">
      <input
        value={strategyName}
        onChange={(e) => setStrategyName(e.target.value)}
        placeholder="Strategy name..."
        className="h-10 px-3 text-sm bg-surface2 border border-border rounded-lg text-text placeholder:text-gray-500 outline-none focus:border-green transition-colors flex-1"
      />
      <button
        onClick={() => onRun(strategyName)}
        disabled={loading || !strategyName.trim()}
        className="h-10 px-5 text-sm font-bold bg-green text-black rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {loading ? 'Running...' : 'Run Backtest'}
      </button>
    </div>
  );
}
