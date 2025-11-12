-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "imageSearchCalls" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiUsage_date_key" ON "ApiUsage"("date");

-- CreateIndex
CREATE INDEX "ApiUsage_date_idx" ON "ApiUsage"("date");

