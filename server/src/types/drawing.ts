export interface CalendarDrawing {
  id: string;
  userId: string;
  spaceId: string;
  date: string;
  title: string;
  sceneData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DrawingBoardDrawing {
  id: string;
  userId: string;
  spaceId: string;
  date: string;
  title: string;
  sceneData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDrawingPayload {
  spaceId: string;
  date: string;
  title?: string;
  sceneData: Record<string, unknown>;
}

export interface UpdateDrawingPayload {
  title?: string;
  sceneData?: Record<string, unknown>;
}
