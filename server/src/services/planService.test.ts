import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@/errors/AppError.js';

vi.mock('@/repositories/planRepository.js', () => ({
  planRepository: {
    findByUserAndSpace: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock('@/validation/index.js', () => ({
  validate: vi.fn(),
}));

vi.mock('@/services/authorizationService.js', () => ({
  authorizationService: {
    ensureSpaceAccess: vi.fn(),
  },
}));

import { planService } from '@/services/planService.js';
import { planRepository } from '@/repositories/planRepository.js';
import { validate } from '@/validation/index.js';
import { authorizationService } from '@/services/authorizationService.js';

const mockPlan = {
  checklist: ['Entry check', 'Risk check'],
  coreRules: ['Rule 1'],
  tradingSetup: ['Setup A'],
  mistakes: ['Mistake X'],
  identity: ['Trader identity'],
};

describe('planService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validate).mockImplementation((_schema: any, data: any) => data);
    vi.mocked(authorizationService.ensureSpaceAccess).mockImplementation(
      async (_userId: string, spaceId: string) => {
        if (!spaceId) throw new AppError('spaceId is required', 400);
        return {} as any;
      },
    );
  });

  describe('getPlan', () => {
    it('returns the plan when it exists in DB', async () => {
      vi.mocked(planRepository.findByUserAndSpace).mockResolvedValue(mockPlan as any);

      const result = await planService.getPlan('user-1', 'space-1');

      expect(planRepository.findByUserAndSpace).toHaveBeenCalledWith('user-1', 'space-1');
      expect(result).toEqual(mockPlan);
    });

    it('returns DEFAULT_PLAN fallback when no plan exists', async () => {
      vi.mocked(planRepository.findByUserAndSpace).mockResolvedValue(null);

      const result = await planService.getPlan('user-1', 'space-1');

      expect(planRepository.findByUserAndSpace).toHaveBeenCalledWith('user-1', 'space-1');
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      // DEFAULT_PLAN has five sections
      expect(result).toHaveProperty('checklist');
      expect(result).toHaveProperty('coreRules');
      expect(result).toHaveProperty('tradingSetup');
      expect(result).toHaveProperty('mistakes');
      expect(result).toHaveProperty('identity');
    });

    it('throws when spaceId is missing', async () => {
      await expect(planService.getPlan('user-1', '')).rejects.toThrow('spaceId is required');
    });
  });

  describe('savePlan', () => {
    it('validates and upserts the plan', async () => {
      vi.mocked(planRepository.upsert).mockResolvedValue(undefined);

      const input = { spaceId: 'space-1', checklist: ['Item 1'], coreRules: ['Rule A'] };
      const result = await planService.savePlan('user-1', input);

      expect(validate).toHaveBeenCalled();
      expect(planRepository.upsert).toHaveBeenCalledWith('user-1', 'space-1', {
        checklist: ['Item 1'],
        coreRules: ['Rule A'],
        tradingSetup: expect.any(Array),
        mistakes: expect.any(Array),
        identity: expect.any(Array),
      });
      expect(result).toEqual({ success: true });
    });

    it('fills missing sections with DEFAULT_PLAN defaults', async () => {
      vi.mocked(planRepository.upsert).mockResolvedValue(undefined);

      // Only provide checklist, everything else should default
      await planService.savePlan('user-1', { spaceId: 'space-1', checklist: ['Custom item'] });

      const callArgs = vi.mocked(planRepository.upsert).mock.calls[0][2];
      expect(callArgs.checklist).toEqual(['Custom item']);
      expect(callArgs.coreRules).toBeDefined();
      expect(callArgs.tradingSetup).toBeDefined();
      expect(callArgs.mistakes).toBeDefined();
      expect(callArgs.identity).toBeDefined();
    });
  });
});
