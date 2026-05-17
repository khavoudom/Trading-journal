-- CreateTable
CREATE TABLE "calendar_drawings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Drawing',
    "sceneData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_drawings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calendar_drawings_userId_spaceId_date_idx" ON "calendar_drawings"("userId", "spaceId", "date");

-- AddForeignKey
ALTER TABLE "calendar_drawings" ADD CONSTRAINT "calendar_drawings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_drawings" ADD CONSTRAINT "calendar_drawings_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
