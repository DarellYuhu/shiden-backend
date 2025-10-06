/*
  Warnings:

  - A unique constraint covering the columns `[platformAccountId]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `platformAccountId` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Content" ADD COLUMN     "platformAccountId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Content_platformAccountId_key" ON "public"."Content"("platformAccountId");

-- AddForeignKey
ALTER TABLE "public"."Content" ADD CONSTRAINT "Content_platformAccountId_fkey" FOREIGN KEY ("platformAccountId") REFERENCES "public"."PlatformAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
