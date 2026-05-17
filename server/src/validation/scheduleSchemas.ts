import { z } from 'zod';

export const createScheduleTaskSchema = z.object({
  spaceId: z.string().min(1, 'spaceId is required'),
  title: z.string().min(1, 'Title is required').max(300),
  time: z.string().optional(),
  timeEnd: z.string().optional(),
  taskDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'taskDate must be yyyy-MM-dd'),
  description: z.string().optional(),
  type: z.string().optional().default('analysis'),
  repeatGroupId: z.string().optional(),
  reminder: z.number().int().positive().optional(),
});

export const updateScheduleTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  time: z.string().nullable().optional(),
  timeEnd: z.string().nullable().optional(),
  completed: z.boolean().optional(),
  description: z.string().nullable().optional(),
  type: z.string().optional(),
  reminder: z.number().int().positive().nullable().optional(),
});

export const generateMonthSchema = z.object({
  spaceId: z.string().min(1, 'spaceId is required'),
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, 'yearMonth must be YYYY-MM'),
  time: z.string().optional(),
  timeEnd: z.string().optional(),
  type: z.string().optional().default('analysis'),
  description: z.string().optional(),
  reminder: z.number().int().positive().optional(),
});
