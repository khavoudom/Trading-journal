/** A real-time price quote for a trading instrument. */
export interface PriceQuote {
  instrument: string;
  price: number;
  change: number | null;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}
