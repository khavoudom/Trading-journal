export interface Notification {
  id: string;
  userId: string;
  spaceId: string;
  type: string;
  category: string;
  title: string;
  description: string;
  status: string;
  linkPath: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationPayload {
  spaceId: string;
  type: string;
  category: string;
  title: string;
  description?: string;
  linkPath?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateNotificationPayload {
  read?: boolean;
}
