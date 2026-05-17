import { v4 as uuidv4 } from 'uuid';
import { scheduleTaskRepository } from '@/repositories/scheduleTaskRepository.js';
import { validate } from '@/validation/index.js';
import {
  createScheduleTaskSchema,
  updateScheduleTaskSchema,
  generateMonthSchema,
} from '@/validation/scheduleSchemas.js';
import { AppError } from '@/errors/AppError.js';
import { authorizationService } from '@/services/authorizationService.js';
import type { ScheduleTask, CreateScheduleTaskPayload } from '@/types/schedule.js';

const mapTask = (row: any): ScheduleTask => ({
  id: row.id,
  userId: row.userId,
  spaceId: row.spaceId,
  title: row.title,
  time: row.time ?? null,
  timeEnd: row.timeEnd ?? null,
  taskDate: row.taskDate,
  completed: row.completed,
  description: row.description ?? null,
  type: row.type,
  repeatGroupId: row.repeatGroupId ?? null,
  reminder: row.reminder ?? null,
  reminderSent: row.reminderSent,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

function expandRepeatDates(
  taskDate: string,
  repeatType: string,
  repeatEnd: string,
  customDays?: number[],
): string[] {
  const start = new Date(taskDate);
  const end = new Date(repeatEnd);
  const dates: string[] = [];

  if (repeatType === 'daily') {
    const d = new Date(start);
    while (d <= end) {
      dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
  } else if (repeatType === 'weekdays') {
    const d = new Date(start);
    while (d <= end) {
      const dow = d.getDay();
      if (dow >= 1 && dow <= 5) dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
  } else if (repeatType === 'weekends') {
    const d = new Date(start);
    while (d <= end) {
      const dow = d.getDay();
      if (dow === 0 || dow === 6) dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
  } else if (repeatType === 'weekly') {
    const d = new Date(start);
    while (d <= end) {
      dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 7);
    }
  } else if (repeatType === 'custom' && customDays) {
    const d = new Date(start);
    while (d <= end) {
      if (customDays.includes(d.getDay())) dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
  }

  return dates;
}

export const scheduleTaskService = {
  getTasksByMonth: async (
    userId: string,
    spaceId: string,
    month: string,
  ): Promise<ScheduleTask[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    if (!month) throw new AppError('month is required (YYYY-MM)', 400);
    const rows = await scheduleTaskRepository.findByMonth(userId, spaceId, month);
    return rows.map(mapTask);
  },

  getTasksByDate: async (
    userId: string,
    spaceId: string,
    taskDate: string,
  ): Promise<ScheduleTask[]> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    if (!taskDate) throw new AppError('date is required', 400);
    const rows = await scheduleTaskRepository.findByDate(userId, spaceId, taskDate);
    return rows.map(mapTask);
  },

  createTask: async (taskData: unknown, userId: string): Promise<ScheduleTask> => {
    const data = validate(createScheduleTaskSchema, taskData);
    await authorizationService.ensureSpaceAccess(userId, data.spaceId);
    const id = uuidv4();
    const row = await scheduleTaskRepository.create({
      id,
      userId,
      spaceId: data.spaceId,
      title: data.title,
      time: data.time ?? null,
      timeEnd: data.timeEnd ?? null,
      taskDate: data.taskDate,
      completed: false,
      description: data.description ?? null,
      type: data.type,
      repeatGroupId: data.repeatGroupId ?? null,
      reminder: data.reminder ?? null,
    });
    return mapTask(row);
  },

  createRepeatingTasks: async (
    baseData: CreateScheduleTaskPayload,
    repeatType: string,
    repeatEnd: string,
    customDays: number[] | undefined,
    userId: string,
  ): Promise<ScheduleTask[]> => {
    await authorizationService.ensureSpaceAccess(userId, baseData.spaceId);
    const dates = expandRepeatDates(baseData.taskDate, repeatType, repeatEnd, customDays);
    const repeatGroupId = uuidv4();
    const records = dates.map((date) => ({
      id: uuidv4(),
      userId,
      spaceId: baseData.spaceId,
      title: baseData.title,
      time: baseData.time ?? null,
      timeEnd: baseData.timeEnd ?? null,
      taskDate: date,
      completed: false,
      description: baseData.description ?? null,
      type: baseData.type ?? 'analysis',
      repeatGroupId,
      reminder: baseData.reminder ?? null,
    }));

    const idsInOrder = records.map((r) => r.id);
    await scheduleTaskRepository.createMany(records);

    // Fetch back in order
    const rows = await scheduleTaskRepository.findByMonth(
      userId,
      baseData.spaceId,
      baseData.taskDate.slice(0, 7),
    );
    return rows.filter((r: any) => idsInOrder.includes(r.id)).map(mapTask);
  },

  updateTask: async (
    id: string,
    taskData: unknown,
    userId: string,
    spaceId: string,
  ): Promise<ScheduleTask> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const data = validate(updateScheduleTaskSchema, taskData);
    const existing = await scheduleTaskRepository.findById(id, userId, spaceId);
    if (!existing) throw new AppError('Schedule task not found', 404);
    const row = await scheduleTaskRepository.update(id, userId, spaceId, data);
    return mapTask(row);
  },

  deleteTask: async (id: string, userId: string, spaceId: string): Promise<void> => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    const deleted = await scheduleTaskRepository.remove(id, userId, spaceId);
    if (!deleted) throw new AppError('Schedule task not found', 404);
  },

  generateMonth: async (payload: unknown, userId: string): Promise<ScheduleTask[]> => {
    const data = validate(generateMonthSchema, payload);
    await authorizationService.ensureSpaceAccess(userId, data.spaceId);
    const [year, month] = data.yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const records: Array<{
      id: string;
      userId: string;
      spaceId: string;
      title: string;
      time: string | null;
      timeEnd: string | null;
      taskDate: string;
      completed: boolean;
      description: string | null;
      type: string;
      repeatGroupId: string | null;
      reminder: number | null;
    }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${data.yearMonth}-${String(day).padStart(2, '0')}`;
      records.push({
        id: uuidv4(),
        userId,
        spaceId: data.spaceId,
        title: `Daily Routine - ${dateStr}`,
        time: data.time ?? null,
        timeEnd: data.timeEnd ?? null,
        taskDate: dateStr,
        completed: false,
        description: data.description ?? null,
        type: data.type,
        repeatGroupId: null,
        reminder: data.reminder ?? null,
      });
    }

    await scheduleTaskRepository.createMany(records);
    const rows = await scheduleTaskRepository.findByMonth(userId, data.spaceId, data.yearMonth);
    return rows.filter((r: any) => records.some((rec) => rec.id === r.id)).map(mapTask);
  },

  processReminders: async () => {
    const now = new Date();
    const pending = await scheduleTaskRepository.findPendingReminders();
    const due: any[] = [];

    for (const task of pending) {
      if (!task.reminder || !task.taskDate) continue;

      // Parse taskDate and time to compute the task's start moment
      const taskDateTime = task.time
        ? new Date(`${task.taskDate}T${task.time}:00`)
        : new Date(`${task.taskDate}T00:00:00`);

      const reminderDate = new Date(taskDateTime.getTime() - task.reminder * 60 * 1000);

      if (reminderDate <= now) {
        due.push(task);
      }
    }

    if (due.length === 0) return due;

    const ids = due.map((t: any) => t.id);
    await scheduleTaskRepository.markReminderSent(ids);

    return due;
  },
};
