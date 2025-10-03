/*
  Warnings:

  - A unique constraint covering the columns `[feedId]` on the table `Content` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Content_feedId_key" ON "public"."Content"("feedId");
