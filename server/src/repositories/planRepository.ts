import { getPrisma } from '@/database/prisma.js';
import { PLAN_TEMPLATES, type PlanContent } from '@/config/defaultPlan.js';

const mapToPlanContent = (rows: Array<{ template: string; content: unknown }>): PlanContent => {
  const result: PlanContent = {
    checklist: [],
    coreRules: [],
    tradingSetup: [],
    mistakes: [],
    identity: [],
  };
  for (const row of rows) {
    const key = row.template as keyof PlanContent;
    if (key in result) {
      result[key] = row.content as string[];
    }
  }
  return result;
};

/** Data access layer for trading plan records using Prisma. */
export const planRepository = {
  /** Finds a plan by user and space, assembling template rows into PlanContent. */
  findByUserAndSpace: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    const rows = await prisma.planRule.findMany({
      where: { userId, spaceId },
      select: { template: true, content: true },
    });
    if (rows.length === 0) return null;
    return mapToPlanContent(rows);
  },

  /** Inserts all 5 template rows for a plan. */
  create: async (userId: string, spaceId: string, plan: PlanContent) => {
    const prisma = getPrisma();
    return prisma.planRule.createMany({
      data: PLAN_TEMPLATES.map((template) => ({
        userId,
        spaceId,
        template,
        content: plan[template],
      })),
    });
  },

  /** Upserts all 5 template rows inside a transaction. */
  upsert: async (userId: string, spaceId: string, plan: PlanContent) => {
    const prisma = getPrisma();
    await prisma.$transaction(
      PLAN_TEMPLATES.map((template) =>
        prisma.planRule.upsert({
          where: {
            userId_spaceId_template: { userId, spaceId, template },
          },
          create: { userId, spaceId, template, content: plan[template] },
          update: { content: plan[template] },
        }),
      ),
    );
  },

  /** Deletes all template rows for a user and space. */
  removeByUserAndSpace: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    await prisma.planRule.deleteMany({
      where: { userId, spaceId },
    });
  },
};
