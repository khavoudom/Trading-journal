export interface TemplateTypeData {
  id: string;
  userId: string;
  spaceId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface TemplateItemData {
  id: string;
  templateId: string;
  type: 'checkbox' | 'text' | 'number';
  label: string;
  value: string | null;
  order: number;
}

export interface TemplateData {
  id: string;
  userId: string;
  spaceId: string;
  name: string;
  typeId: string;
  type: TemplateTypeData;
  items: TemplateItemData[];
  isAttached: boolean;
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
  typeId?: string;
  items: Array<{
    type: 'checkbox' | 'text' | 'number';
    label: string;
    value?: string;
    order: number;
  }>;
}

export interface UpdateTemplatePayload {
  name?: string;
  typeId?: string;
  isAttached?: boolean;
}

export interface CreateTemplateItemPayload {
  type: 'checkbox' | 'text' | 'number';
  label: string;
  value?: string;
  order: number;
}

export interface UpdateTemplateItemPayload {
  type?: 'checkbox' | 'text' | 'number';
  label?: string;
  value?: string | null;
  order?: number;
}
