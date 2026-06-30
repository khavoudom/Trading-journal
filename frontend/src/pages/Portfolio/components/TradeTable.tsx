import type { Trade } from '@/types/trade';
import { TradeTableRow } from './TradeTableRow';

export function TradeTable({
  trades,
  onDelete,
}: {
  trades: Trade[];
  onDelete: (id: string) => void;
}) {
  if (trades.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-gray-500 text-[10px] uppercase tracking-[0.5px]">
            <th className="text-left py-2.5 pr-3 font-medium">Instrument</th>
            <th className="text-left py-2.5 pr-3 font-medium">Entry</th>
            <th className="text-left py-2.5 pr-3 font-medium">Exit</th>
            <th className="text-left py-2.5 pr-3 font-medium">Qty</th>
            <th className="text-left py-2.5 pr-3 font-medium">P/L</th>
            <th className="text-left py-2.5 pr-3 font-medium">P/L %</th>
            <th className="text-left py-2.5 pr-3 font-medium">Mindset</th>
            <th className="text-left py-2.5 pr-3 font-medium">Plan</th>
            <th className="text-left py-2.5 pr-3 font-medium">Images</th>
            <th className="text-left py-2.5 pr-3 font-medium">Date</th>
            <th className="text-right py-2.5 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {trades.map((item) => (
            <TradeTableRow key={item.id} trade={item} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
