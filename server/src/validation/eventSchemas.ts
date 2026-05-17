import { z } from 'zod';

export const createEventSchema = z.object({
  spaceId: z.string().min(1, 'spaceId is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be yyyy-MM-dd'),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().optional().default(''),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
});
