/*
  Warnings:

  - Added the required column `threadId` to the `Source` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workgroupName` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Source" ADD COLUMN     "threadId" TEXT NOT NULL,
ADD COLUMN     "workgroupName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Source" ADD CONSTRAINT "Source_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
