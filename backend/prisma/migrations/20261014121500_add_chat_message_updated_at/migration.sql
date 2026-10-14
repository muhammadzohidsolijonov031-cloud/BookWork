ALTER TABLE "ChatMessage"
ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "ChatMessage"
SET "updatedAt" = "createdAt";

ALTER TABLE "ChatMessage"
ALTER COLUMN "updatedAt" SET NOT NULL;
