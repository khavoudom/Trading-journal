import { z } from 'zod';

export const upsertSettingSchema = z.object({
  spaceId: z.string().optional(),
  key: z.string().min(1, 'key is required').max(255, 'key must be at most 255 characters'),
  value: z.any(),
});

export const getSettingSchema = z.object({
  spaceId: z.string().optional(),
  key: z.string().optional(),
});
