-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licenseConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BookReview" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReaderProfile" (
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "openToPartners" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReaderProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "ReadingGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "genre" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookReview_bookId_createdAt_idx" ON "BookReview"("bookId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BookReview_bookId_userId_key" ON "BookReview"("bookId", "userId");

-- CreateIndex
CREATE INDEX "ReadingGroup_genre_idx" ON "ReadingGroup"("genre");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "Book_type_idx" ON "Book"("type");

-- CreateIndex
CREATE INDEX "Book_viewCount_idx" ON "Book"("viewCount");

-- AddForeignKey
ALTER TABLE "BookReview" ADD CONSTRAINT "BookReview_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookReview" ADD CONSTRAINT "BookReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ReaderProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ReadingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ReaderProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
