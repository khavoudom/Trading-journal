import { useNavigate } from 'react-router-dom';
import type { Trade } from '@/types/trade';
import { INSTRUMENT_LABELS } from '@/constants/instruments';
import { formatUSD } from '@/utils/format';

export function RecentTrades({ trades }: { trades: Trade[] }) {
  const navigate = useNavigate();
  const recent = trades.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 border border-dashed border-border rounded-lg">
        <span className="text-xs text-gray-500">No trades recorded yet</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {recent.map((trade) => (
        <div
          key={trade.id}
          onClick={() => navigate(`?editTrade=${trade.id}`)}
          className="flex items-center justify-between px-3 py-2.25 bg-surface2 rounded-lg border border-border text-xs cursor-pointer hover:bg-surface2/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span
              className="font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}
            >
              {INSTRUMENT_LABELS[trade.instrument] || trade.instrument}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-[0.5px] ${
                trade.side === 'Long'
                  ? 'bg-green-subtle text-green'
                  : 'bg-orange-subtle text-orange'
              }`}
            >
              {trade.side}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-text2">
              {new Date(trade.exitTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span
              className="font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                color:
                  trade.status === 'pending' || trade.status === 'running'
                    ? 'var(--warning)'
                    : trade.profitLoss >= 0
                      ? 'var(--green)'
                      : 'var(--orange)',
              }}
            >
              {trade.profitLoss >= 0 ? '+' : ''}
              {formatUSD(trade.profitLoss, { showSign: false, decimals: 0 })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
