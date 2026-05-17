import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '@/errors/AppError.js';

vi.mock('@/repositories/spaceRepository.js', () => ({
  spaceRepository: {
    findByIdAndUser: vi.fn(),
  },
}));

vi.mock('@/services/cacheService.js', () => ({
  cacheService: {
    getJson: vi.fn(),
    setJson: vi.fn(),
    delete: vi.fn(),
    clearAuthorizationCache: vi.fn(),
  },
}));

import { authorizationService } from '@/services/authorizationService.js';
import { spaceRepository } from '@/repositories/spaceRepository.js';
import { cacheService } from '@/services/cacheService.js';

describe('authorizationService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(cacheService.getJson).mockResolvedValue(null);
    vi.mocked(cacheService.setJson).mockResolvedValue(false);
    vi.mocked(cacheService.delete).mockResolvedValue(undefined);
    vi.mocked(cacheService.clearAuthorizationCache).mockResolvedValue(undefined);
    await authorizationService.clearCache();
  });

  describe('ensureSpaceAccess', () => {
    it('returns the space when the user owns it', async () => {
      const space = { id: 'space-1', userId: 'user-1', name: 'Main' };
      vi.mocked(spaceRepository.findByIdAndUser).mockResolvedValue(space as any);

      const result = await authorizationService.ensureSpaceAccess('user-1', 'space-1');

      expect(spaceRepository.findByIdAndUser).toHaveBeenCalledWith('space-1', 'user-1');
      expect(result).toEqual(space);
    });

    it('reuses a cached space access result within the TTL', async () => {
      const space = { id: 'space-1', userId: 'user-1', name: 'Main' };
      vi.mocked(spaceRepository.findByIdAndUser).mockResolvedValue(space as any);

      const first = await authorizationService.ensureSpaceAccess('user-1', 'space-1');
      const second = await authorizationService.ensureSpaceAccess('user-1', 'space-1');

      expect(spaceRepository.findByIdAndUser).toHaveBeenCalledTimes(1);
      expect(first).toEqual(space);
      expect(second).toEqual(space);
    });

    it('uses Redis cache before querying the repository', async () => {
      const space = { id: 'space-1', userId: 'user-1', name: 'Main' };
      vi.mocked(cacheService.getJson).mockResolvedValue(space);

      const result = await authorizationService.ensureSpaceAccess('user-1', 'space-1');

      expect(cacheService.getJson).toHaveBeenCalledWith('authz:space:user-1:space-1');
      expect(spaceRepository.findByIdAndUser).not.toHaveBeenCalled();
      expect(result).toEqual(space);
    });

    it('fetches again after cache invalidation', async () => {
      const space = { id: 'space-1', userId: 'user-1', name: 'Main' };
      vi.mocked(spaceRepository.findByIdAndUser).mockResolvedValue(space as any);

      await authorizationService.ensureSpaceAccess('user-1', 'space-1');
      await authorizationService.invalidateSpaceAccess('user-1', 'space-1');
      await authorizationService.ensureSpaceAccess('user-1', 'space-1');

      expect(spaceRepository.findByIdAndUser).toHaveBeenCalledTimes(2);
      expect(cacheService.delete).toHaveBeenCalledWith('authz:space:user-1:space-1');
    });

    it('throws when spaceId is missing', async () => {
      await expect(authorizationService.ensureSpaceAccess('user-1', '')).rejects.toThrow(
        'spaceId is required',
      );
      expect(spaceRepository.findByIdAndUser).not.toHaveBeenCalled();
    });

    it('throws 403 when the space is missing or not owned by the user', async () => {
      vi.mocked(spaceRepository.findByIdAndUser).mockResolvedValue(null);

      await expect(
        authorizationService.ensureSpaceAccess('user-1', 'space-2'),
      ).rejects.toMatchObject(new AppError('Not authorized for this space', 403));
    });
  });
});
