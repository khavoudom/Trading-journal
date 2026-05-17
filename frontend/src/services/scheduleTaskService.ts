import api from './api';
import type { ScheduleTask } from '@/pages/Schedule/SchedulePage';

export interface CreateTaskPayload {
  spaceId: string;
  title: string;
  time?: string;
  timeEnd?: string;
  taskDate: string;
  description?: string;
  type?: string;
  reminder?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  time?: string | null;
  timeEnd?: string | null;
  completed?: boolean;
  description?: string | null;
  type?: string;
  reminder?: number | null;
  spaceId?: string;
}

export const scheduleTaskService = {
  getByMonth: async (spaceId: string, month: string): Promise<ScheduleTask[]> => {
    const { data } = await api.get('/schedule-tasks', { params: { spaceId, month } });
    return data.map((t: any) => ({ ...t, date: new Date(t.taskDate) }));
  },

  getByDate: async (spaceId: string, date: string): Promise<ScheduleTask[]> => {
    const { data } = await api.get('/schedule-tasks/date', { params: { spaceId, date } });
    return data.map((t: any) => ({ ...t, date: new Date(t.taskDate) }));
  },

  create: async (task: CreateTaskPayload): Promise<ScheduleTask> => {
    const { data } = await api.post('/schedule-tasks', task);
    return { ...data, date: new Date(data.taskDate) };
  },

  createRepeating: async (
    task: CreateTaskPayload,
    repeatType: string,
    repeatEnd: string,
    customDays?: number[],
  ): Promise<ScheduleTask[]> => {
    const { data } = await api.post('/schedule-tasks/repeat', {
      ...task,
      repeatType,
      repeatEnd,
      customDays,
    });
    return data.map((t: any) => ({ ...t, date: new Date(t.taskDate) }));
  },

  update: async (id: string, task: UpdateTaskPayload): Promise<ScheduleTask> => {
    const { data } = await api.put(`/schedule-tasks/${id}`, task);
    return { ...data, date: new Date(data.taskDate) };
  },

  delete: async (id: string, spaceId: string): Promise<void> => {
    await api.delete(`/schedule-tasks/${id}`, { params: { spaceId } });
  },

  generateMonth: async (
    spaceId: string,
    yearMonth: string,
    opts?: {
      time?: string;
      timeEnd?: string;
      type?: string;
      description?: string;
      reminder?: number;
    },
  ): Promise<ScheduleTask[]> => {
    const { data } = await api.post('/schedule-tasks/generate', {
      spaceId,
      yearMonth,
      ...opts,
    });
    return data.map((t: any) => ({ ...t, date: new Date(t.taskDate) }));
  },
};
