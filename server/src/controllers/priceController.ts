import type { Request, Response } from 'express';
import { fetchAllQuotes, fetchQuoteBySymbol } from '@/services/priceService.js';

export const priceController = {
  async getAllPrices(_req: Request, res: Response) {
    res.set('Cache-Control', 'no-cache');
    const quotes = await fetchAllQuotes();
    res.json(quotes);
  },

  async getPriceBySymbol(req: Request, res: Response) {
    const symbol = String(req.params.symbol).toUpperCase();
    const instruments = ['XAUUSD', 'GBPUSD', 'NASDAQ', 'SPY', 'NQ', 'GC', 'CL', 'EURUSD', 'BTC'];

    if (!instruments.includes(symbol)) {
      res.status(400).json({ error: `Unsupported instrument: ${symbol}` });
      return;
    }

    res.set('Cache-Control', 'no-cache');
    const quote = await fetchQuoteBySymbol(symbol);
    if (!quote) {
      res.status(503).json({ error: 'Failed to fetch price data' });
      return;
    }

    res.json(quote);
  },
};
