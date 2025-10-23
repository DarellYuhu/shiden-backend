-- DropForeignKey
ALTER TABLE "public"."ContentFile" DROP CONSTRAINT "ContentFile_contentId_fkey";

-- AddForeignKey
ALTER TABLE "ContentFile" ADD CONSTRAINT "ContentFile_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
