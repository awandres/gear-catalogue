-- CreateTable
CREATE TABLE "GearImage" (
    "id" TEXT NOT NULL,
    "gearId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GearImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GearImage_gearId_idx" ON "GearImage"("gearId");

-- CreateIndex
CREATE INDEX "GearImage_isPrimary_idx" ON "GearImage"("isPrimary");

-- AddForeignKey
ALTER TABLE "GearImage" ADD CONSTRAINT "GearImage_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "Gear"("id") ON DELETE CASCADE ON UPDATE CASCADE;
