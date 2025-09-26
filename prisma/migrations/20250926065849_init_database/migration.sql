-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('TIKTOK', 'FACEBOOK', 'INSTAGRAM', 'X');

-- CreateTable
CREATE TABLE "public"."Handler" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Handler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlatformAccount" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "signature" TEXT,
    "platform" "public"."Platform" NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "handlerId" TEXT,
    "avatarId" INTEGER,

    CONSTRAINT "PlatformAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AccountNiche" (
    "accountId" TEXT NOT NULL,
    "nicheId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Niche" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Niche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CategoryAccount" (
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Content" (
    "id" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "duration" INTEGER,
    "createTime" TIMESTAMP(3),
    "description" TEXT,
    "prodComplexity" INTEGER,
    "messageEmbeding" INTEGER,
    "coverId" INTEGER,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Statistic" (
    "contentId" TEXT NOT NULL,
    "comment" INTEGER NOT NULL,
    "like" INTEGER NOT NULL,
    "download" INTEGER NOT NULL,
    "play" INTEGER NOT NULL,
    "share" INTEGER NOT NULL,
    "forward" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "public"."File" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "fullPath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformAccount_username_key" ON "public"."PlatformAccount"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AccountNiche_accountId_nicheId_key" ON "public"."AccountNiche"("accountId", "nicheId");

-- CreateIndex
CREATE UNIQUE INDEX "Niche_name_key" ON "public"."Niche"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryAccount_accountId_categoryId_key" ON "public"."CategoryAccount"("accountId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Statistic_contentId_key" ON "public"."Statistic"("contentId");

-- AddForeignKey
ALTER TABLE "public"."PlatformAccount" ADD CONSTRAINT "PlatformAccount_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "public"."Handler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlatformAccount" ADD CONSTRAINT "PlatformAccount_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "public"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AccountNiche" ADD CONSTRAINT "AccountNiche_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."PlatformAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AccountNiche" ADD CONSTRAINT "AccountNiche_nicheId_fkey" FOREIGN KEY ("nicheId") REFERENCES "public"."Niche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CategoryAccount" ADD CONSTRAINT "CategoryAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."PlatformAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CategoryAccount" ADD CONSTRAINT "CategoryAccount_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Content" ADD CONSTRAINT "Content_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "public"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Statistic" ADD CONSTRAINT "Statistic_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
