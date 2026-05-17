import api from './api';
import type {
  Template,
  TemplateType,
  CreateTemplatePayload,
  CreateTemplateTypePayload,
  UpdateTemplatePayload,
  TemplateItemType,
} from '@/types/template';

export const templateService = {
  // Types
  getTypes: async (spaceId: string): Promise<TemplateType[]> => {
    const res = await api.get('/templates/types', { params: { spaceId } });
    return res.data;
  },
  createType: async (data: CreateTemplateTypePayload): Promise<TemplateType> => {
    const res = await api.post('/templates/types', data);
    return res.data;
  },
  deleteType: async (typeId: string): Promise<void> => {
    await api.delete(`/templates/types/${typeId}`);
  },

  // Templates
  getTemplates: async (spaceId: string, typeId?: string): Promise<Template[]> => {
    const params: Record<string, string> = { spaceId };
    if (typeId) params.typeId = typeId;
    const res = await api.get('/templates', { params });
    return res.data;
  },
  getTemplate: async (templateId: string): Promise<Template> => {
    const res = await api.get(`/templates/${templateId}`);
    return res.data;
  },
  createTemplate: async (data: CreateTemplatePayload): Promise<Template> => {
    const res = await api.post('/templates', data);
    return res.data;
  },
  updateTemplate: async (templateId: string, data: UpdateTemplatePayload): Promise<void> => {
    await api.put(`/templates/${templateId}`, data);
  },
  deleteTemplate: async (templateId: string): Promise<void> => {
    await api.delete(`/templates/${templateId}`);
  },

  // Items
  addItem: async (
    templateId: string,
    data: { type: TemplateItemType; label: string; order: number },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    const res = await api.post(`/templates/${templateId}/items`, data);
    return res.data;
  },
  updateItem: async (
    itemId: string,
    data: Partial<{ type: TemplateItemType; label: string; order: number }>,
  ): Promise<void> => {
    await api.put(`/templates/items/${itemId}`, data);
  },
  deleteItem: async (itemId: string): Promise<void> => {
    await api.delete(`/templates/items/${itemId}`);
  },
};
