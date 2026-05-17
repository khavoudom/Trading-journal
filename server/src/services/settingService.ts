import { settingRepository } from '@/repositories/settingRepository.js';
import { validate } from '@/validation/index.js';
import { upsertSettingSchema } from '@/validation/settingSchemas.js';
import { AppError } from '@/errors/AppError.js';
import { authorizationService } from '@/services/authorizationService.js';

const SETTING_CACHE_TTL_MS = 60_000 as const;

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const settingCache = new Map<string, CacheEntry>();

const getCacheKey = (userId: string, key: string, spaceId?: string) =>
  `${userId}:${spaceId ?? ''}:${key}`;

const getFromCache = (userId: string, key: string, spaceId?: string): unknown | null => {
  const cacheKey = getCacheKey(userId, key, spaceId);
  const cached = settingCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  if (cached) {
    settingCache.delete(cacheKey);
  }
  return null;
};

const setCache = (userId: string, key: string, value: unknown, spaceId?: string) => {
  const cacheKey = getCacheKey(userId, key, spaceId);
  settingCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + SETTING_CACHE_TTL_MS,
  });
};

const invalidateCache = (userId: string, key: string, spaceId?: string) => {
  settingCache.delete(getCacheKey(userId, key, spaceId));
};

export const settingService = {
  get: async (userId: string, key: string, spaceId?: string) => {
    if (spaceId) {
      await authorizationService.ensureSpaceAccess(userId, spaceId);
    }

    const cached = getFromCache(userId, key, spaceId);
    if (cached !== null) {
      return cached;
    }

    const setting = await settingRepository.findByUserAndKey(userId, key, spaceId);
    if (!setting) {
      return null;
    }

    setCache(userId, key, setting.value, spaceId);
    return setting.value;
  },

  getAll: async (userId: string, spaceId?: string) => {
    if (spaceId) {
      await authorizationService.ensureSpaceAccess(userId, spaceId);
    }

    const settings = await settingRepository.findAllByUser(userId, spaceId);

    settings.forEach((s) => {
      setCache(userId, s.key, s.value, s.spaceId ?? undefined);
    });

    return settings.map((s) => ({
      id: s.id,
      key: s.key,
      value: s.value,
      spaceId: s.spaceId,
    }));
  },

  set: async (userId: string, input: unknown) => {
    const data = validate(upsertSettingSchema, input);

    if (data.spaceId) {
      await authorizationService.ensureSpaceAccess(userId, data.spaceId);
    }

    const setting = await settingRepository.upsert(userId, data.key, data.value, data.spaceId);
    invalidateCache(userId, data.key, data.spaceId);

    return setting;
  },

  remove: async (userId: string, id: string) => {
    const setting = await settingRepository.findById(id);
    if (!setting) throw new AppError('Setting not found', 404);
    if (setting.userId !== userId) throw new AppError('Not authorized', 403);

    invalidateCache(userId, setting.key, setting.spaceId ?? undefined);
    await settingRepository.remove(id);
    return { success: true };
  },
};
