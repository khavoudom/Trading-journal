import { create } from 'zustand';
import type {
  Template,
  TemplateType,
  CreateTemplatePayload,
  CreateTemplateTypePayload,
  UpdateTemplatePayload,
  TemplateItemType,
} from '@/types/template';
import { templateService } from '@/services/templateService';

interface TemplateState {
  types: TemplateType[];
  templates: Template[];
  loading: boolean;
  error: string | null;
  fetchTypes: (spaceId: string) => Promise<void>;
  createType: (data: CreateTemplateTypePayload) => Promise<TemplateType>;
  deleteType: (typeId: string) => Promise<void>;
  fetchTemplates: (spaceId: string, typeId?: string) => Promise<void>;
  createTemplate: (data: CreateTemplatePayload) => Promise<void>;
  updateTemplate: (id: string, data: UpdateTemplatePayload) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  addItem: (
    templateId: string,
    data: { type: TemplateItemType; label: string; order: number },
  ) => Promise<void>;
  updateItem: (
    itemId: string,
    data: Partial<{ type: TemplateItemType; label: string; order: number }>,
  ) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateState>()((set) => ({
  types: [],
  templates: [],
  loading: false,
  error: null,

  fetchTypes: async (spaceId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await templateService.getTypes(spaceId);
      set({ types: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch template types', loading: false });
    }
  },

  createType: async (data: CreateTemplateTypePayload) => {
    set({ error: null });
    try {
      const newType = await templateService.createType(data);
      set((state) => ({ types: [...state.types, newType] }));
      return newType;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create template type' });
      throw err;
    }
  },

  deleteType: async (typeId: string) => {
    set({ error: null });
    try {
      await templateService.deleteType(typeId);
      set((state) => ({ types: state.types.filter((t) => t.id !== typeId) }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete template type' });
      throw err;
    }
  },

  fetchTemplates: async (spaceId: string, typeId?: string) => {
    set({ loading: true, error: null });
    try {
      const data = await templateService.getTemplates(spaceId, typeId);
      set({ templates: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch templates', loading: false });
    }
  },

  createTemplate: async (data: CreateTemplatePayload) => {
    set({ error: null });
    try {
      const newTemplate = await templateService.createTemplate(data);
      set((state) => ({ templates: [newTemplate, ...state.templates] }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to create template' });
      throw err;
    }
  },

  updateTemplate: async (id: string, data: UpdateTemplatePayload) => {
    set({ error: null });
    try {
      await templateService.updateTemplate(id, data);
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? ({ ...t, ...data } as Template) : t)),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update template' });
      throw err;
    }
  },

  deleteTemplate: async (id: string) => {
    set({ error: null });
    try {
      await templateService.deleteTemplate(id);
      set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete template' });
      throw err;
    }
  },

  addItem: async (
    templateId: string,
    data: { type: TemplateItemType; label: string; order: number },
  ) => {
    set({ error: null });
    try {
      const newItem = await templateService.addItem(templateId, data);
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === templateId ? { ...t, items: [...t.items, newItem] } : t,
        ),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to add template item' });
      throw err;
    }
  },

  updateItem: async (
    itemId: string,
    data: Partial<{ type: TemplateItemType; label: string; order: number }>,
  ) => {
    set({ error: null });
    try {
      await templateService.updateItem(itemId, data);
      set((state) => ({
        templates: state.templates.map((t) => ({
          ...t,
          items: t.items.map((item) =>
            item.id === itemId ? ({ ...item, ...data } as Template['items'][number]) : item,
          ),
        })),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update template item' });
      throw err;
    }
  },

  deleteItem: async (itemId: string) => {
    set({ error: null });
    try {
      await templateService.deleteItem(itemId);
      set((state) => ({
        templates: state.templates.map((t) => ({
          ...t,
          items: t.items.filter((item) => item.id !== itemId),
        })),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete template item' });
      throw err;
    }
  },
}));
