-- DropForeignKey
ALTER TABLE "public"."Feed" DROP CONSTRAINT "Feed_threadMemberId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Feed" ADD CONSTRAINT "Feed_threadMemberId_fkey" FOREIGN KEY ("threadMemberId") REFERENCES "public"."ThreadMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
