import { getPrisma, disconnectPrisma } from './prisma.js';
import { logger } from '@/utils/logger.js';

export async function connectDatabase(): Promise<void> {
  const prisma = getPrisma();
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  logger.info('DB', 'Connected to database');
}

export async function disconnectDatabase(): Promise<void> {
  await disconnectPrisma();
  logger.info('DB', 'Disconnected from database');
}
