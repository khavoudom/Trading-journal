import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_PLAN, PLAN_TEMPLATES } from '@/config/defaultPlan.js';
import { spaceRepository } from '@/repositories/spaceRepository.js';
import { userRepository } from '@/repositories/userRepository.js';
import { getPrisma } from '@/database/prisma.js';
import { validate } from '@/validation/index.js';
import { createSpaceSchema, renameSpaceSchema } from '@/validation/spaceSchemas.js';
import { AppError } from '@/errors/AppError.js';
import { authorizationService } from '@/services/authorizationService.js';

/** Business logic for managing trading spaces. */
export const spaceService = {
  /**
   * Returns all spaces belonging to a user.
   */
  getSpaces: async (userId: string) => {
    return spaceRepository.findAllByUser(userId);
  },

  /**
   * Creates a new space with an associated default trading plan.
   */
  createSpace: async (userId: string, name: string) => {
    const data = validate(createSpaceSchema, { name });

    const id = uuidv4();
    const createdAt = new Date();

    await getPrisma().$transaction(async (tx) => {
      await tx.space.create({
        data: { id, userId, name: data.name, createdAt },
      });
      await tx.planRule.createMany({
        data: PLAN_TEMPLATES.map((template) => ({
          userId,
          spaceId: id,
          template,
          content: DEFAULT_PLAN[template],
        })),
      });
    });

    return { id, userId, name: data.name, createdAt: createdAt.toISOString() };
  },

  /**
   * Renames an existing space owned by the user.
   */
  renameSpace: async (userId: string, id: string, name: string) => {
    const data = validate(renameSpaceSchema, { name });

    const updated = await spaceRepository.rename(id, userId, data.name);
    if (!updated) {
      throw new AppError('Space not found', 404);
    }

    await authorizationService.invalidateSpaceAccess(userId, id);

    return updated;
  },

  /**
   * Deletes a space and all associated trades and plan data.
   * Requires password confirmation. Prevents deletion of the user's only remaining space.
   */
  deleteSpace: async (userId: string, id: string, password: string) => {
    const space = await spaceRepository.findByIdAndUser(id, userId);
    if (!space) {
      throw new AppError('Space not found', 404);
    }

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError('Password is incorrect', 403);
    }

    const spaceCount = await spaceRepository.countByUser(userId);
    if (spaceCount <= 1) {
      throw new AppError('Cannot delete your only space', 400);
    }

    await getPrisma().$transaction(async (tx) => {
      await tx.trade.deleteMany({ where: { spaceId: id, userId } });
      await tx.planRule.deleteMany({ where: { userId, spaceId: id } });
      await tx.riskRule.deleteMany({ where: { spaceId: id, userId } });
      await tx.templateType.deleteMany({ where: { spaceId: id, userId } });
      await tx.template.deleteMany({ where: { spaceId: id, userId } });
      await tx.calendarEvent.deleteMany({ where: { spaceId: id, userId } });
      await tx.calendarDrawing.deleteMany({ where: { spaceId: id, userId } });
      await tx.drawingBoardDrawing.deleteMany({ where: { spaceId: id, userId } });
      await tx.space.delete({ where: { id } });
    });

    await authorizationService.invalidateSpaceAccess(userId, id);
  },
};
