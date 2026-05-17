import { getPrisma } from '@/database/prisma.js';
import type { Space } from '@/types/space.js';

const mapSpace = (row: { id: string; userId: string; name: string; createdAt: Date }): Space => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
});

/** Data access layer for space records using Prisma. */
export const spaceRepository = {
  /** Returns all spaces belonging to a user, ordered by creation date. */
  findAllByUser: async (userId: string): Promise<Space[]> => {
    const prisma = getPrisma();
    const rows = await prisma.space.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'asc' }],
    });
    return rows.map(mapSpace);
  },

  /** Finds a single space by its ID. */
  findById: async (id: string): Promise<Space | null> => {
    const prisma = getPrisma();
    const row = await prisma.space.findUnique({ where: { id } });
    return row ? mapSpace(row) : null;
  },

  /** Finds a single space by ID ensuring it belongs to the given user. */
  findByIdAndUser: async (id: string, userId: string): Promise<Space | null> => {
    const prisma = getPrisma();
    const row = await prisma.space.findFirst({ where: { id, userId } });
    return row ? mapSpace(row) : null;
  },

  /** Inserts a new space record. */
  create: async (id: string, userId: string, name: string, createdAt: Date): Promise<Space> => {
    const prisma = getPrisma();
    const row = await prisma.space.create({
      data: { id, userId, name, createdAt },
    });
    return mapSpace(row);
  },

  /** Renames a space owned by the user. Returns the updated space or null if not found. */
  rename: async (id: string, userId: string, name: string): Promise<Space | null> => {
    const prisma = getPrisma();
    const space = await prisma.space.findFirst({ where: { id, userId } });
    if (!space) return null;
    const row = await prisma.space.update({
      where: { id },
      data: { name },
    });
    return mapSpace(row);
  },

  /** Deletes a space owned by the user. */
  remove: async (id: string, userId: string): Promise<boolean> => {
    const prisma = getPrisma();
    const space = await prisma.space.findFirst({ where: { id, userId } });
    if (!space) return false;
    await prisma.space.delete({ where: { id } });
    return true;
  },

  /** Returns the total number of spaces for a user. */
  countByUser: async (userId: string): Promise<number> => {
    const prisma = getPrisma();
    return prisma.space.count({ where: { userId } });
  },
};
