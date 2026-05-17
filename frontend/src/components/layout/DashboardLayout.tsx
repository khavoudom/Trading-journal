import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Shield,
  Bell,
  Pencil,
  Eye,
  History,
  Clock,
} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useMarketPrices } from '@/hooks/useMarketPrices';
import { INSTRUMENT_LABELS } from '@/constants/instruments';
import type { AlertItem } from '@/pages/Alerts/alertUtils';

interface DashboardLayoutProps {
  spaceId?: string;
  alertCount?: number;
  alerts?: AlertItem[];
  onAlertReadChange?: (alertId: string, read: boolean) => void;
  showAlertsPage?: boolean;
}

const TICKER_SYMBOLS = ['SPY', 'NQ', 'GC', 'CL', 'EURUSD', 'BTC'];

function TickerTape() {
  const { prices } = useMarketPrices();

  const items = TICKER_SYMBOLS.map((sym) => {
    const p = prices.find((q) => q.instrument === sym);
    return {
      sym: INSTRUMENT_LABELS[sym] || sym,
      price: p ? formatPrice(p.price) : '---',
      chg: p ? `${p.changePercent >= 0 ? '+' : ''}${p.changePercent.toFixed(2)}%` : '---',
      up: p ? p.changePercent >= 0 : true,
    };
  });

  return (
    <div className="h-9 border-b border-border flex items-center overflow-hidden bg-surface">
      <div className="flex animate-ticker gap-0">
        {[...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-5 border-r border-border text-[11px] whitespace-nowrap shrink-0"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span className="font-bold text-text">{item.sym}</span>
            <span className="text-text2">{item.price}</span>
            <span className={item.up ? 'text-green' : 'text-orange'}>{item.chg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 100) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  spaceId,
  alertCount = 0,
  alerts = [],
  onAlertReadChange,
  showAlertsPage = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarSections = [
    {
      label: 'Overview',
      items: [
        { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', path: 'dashboard' },
        { icon: <Wallet className="w-4 h-4" />, label: 'Trade Log', path: 'portfolio' },
        { icon: <CalendarDays className="w-4 h-4" />, label: 'Journal', path: 'calendar' },
        { icon: <Clock className="w-4 h-4" />, label: 'Schedule', path: 'schedule' },
      ],
    },
    {
      label: 'Performance',
      items: [{ icon: <BarChart3 className="w-4 h-4" />, label: 'Analytics', path: 'analytics' }],
    },
    {
      label: 'Strategy',
      items: [
        { icon: <ClipboardCheck className="w-4 h-4" />, label: 'Templates', path: 'trade-plan' },
        { icon: <Shield className="w-4 h-4" />, label: 'Risk Manager', path: 'risk-manager' },
        ...(showAlertsPage
          ? [
              {
                icon: <Bell className="w-4 h-4" />,
                label: 'Alerts',
                path: 'alerts',
                badge: 'alert' as const,
              },
            ]
          : []),
        { icon: <Eye className="w-4 h-4" />, label: 'Watchlist', path: 'watchlist' },
        { icon: <History className="w-4 h-4" />, label: 'Backtest', path: 'backtest' },
        { icon: <Pencil className="w-4 h-4" />, label: 'Drawing Board', path: 'drawing-board' },
      ],
    },
  ];

  const basePath = `/space/${spaceId}`;
  const isActive = (path: string) => location.pathname === `${basePath}/${path}`;

  return (
    <div className="h-screen flex flex-col bg-bg">
      <TickerTape />

      <Navbar
        spaceId={spaceId!}
        basePath={basePath}
        alerts={alerts}
        onAlertReadChange={onAlertReadChange}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          basePath={basePath}
          sidebarSections={sidebarSections}
          isActive={isActive}
          setMobileMenuOpen={setMobileMenuOpen}
          alertCount={alertCount}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-7 max-w-350 mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav
        basePath={basePath}
        sidebarSections={sidebarSections}
        isActive={isActive}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleLogout={handleLogout}
        alertCount={alertCount}
      />
    </div>
  );
};

export default DashboardLayout;
