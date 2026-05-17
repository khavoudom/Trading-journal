import { Trash2, Bell } from 'lucide-react';

export function WatchlistItemRow({
  item,
  onRemove,
}: {
  item: {
    id: string;
    symbol: string;
    notes: string;
    status: 'watching' | 'ready' | 'avoid';
    alert?: string;
  };
  onRemove: (id: string) => void;
}) {
  const statusConfig = {
    watching: { label: 'Watching', bg: 'bg-blue-subtle', text: 'text-blue' },
    ready: { label: 'Ready', bg: 'bg-green-subtle', text: 'text-green' },
    avoid: { label: 'Avoid', bg: 'bg-orange-subtle', text: 'text-orange' },
  } as const;

  const sc = statusConfig[item.status];

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-surface2 rounded-lg border border-border">
      <span
        className="text-[13px] font-bold text-text min-w-18"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {item.symbol}
      </span>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
        {sc.label}
      </span>
      <span className="text-[11px] text-text2 flex-1 truncate">{item.notes}</span>
      {item.alert && (
        <span className="flex items-center gap-1 text-[10px] text-blue shrink-0">
          <Bell className="w-3 h-3" />
          {item.alert}
        </span>
      )}
      <button
        onClick={() => onRemove(item.id)}
        className="p-1 rounded text-gray-500 hover:text-orange hover:bg-orange-subtle transition-colors shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
