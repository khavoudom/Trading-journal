import { ChevronRight } from 'lucide-react';
import type { AlertAction, AlertItem } from '../alertUtils';

export function AlertCard({
  alert,
  onAction,
  onReadChange,
}: {
  alert: AlertItem;
  onAction: (action: AlertAction) => void;
  onReadChange?: (alertId: string, read: boolean) => void;
}) {
  const typeDotColors: Record<string, string> = {
    positive: 'bg-green',
    negative: 'bg-orange',
    warning: 'bg-warning',
    info: 'bg-text2',
  };

  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 border-b border-border/50 last:border-b-0 transition-colors${
        alert.read ? 'opacity-60' : 'bg-accent/5'
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
          alert.read ? 'bg-transparent' : typeDotColors[alert.type]
        }`}
      />
      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-text2">
        {alert.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text">{alert.title}</p>
        <p className="text-xs text-text2 mt-0.5">{alert.description}</p>
        {alert.action && (
          <button
            onClick={() => {
              onReadChange?.(alert.id, true);
              onAction(alert.action!);
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
  );
}
