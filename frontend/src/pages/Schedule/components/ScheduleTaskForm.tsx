import { useState, useEffect } from 'react';
import { X, Save, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import TextEditor from '@/components/shared/TextEditor';
import { format } from 'date-fns';

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

type RepeatType = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';

interface ScheduleTaskFormProps {
  task: ScheduleTask | null;
  date: Date;
  scheduleTypes: { value: ScheduleTask['type']; label: string }[];
  onSubmit: (task: Omit<ScheduleTask, 'id'> | ScheduleTask) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  onRepeatSubmit?: (
    task: Omit<ScheduleTask, 'id'>,
    repeatType: RepeatType,
    repeatEnd: Date,
    customDays?: number[],
  ) => void;
}

const SELECTED_TYPE_STYLES: Record<ScheduleTask['type'], string> = {
  trade: 'bg-green text-black',
  analysis: 'bg-blue text-white',
  review: 'bg-orange text-white',
  break: 'bg-purple text-white',
  other: 'bg-surface2 text-text',
};

const TYPE_DOTS: Record<ScheduleTask['type'], string> = {
  trade: 'bg-green',
  analysis: 'bg-blue',
  review: 'bg-orange',
  break: 'bg-purple',
  other: 'bg-[var(--text-gray-500)]',
};

export default function ScheduleTaskForm({
  task,
  date,
  scheduleTypes,
  onSubmit,
  onDelete,
  onClose,
  onRepeatSubmit,
}: ScheduleTaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [time, setTime] = useState(task?.time || '');
  const [timeEnd, setTimeEnd] = useState(task?.timeEnd || '');
  const [description, setDescription] = useState(task?.description || '');
  const [type, setType] = useState<ScheduleTask['type']>(task?.type || 'analysis');
  const [error, setError] = useState('');
  const [reminder, setReminder] = useState(task?.reminder ?? 0);
  const [customReminder, setCustomReminder] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [repeatEnd, setRepeatEnd] = useState(
    format(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd'),
  );
  const [customDays, setCustomDays] = useState<number[]>([date.getDay()]);

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev].sort(),
    );
  };

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    setError('');

    const taskData: Omit<ScheduleTask, 'id'> = {
      title: title.trim(),
      time: time || undefined,
      timeEnd: timeEnd || undefined,
      description: description || undefined,
      type,
      date,
      completed: false,
      reminder: reminder > 0 ? reminder : undefined,
    };

    if (task) {
      onSubmit({ ...task, ...taskData });
    } else if (repeatEnabled && onRepeatSubmit && repeatEnd) {
      onRepeatSubmit(taskData, repeatType, new Date(repeatEnd), customDays);
    } else {
      onSubmit(taskData);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto backdrop-blur-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="animate-fade-in bg-surface/10 border-border/60 shadow-lg shadow-black/10">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-green" />
                <span className="text-base font-semibold">{task ? 'Edit Task' : 'New Task'}</span>
              </CardTitle>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md text-text2 hover:text-text hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-text2 mt-1 ml-7">{format(date, 'EEEE, MMMM d, yyyy')}</p>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label>Task Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pre-market analysis"
                  className="w-full"
                />
                {error && <p className="text-[11px] text-orange">{error}</p>}
              </div>

              {/* Time range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-[10px] text-text2">Optional</p>
                </div>
                <div className="space-y-1.5">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-[10px] text-text2">Optional</p>
                </div>
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <Label>Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {scheduleTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`h-9 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        type === t.value
                          ? SELECTED_TYPE_STYLES[t.value]
                          : 'border border-border text-text2 hover:border-green hover:text-green'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${TYPE_DOTS[t.value]}`} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reminder */}
              <div className="space-y-1.5">
                <Label>Reminder</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 0, label: 'None' },
                    { value: 15, label: '15 min' },
                    { value: 30, label: '30 min' },
                    { value: 60, label: '1 hour' },
                    { value: 120, label: '2 hours' },
                    // custom option below
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setReminder(opt.value);
                        setShowCustomInput(false);
                      }}
                      className={`h-9 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                        reminder === opt.value && !showCustomInput
                          ? 'bg-accent text-white'
                          : 'border border-border text-text2 hover:border-accent/50 hover:text-text'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  {/* Custom button */}
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className={`h-9 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      showCustomInput
                        ? 'bg-accent text-white'
                        : 'border border-border text-text2 hover:border-accent/50 hover:text-text'
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {showCustomInput && (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      min={1}
                      placeholder="Enter minutes"
                      value={customReminder}
                      onChange={(e) => {
                        setCustomReminder(e.target.value);
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) setReminder(val);
                      }}
                      className="w-full"
                    />
                    <span className="text-xs text-text2 whitespace-nowrap">minutes</span>
                  </div>
                )}
              </div>

              {/* Repeat (new tasks only) */}
              {!task && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label>Repeat</Label>
                    <button
                      type="button"
                      onClick={() => setRepeatEnabled(!repeatEnabled)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        repeatEnabled ? 'bg-green' : 'bg-surface2'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          repeatEnabled ? 'translate-x-4' : ''
                        }`}
                      />
                    </button>
                  </div>
                  {repeatEnabled && (
                    <div className="space-y-3 pl-1">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'daily' as const, label: 'Every Day' },
                          { value: 'weekdays' as const, label: 'Weekdays' },
                          { value: 'weekends' as const, label: 'Weekends' },
                          { value: 'weekly' as const, label: 'Weekly' },
                          { value: 'custom' as const, label: 'Custom' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setRepeatType(opt.value)}
                            className={`h-9 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                              repeatType === opt.value
                                ? 'bg-accent text-white'
                                : 'border border-border text-text2 hover:border-accent/50 hover:text-text'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {repeatType === 'custom' && (
                        <div className="space-y-1.5">
                          <Label>Select Days</Label>
                          <div className="flex gap-1.5">
                            {DAY_LABELS.map((label, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => toggleCustomDay(i)}
                                className={`w-9 h-9 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                                  customDays.includes(i)
                                    ? 'bg-accent text-white'
                                    : 'border border-border text-text2 hover:border-accent/50 hover:text-text'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={repeatEnd}
                          onChange={(e) => setRepeatEnd(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <Label>Description</Label>
                <TextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Add notes or details about this task..."
                  minHeight={140}
                />
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border mt-2">
              {task && onDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2.5">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-green text-black hover:bg-green/90 font-bold"
                >
                  <Save className="w-3.5 h-3.5" />
                  {task ? 'Save Changes' : 'Add Task'}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
