/*
  Warnings:

  - You are about to drop the column `messageEmbeding` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `prodComplexity` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `Source` table. All the data in the column will be lost.
  - You are about to drop the column `download` on the `Statistic` table. All the data in the column will be lost.
  - You are about to drop the column `forward` on the `Statistic` table. All the data in the column will be lost.
  - You are about to drop the column `play` on the `Statistic` table. All the data in the column will be lost.
  - You are about to drop the column `isOwner` on the `ThreadMember` table. All the data in the column will be lost.
  - Added the required column `threadMemberId` to the `Feed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `view` to the `Statistic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ThreadRole" AS ENUM ('ADMIN', 'OWNER', 'USER');

-- AlterTable
ALTER TABLE "public"."Content" DROP COLUMN "messageEmbeding",
DROP COLUMN "prodComplexity";

-- AlterTable
ALTER TABLE "public"."Feed" ADD COLUMN     "contentId" TEXT,
ADD COLUMN     "platformAccountId" TEXT,
ADD COLUMN     "threadMemberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Source" DROP COLUMN "platform";

-- AlterTable
ALTER TABLE "public"."Statistic" DROP COLUMN "download",
DROP COLUMN "forward",
DROP COLUMN "play",
ADD COLUMN     "other" JSONB,
ADD COLUMN     "view" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."ThreadMember" DROP COLUMN "isOwner",
ADD COLUMN     "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "public"."ThreadRole" NOT NULL DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE "public"."Feed" ADD CONSTRAINT "Feed_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;
