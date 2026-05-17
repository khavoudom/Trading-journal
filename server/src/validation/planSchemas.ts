import { z } from 'zod';

export const savePlanSchema = z.object({
  spaceId: z.string().min(1, 'spaceId is required'),
  checklist: z.array(z.string()).optional(),
  coreRules: z.array(z.string()).optional(),
  tradingSetup: z.array(z.string()).optional(),
  mistakes: z.array(z.string()).optional(),
  identity: z.array(z.string()).optional(),
});
