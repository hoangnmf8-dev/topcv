-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_service_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_service_plan_id_fkey";

-- DropIndex
DROP INDEX "candidates_service_plan_id_key";

-- DropIndex
DROP INDEX "companies_service_plan_id_key";

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_service_plan_id_fkey" FOREIGN KEY ("service_plan_id") REFERENCES "service_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_service_plan_id_fkey" FOREIGN KEY ("service_plan_id") REFERENCES "service_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
