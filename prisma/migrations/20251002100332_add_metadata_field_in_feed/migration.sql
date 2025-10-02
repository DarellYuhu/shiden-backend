/*
  Warnings:

  - You are about to drop the column `contentId` on the `Feed` table. All the data in the column will be lost.
  - Added the required column `feedId` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentMeta` to the `Feed` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Feed" DROP CONSTRAINT "Feed_contentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Source" DROP CONSTRAINT "Source_threadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ThreadMember" DROP CONSTRAINT "ThreadMember_threadId_fkey";

-- AlterTable
ALTER TABLE "public"."Content" ADD COLUMN     "feedId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Feed" DROP COLUMN "contentId",
ADD COLUMN     "contentMeta" JSONB NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ThreadMember" ADD CONSTRAINT "ThreadMember_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Source" ADD CONSTRAINT "Source_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feed" ADD CONSTRAINT "Feed_threadMemberId_fkey" FOREIGN KEY ("threadMemberId") REFERENCES "public"."ThreadMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feed" ADD CONSTRAINT "Feed_platformAccountId_fkey" FOREIGN KEY ("platformAccountId") REFERENCES "public"."PlatformAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Content" ADD CONSTRAINT "Content_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "public"."Feed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
