import { useState, useEffect } from 'react';
import api from '@/services/api';

interface MarketPrice {
  instrument: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

const TICKER_ORDER = ['SPY', 'NQ', 'GC', 'CL', 'EURUSD', 'BTC'];

export function useMarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPrices = async () => {
      try {
        const res = await api.get<MarketPrice[]>('/prices');
        if (!cancelled) {
          const ordered = TICKER_ORDER.map((sym) => {
            const match = res.data.find((p) => p.instrument === sym);
            return match || { instrument: sym, price: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, previousClose: 0, timestamp: 0 };
          });
          setPrices(ordered);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load market data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPrices();

    return () => {
      cancelled = true;
    };
  }, []);

  return { prices, loading, error };
}

export type { MarketPrice };
