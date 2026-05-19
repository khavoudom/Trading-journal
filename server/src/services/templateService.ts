import { templateRepository } from '@/repositories/templateRepository.js';
import { validate } from '@/validation/index.js';
import {
  createTemplateTypeSchema,
  updateTemplateTypeSchema,
  createTemplateSchema,
  updateTemplateSchema,
  createTemplateItemSchema,
  updateTemplateItemSchema,
} from '@/validation/templateSchemas.js';
import { AppError } from '@/errors/AppError.js';
import { authorizationService } from '@/services/authorizationService.js';

/** Business logic for templates, template types, and template items. */
export const templateService = {
  // ---- Template Types ----

  getTypes: async (userId: string, spaceId: string) => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    return templateRepository.findTypesByUserAndSpace(userId, spaceId);
  },

  createType: async (userId: string, input: { spaceId: string; name: string; color?: string }) => {
    const data = validate(createTemplateTypeSchema, input);
    await authorizationService.ensureSpaceAccess(userId, data.spaceId);
    return templateRepository.createType(userId, data.spaceId, {
      name: data.name,
      color: data.color,
    });
  },

  deleteType: async (userId: string, typeId: string) => {
    const type = await templateRepository.findTypeById(typeId);
    if (!type) throw new AppError('Template type not found', 404);
    if (type.userId !== userId) throw new AppError('Unauthorized', 403);

    const count = await templateRepository.countTemplatesByType(typeId);
    if (count > 0) {
      throw new AppError(
        `Cannot delete type "${type.name}" — it has ${count} template(s). Remove them first.`,
        400,
      );
    }

    await templateRepository.deleteType(typeId);
  },

  updateType: async (userId: string, typeId: string, input: { name?: string; color?: string }) => {
    const existing = await templateRepository.findTypeById(typeId);
    if (!existing) throw new AppError('Template type not found', 404);
    if (existing.userId !== userId) throw new AppError('Unauthorized', 403);

    const data = validate(updateTemplateTypeSchema, input);
    return templateRepository.updateType(typeId, data);
  },

  // ---- Templates ----

  getTemplates: async (userId: string, spaceId: string, typeId?: string) => {
    await authorizationService.ensureSpaceAccess(userId, spaceId);
    return templateRepository.findByUserAndSpace(userId, spaceId, typeId);
  },

  getTemplate: async (userId: string, templateId: string) => {
    const template = await templateRepository.findById(templateId);
    if (!template) throw new AppError('Template not found', 404);
    if (template.userId !== userId) throw new AppError('Unauthorized', 403);
    return template;
  },

  createTemplate: async (
    userId: string,
    input: {
      spaceId: string;
      name: string;
      typeId: string;
      items: Array<{
        type: 'checkbox' | 'text' | 'number';
        label: string;
        value?: string;
        order: number;
      }>;
    },
  ) => {
    const data = validate(createTemplateSchema, input);
    await authorizationService.ensureSpaceAccess(userId, data.spaceId);
    return templateRepository.create(userId, data.spaceId, {
      name: data.name,
      typeId: data.typeId ?? null,
      items: data.items,
    });
  },

  updateTemplate: async (
    userId: string,
    templateId: string,
    input: { name?: string; typeId?: string; isAttached?: boolean },
  ) => {
    const existing = await templateRepository.findById(templateId);
    if (!existing) throw new AppError('Template not found', 404);
    if (existing.userId !== userId) throw new AppError('Unauthorized', 403);

    const data = validate(updateTemplateSchema, input);
    await templateRepository.update(templateId, data);
  },

  deleteTemplate: async (userId: string, templateId: string) => {
    const existing = await templateRepository.findById(templateId);
    if (!existing) throw new AppError('Template not found', 404);
    if (existing.userId !== userId) throw new AppError('Unauthorized', 403);

    await templateRepository.delete(templateId);
  },

  // ---- Template Items ----

  addItem: async (
    userId: string,
    templateId: string,
    input: { type: 'checkbox' | 'text' | 'number'; label: string; value?: string; order: number },
  ) => {
    const existing = await templateRepository.findById(templateId);
    if (!existing) throw new AppError('Template not found', 404);
    if (existing.userId !== userId) throw new AppError('Unauthorized', 403);

    const data = validate(createTemplateItemSchema, input);
    return templateRepository.createItem(templateId, data);
  },

  updateItem: async (
    userId: string,
    itemId: string,
    input: {
      type?: 'checkbox' | 'text' | 'number';
      label?: string;
      value?: string | null;
      order?: number;
    },
  ) => {
    const item = await templateRepository.findItemById(itemId);
    if (!item) throw new AppError('Template item not found', 404);
    if (item.template.userId !== userId) throw new AppError('Unauthorized', 403);

    const data = validate(updateTemplateItemSchema, input);
    await templateRepository.updateItem(itemId, data);
  },

  deleteItem: async (userId: string, itemId: string) => {
    const item = await templateRepository.findItemById(itemId);
    if (!item) throw new AppError('Template item not found', 404);
    if (item.template.userId !== userId) throw new AppError('Unauthorized', 403);

    await templateRepository.deleteItem(itemId);
  },
};
