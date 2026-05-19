export const INSTRUMENTS = [
  'SPY',
  'NQ',
  'GC',
  'CL',
  'EURUSD',
  'BTC',
  'XAUUSD',
  'GBPUSD',
  'NASDAQ',
] as const;

export type Instrument = (typeof INSTRUMENTS)[number];

export const INSTRUMENT_LABELS: Record<string, string> = {
  SPY: 'SPY',
  NQ: 'NQ',
  GC: 'Gold',
  CL: 'Crude Oil',
  EURUSD: 'EUR/USD',
  BTC: 'Bitcoin',
  XAUUSD: 'XAU/USD',
  GBPUSD: 'GBP/USD',
  NASDAQ: 'NASDAQ',
};

export const INSTRUMENT_PRICE_RANGES: Record<string, { min: number; max: number; label: string }> =
  {
    SPY: { min: 300, max: 700, label: 'S&P 500 ETF' },
    NQ: { min: 25000, max: 35000, label: 'NASDAQ-100 Futures' },
    GC: { min: 1800, max: 10000, label: 'Gold / USD' },
    CL: { min: 30, max: 200, label: 'Crude Oil ETF' },
    EURUSD: { min: 0.9, max: 1.5, label: 'Euro / USD' },
    BTC: { min: 10000, max: 150000, label: 'Bitcoin / USD' },
    XAUUSD: { min: 1800, max: 10000, label: 'Gold / USD' },
    GBPUSD: { min: 1.05, max: 1.5, label: 'British Pound / USD' },
    NASDAQ: { min: 10000, max: 25000, label: 'US Tech 100' },
  };

// Contract size per standard lot — P&L = (exitPrice - entryPrice) * quantity * contractSize
// Keep in sync with server/src/config/instruments.ts
export const CONTRACT_SIZES: Record<string, number> = {
  SPY: 100,
  NQ: 100,
  GC: 100,
  CL: 1000,
  EURUSD: 100000,
  BTC: 1,
  XAUUSD: 100, // 1 lot = 100 ounces; 0.01 lots × 100pt move → $100
  GBPUSD: 100000, // 1 lot = 100k units; 0.01 lots × 100pip move → ~$10
  NASDAQ: 20, // 1 lot = 1 contract × $20/pt; 0.01 lots × 100pt move → $20
};
