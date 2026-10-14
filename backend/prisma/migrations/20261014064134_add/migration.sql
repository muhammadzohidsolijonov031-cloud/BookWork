-- CreateTable
CREATE TABLE "PartnerInterest" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerConnection" (
    "id" SERIAL NOT NULL,
    "userA" TEXT NOT NULL,
    "userB" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT,
    "groupId" INTEGER,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerInterest_bookId_idx" ON "PartnerInterest"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerInterest_userId_bookId_key" ON "PartnerInterest"("userId", "bookId");

-- CreateIndex
CREATE INDEX "PartnerConnection_userA_idx" ON "PartnerConnection"("userA");

-- CreateIndex
CREATE INDEX "PartnerConnection_userB_idx" ON "PartnerConnection"("userB");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerConnection_userA_userB_bookTitle_key" ON "PartnerConnection"("userA", "userB", "bookTitle");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_recipientId_createdAt_idx" ON "ChatMessage"("senderId", "recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_groupId_createdAt_idx" ON "ChatMessage"("groupId", "createdAt");

-- AddForeignKey
ALTER TABLE "PartnerInterest" ADD CONSTRAINT "PartnerInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ReaderProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerInterest" ADD CONSTRAINT "PartnerInterest_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerConnection" ADD CONSTRAINT "PartnerConnection_userA_fkey" FOREIGN KEY ("userA") REFERENCES "ReaderProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerConnection" ADD CONSTRAINT "PartnerConnection_userB_fkey" FOREIGN KEY ("userB") REFERENCES "ReaderProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ReaderProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "ReaderProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "ReaderProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ReadingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
