/*
  Warnings:

  - Made the column `userId` on table `PlatformAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."PlatformAccount" DROP CONSTRAINT "PlatformAccount_userId_fkey";

-- AlterTable
ALTER TABLE "public"."PlatformAccount" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."PlatformAccount" ADD CONSTRAINT "PlatformAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
