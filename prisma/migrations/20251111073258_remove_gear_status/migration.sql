-- DropIndex (if exists)
DROP INDEX IF EXISTS "Gear_status_idx";

-- AlterTable
ALTER TABLE "Gear" DROP COLUMN IF EXISTS "status";

-- DropEnum
DROP TYPE IF EXISTS "GearStatus";

