/*
  Warnings:

  - A unique constraint covering the columns `[userId,ideaId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
ALTER TABLE "Board" ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Untitled Board';

CREATE UNIQUE INDEX "Vote_userId_ideaId_key" ON "Vote"("userId", "ideaId");
