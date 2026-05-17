import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTradeStore } from './tradeStore';
import { tradeService } from '@/services/tradeService';

vi.mock('@/services/tradeService', () => ({
  tradeService: {
    getTrades: vi.fn(),
    createTrade: vi.fn(),
    updateTrade: vi.fn(),
    deleteTrade: vi.fn(),
    getAnalyticsSummary: vi.fn(),
  },
}));

const TestComponent = () => {
  const { trades, loading, fetchTrades } = useTradeStore();

  useEffect(() => {
    fetchTrades('test-space');
  }, [fetchTrades]);

  if (loading) return <div>Loading...</div>;
  return (
    <ul>
      {trades.map((t) => (
        <li key={t.id}>{t.instrument}</li>
      ))}
    </ul>
  );
};

describe('TradeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTradeStore.setState({ trades: [], loading: false, error: null });
  });

  it('fetches trades on mount', async () => {
    const mockTrades = [{ id: '1', instrument: 'AAPL', side: 'Long' }];
    vi.mocked(tradeService.getTrades).mockResolvedValue(mockTrades as any);

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });
  });
});
