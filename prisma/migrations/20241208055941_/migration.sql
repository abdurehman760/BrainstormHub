/*
  Warnings:

  - You are about to drop the column `name` on the `Board` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Board" DROP COLUMN "name",
ALTER COLUMN "title" DROP DEFAULT;
