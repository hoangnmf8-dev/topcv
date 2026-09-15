-- AlterTable
ALTER TABLE "candidates" ALTER COLUMN "service_plan_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "service_plan_id" DROP NOT NULL;
