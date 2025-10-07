-- CreateTable
CREATE TABLE "public"."ContentFile" (
    "contentId" TEXT NOT NULL,
    "fileId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentFile_fileId_key" ON "public"."ContentFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentFile_contentId_fileId_key" ON "public"."ContentFile"("contentId", "fileId");

-- AddForeignKey
ALTER TABLE "public"."ContentFile" ADD CONSTRAINT "ContentFile_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentFile" ADD CONSTRAINT "ContentFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
