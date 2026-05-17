import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isFuture,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from '@/components/loaders';
import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { useEventStore } from '@/store/eventStore';
import { useCalendarDrawingStore } from '@/store/calendarDrawingStore';
import { calendarDrawingService } from '@/services/drawingService';
import type { Trade } from '@/types/trade';
import type { CalendarDrawing } from '@/types/drawing';
import { formatUSD } from '@/utils/format';
import QuickActionsPopup from './QuickActionsPopup';
import AddEventForm from './AddEventForm';

const CalendarDrawingBoard = lazy(() => import('./CalendarDrawingBoard'));

interface CalendarViewProps {
  trades: Trade[];
  spaceId: string;
}

const getOpenStatusLabel = (trades: Trade[]) => {
  const labels = trades
    .map((t) => {
      if (t.status === 'pending') return 'Pending';
      if (t.status === 'running') return 'Running';
      return null;
    })
    .filter(Boolean) as string[];
  const unique = [...new Set(labels)];
  return unique.join(' / ') || 'Open';
};

const getOpenCountLabel = (trades: Trade[]) => {
  const openCount = trades.filter((t) => t.status === 'pending' || t.status === 'running').length;
  const suffix = trades.length > 1 ? 'trades' : 'trade';
  return `${openCount} ${suffix} ${getOpenStatusLabel(trades).toLowerCase()}`;
};

