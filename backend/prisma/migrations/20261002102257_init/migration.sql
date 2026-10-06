-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "author" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT DEFAULT 'wishlist',
    "rating" INTEGER,
    "userId" TEXT NOT NULL,
    "type" TEXT,
    "hooks" TEXT,
    "pages" TEXT,
    "cost" TEXT DEFAULT '0',
     "maslahatBeraman" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);
