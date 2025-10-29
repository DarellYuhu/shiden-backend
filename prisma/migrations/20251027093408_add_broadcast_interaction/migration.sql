-- CreateTable
CREATE TABLE "BroadcastInteraction" (
    "broadcastId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BroadcastInteraction_broadcastId_userId_key" ON "BroadcastInteraction"("broadcastId", "userId");

-- AddForeignKey
ALTER TABLE "BroadcastInteraction" ADD CONSTRAINT "BroadcastInteraction_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroadcastInteraction" ADD CONSTRAINT "BroadcastInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
