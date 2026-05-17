import { useState, useEffect, useCallback } from 'react';
import { Clock, Plus, ChevronLeft, ChevronRight, List, Grid3X3, Sparkles } from 'lucide-react';
import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import type { Trade } from '@/types/trade';
import ScheduleDay from './components/ScheduleDay';
import ScheduleTaskForm from './components/ScheduleTaskForm';
import { scheduleTaskService } from '@/services/scheduleTaskService';

export interface ScheduleTask {
  id: string;
  title: string;
  time?: string;
  timeEnd?: string;
  date: Date;
  completed: boolean;
  description?: string;
  type: 'trade' | 'analysis' | 'review' | 'break' | 'other';
  repeatGroupId?: string;
  reminder?: number;
}

type ViewMode = 'day' | 'week' | 'month';

interface SchedulePageProps {
  trades: Trade[];
  spaceId: string;
}

const TYPE_COLORS: Record<ScheduleTask['type'], string> = {
  trade: 'border-l-green bg-green/5',
  analysis: 'border-l-blue bg-blue/5',
  review: 'border-l-orange bg-orange/5',
  break: 'border-l-purple bg-purple/5',
  other: 'border-l-[var(--text-gray-500)] bg-surface',
};

const SCHEDULE_TYPES: { value: ScheduleTask['type']; label: string }[] = [
  { value: 'trade', label: 'Trade Session' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'review', label: 'Review' },
  { value: 'break', label: 'Break' },
  { value: 'other', label: 'Other' },
];

