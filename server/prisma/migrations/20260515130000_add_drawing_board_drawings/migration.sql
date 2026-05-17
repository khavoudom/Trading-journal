CREATE TABLE "drawing_board_drawings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Drawing',
    "sceneData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drawing_board_drawings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "drawing_board_drawings_userId_spaceId_date_idx" ON "drawing_board_drawings"("userId", "spaceId", "date");

ALTER TABLE "drawing_board_drawings" ADD CONSTRAINT "drawing_board_drawings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "drawing_board_drawings" ADD CONSTRAINT "drawing_board_drawings_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
