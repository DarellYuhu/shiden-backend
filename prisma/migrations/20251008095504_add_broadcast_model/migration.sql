-- CreateEnum
CREATE TYPE "public"."BroadcastType" AS ENUM ('ENGAGE', 'REPORT', 'SHARE');

-- CreateTable
CREATE TABLE "public"."Broadcast" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "link" TEXT,
    "type" "public"."BroadcastType",
    "ownerId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Broadcast" ADD CONSTRAINT "Broadcast_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Broadcast" ADD CONSTRAINT "Broadcast_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
