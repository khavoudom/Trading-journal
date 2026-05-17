import { PrismaClient } from '@/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '@/config/index.js';

let prisma: PrismaClient | null = null;

/** Returns the singleton PrismaClient instance, creating it on first call. */
export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    const adapter = new PrismaPg({ connectionString: config.databaseUrl });
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
};

/** Disconnects and releases the PrismaClient singleton. */
export const disconnectPrisma = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};
