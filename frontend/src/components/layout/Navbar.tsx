import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useSpaceStore } from '@/store/spaceStore';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Plus, Menu, X, Layers, Loader2, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import type { AlertAction, AlertItem } from '@/pages/Alerts/alertUtils';

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Phnom_Penh',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

interface NavbarProps {
  spaceId: string;
  basePath: string;
  alerts: AlertItem[];
  onAlertReadChange?: (alertId: string, read: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

function formatDate(tz: string) {
  const d = new Date();
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZoneName: 'short',
    hour12: false,
  };
  const parts = new Intl.DateTimeFormat('en-US', opts).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  const monthNum = parseInt(get('month'), 10);
  const tzShort = parts.find((p) => p.type === 'timeZoneName')?.value || '';
  return `${get('day')} ${months[monthNum - 1]} ${get('year')} · ${get('hour')}:${get('minute')} ${tzShort}`;
}

const Navbar: React.FC<NavbarProps> = ({
  basePath,
  alerts,
  onAlertReadChange,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { spaces, currentSpaceId, createSpace } = useSpaceStore();
  const { timezone, setTimezone } = useAuthStore();
  const [dateStr, setDateStr] = useState(() => formatDate(timezone));
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [creatingSpace, setCreatingSpace] = useState(false);

  useEffect(() => {
    setDateStr(formatDate(timezone));
    const timer = setInterval(() => setDateStr(formatDate(timezone)), 30000);
    return () => clearInterval(timer);
  }, [timezone]);

  const handleSpaceChange = (newSpaceId: string | null) => {
    if (!newSpaceId || newSpaceId === '__create__') {
      setShowCreateSpace(true);
      return;
    }
    const path = location.pathname.replace(/^\/space\/[^/]+/, `/space/${newSpaceId}`);
    navigate(path);
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;
    setCreatingSpace(true);
    try {
      const space = await createSpace(newSpaceName.trim());
      setNewSpaceName('');
      setShowCreateSpace(false);
      navigate(`/space/${space.id}/dashboard`);
    } catch {
      // silent
    } finally {
      setCreatingSpace(false);
    }
  };

  const handleAlertAction = (action: AlertAction) => {
    navigate({
      pathname: `${basePath}${action.path}`,
      search: action.search?.startsWith('?') ? action.search : action.search && `?${action.search}`,
    });
  };

  return (
    <>
      <header
        className="flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 border-b border-border bg-bg gap-2"
        style={{ height: '57px' }}
      >
        {/* Left section: hamburger + logo + space switcher */}
        <div className="flex items-center gap-1 sm:gap-3 lg:shrink-0">
          {/* Hamburger visible below lg (sidebar disappears there) */}
          <button
            className="lg:hidden p-2 rounded-md text-text2 hover:bg-surface cursor-pointer shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3 14L9 4L15 14"
                  stroke="#000"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M5.5 11H12.5" stroke="#000" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span
              className="hidden xs:inline"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '16px',
                letterSpacing: '-0.5px',
              }}
            >
              <span className="hidden xl:flex">
                Trade<span style={{ color: 'var(--text)' }}>Journey</span>
              </span>
            </span>
          </div>

          {/* Space Switcher - visible from sm up */}
          <div className="hidden sm:flex items-center min-w-0">
            <div className="h-6 w-px bg-border mx-2 md:mx-3 shrink-0" />
            <Select value={currentSpaceId || undefined} onValueChange={handleSpaceChange}>
              <SelectTrigger className="border-none bg-transparent hover:bg-surface h-8 px-2 md:px-3 gap-1 md:gap-2 text-[13px] text-text2 hover:text-text font-medium max-w-30 md:max-w-45">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="text-text truncate">
                  {spaces.find((s) => s.id === currentSpaceId)?.name || 'Select space'}
                </span>
              </SelectTrigger>
              <SelectContent align="start" sideOffset={8} className="px-1 py-1">
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.name}
                  </SelectItem>
                ))}
                <SelectItem
                  value="__create__"
                  className="text-green border-t border-border mt-1 pt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Space
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Center: nav links - visible from xl when sidebar is present */}
        <div className="hidden xl:flex items-center justify-center gap-5 text-[13px] flex-1 min-w-0">
          {[
            { label: 'Dashboard', path: 'dashboard' },
            { label: 'Trades', path: 'portfolio' },
            { label: 'Journal', path: 'calendar' },
            { label: 'Analytics', path: 'analytics' },
            { label: 'Templates', path: 'trade-plan' },
            { label: 'Watchlist', path: 'watchlist' },
          ].map((link) => (
            <NavLink
              key={link.path}
              to={`${basePath}/${link.path}`}
              className={({ isActive: active }) =>
                cn(
                  'transition-colors whitespace-nowrap',
                  active ? 'text-green' : 'text-text2 hover:text-text',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right section: date, globe, buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:shrink-0">
          {/* Date/time - hidden below md to save space */}
          <div
            className="hidden md:block text-[11px] text-text2 border border-border2 px-2.5 md:px-3 py-1.5 rounded-lg truncate max-w-40 xl:max-w-none"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {dateStr}
          </div>
          {/* Globe timezone selector - always visible */}
          <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
            <SelectTrigger className="border-none bg-transparent hover:bg-surface h-7 w-7 p-0 justify-center rounded-lg shrink-0">
              <Globe className="w-3.5 h-3.5 text-text2" />
            </SelectTrigger>
            <SelectContent align="end" sideOffset={6} className="max-h-64">
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz} className="text-xs">
                  {tz.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Notifications */}
          <NotificationCenter
            alerts={alerts}
            onAction={handleAlertAction}
            onReadChange={onAlertReadChange}
          />
          {/* Import Trades - hidden below sm */}
          <button
            className="hidden sm:inline-flex items-center h-9 px-2.5 md:px-4 text-[13px] border border-border2 bg-transparent text-text2 rounded-lg hover:text-text hover:border-muted transition-colors cursor-pointer whitespace-nowrap"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Import Trades
          </button>
          {/* New Trade button - always visible, smaller on mobile */}
          <button
            onClick={() => navigate(`?newTrade`)}
            className="h-8 sm:h-9 px-3 sm:px-4.5 text-[12px] sm:text-[13px] font-bold bg-green text-black rounded-lg hover:bg-green/90 transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">New Trade</span>
          </button>
        </div>
      </header>

      {/* Create Space Dialog */}
      <Dialog
        open={showCreateSpace}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateSpace(false);
            setNewSpaceName('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Trading Space</DialogTitle>
            <DialogDescription>
              A trading space keeps its own trades, analytics, and risk management separate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="new-space-name">Space Name</Label>
            <Input
              id="new-space-name"
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              placeholder="e.g. Futures Account, Demo, Swing Trading"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateSpace();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateSpace(false);
                setNewSpaceName('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSpace} disabled={creatingSpace || !newSpaceName.trim()}>
              {creatingSpace ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  Create Space
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
