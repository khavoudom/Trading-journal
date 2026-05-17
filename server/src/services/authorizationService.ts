import { AppError } from '@/errors/AppError.js';
import { spaceRepository } from '@/repositories/spaceRepository.js';
import { cacheService } from '@/services/cacheService.js';
import type { Space } from '@/types/space.js';

const SPACE_ACCESS_CACHE_TTL_MS = 30_000;
const SPACE_ACCESS_CACHE_TTL_SECONDS = SPACE_ACCESS_CACHE_TTL_MS / 1000;

type CacheEntry = {
  space: Space;
  expiresAt: number;
};

const spaceAccessCache = new Map<string, CacheEntry>();

const getMemoryCacheKey = (userId: string, spaceId: string) => `${userId}:${spaceId}`;
const getRedisCacheKey = (userId: string, spaceId: string) => `authz:space:${userId}:${spaceId}`;

const setMemoryCache = (cacheKey: string, space: Space) => {
  spaceAccessCache.set(cacheKey, {
    space,
    expiresAt: Date.now() + SPACE_ACCESS_CACHE_TTL_MS,
  });
};

/** Verifies that a user owns the requested space before any space-scoped operation. */
export const authorizationService = {
  ensureSpaceAccess: async (userId: string, spaceId: string) => {
    if (!spaceId) {
      throw new AppError('spaceId is required', 400);
    }

    const memoryCacheKey = getMemoryCacheKey(userId, spaceId);
    const cached = spaceAccessCache.get(memoryCacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.space;
    }
    if (cached) {
      spaceAccessCache.delete(memoryCacheKey);
    }

    const redisCacheKey = getRedisCacheKey(userId, spaceId);
    const redisCached = await cacheService.getJson<Space>(redisCacheKey);
    if (redisCached) {
      setMemoryCache(memoryCacheKey, redisCached);
      return redisCached;
    }

    const space = await spaceRepository.findByIdAndUser(spaceId, userId);
    if (!space) {
      spaceAccessCache.delete(memoryCacheKey);
      await cacheService.delete(redisCacheKey);
      throw new AppError('Not authorized for this space', 403);
    }

    setMemoryCache(memoryCacheKey, space);
    await cacheService.setJson(redisCacheKey, space, SPACE_ACCESS_CACHE_TTL_SECONDS);

    return space;
  },

  invalidateSpaceAccess: async (userId: string, spaceId: string) => {
    spaceAccessCache.delete(getMemoryCacheKey(userId, spaceId));
    await cacheService.delete(getRedisCacheKey(userId, spaceId));
  },

  clearCache: async () => {
    spaceAccessCache.clear();
    await cacheService.clearAuthorizationCache();
  },
};
