import type { Trade } from '@/types/trade';
import { INSTRUMENT_LABELS } from '@/constants/instruments';

export function TradeJournal({ trades }: { trades: Trade[] }) {
  const recent = trades.slice(0, 3);

  if (recent.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 border border-dashed border-border rounded-lg">
        <span className="text-xs text-gray-500">No trade journal yet</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {recent.map((trade) => {
        const isOpen = trade.status === 'pending' || trade.status === 'running';
        const isGood = trade.profitLoss >= 0;
        const date = new Date(trade.exitTime);
        const dateStr = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${date.getFullYear()}`;
        return (
          <div
            key={trade.id}
            className="border-l-2 pl-3"
            style={{
              borderColor: isOpen ? 'var(--warning)' : isGood ? 'var(--green)' : 'var(--orange)',
            }}
          >
            <div className="text-[10px] text-gray-300" style={{ fontFamily: 'var(--font-mono)' }}>
              {dateStr} · {INSTRUMENT_LABELS[trade.instrument] || trade.instrument}{' '}
              {trade.side.toUpperCase()}
            </div>
            <div className="text-xs text-text2 mt-1 leading-normal">
              {trade.notes || 'No notes recorded for this trade.'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
