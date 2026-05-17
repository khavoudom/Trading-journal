import { z } from 'zod';

export const createSpaceSchema = z.object({
  name: z.string().min(1, 'Space name is required').trim(),
});

export const renameSpaceSchema = z.object({
  name: z.string().min(1, 'Space name is required').trim(),
});
