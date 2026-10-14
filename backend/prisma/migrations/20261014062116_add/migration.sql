-- CreateTable
CREATE TABLE "BookPost" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'THOUGHT',
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookPost_bookId_createdAt_idx" ON "BookPost"("bookId", "createdAt");

-- AddForeignKey
ALTER TABLE "BookPost" ADD CONSTRAINT "BookPost_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookPost" ADD CONSTRAINT "BookPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ReaderProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
