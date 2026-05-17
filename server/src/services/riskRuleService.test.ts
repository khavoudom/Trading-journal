import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@/errors/AppError.js';

vi.mock('@/repositories/riskRuleRepository.js', () => ({
  riskRuleRepository: {
    findByUserAndSpace: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
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

import { riskRuleService } from '@/services/riskRuleService.js';
import { riskRuleRepository } from '@/repositories/riskRuleRepository.js';
import { validate } from '@/validation/index.js';
import { authorizationService } from '@/services/authorizationService.js';

const mockRiskRule = {
  id: 'rule-1',
  userId: 'user-1',
  spaceId: 'space-1',
  name: 'Max Daily Loss',
  value: 1000,
  unit: 'USD',
  enabled: true,
  createdAt: new Date('2024-01-01'),
};

describe('riskRuleService', () => {
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

  describe('getAll', () => {
    it('returns all rules for a user and space', async () => {
      vi.mocked(riskRuleRepository.findByUserAndSpace).mockResolvedValue([mockRiskRule] as any);

      const result = await riskRuleService.getAll('user-1', 'space-1');

      expect(riskRuleRepository.findByUserAndSpace).toHaveBeenCalledWith('user-1', 'space-1');
      expect(result).toEqual([mockRiskRule]);
    });

    it('throws when spaceId is missing', async () => {
      await expect(riskRuleService.getAll('user-1', '')).rejects.toThrow('spaceId is required');
    });
  });

  describe('create', () => {
    it('creates a risk rule with validated data', async () => {
      vi.mocked(riskRuleRepository.create).mockResolvedValue(mockRiskRule as any);

      const input = {
        spaceId: 'space-1',
        name: 'Max Daily Loss',
        value: 1000,
        unit: 'USD',
        enabled: true,
      };
      const result = await riskRuleService.create('user-1', input);

      expect(validate).toHaveBeenCalled();
      expect(riskRuleRepository.create).toHaveBeenCalledWith('user-1', 'space-1', {
        name: 'Max Daily Loss',
        value: 1000,
        unit: 'USD',
        enabled: true,
      });
      expect(result).toEqual(mockRiskRule);
    });
  });

  describe('update', () => {
    it('updates an owned rule', async () => {
      vi.mocked(riskRuleRepository.findById).mockResolvedValue(mockRiskRule as any);
      vi.mocked(riskRuleRepository.update).mockResolvedValue({
        ...mockRiskRule,
        value: 2000,
      } as any);

      const result = await riskRuleService.update('user-1', 'rule-1', { value: 2000 });

      expect(riskRuleRepository.findById).toHaveBeenCalledWith('rule-1');
      expect(riskRuleRepository.update).toHaveBeenCalledWith('rule-1', { value: 2000 });
    });

    it('throws 403 when rule belongs to another user', async () => {
      vi.mocked(riskRuleRepository.findById).mockResolvedValue(mockRiskRule as any);

      await expect(riskRuleService.update('other-user', 'rule-1', { value: 2000 })).rejects.toThrow(
        AppError,
      );
      await expect(riskRuleService.update('other-user', 'rule-1', { value: 2000 })).rejects.toThrow(
        'Not authorized',
      );
      expect(riskRuleRepository.update).not.toHaveBeenCalled();
    });

    it('throws 404 when rule not found', async () => {
      vi.mocked(riskRuleRepository.findById).mockResolvedValue(null);

      await expect(
        riskRuleService.update('user-1', 'nonexistent', { value: 2000 }),
      ).rejects.toThrow(AppError);
      await expect(
        riskRuleService.update('user-1', 'nonexistent', { value: 2000 }),
      ).rejects.toThrow('Risk rule not found');
    });
  });

  describe('remove', () => {
    it('removes an owned rule', async () => {
      vi.mocked(riskRuleRepository.findById).mockResolvedValue(mockRiskRule as any);

      const result = await riskRuleService.remove('user-1', 'rule-1');

      expect(riskRuleRepository.findById).toHaveBeenCalledWith('rule-1');
      expect(riskRuleRepository.remove).toHaveBeenCalledWith('rule-1');
      expect(result).toEqual({ success: true });
    });

    it('throws 403 when rule belongs to another user', async () => {
      vi.mocked(riskRuleRepository.findById).mockResolvedValue(mockRiskRule as any);

      await expect(riskRuleService.remove('other-user', 'rule-1')).rejects.toThrow(
        'Not authorized',
      );
      expect(riskRuleRepository.remove).not.toHaveBeenCalled();
    });

    it('throws 404 when rule not found', async () => {
      vi.mocked(riskRuleRepository.findById).mockResolvedValue(null);

      await expect(riskRuleService.remove('user-1', 'nonexistent')).rejects.toThrow(
        'Risk rule not found',
      );
    });
  });
});
