import https from 'https';
import { logger } from '@/utils/logger.js';
import { config } from '@/config/index.js';
import { YAHOO_SYMBOLS } from '@/constants/yahooSymbols.js';
import type { PriceQuote } from '@/types/price.js';

interface YahooQuoteResult {
  price: number;
  change: number | null;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

const PRICE_CACHE_TTL_MS = 30_000;

interface CacheEntry {
  quotes: PriceQuote[];
  expiresAt: number;
}

let allQuotesCache: CacheEntry | null = null;
const singleQuoteCaches = new Map<string, PriceQuote & { expiresAt: number }>();

function isFresh(expiresAt: number): boolean {
  return Date.now() < expiresAt;
}

function yahooGet(symbol: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const url = `${config.yahooFinanceBaseUrl}/${encodeURIComponent(symbol)}?range=1d&interval=1d`;

    logger.info('YAHOO', 'GET %s', symbol);

    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Yahoo parse error: ${data.slice(0, 200)}`));
          }
        });
      })
      .on('error', (err) => {
        logger.error('YAHOO', 'Request error for %s: %O', symbol, err);
        reject(err);
      });
  });
}

function parseYahooQuote(data: unknown): YahooQuoteResult | null {
  if (!data || typeof data !== 'object') return null;

  const chart = (data as Record<string, unknown>).chart as Record<string, unknown> | undefined;
  if (!chart) return null;

  const result = (Array.isArray(chart.result) ? chart.result[0] : null) as
    | Record<string, unknown>
    | undefined;
  if (!result) return null;

  const meta = result.meta as Record<string, unknown> | undefined;
  if (!meta) return null;

  const regularMarketPrice = meta.regularMarketPrice as number | undefined;
  const previousClose = meta.previousClose as number | undefined;
  const regularMarketTime = meta.regularMarketTime as number | undefined;
  const chartPreviousClose = meta.chartPreviousClose as number | undefined;

  if (regularMarketPrice == null) return null;

  const indicators = result.indicators as Record<string, unknown> | undefined;
  const quoteList = (Array.isArray(indicators?.quote) ? indicators!.quote[0] : null) as
    | Record<string, unknown>
    | undefined;

  const open = (quoteList?.open as number[] | undefined)?.[0];
  const high = (quoteList?.high as number[] | undefined)?.[0];
  const low = (quoteList?.low as number[] | undefined)?.[0];

  const pc = previousClose ?? chartPreviousClose ?? regularMarketPrice;
  const change = regularMarketPrice - pc;
  const changePercent = pc !== 0 ? (change / pc) * 100 : 0;

  return {
    price: regularMarketPrice,
    change,
    changePercent,
    high: high ?? regularMarketPrice,
    low: low ?? regularMarketPrice,
    open: open ?? regularMarketPrice,
    previousClose: pc,
    timestamp: regularMarketTime ? regularMarketTime * 1000 : Date.now(),
  };
}

async function fetchSingleQuote(symbol: string): Promise<PriceQuote | null> {
  const yahooSymbol = YAHOO_SYMBOLS[symbol];
  if (!yahooSymbol) return null;

  try {
    const data = await yahooGet(yahooSymbol);
    const result = parseYahooQuote(data);
    if (!result) return null;

    return {
      instrument: symbol,
      price: result.price,
      change: result.change,
      changePercent: result.changePercent,
      high: result.high,
      low: result.low,
      open: result.open,
      previousClose: result.previousClose,
      timestamp: result.timestamp,
    };
  } catch (err) {
    logger.error('PRICE', 'Failed to fetch quote for %s: %O', symbol, err);
    return null;
  }
}

/** Fetch real-time quotes for all configured instruments (cached for 30s). */
export async function fetchAllQuotes(): Promise<PriceQuote[]> {
  if (allQuotesCache && isFresh(allQuotesCache.expiresAt)) {
    return allQuotesCache.quotes;
  }

  const instruments = Object.keys(YAHOO_SYMBOLS);
  const results = await Promise.all(instruments.map(fetchSingleQuote));
  const quotes = results.filter((q): q is PriceQuote => q !== null);

  allQuotesCache = { quotes, expiresAt: Date.now() + PRICE_CACHE_TTL_MS };

  return quotes;
}

export async function fetchQuoteBySymbol(symbol: string): Promise<PriceQuote | null> {
  const cached = singleQuoteCaches.get(symbol);
  if (cached && isFresh(cached.expiresAt)) {
    return cached;
  }

  const quote = await fetchSingleQuote(symbol);

  if (quote) {
    singleQuoteCaches.set(symbol, { ...quote, expiresAt: Date.now() + PRICE_CACHE_TTL_MS });
  }

  return quote;
}
