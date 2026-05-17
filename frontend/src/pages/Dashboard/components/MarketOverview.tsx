import { useMarketPrices } from '@/hooks/useMarketPrices';
import { INSTRUMENT_LABELS } from '@/constants/instruments';
import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { MarketOverviewTableLoader } from '@/components/loaders';

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 100) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function TickerRow({
  sym,
  price,
  change,
  changePercent,
  high,
  low,
}: {
  sym: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
}) {
  const up = changePercent >= 0;
  return (
    <div className="flex items-center gap-3 px-3 py-2 hover:bg-surface2 rounded-lg transition-colors">
      <span
        className="text-[13px] font-bold text-text w-20 shrink-0"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {INSTRUMENT_LABELS[sym] || sym}
      </span>
      <span
        className="text-[13px] text-text flex-1 text-right"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {formatPrice(price)}
      </span>
      <span
        className={`text-[11px] font-bold w-14 text-right shrink-0 ${up ? 'text-green' : 'text-orange'}`}
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {up ? '+' : ''}
        {change.toFixed(2)}
      </span>
      <span
        className={`text-[11px] font-bold w-16 text-right shrink-0 ${up ? 'text-green' : 'text-orange'}`}
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {up ? '+' : ''}
        {changePercent.toFixed(2)}%
      </span>
      <span
        className="text-[11px] text-text2 w-16 text-right shrink-0 hidden sm:block"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {formatPrice(high)}
      </span>
      <span
        className="text-[11px] text-text2 w-16 text-right shrink-0 hidden sm:block"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {formatPrice(low)}
      </span>
    </div>
  );
}

export function MarketOverview() {
  const { prices, loading, error } = useMarketPrices();

  return (
    <Panel>
      <PanelHeader>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-subtle flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--green)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <div
              className="text-[13px] font-bold text-text"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Market Overview
            </div>
            <div className="text-[11px] text-text2">Real-time prices</div>
          </div>
        </div>
      </PanelHeader>
      <PanelBody>
        <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] text-text2 uppercase tracking-[0.5px] font-bold">
          <span className="w-20 shrink-0">Symbol</span>
          <span className="flex-1 text-right">Price</span>
          <span className="w-14 text-right shrink-0">Change</span>
          <span className="w-16 text-right shrink-0">Chg%</span>
          <span className="w-16 text-right shrink-0 hidden sm:block">High</span>
          <span className="w-16 text-right shrink-0 hidden sm:block">Low</span>
        </div>

        {loading && <MarketOverviewTableLoader />}

        {error && !loading && (
          <div className="flex items-center justify-center h-24 border border-dashed border-border rounded-lg mt-2">
            <span className="text-xs text-gray-500">{error}</span>
          </div>
        )}

        {!loading && !error && prices.length === 0 && (
          <div className="flex items-center justify-center h-24 border border-dashed border-border rounded-lg mt-2">
            <span className="text-xs text-gray-500">No data available</span>
          </div>
        )}

        {!loading && prices.length > 0 && (
          <div className="space-y-0.5 mt-1">
            {prices.map((p) => (
              <TickerRow
                key={p.instrument}
                sym={p.instrument}
                price={p.price}
                change={p.change}
                changePercent={p.changePercent}
                high={p.high}
                low={p.low}
              />
            ))}
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
