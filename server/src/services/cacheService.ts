import { createClient, type RedisClientType } from 'redis';
import { config } from '@/config/index.js';
import { logger } from '@/utils/logger.js';

let redisClient: RedisClientType | null = null;
let redisAvailable = false;

const getRedisClient = async (): Promise<RedisClientType | null> => {
  if (!config.redisUrl) {
    return null;
  }

  if (!redisClient) {
    redisClient = createClient({ url: config.redisUrl });
    redisClient.on('error', (error) => {
      redisAvailable = false;
      logger.error('CACHE', 'Redis error: %s', error instanceof Error ? error.message : error);
    });
  }

  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      redisAvailable = true;
    } catch (error) {
      redisAvailable = false;
      logger.error(
        'CACHE',
        'Failed to connect to Redis: %s',
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  return redisAvailable ? redisClient : null;
};

export const cacheService = {
  getJson: async <T>(key: string): Promise<T | null> => {
    const client = await getRedisClient();
    if (!client) return null;

    try {
      const value = await client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      logger.error('CACHE', 'Redis get failed for %s: %s', key, error);
      return null;
    }
  },

  setJson: async (key: string, value: unknown, ttlSeconds: number): Promise<boolean> => {
    const client = await getRedisClient();
    if (!client) return false;

    try {
      await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
      return true;
    } catch (error) {
      logger.error('CACHE', 'Redis set failed for %s: %s', key, error);
      return false;
    }
  },

  delete: async (key: string): Promise<void> => {
    const client = await getRedisClient();
    if (!client) return;

    try {
      await client.del(key);
    } catch (error) {
      logger.error('CACHE', 'Redis delete failed for %s: %s', key, error);
    }
  },

  clearAuthorizationCache: async (): Promise<void> => {
    const client = await getRedisClient();
    if (!client) return;

    try {
      const keys = await client.keys('authz:space:*');
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      logger.error('CACHE', 'Redis auth cache clear failed: %s', error);
    }
  },
};
