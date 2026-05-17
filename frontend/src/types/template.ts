export type TemplateItemType = 'checkbox' | 'text' | 'number';

export const TEMPLATE_ITEM_TYPE_LABELS: Record<TemplateItemType, string> = {
  checkbox: 'Checkbox',
  text: 'Text Input',
  number: 'Number Input',
};

export interface TemplateType {
  id: string;
  userId: string;
  spaceId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface TemplateItem {
  id: string;
  templateId: string;
  type: TemplateItemType;
  label: string;
  value: string | null;
  order: number;
}

export interface Template {
  id: string;
  userId: string;
  spaceId: string;
  name: string;
  typeId: string;
  type: TemplateType;
  items: TemplateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateTypePayload {
  spaceId: string;
  name: string;
  color?: string;
}

export interface CreateTemplatePayload {
  spaceId: string;
  name: string;
  typeId: string;
  items: Array<{
    type: TemplateItemType;
    label: string;
    value?: string;
    order: number;
  }>;
}

export interface UpdateTemplatePayload {
  name?: string;
  typeId?: string;
}
