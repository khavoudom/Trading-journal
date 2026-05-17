import { FileDown, Printer } from 'lucide-react';
import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { Button } from '@/components/ui/Button';
import type { Trade } from '@/types/trade';
import { TradeTable } from './components/TradeTable';
import { EmptyState } from './components/EmptyState';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { exportTradesToExcel, printTrades } from '@/utils/export';

interface PortfolioPageProps {
  trades: Trade[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ trades, isLoading, onDelete }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <div className="text-[13px] font-bold text-text">Trade Ledger</div>
              <div className="text-[11px] text-text2">Complete history of all executed trades</div>
            </div>
          </PanelHeader>
          <PanelBody>
            <LoadingSkeleton />
          </PanelBody>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader>
          <div>
            <div className="text-[13px] font-bold text-text">Trade Ledger</div>
            <div className="text-[11px] text-text2">Complete history of all executed trades</div>
          </div>
          {trades.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportTradesToExcel(trades)}>
                <FileDown className="w-3.5 h-3.5" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={printTrades}>
                <Printer className="w-3.5 h-3.5" />
                Print
              </Button>
            </div>
          )}
        </PanelHeader>
        <PanelBody>
          {trades.length === 0 ? (
            <EmptyState />
          ) : (
            <TradeTable trades={trades} onDelete={onDelete} />
          )}
        </PanelBody>
      </Panel>
    </div>
  );
};

export default PortfolioPage;
