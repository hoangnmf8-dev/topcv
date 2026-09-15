/*
  Warnings:

  - The `role` column on the `candidates` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[service_plan_id]` on the table `candidates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `service_plan_id` to the `candidates` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('candidate', 'company');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "service_plan_id" UUID NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'candidate';

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role" TEXT NOT NULL DEFAULT 'company',
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "phone" VARCHAR(30),
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "logo_url" VARCHAR(500),
    "banner_url" VARCHAR(500),
    "description" TEXT,
    "website" VARCHAR(255),
    "tax_code" VARCHAR(50),
    "size_range" VARCHAR(50),
    "category_id" UUID,
    "location_id" UUID,
    "address" TEXT,
    "service_plan_id" UUID NOT NULL,
    "status" "account_status" NOT NULL DEFAULT 'active',
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMPTZ,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "targetType" "UserRole" NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "duration_days" INTEGER,
    "features_json" JSONB,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "service_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_key" ON "companies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tax_code_key" ON "companies"("tax_code");

-- CreateIndex
CREATE UNIQUE INDEX "companies_service_plan_id_key" ON "companies"("service_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_plans_code_key" ON "service_plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_service_plan_id_key" ON "candidates"("service_plan_id");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_service_plan_id_fkey" FOREIGN KEY ("service_plan_id") REFERENCES "service_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_service_plan_id_fkey" FOREIGN KEY ("service_plan_id") REFERENCES "service_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
