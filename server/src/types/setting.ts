export interface Setting {
  id: string;
  userId: string;
  spaceId: string | null;
  key: string;
  value: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSettingPayload {
  spaceId?: string;
  key: string;
  value: unknown;
}
