import { getPrisma } from '@/database/prisma.js';

/** Data access layer for user records using Prisma. */
export const userRepository = {
  /** Finds a user by email, returning the full record including password hash. */
  findByEmail: async (email: string) => {
    const prisma = getPrisma();
    return prisma.user.findUnique({ where: { email } });
  },

  /** Finds a user by ID, excluding the password field. */
  findById: async (id: string) => {
    const prisma = getPrisma();
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, createdAt: true },
    });
  },

  /** Finds a user by ID including the password hash. */
  findByIdWithPassword: async (id: string) => {
    const prisma = getPrisma();
    return prisma.user.findUnique({ where: { id } });
  },

  /** Inserts a new user record. */
  create: async (
    id: string,
    email: string,
    password: string,
    username: string,
    createdAt: Date,
  ) => {
    const prisma = getPrisma();
    return prisma.user.create({
      data: { id, email, password, username, createdAt },
    });
  },

  /** Partially updates a user by ID. Accepts a typed object of fields to update. */
  update: async (id: string, data: { email?: string; username?: string; password?: string }) => {
    const prisma = getPrisma();
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  /** Checks if an email already exists, optionally excluding a user ID. */
  existsByEmail: async (email: string, excludeId?: string) => {
    const prisma = getPrisma();
    const count = await prisma.user.count({
      where: { email, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    return count > 0;
  },

  /** Deletes a user account by ID. */
  remove: async (id: string) => {
    const prisma = getPrisma();
    await prisma.user.delete({ where: { id } });
  },
};
