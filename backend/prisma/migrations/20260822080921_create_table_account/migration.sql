/*
  Warnings:

  - You are about to drop the column `email` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `last_login_at` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `last_login_at` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `companies` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id]` on the table `candidates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[account_id]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_id` to the `candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_id` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `targetType` on the `service_plans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "role" AS ENUM ('candidate', 'company');

-- DropIndex
DROP INDEX "candidates_email_key";

-- DropIndex
DROP INDEX "companies_email_key";

-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "email",
DROP COLUMN "last_login_at",
DROP COLUMN "password_hash",
DROP COLUMN "role",
DROP COLUMN "status",
ADD COLUMN     "account_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "email",
DROP COLUMN "last_login_at",
DROP COLUMN "password_hash",
DROP COLUMN "role",
DROP COLUMN "status",
ADD COLUMN     "account_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "service_plans" DROP COLUMN "targetType",
ADD COLUMN     "targetType" "role" NOT NULL;

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "role" NOT NULL,
    "status" "account_status" NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE INDEX "accounts_role_status_idx" ON "accounts"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_account_id_key" ON "candidates"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_account_id_key" ON "companies"("account_id");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
