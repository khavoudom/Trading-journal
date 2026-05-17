import { format } from 'date-fns';
import { GripVertical, CheckCircle2, Circle, Clock, Pencil, Trash2, Bell } from 'lucide-react';
import type { Trade } from '@/types/trade';

interface ScheduleTask {
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

interface ScheduleDayProps {
  date: Date;
  tasks: ScheduleTask[];
  trades: Trade[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: ScheduleTask) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  dragTaskId: string | null;
  typeColors: Record<ScheduleTask['type'], string>;
}

export default function ScheduleDay({
  date,
  tasks,
  trades,
  onToggleComplete,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  dragTaskId,
  typeColors,
}: ScheduleDayProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  const hasTrades = trades.length > 0;

  return (
    <div className="space-y-4">
      {/* Day Overview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-text" style={{ fontFamily: 'var(--font-mono)' }}>
            {format(date, 'd')}
          </span>
          <div>
            <span className="text-sm font-medium text-text">{format(date, 'EEEE')}</span>
            <span className="text-xs text-text2 block">{format(date, 'MMMM yyyy')}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-text2">
          <span>{tasks.filter((t) => !t.completed).length} pending</span>
          <span>{tasks.filter((t) => t.completed).length} done</span>
          {hasTrades && <span className="text-green">{trades.length} trades</span>}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl bg-surface/50">
            <Clock className="w-8 h-8 text-text2/40 mb-3" />
            <p className="text-sm text-text2">No tasks scheduled for this day</p>
            <p className="text-xs text-text2/60 mt-1">
              Click &quot;Add Task&quot; to create your schedule
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => onDragStart(task.id)}
                onDragOver={(e) => onDragOver(e, task.id)}
                onDragEnd={onDragEnd}
                className={`group flex items-start gap-3 p-3 rounded-xl border border-border transition-all ${
                  typeColors[task.type]
                } ${dragTaskId === task.id ? 'opacity-50 scale-[0.98]' : 'hover:border-accent/30'}`}
              >
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                >
                  <GripVertical className="w-3.5 h-3.5 text-text2" />
                </button>

                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="mt-0.5 shrink-0 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green" />
                  ) : (
                    <Circle className="w-4 h-4 text-text2 hover:text-text transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {task.time && (
                      <span className="text-[11px] text-text2 font-mono flex items-center gap-1">
                        {task.reminder && <Bell className="w-3 h-3 text-accent" />}
                        {task.time}
                        {task.timeEnd && <span> - {task.timeEnd}</span>}
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium ${
                        task.completed ? 'text-text2 line-through' : 'text-text'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-text2/60 border border-border rounded px-1 py-0.5 leading-none">
                      {task.type}
                    </span>
                    {task.reminder && (
                      <span className="text-[9px] text-accent flex items-center gap-0.5">
                        <Bell className="w-2.5 h-2.5" />
                        {task.reminder >= 1440
                          ? '1d'
                          : task.reminder >= 60
                            ? `${task.reminder / 60}h`
                            : `${task.reminder}m`}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <div
                      className="text-xs text-text2 mt-1 line-clamp-2 [&_p]:m-0"
                      dangerouslySetInnerHTML={{ __html: task.description }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(task)}
                    className="p-1 rounded-md hover:bg-white/5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-text2" />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-1 rounded-md hover:bg-red/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-text2 hover:text-orange transition-colors" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