const CalendarView: React.FC<CalendarViewProps> = ({ trades, spaceId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [popupMode, setPopupMode] = useState<'actions' | 'add-event'>('actions');
  const [drawingBoardOpen, setDrawingBoardOpen] = useState(false);
  const [drawingBoardDate, setDrawingBoardDate] = useState<string | null>(null);
  const [editingDrawing, setEditingDrawing] = useState<CalendarDrawing | null>(null);
  const [drawingDates, setDrawingDates] = useState<string[]>([]);
  const {
    events,
    eventDates,
    loading: eventsLoading,
    fetchEvents,
    fetchEventDates,
    addEvent,
    removeEvent,
  } = useEventStore();
  const {
    drawings,
    loading: drawingsLoading,
    fetchDrawings,
    removeDrawing,
  } = useCalendarDrawingStore();

  const dailyData = useMemo(() => {
    const map = new Map<
      string,
      { pnl: number; count: number; trades: Trade[]; hasOpen: boolean }
    >();
    for (const trade of trades) {
      const dateKey = format(new Date(trade.exitTime), 'yyyy-MM-dd');
      const existing = map.get(dateKey);
      const isOpen = trade.status === 'pending' || trade.status === 'running';
      if (existing) {
        existing.pnl += trade.profitLoss;
        if (isOpen) existing.hasOpen = true;
        existing.count += 1;
        existing.trades.push(trade);
      } else {
        map.set(dateKey, {
          pnl: trade.profitLoss,
          count: 1,
          trades: [trade],
          hasOpen: isOpen,
        });
      }
    }
    return map;
  }, [trades]);

  const selectedDayData = selectedDate ? dailyData.get(selectedDate) : null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (spaceId) {
      fetchEventDates(spaceId, format(currentMonth, 'yyyy-MM'));
    }
  }, [currentMonth, spaceId, fetchEventDates]);

  useEffect(() => {
    if (!spaceId) return;
    calendarDrawingService
      .getDrawingDates(spaceId, format(currentMonth, 'yyyy-MM'))
      .then(setDrawingDates)
      .catch(() => setDrawingDates([]));
  }, [currentMonth, spaceId]);

  const addDrawingDate = useCallback((date: string) => {
    setDrawingDates((prev) => (prev.includes(date) ? prev : [...prev, date]));
  }, []);

  const removeDrawingDate = useCallback((date: string) => {
    setDrawingDates((prev) => prev.filter((d) => d !== date));
  }, []);

  const loadModalData = useCallback(
    (date: string) => {
      if (!spaceId) return;
      void fetchEvents(spaceId, date);
      void fetchDrawings(spaceId, date);
    },
    [fetchDrawings, fetchEvents, spaceId],
  );

  const handleDoubleClick = (dateKey: string, date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;
    setSelectedDate(dateKey);
    setPopupMode('actions');
    loadModalData(dateKey);
  };

  const handleClosePopup = () => {
    setSelectedDate(null);
    setPopupMode('actions');
  };

  const handleAddEvent = () => {
    setPopupMode('add-event');
  };

  const handleSaveEvent = async (title: string, content: string) => {
    if (!selectedDate || !spaceId) return;
    await addEvent({ spaceId, date: selectedDate, title, content });
    await fetchEventDates(spaceId, format(currentMonth, 'yyyy-MM'));
    setPopupMode('actions');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!spaceId) return;
    await removeEvent(eventId, spaceId);
    await fetchEventDates(spaceId, format(currentMonth, 'yyyy-MM'));
  };

  const handleDeleteDrawing = async (drawingId: string) => {
    if (!spaceId) return;
    await removeDrawing(drawingId, spaceId);
    if (selectedDate && drawings.length <= 1) {
      removeDrawingDate(selectedDate);
    }
  };

  const handleDrawingBoardClose = (hasDrawing = false) => {
    setDrawingBoardOpen(false);
    setDrawingBoardDate(null);
    setEditingDrawing(null);
    if (selectedDate && spaceId) {
      fetchDrawings(spaceId, selectedDate);
      if (hasDrawing) {
        addDrawingDate(selectedDate);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader>
          <div>
            <div className="text-[13px] font-bold text-text">Trading Calendar</div>
            <div className="text-[11px] text-text2">Daily P&L and trade activity</div>
          </div>
        </PanelHeader>
        <PanelBody>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                setCurrentMonth(subMonths(currentMonth, 1));
                setSelectedDate(null);
              }}
              className="p-2 rounded-md text-text2 hover:text-text hover:bg-surface2 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-base font-semibold text-text">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => {
                setCurrentMonth(addMonths(currentMonth, 1));
                setSelectedDate(null);
              }}
              className="p-2 rounded-md text-text2 hover:text-text hover:bg-surface2 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {dayHeaders.map((header) => (
              <div
                key={header}
                className="text-center text-[11px] font-medium text-gray-500 py-2 uppercase tracking-wider"
              >
                {header}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
            {days.map((date, i) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayData = dailyData.get(dateKey);
              const inCurrentMonth = isSameMonth(date, currentMonth);
              const isDayToday = isToday(date);
              const isSelected = selectedDate === dateKey;

              return (
                <div
                  key={i}
                  onDoubleClick={() => handleDoubleClick(dateKey, date)}
                  className={`min-h-22.5 p-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-green-subtle ring-2 ring-inset ring-green'
                      : isDayToday
                        ? 'bg-green-subtle'
                        : inCurrentMonth
                          ? 'bg-surface hover:bg-surface2'
                          : 'bg-bg cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-medium ${
                        !inCurrentMonth
                          ? 'text-gray-500 opacity-40'
                          : isDayToday
                            ? 'text-green'
                            : 'text-text2'
                      }`}
                    >
                      {format(date, 'd')}
                    </span>
                    {inCurrentMonth && eventDates.includes(dateKey) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green shrink-0" />
                    )}
                    {inCurrentMonth && drawingDates.includes(dateKey) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>

                  {dayData && inCurrentMonth && (
                    <div className="mt-1.5 space-y-0.5">
                      <span
                        className={`block text-[11px] font-mono font-semibold leading-tight ${
                          dayData.hasOpen
                            ? 'text-warning'
                            : dayData.pnl >= 0
                              ? 'text-green'
                              : 'text-red'
                        }`}
                      >
                        {formatUSD(dayData.pnl, { showSign: true })}
                      </span>
                      <span className="block text-[10px] text-gray-500">
                        {dayData.hasOpen
                          ? getOpenCountLabel(dayData.trades)
                          : `${dayData.count} ${dayData.count === 1 ? 'trade' : 'trades'}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </PanelBody>
      </Panel>

      {/* Quick Actions Popup */}
      {selectedDate && popupMode === 'actions' && (
        <QuickActionsPopup
          open={selectedDate !== null && popupMode === 'actions'}
          onClose={handleClosePopup}
          date={selectedDate}
          trades={selectedDayData?.trades || []}
          events={events}
          drawings={drawings}
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
          onDeleteDrawing={handleDeleteDrawing}
          onAddDrawingBoard={(date) => {
            setDrawingBoardDate(date);
            setEditingDrawing(null);
            setDrawingBoardOpen(true);
          }}
          onOpenDrawing={(_date, drawing) => {
            setDrawingBoardDate(_date);
            setEditingDrawing(drawing);
            setDrawingBoardOpen(true);
          }}
          isFutureDate={isFuture(new Date(selectedDate))}
          eventsLoading={eventsLoading}
          drawingsLoading={drawingsLoading}
        />
      )}

      {/* Add Event Form (rendered inside as replacement view) */}
      {selectedDate && popupMode === 'add-event' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClosePopup}
        >
          <div
            className="card p-5 w-full max-w-md mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-text mb-4">
              Add Event — {format(new Date(selectedDate), 'MMM d, yyyy')}
            </h3>
            <AddEventForm onSave={handleSaveEvent} onCancel={() => setPopupMode('actions')} />
          </div>
        </div>
      )}

      {/* Inline Drawing Board */}
      {drawingBoardOpen && drawingBoardDate && spaceId && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
              <div className="flex flex-col items-center gap-3">
                <Spinner className="h-8 w-8" />
                <span className="text-sm text-text2">Loading drawing board...</span>
              </div>
            </div>
          }
        >
          <CalendarDrawingBoard
            spaceId={spaceId}
            date={drawingBoardDate}
            existingDrawing={editingDrawing || undefined}
            onClose={handleDrawingBoardClose}
          />
        </Suspense>
      )}
    </div>
  );
};

export default CalendarView;
