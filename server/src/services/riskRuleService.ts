import { riskRuleRepository } from '@/repositories/riskRuleRepository.js';
import { validate } from '@/validation/index.js';
import { createRiskRuleSchema, updateRiskRuleSchema } from '@/validation/riskRuleSchemas.js';
import { AppError } from '@/errors/AppError.js';
import { authorizationService } from '@/services/authorizationService.js';

export const riskRuleService = {
  getAll: async (userId: string, spaceId: string) => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    return riskRuleRepository.findByUserAndSpace(userId, spaceId);
  },

  create: async (userId: string, input: unknown) => {
    const data = validate(createRiskRuleSchema, input);
    await authorizationService.ensureSpaceAccess(userId, data.spaceId);
    return riskRuleRepository.create(userId, data.spaceId, {
      name: data.name,
      value: data.value,
      unit: data.unit,
      enabled: data.enabled,
    });
  },

  update: async (userId: string, id: string, input: unknown) => {
    const existing = await riskRuleRepository.findById(id);
    if (!existing) throw new AppError('Risk rule not found', 404);
    if (existing.userId !== userId) throw new AppError('Not authorized', 403);

    const data = validate(updateRiskRuleSchema, input);
    return riskRuleRepository.update(id, data);
  },

  remove: async (userId: string, id: string) => {
    const existing = await riskRuleRepository.findById(id);
    if (!existing) throw new AppError('Risk rule not found', 404);
    if (existing.userId !== userId) throw new AppError('Not authorized', 403);

    await riskRuleRepository.remove(id);
    return { success: true };
  },
};
