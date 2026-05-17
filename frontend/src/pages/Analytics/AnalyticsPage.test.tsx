import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnalyticsPage from './AnalyticsPage';

// Mock Recharts to avoid issues in JSDOM
vi.mock('recharts', () => ({
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div>Area</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  Cell: () => <div>Cell</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => <div>Pie</div>,
}));

describe('AnalyticsPage', () => {
  const testData = {
    portfolioData: [{ date: '2024-01-01', value: 10000 }],
    trades: [
      {
        id: '1',
        spaceId: '1',
        instrument: 'AAPL',
        side: 'Long' as const,
        strategy: 'Swing Trading',
        entryPrice: 150,
        exitPrice: 160,
        quantity: 10,
        entryTime: '2024-01-01T10:00:00Z',
        exitTime: '2024-01-01T14:00:00Z',
        profitLoss: 100,
        profitLossPercent: 6.67,
        tags: [],
      },
    ],
    analytics: {
      winRate: 60,
      winningTrades: 6,
      losingTrades: 4,
      totalTrades: 10,
      totalProfitLoss: 500,
      averageProfitLoss: 50,
      bestTrade: null,
      worstTrade: null,
    },
    disciplineScore: 85,
    setupScore: 70,
  };

  it('renders chart titles', () => {
    render(<AnalyticsPage {...testData} />);
    expect(screen.getByText(/Equity Curve/i)).toBeInTheDocument();
    expect(screen.getByText(/Trade Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Strategy Performance/i)).toBeInTheDocument();
  });

  it('displays win rate', () => {
    render(<AnalyticsPage {...testData} />);
    expect(screen.getByText('60.00%')).toBeInTheDocument();
  });
});
