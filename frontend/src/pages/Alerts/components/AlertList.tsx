import { Bell } from 'lucide-react';
import { AlertCard } from './AlertCard';
import type { AlertAction, AlertItem } from '../alertUtils';

export function AlertList({
  alerts,
  onAction,
  onReadChange,
}: {
  alerts: AlertItem[];
  onAction: (action: AlertAction) => void;
  onReadChange?: (alertId: string, read: boolean) => void;
}) {
  if (alerts.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-border rounded-md">
        <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-text2/30">
          <Bell className="w-4 h-4" />
        </div>
        <p className="text-xs text-text2/50">No alerts at this time</p>
        <p className="text-[11px] text-text2/40 mt-1">
          You'll be notified here when there's activity
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} onAction={onAction} onReadChange={onReadChange} />
      ))}
    </div>
  );
}
