/*
  Warnings:

  - You are about to drop the column `handlerId` on the `PlatformAccount` table. All the data in the column will be lost.
  - You are about to drop the `AccountNiche` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategoryAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Handler` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Niche` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AccountNiche" DROP CONSTRAINT "AccountNiche_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AccountNiche" DROP CONSTRAINT "AccountNiche_nicheId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CategoryAccount" DROP CONSTRAINT "CategoryAccount_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CategoryAccount" DROP CONSTRAINT "CategoryAccount_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlatformAccount" DROP CONSTRAINT "PlatformAccount_handlerId_fkey";

-- AlterTable
ALTER TABLE "public"."PlatformAccount" DROP COLUMN "handlerId",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "public"."AccountNiche";

-- DropTable
DROP TABLE "public"."Category";

-- DropTable
DROP TABLE "public"."CategoryAccount";

-- DropTable
DROP TABLE "public"."Handler";

-- DropTable
DROP TABLE "public"."Niche";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Thread" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Source" (
    "id" TEXT NOT NULL,
    "workgroupId" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feed" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Feed_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PlatformAccount" ADD CONSTRAINT "PlatformAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