export default function SchedulePage({ trades, spaceId }: SchedulePageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const todayTrades = trades.filter((t) => {
    const tradeDate = new Date(t.exitTime || t.entryTime);
    return isSameDay(tradeDate, selectedDate);
  });

  const selectedDateTasks = tasks.filter((t) => isSameDay(t.date, selectedDate));
  const pendingTasks = selectedDateTasks.filter((t) => !t.completed);
  const completedTasks = selectedDateTasks.filter((t) => t.completed);

  const currentMonth = format(currentDate, 'yyyy-MM');

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    if (!spaceId) return;
    try {
      setLoading(true);
      const data = await scheduleTaskService.getByMonth(spaceId, currentMonth);
      setTasks(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [spaceId, currentMonth]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const navigatePrev = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, -1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const navigateNext = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const navigateToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const dateLabel =
    viewMode === 'day'
      ? format(selectedDate, 'EEEE, MMMM d, yyyy')
      : viewMode === 'week'
        ? `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
        : format(currentDate, 'MMMM yyyy');

  const handleAddTask = async (task: Omit<ScheduleTask, 'id'>) => {
    try {
      const taskDate = format(task.date, 'yyyy-MM-dd');
      const created = await scheduleTaskService.create({
        spaceId,
        title: task.title,
        time: task.time,
        timeEnd: task.timeEnd,
        taskDate,
        description: task.description,
        type: task.type,
        reminder: task.reminder,
      });
      setTasks((prev) => [...prev, created]);
      setShowTaskForm(false);
    } catch {
      // silent
    }
  };

  const handleUpdateTask = async (updated: ScheduleTask | Omit<ScheduleTask, 'id'>) => {
    if (!('id' in updated)) return;
    try {
      const task = await scheduleTaskService.update(updated.id, {
        title: updated.title,
        time: updated.time ?? null,
        timeEnd: updated.timeEnd ?? null,
        completed: updated.completed,
        description: updated.description ?? null,
        type: updated.type,
        reminder: updated.reminder ?? null,
        spaceId,
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setEditingTask(null);
    } catch {
      // silent
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await scheduleTaskService.delete(id, spaceId);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setEditingTask(null);
    } catch {
      // silent
    }
  };

  const toggleTaskComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      const updated = await scheduleTaskService.update(id, {
        completed: !task.completed,
        spaceId,
      });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      // silent
    }
  };

  const handleDragStart = (id: string) => setDragTaskId(id);

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragTaskId || dragTaskId === targetId) return;
    setTasks((prev) => {
      const items = [...prev];
      const draggedIndex = items.findIndex((t) => t.id === dragTaskId);
      const targetIndex = items.findIndex((t) => t.id === targetId);
      const [moved] = items.splice(draggedIndex, 1);
      items.splice(targetIndex, 0, moved);
      return items;
    });
  };

  const handleDragEnd = () => setDragTaskId(null);

  const handleGenerateMonth = async () => {
    setGenerating(true);
    try {
      const yearMonth = format(currentDate, 'yyyy-MM');
      const newTasks = await scheduleTaskService.generateMonth(spaceId, yearMonth, {
        time: '07:00',
        type: 'analysis',
      });
      setTasks((prev) => [...prev, ...newTasks]);
      setShowGenerate(false);
    } catch {
      // silent
    } finally {
      setGenerating(false);
    }
  };

  const handleRepeatSubmit = async (
    taskData: Omit<ScheduleTask, 'id'>,
    repeatType: 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom',
    repeatEnd: Date,
    customDays?: number[],
  ) => {
    try {
      const taskDate = format(taskData.date, 'yyyy-MM-dd');
      const endDate = format(repeatEnd, 'yyyy-MM-dd');
      const newTasks = await scheduleTaskService.createRepeating(
        {
          spaceId,
          title: taskData.title,
          time: taskData.time,
          timeEnd: taskData.timeEnd,
          taskDate,
          description: taskData.description,
          type: taskData.type,
          reminder: taskData.reminder,
        },
        repeatType,
        endDate,
        customDays,
      );
      setTasks((prev) => [...prev, ...newTasks]);
      setShowTaskForm(false);
    } catch {
      // silent
    }
  };

  const todayTradesOnDate = trades.filter((t) => {
    const d = new Date(t.exitTime || t.entryTime);
    return isSameDay(d, selectedDate);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-semibold text-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Daily Schedule
          </h1>
          <p className="text-sm text-text2 mt-1">Plan and manage your trading day</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-accent text-white'
                    : 'text-text2 hover:text-text bg-surface'
                }`}
              >
                {mode === 'day' ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : mode === 'week' ? (
                  <List className="w-3.5 h-3.5" />
                ) : (
                  <Grid3X3 className="w-3.5 h-3.5" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation & Add Task */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={navigatePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <button
              onClick={navigateToday}
              className="px-3 py-1 text-xs font-medium text-text2 hover:text-text transition-colors"
            >
              Today
            </button>
            <Button variant="ghost" size="icon-xs" onClick={navigateNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-sm font-medium text-text">{dateLabel}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={() => setShowTaskForm(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Task
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowGenerate(true)}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Generate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar/View Panel */}
        <div className="xl:col-span-2 space-y-6">
          {viewMode === 'day' && (
            <ScheduleDay
              date={selectedDate}
              tasks={selectedDateTasks}
              trades={todayTradesOnDate}
              onToggleComplete={toggleTaskComplete}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              dragTaskId={dragTaskId}
              typeColors={TYPE_COLORS}
            />
          )}

          {viewMode === 'week' && (
            <Panel>
              <PanelHeader>
                <span className="text-sm font-medium text-text">Week at a Glance</span>
              </PanelHeader>
              <PanelBody>
                <div className="grid grid-cols-7 gap-2">
                  {daysInWeek.map((day) => {
                    const dayTasks = tasks.filter((t) => isSameDay(t.date, day));
                    const hasTrades = trades.some((t) => {
                      const d = new Date(t.exitTime || t.entryTime);
                      return isSameDay(d, day);
                    });
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          setSelectedDate(day);
                          setCurrentDate(day);
                          setViewMode('day');
                        }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                          isSameDay(day, selectedDate)
                            ? 'border-accent bg-accent/10'
                            : isToday(day)
                              ? 'border-green/50 bg-green/5'
                              : 'border-border bg-surface hover:border-text2/30'
                        }`}
                      >
                        <span className="text-[10px] text-text2 font-medium uppercase">
                          {format(day, 'EEE')}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            isToday(day) ? 'text-green' : 'text-text'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          {dayTasks.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
                          )}
                          {hasTrades && <span className="w-1.5 h-1.5 rounded-full bg-green" />}
                        </div>
                        {dayTasks.filter((t) => !t.completed).length > 0 && (
                          <span className="text-[10px] text-text2">
                            {dayTasks.filter((t) => !t.completed).length} tasks
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </PanelBody>
            </Panel>
          )}

          {viewMode === 'month' && (
            <Panel>
              <PanelHeader>
                <span className="text-sm font-medium text-text">Monthly Calendar</span>
              </PanelHeader>
              <PanelBody>
                <div className="grid grid-cols-7 gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] text-text2 font-medium uppercase py-2"
                    >
                      {day}
                    </div>
                  ))}
                  {/* Empty cells for offset */}
                  {Array.from({
                    length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1,
                  }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {monthDays.map((day) => {
                    const dayTasks = tasks.filter((t) => isSameDay(t.date, day));
                    const hasTrades = trades.some((t) => {
                      const d = new Date(t.exitTime || t.entryTime);
                      return isSameDay(d, day);
                    });
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          setSelectedDate(day);
                          setCurrentDate(day);
                          setViewMode('day');
                        }}
                        className={`flex flex-col items-center p-1.5 rounded-lg border transition-colors min-h-14 ${
                          isSameDay(day, selectedDate)
                            ? 'border-accent bg-accent/10'
                            : isToday(day)
                              ? 'border-green/50 bg-green/5'
                              : !isSameMonth(day, currentDate)
                                ? 'border-transparent opacity-40'
                                : 'border-border bg-surface hover:border-text2/30'
                        }`}
                      >
                        <span
                          className={`text-xs font-medium ${
                            isToday(day) ? 'text-green' : 'text-text'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                        {(dayTasks.length > 0 || hasTrades) && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {dayTasks.length > 0 && (
                              <span className="w-1 h-1 rounded-full bg-blue" />
                            )}
                            {hasTrades && <span className="w-1 h-1 rounded-full bg-green" />}
                          </div>
                        )}
                        {dayTasks.filter((t) => !t.completed).length > 0 && (
                          <span className="text-[9px] text-text2 mt-0.5">
                            {dayTasks.filter((t) => !t.completed).length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </PanelBody>
            </Panel>
          )}
        </div>

        {/* Side Panel - Selected Day Details */}
        <div className="space-y-6">
          {/* Selected Date Info */}
          <Panel>
            <PanelHeader>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-text">
                  {format(selectedDate, 'EEEE, MMM d')}
                </span>
                <button
                  onClick={() => {
                    setSelectedDate(new Date());
                    setCurrentDate(new Date());
                  }}
                  className="text-[10px] text-accent hover:text-accent/80 transition-colors"
                >
                  Jump to Today
                </button>
              </div>
            </PanelHeader>
            <PanelBody>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-text2">
                  <span>Active Tasks</span>
                  <span>{pendingTasks.length}</span>
                </div>
                <div className="flex justify-between text-xs text-text2">
                  <span>Completed</span>
                  <span>{completedTasks.length}</span>
                </div>
                <div className="flex justify-between text-xs text-text2">
                  <span>Trades</span>
                  <span>{todayTrades.length}</span>
                </div>
                {selectedDateTasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-green rounded-full transition-all"
                        style={{
                          width: `${Math.round((completedTasks.length / selectedDateTasks.length) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-text2 mt-1 block text-right">
                      {Math.round((completedTasks.length / selectedDateTasks.length) * 100)}%
                      complete
                    </span>
                  </div>
                )}
              </div>
            </PanelBody>
          </Panel>

          {/* Related Trades */}
          {todayTrades.length > 0 && (
            <Panel>
              <PanelHeader>
                <span className="text-sm font-medium text-text">Today's Trades</span>
              </PanelHeader>
              <PanelBody>
                <div className="space-y-2">
                  {todayTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-border bg-surface"
                    >
                      <div>
                        <span className="text-xs font-medium text-text">{trade.instrument}</span>
                        <span className="text-[10px] text-text2 ml-2">
                          {trade.side?.toUpperCase()}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-mono font-medium ${
                          (trade.profitLoss || 0) >= 0 ? 'text-green' : 'text-orange'
                        }`}
                      >
                        {(trade.profitLoss || 0) >= 0 ? '+' : ''}
                        {trade.profitLoss?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </PanelBody>
            </Panel>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {(showTaskForm || editingTask) && (
        <ScheduleTaskForm
          task={editingTask}
          date={selectedDate}
          scheduleTypes={SCHEDULE_TYPES}
          onSubmit={editingTask ? handleUpdateTask : handleAddTask}
          onDelete={editingTask ? handleDeleteTask : undefined}
          onRepeatSubmit={editingTask ? undefined : handleRepeatSubmit}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* Generate Schedule Dialog */}
      {showGenerate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowGenerate(false)}
        >
          <div className="w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <Card className="animate-fade-in bg-surface/10 border-border/60 shadow-lg shadow-black/10">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-green" />
                  <span className="text-base font-semibold">Generate Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-text2">
                  Fill <strong className="text-text">{format(monthStart, 'MMMM yyyy')}</strong> with
                  a daily trading routine for all weekdays?
                </p>
                <div className="mt-3 space-y-1 text-xs text-text2">
                  <p>07:00 - Pre-market analysis</p>
                  <p>07:30 - Review overnight news</p>
                  <p>08:00 - Session 1 (London Open)</p>
                  <p>10:00 - Mid-session break</p>
                  <p>13:30 - Session 2 (NY Open)</p>
                  <p>15:30 - End-of-day review & journal</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2.5 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setShowGenerate(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-green text-black hover:bg-green/90 font-bold"
                  onClick={handleGenerateMonth}
                  disabled={generating}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  {generating ? 'Generating...' : 'Generate'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
