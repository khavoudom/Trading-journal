import { DEFAULT_PLAN } from '@/config/defaultPlan.js';
import { planRepository } from '@/repositories/planRepository.js';
import { validate } from '@/validation/index.js';
import { savePlanSchema } from '@/validation/planSchemas.js';
import { authorizationService } from '@/services/authorizationService.js';

/** Business logic for reading and saving trading plans. */
export const planService = {
  /**
   * Returns the trading plan for a user and space, or the default plan if none exists.
   */
  getPlan: async (userId: string, spaceId: string) => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);

    const plan = await planRepository.findByUserAndSpace(userId, spaceId);
    return plan ?? { ...DEFAULT_PLAN };
  },

  /**
   * Upserts the trading plan for a user and space.
   */
  savePlan: async (
    userId: string,
    input: {
      spaceId: string;
      checklist?: string[];
      coreRules?: string[];
      tradingSetup?: string[];
      mistakes?: string[];
      identity?: string[];
    },
  ) => {
    const data = validate(savePlanSchema, input);
    await authorizationService.ensureSpaceAccess(userId, data.spaceId);

    await planRepository.upsert(userId, data.spaceId, {
      checklist: data.checklist || DEFAULT_PLAN.checklist,
      coreRules: data.coreRules || DEFAULT_PLAN.coreRules,
      tradingSetup: data.tradingSetup || DEFAULT_PLAN.tradingSetup,
      mistakes: data.mistakes || DEFAULT_PLAN.mistakes,
      identity: data.identity || DEFAULT_PLAN.identity,
    });

    return { success: true };
  },
};
