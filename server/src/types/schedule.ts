export interface ScheduleTask {
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
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleTaskPayload {
  spaceId: string;
  title: string;
  time?: string;
  timeEnd?: string;
  taskDate: string;
  description?: string;
  type?: string;
  repeatGroupId?: string;
  reminder?: number;
}

export interface UpdateScheduleTaskPayload {
  title?: string;
  time?: string | null;
  timeEnd?: string | null;
  completed?: boolean;
  description?: string | null;
  type?: string;
  reminder?: number | null;
}
