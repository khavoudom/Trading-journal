import { z } from 'zod';

export const createDrawingSchema = z.object({
  spaceId: z.string().min(1, 'spaceId is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be yyyy-MM-dd'),
  title: z.string().max(200).optional().default('Drawing'),
  sceneData: z.any(),
});

export const updateDrawingSchema = z.object({
  title: z.string().max(200).optional(),
  sceneData: z.any().optional(),
});
