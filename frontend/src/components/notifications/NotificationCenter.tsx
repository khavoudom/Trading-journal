import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import type { AlertAction, AlertItem } from '@/pages/Alerts/alertUtils';

interface NotificationCenterProps {
  alerts: AlertItem[];
  onAction: (action: AlertAction) => void;
  onReadChange?: (alertId: string, read: boolean) => void;
}

export default function NotificationCenter({
  alerts,
  onAction,
  onReadChange,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = alerts.filter((alert) => !alert.read).length;

  const typeDotColors: Record<AlertItem['type'], string> = {
    positive: 'bg-green',
    negative: 'bg-orange',
    warning: 'bg-warning',
    info: 'bg-text2',
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4 text-text2" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-lg shadow-black/20 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-text">Alerts & Insights</span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-text2/30">
                  <Bell className="w-4 h-4" />
                </div>
                <p className="text-xs text-text2/50">No alerts at this time</p>
                <p className="text-[11px] text-text2/40 mt-1">
                  You'll be notified here when there's activity
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`px-4 py-3 border-b border-border/50 last:border-b-0 transition-colors hover:bg-surface2/40 ${
                    alert.read ? 'opacity-60' : 'bg-accent/5'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        alert.read ? 'bg-transparent' : typeDotColors[alert.type]
                      }`}
                    />
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-text2">
                      {alert.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text">{alert.title}</p>
                      <p className="text-xs text-text2 mt-0.5">{alert.description}</p>
                      {alert.action && (
                        <button
                          onClick={() => {
                            onReadChange?.(alert.id, true);
                            onAction(alert.action!);
                            setOpen(false);
                          }}
                          className="mt-2 text-xs font-medium text-text2 hover:text-text inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {alert.action.label} <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                      {onReadChange && (
                        <button
                          onClick={() => onReadChange(alert.id, !alert.read)}
                          className="ml-3 mt-2 text-xs font-medium text-text2 hover:text-text cursor-pointer transition-colors"
                        >
                          {alert.read ? 'Mark unread' : 'Mark read'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
