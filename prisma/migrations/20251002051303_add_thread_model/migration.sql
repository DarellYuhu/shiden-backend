-- CreateTable
CREATE TABLE "public"."ThreadMember" (
    "userId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "ThreadMember_userId_threadId_key" ON "public"."ThreadMember"("userId", "threadId");

-- AddForeignKey
ALTER TABLE "public"."ThreadMember" ADD CONSTRAINT "ThreadMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ThreadMember" ADD CONSTRAINT "ThreadMember_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
