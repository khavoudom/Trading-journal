import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Edit2, Trash2, CheckCircle2, X } from 'lucide-react';
import type { Trade } from '@/types/trade';
import { INSTRUMENT_LABELS } from '@/constants/instruments';
import { imageUrl } from '@/utils/imageUrl';

export function TradeTableRow({
  trade,
  onDelete,
}: {
  trade: Trade;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const screenshots = trade.screenshots || [];

  return (
    <>
      {/* Lightbox overlay */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl(screenshots[lightboxIndex])}
              alt={`Screenshot ${lightboxIndex + 1} of ${screenshots.length}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
          {screenshots.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {screenshots.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                    idx === lightboxIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
          {screenshots.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(0);
              }}
              className="relative group flex items-center gap-1"
            >
              <img
                src={imageUrl(screenshots[0])}
                alt="Screenshot"
                className="w-8 h-8 rounded object-cover border border-border"
              />
              {screenshots.length > 1 && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-mono bg-green text-black w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {screenshots.length}
                </span>
              )}
            </button>
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
    </>
  );
}
