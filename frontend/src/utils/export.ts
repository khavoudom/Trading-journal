import * as XLSX from 'xlsx';
import type { Trade } from '@/types/trade';
import { INSTRUMENT_LABELS } from '@/constants/instruments';

export function exportTradesToExcel(trades: Trade[]) {
  const rows = trades.map((trade) => ({
    Instrument: INSTRUMENT_LABELS[trade.instrument] || trade.instrument,
    Side: trade.side,
    Strategy: trade.strategy,
    'Entry Price': trade.entryPrice,
    'Exit Price': trade.exitPrice,
    Quantity: trade.quantity,
    'P/L': trade.profitLoss,
    'P/L %': trade.profitLossPercent,
    Emotion: trade.emotion || '',
    'Entry Date': new Date(trade.entryTime).toLocaleDateString(),
    'Exit Date': new Date(trade.exitTime).toLocaleDateString(),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  const colWidths = Object.keys(rows[0] || {}).map(() => ({ wch: 16 }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Trades');
  XLSX.writeFile(wb, 'trade-ledger.xlsx');
}

export function printTrades() {
  window.print();
}
