import { z } from 'zod';

export const createRiskRuleSchema = z.object({
  spaceId: z.string().min(1, 'spaceId is required'),
  name: z.enum(['daily_drawdown', 'max_position_size', 'max_leverage', 'correlated_exposure']),
  value: z.number().positive('value must be positive'),
  unit: z.enum(['USD', '%', 'lots']).default('USD'),
  enabled: z.boolean().default(true),
});

export const updateRiskRuleSchema = z.object({
  name: z
    .enum(['daily_drawdown', 'max_position_size', 'max_leverage', 'correlated_exposure'])
    .optional(),
  value: z.number().positive('value must be positive').optional(),
  unit: z.enum(['USD', '%', 'lots']).optional(),
  enabled: z.boolean().optional(),
});
