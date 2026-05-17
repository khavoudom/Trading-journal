import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { AddSymbolForm } from './components/AddSymbolForm';
import { WatchlistItemRow } from './components/WatchlistItem';
import { WatchlistEmpty } from './components/WatchlistEmpty';

interface WatchlistItem {
  id: string;
  symbol: string;
  notes: string;
  status: 'watching' | 'ready' | 'avoid';
  alert?: string;
}

const defaultItems: WatchlistItem[] = [
  {
    id: '1',
    symbol: 'ES',
    notes: 'Key level at 5280, waiting for breakout confirmation',
    status: 'watching',
    alert: 'Above 5300',
  },
  { id: '2', symbol: 'NQ', notes: 'Trend is strong, looking for pullback entry', status: 'ready' },
  {
    id: '3',
    symbol: 'GC',
    notes: 'Bearish divergence on daily',
    status: 'avoid',
    alert: 'Below 2350',
  },
  {
    id: '4',
    symbol: 'AAPL',
    notes: 'Earnings next week, watching for vol expansion',
    status: 'watching',
  },
];

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>(defaultItems);

  const addItem = (symbol: string) => {
    setItems([...items, { id: Date.now().toString(), symbol, notes: '', status: 'watching' }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-subtle flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue" />
            </div>
            <div>
              <div
                className="text-[13px] font-bold text-text"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Watchlist
              </div>
              <div className="text-[11px] text-text2">Symbols you are monitoring</div>
            </div>
          </div>
        </PanelHeader>
        <PanelBody>
          <AddSymbolForm onAdd={addItem} />

          {items.length === 0 ? (
            <WatchlistEmpty />
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <WatchlistItemRow key={item.id} item={item} onRemove={removeItem} />
              ))}
            </div>
          )}
        </PanelBody>
      </Panel>
    </div>
  );
}
