import { getPrisma } from '@/database/prisma.js';

const typeSelect = {
  id: true,
  userId: true,
  spaceId: true,
  name: true,
  color: true,
  createdAt: true,
} as const;

const itemOrder = { order: 'asc' as const };

/** Data access layer for templates, template types, and template items using Prisma. */
export const templateRepository = {
  // ---- Template Types ----

  findTypesByUserAndSpace: async (userId: string, spaceId: string) => {
    const prisma = getPrisma();
    return prisma.templateType.findMany({
      where: { userId, spaceId },
      select: typeSelect,
      orderBy: { createdAt: 'asc' },
    });
  },

  findTypeById: async (id: string) => {
    const prisma = getPrisma();
    return prisma.templateType.findUnique({
      where: { id },
      select: typeSelect,
    });
  },

  createType: async (userId: string, spaceId: string, data: { name: string; color?: string }) => {
    const prisma = getPrisma();
    return prisma.templateType.create({
      data: { userId, spaceId, name: data.name, color: data.color || '#22c55e' },
      select: typeSelect,
    });
  },

  updateType: async (id: string, data: { name?: string; color?: string }) => {
    const prisma = getPrisma();
    return prisma.templateType.update({ where: { id }, data, select: typeSelect });
  },

  deleteType: async (id: string) => {
    const prisma = getPrisma();
    await prisma.templateType.delete({ where: { id } });
  },

  countTemplatesByType: async (typeId: string) => {
    const prisma = getPrisma();
    return prisma.template.count({ where: { typeId } });
  },

  // ---- Templates ----

  findByUserAndSpace: async (userId: string, spaceId: string, typeId?: string) => {
    const prisma = getPrisma();
    const where: Record<string, unknown> = { userId, spaceId };
    if (typeId) where.typeId = typeId;
    return prisma.template.findMany({
      where,
      include: {
        items: { orderBy: itemOrder },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: string) => {
    const prisma = getPrisma();
    return prisma.template.findUnique({
      where: { id },
      include: {
        items: { orderBy: itemOrder },
      },
    });
  },

  create: async (
    userId: string,
    spaceId: string,
    data: {
      name: string;
      typeId: string | null;
      items: Array<{ type: string; label: string; value?: string; order: number }>;
    },
  ) => {
    const prisma = getPrisma();
    const [template] = await prisma.$transaction(async (tx) => {
      const t = await tx.template.create({
        data: {
          userId,
          spaceId,
          name: data.name,
          typeId: data.typeId,
          items: {
            createMany: {
              data: data.items.map((item) => ({
                type: item.type,
                label: item.label,
                value: item.value || null,
                order: item.order,
              })),
            },
          },
        },
        include: {
          items: { orderBy: itemOrder },
        },
      });
      return [t];
    });
    return template;
  },

  update: async (id: string, data: { name?: string; typeId?: string; isAttached?: boolean }) => {
    const prisma = getPrisma();
    await prisma.template.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    const prisma = getPrisma();
    await prisma.template.delete({ where: { id } });
  },

  // ---- Template Items ----

  findItemById: async (id: string) => {
    const prisma = getPrisma();
    return prisma.templateItem.findUnique({
      where: { id },
      select: {
        id: true,
        templateId: true,
        type: true,
        label: true,
        value: true,
        order: true,
        template: { select: { userId: true } },
      },
    });
  },

  createItem: async (
    templateId: string,
    data: { type: string; label: string; value?: string; order: number },
  ) => {
    const prisma = getPrisma();
    return prisma.templateItem.create({
      data: {
        templateId,
        type: data.type,
        label: data.label,
        value: data.value || null,
        order: data.order,
      },
    });
  },

  updateItem: async (
    id: string,
    data: { type?: string; label?: string; value?: string | null; order?: number },
  ) => {
    const prisma = getPrisma();
    await prisma.templateItem.update({ where: { id }, data });
  },

  deleteItem: async (id: string) => {
    const prisma = getPrisma();
    await prisma.templateItem.delete({ where: { id } });
  },
};
