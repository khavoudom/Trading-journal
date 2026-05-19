export type TemplateItemType = 'checkbox' | 'text' | 'number';

export const TEMPLATE_ITEM_TYPE_LABELS: Record<TemplateItemType, string> = {
  checkbox: 'Checkbox',
  text: 'Text Input',
  number: 'Number Input',
};

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
  items: TemplateItem[];
  isAttached: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplatePayload {
  spaceId: string;
  name: string;
  items: Array<{
    type: TemplateItemType;
    label: string;
    value?: string;
    order: number;
  }>;
}

export interface UpdateTemplatePayload {
  name?: string;
  isAttached?: boolean;
}
