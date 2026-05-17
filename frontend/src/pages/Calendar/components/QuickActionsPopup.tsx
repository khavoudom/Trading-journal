import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, FileText, PenTool, Trash2, Loader2, Image } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { INSTRUMENT_LABELS } from '@/constants/instruments';
import type { Trade, DayEvent } from '@/types/trade';
import type { CalendarDrawing } from '@/types/drawing';

interface QuickActionsPopupProps {
  open: boolean;
  onClose: () => void;
  date: string;
  trades: Trade[];
  events: DayEvent[];
  drawings: CalendarDrawing[];
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
  onDeleteDrawing: (id: string) => void;
  onAddDrawingBoard: (date: string) => void;
  onOpenDrawing: (date: string, drawing: CalendarDrawing) => void;
  isFutureDate: boolean;
  eventsLoading: boolean;
  drawingsLoading: boolean;
}

export default function QuickActionsPopup({
  open,
  onClose,
  date,
  trades,
  events,
  drawings,
  onAddEvent,
  onDeleteEvent,
  onDeleteDrawing,
  onAddDrawingBoard,
  onOpenDrawing,
  isFutureDate,
  eventsLoading,
  drawingsLoading,
}: QuickActionsPopupProps) {
  void isFutureDate;
  const navigate = useNavigate();

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{format(new Date(date), 'EEEE, MMMM d, yyyy')}</DialogTitle>
        </DialogHeader>

        {/* Trades section */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text2 uppercase tracking-wider">
            Trades ({trades.length})
          </h4>
          {trades.length > 0 ? (
            <div className="space-y-1.5">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  onClick={() => {
                    onClose();
                    navigate(`?editTrade=${trade.id}`);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-md bg-surface2 border border-border hover:border-border2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm font-medium text-text truncate">
                      {INSTRUMENT_LABELS[trade.instrument] || trade.instrument}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium shrink-0 ${
                        trade.side === 'Long'
                          ? 'text-green bg-green-subtle'
                          : 'text-orange bg-orange-subtle'
                      }`}
                    >
                      {trade.side.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 truncate">{trade.strategy}</span>
                  </div>
                  <span
                    className={`text-sm font-mono font-semibold shrink-0 ml-2 ${
                      trade.profitLoss >= 0 ? 'text-green' : 'text-orange'
                    }`}
                  >
                    {trade.profitLoss >= 0 ? '+' : ''}
                    {trade.profitLoss.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-1">No trades on this day.</p>
          )}
        </div>

        {/* Events section */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text2 uppercase tracking-wider">
            Events ({events.length})
          </h4>
          {eventsLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-xs text-gray-500">Loading events...</span>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-1.5">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between p-2.5 rounded-md bg-surface2 border border-border"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text truncate">{event.title}</p>
                    {event.content && (
                      <div
                        className="text-xs text-gray-500 mt-0.5 line-clamp-2 [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0 [&_li]:m-0"
                        dangerouslySetInnerHTML={{ __html: event.content }}
                      />
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="p-1 rounded-sm text-gray-500 hover:text-orange hover:bg-orange-subtle transition-colors shrink-0 ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-1">No events on this day.</p>
          )}
        </div>

        {/* Drawings section */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text2 uppercase tracking-wider">
            Drawings ({drawings.length})
          </h4>
          {drawingsLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-xs text-gray-500">Loading drawings...</span>
            </div>
          ) : drawings.length > 0 ? (
            <div className="space-y-1.5">
              {drawings.map((drawing) => (
                <div
                  key={drawing.id}
                  onClick={() => {
                    onClose();
                    onOpenDrawing(date, drawing);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-md bg-surface2 border border-border hover:border-border2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Image className="w-4 h-4 text-gray-500 shrink-0" />
                    <p className="text-sm font-medium text-text truncate">{drawing.title}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDrawing(drawing.id);
                    }}
                    className="p-1 rounded-sm text-gray-500 hover:text-orange hover:bg-orange-subtle transition-colors shrink-0 ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-1">No drawings on this day.</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              navigate(`?newTrade&date=${date}`);
            }}
            className="h-10 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Trade
          </Button>
          <Button variant="outline" onClick={onAddEvent} className="h-10 gap-2">
            <FileText className="w-4 h-4" />
            Add Event
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              onAddDrawingBoard(date);
            }}
            className="h-10 gap-2 col-span-2"
          >
            <PenTool className="w-4 h-4" />
            Add Drawing Board
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} size="sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
