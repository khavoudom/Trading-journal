export interface CalendarEvent {
  id: string;
  userId: string;
  spaceId: string;
  date: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  spaceId: string;
  date: string;
  title: string;
  content?: string;
}

export interface UpdateEventPayload {
  title?: string;
  content?: string;
}
