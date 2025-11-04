-- CreateEnum
CREATE TYPE "GearStatus" AS ENUM ('available', 'in-use', 'archived', 'maintenance', 'broken');

-- CreateTable
CREATE TABLE "Gear" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "soundCharacteristics" JSONB NOT NULL,
    "tags" TEXT[],
    "status" "GearStatus" NOT NULL,
    "parameters" JSONB,
    "specifications" JSONB,
    "usage" JSONB,
    "media" JSONB,
    "connections" JSONB,
    "notes" TEXT,
    "dateAdded" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gear_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Gear_category_idx" ON "Gear"("category");

-- CreateIndex
CREATE INDEX "Gear_status_idx" ON "Gear"("status");

-- CreateIndex
CREATE INDEX "Gear_tags_idx" ON "Gear"("tags");

-- CreateIndex
CREATE INDEX "Gear_name_brand_description_idx" ON "Gear"("name", "brand", "description");
