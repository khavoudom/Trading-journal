import { z } from 'zod';

export const createNotificationSchema = z.object({
  spaceId: z.string().min(1, 'spaceId is required'),
  type: z.enum(['alert', 'reminder']),
  category: z.string().min(1, 'category is required'),
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().optional().default(''),
  linkPath: z.string().optional(),
  metadata: z.any().optional().default({}),
  status: z.string().optional().default('unread'),
});

export const markReadSchema = z.object({
  read: z.boolean(),
});
