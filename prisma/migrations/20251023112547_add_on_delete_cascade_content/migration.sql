-- DropForeignKey
ALTER TABLE "public"."Content" DROP CONSTRAINT "Content_feedId_fkey";

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
