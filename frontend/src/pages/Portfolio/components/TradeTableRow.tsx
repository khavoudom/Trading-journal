import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import type { Trade } from '@/types/trade';
import { INSTRUMENT_LABELS } from '@/constants/instruments';

export function TradeTableRow({
  trade,
  onDelete,
}: {
  trade: Trade;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => navigate(`?editTrade=${trade.id}`)}
      className="border-b border-border hover:bg-surface2 transition-colors cursor-pointer"
    >
      <td className="py-2.5 pr-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text">
              {INSTRUMENT_LABELS[trade.instrument] || trade.instrument}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
                trade.side === 'Long'
                  ? 'text-green bg-green-subtle'
                  : 'text-orange bg-orange-subtle'
              }`}
            >
              {trade.side.toUpperCase()}
            </span>
          </div>
          <span className="text-[11px] text-gray-500">{trade.strategy}</span>
        </div>
      </td>
      <td className="py-2.5 pr-3">
        <span style={{ fontFamily: 'var(--font-mono)' }}>{trade.entryPrice.toFixed(2)}</span>
      </td>
      <td className="py-2.5 pr-3">
        <span style={{ fontFamily: 'var(--font-mono)' }}>{trade.exitPrice.toFixed(2)}</span>
      </td>
      <td className="py-2.5 pr-3">
        <span className="text-gray-500" style={{ fontFamily: 'var(--font-mono)' }}>
          {trade.quantity}
        </span>
      </td>
      <td className="py-2.5 pr-3">
        {trade.status === 'pending' || trade.status === 'running' ? (
          <span className="font-semibold text-warning" style={{ fontFamily: 'var(--font-mono)' }}>
            {trade.profitLoss >= 0 ? '+' : ''}
            {trade.profitLoss.toFixed(2)}
          </span>
        ) : (
          <span
            className="font-semibold"
            style={{
              fontFamily: 'var(--font-mono)',
              color: trade.profitLoss >= 0 ? 'var(--green)' : 'var(--orange)',
            }}
          >
            {trade.profitLoss >= 0 ? '+' : ''}
            {trade.profitLoss.toFixed(2)}
          </span>
        )}
      </td>
      <td className="py-2.5 pr-3">
        {trade.status === 'pending' || trade.status === 'running' ? (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-medium bg-warning/10 text-warning`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {trade.profitLossPercent >= 0 ? '+' : ''}
            {trade.profitLossPercent.toFixed(2)}%
          </span>
        ) : (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-medium ${
              trade.profitLossPercent >= 0
                ? 'bg-green-subtle text-green'
                : 'bg-orange-subtle text-orange'
            }`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {trade.profitLossPercent >= 0 ? '+' : ''}
            {trade.profitLossPercent.toFixed(2)}%
          </span>
        )}
      </td>
      <td className="py-2.5 pr-3">
        {trade.emotion && trade.emotion !== 'neutral' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm border border-border font-medium text-gray-500">
            {trade.emotion}
          </span>
        )}
      </td>
      <td className="py-2.5 pr-3">
        {trade.planData && trade.planData.length > 0 && (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green" />
            <span className="text-[9px] text-gray-500" style={{ fontFamily: 'var(--font-mono)' }}>
              {trade.planData.length}
            </span>
          </div>
        )}
      </td>
      <td className="py-2.5 pr-3">
        <span className="text-xs text-gray-500">
          {new Date(trade.exitTime).toLocaleDateString()}
        </span>
      </td>
      <td className="py-2.5 text-right">
        <div className="flex gap-1.5 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`?editTrade=${trade.id}`);
            }}
            className="p-1.5 rounded-sm text-gray-500 hover:text-green hover:bg-green-subtle transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(trade.id);
            }}
            className="p-1.5 rounded-sm text-gray-500 hover:text-orange hover:bg-orange-subtle transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
