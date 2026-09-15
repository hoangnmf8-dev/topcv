/*
  Warnings:

  - You are about to drop the column `features_json` on the `service_plans` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `service_plans` table. All the data in the column will be lost.
  - You are about to drop the `candidates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `companies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `audience` to the `service_plans` table without a default value. This is not possible if the table is not empty.
  - Made the column `is_active` on table `service_plans` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('submitted', 'reviewing', 'interview', 'hired', 'rejected');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('ACCOUNT', 'SYSTEM', 'WEBHOOK', 'CRON');

-- CreateEnum
CREATE TYPE "job_status" AS ENUM ('draft', 'pending', 'published', 'paused', 'rejected', 'closed', 'expired');

-- CreateEnum
CREATE TYPE "message_type" AS ENUM ('text', 'image', 'file');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('system', 'application', 'interview', 'message', 'job', 'payment', 'service_plan');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'expired');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'expired', 'refunded');

-- CreateEnum
CREATE TYPE "plan_audience" AS ENUM ('candidate', 'company');

-- AlterEnum
ALTER TYPE "role" ADD VALUE 'admin';

-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_account_id_fkey";

-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_service_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_account_id_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_service_plan_id_fkey";

-- DropIndex
DROP INDEX "accounts_role_status_idx";

-- AlterTable
ALTER TABLE "service_plans" DROP COLUMN "features_json",
DROP COLUMN "targetType",
ADD COLUMN     "audience" "plan_audience" NOT NULL,
ADD COLUMN     "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_free" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "is_active" SET NOT NULL;

-- DropTable
DROP TABLE "candidates";

-- DropTable
DROP TABLE "companies";

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_post_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "cv_id" UUID,
    "cover_letter" TEXT,
    "status" "application_status" NOT NULL DEFAULT 'submitted',
    "fit_score" DECIMAL(5,2),
    "internal_note" TEXT,
    "applied_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_type" "AuditActorType" NOT NULL,
    "actor_account_id" UUID,
    "action" VARCHAR(50) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID,
    "before_data" JSONB,
    "after_data" JSONB,
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(500),
    "request_id" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),
    "avatar_url" VARCHAR(500),
    "headline" VARCHAR(255),
    "career_goal" TEXT,
    "experience_years" DECIMAL(4,1) DEFAULT 0,
    "current_location_id" UUID,
    "profile_completion" SMALLINT DEFAULT 0,
    "is_searchable" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "phone" VARCHAR(30),
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "logo_url" VARCHAR(500),
    "banner_url" VARCHAR(500),
    "description" TEXT,
    "website" VARCHAR(255),
    "tax_code" VARCHAR(50),
    "size_range" VARCHAR(50),
    "location_id" UUID,
    "address" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "last_message_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cvs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "template_code" VARCHAR(100),
    "content_json" JSONB,
    "file_url" VARCHAR(500),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "cvs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "job_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_post" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "job_title_id" UUID,
    "job_category_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "benefits" TEXT,
    "salary_min" DECIMAL(15,2),
    "salary_max" DECIMAL(15,2),
    "currency" VARCHAR(10) DEFAULT 'VND',
    "employment_type" VARCHAR(30) DEFAULT 'full_time',
    "experience_years_min" DECIMAL(4,1),
    "deadline_at" TIMESTAMPTZ,
    "status" "job_status" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ,
    "is_boosted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "job_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_title" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_category_id" UUID NOT NULL,
    "code" VARCHAR(30),
    "name" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "job_title_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "sender_account_id" UUID NOT NULL,
    "reply_to_message_id" UUID,
    "type" "message_type" NOT NULL DEFAULT 'text',
    "content" TEXT,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_liked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(100),
    "file_size" BIGINT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_account_id" UUID NOT NULL,
    "type" "notification_type" NOT NULL DEFAULT 'system',
    "title" VARCHAR(150) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "link" VARCHAR(500),
    "read_at" TIMESTAMPTZ,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "purchased_by_account_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
    "status" "order_status" NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "transaction_code" VARCHAR(150),
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "failure_reason" TEXT,
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "province" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,

    CONSTRAINT "province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_job" (
    "candidate_id" UUID NOT NULL,
    "job_post_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_job_pkey" PRIMARY KEY ("candidate_id","job_post_id")
);

-- CreateTable
CREATE TABLE "ward" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "province_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,

    CONSTRAINT "ward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applications_candidate_id_status_idx" ON "applications"("candidate_id", "status");

-- CreateIndex
CREATE INDEX "applications_job_post_id_status_idx" ON "applications"("job_post_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "applications_job_post_id_candidate_id_key" ON "applications"("job_post_id", "candidate_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_account_id_created_at_idx" ON "audit_logs"("actor_account_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "audit_logs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_request_id_idx" ON "audit_logs"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_account_id_key" ON "candidate"("account_id");

-- CreateIndex
CREATE INDEX "candidate_current_location_id_idx" ON "candidate"("current_location_id");

-- CreateIndex
CREATE INDEX "candidate_is_searchable_deleted_at_idx" ON "candidate"("is_searchable", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "company_account_id_key" ON "company"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_code_key" ON "company"("code");

-- CreateIndex
CREATE UNIQUE INDEX "company_tax_code_key" ON "company"("tax_code");

-- CreateIndex
CREATE INDEX "company_location_id_idx" ON "company"("location_id");

-- CreateIndex
CREATE INDEX "company_verification_status_created_at_idx" ON "company"("verification_status", "created_at");

-- CreateIndex
CREATE INDEX "conversations_candidate_id_last_message_at_idx" ON "conversations"("candidate_id", "last_message_at");

-- CreateIndex
CREATE INDEX "conversations_company_id_last_message_at_idx" ON "conversations"("company_id", "last_message_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_candidate_id_company_id_key" ON "conversations"("candidate_id", "company_id");

-- CreateIndex
CREATE INDEX "cvs_candidate_id_idx" ON "cvs"("candidate_id");

-- CreateIndex
CREATE INDEX "cvs_candidate_id_deleted_at_idx" ON "cvs"("candidate_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "job_category_code_key" ON "job_category"("code");

-- CreateIndex
CREATE INDEX "job_post_company_id_status_created_at_idx" ON "job_post"("company_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "job_post_job_category_id_job_title_id_idx" ON "job_post"("job_category_id", "job_title_id");

-- CreateIndex
CREATE INDEX "job_post_location_id_status_idx" ON "job_post"("location_id", "status");

-- CreateIndex
CREATE INDEX "job_post_status_deadline_at_idx" ON "job_post"("status", "deadline_at");

-- CreateIndex
CREATE UNIQUE INDEX "job_title_code_key" ON "job_title"("code");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_sender_account_id_idx" ON "messages"("sender_account_id");

-- CreateIndex
CREATE INDEX "messages_reply_to_message_id_idx" ON "messages"("reply_to_message_id");

-- CreateIndex
CREATE INDEX "message_attachments_message_id_deleted_at_idx" ON "message_attachments"("message_id", "deleted_at");

-- CreateIndex
CREATE INDEX "notifications_recipient_account_id_read_at_created_at_idx" ON "notifications"("recipient_account_id", "read_at", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");

-- CreateIndex
CREATE INDEX "orders_purchased_by_account_id_status_expires_at_idx" ON "orders"("purchased_by_account_id", "status", "expires_at");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "orders_plan_id_idx" ON "orders"("plan_id");

-- CreateIndex
CREATE INDEX "payments_order_id_created_at_idx" ON "payments"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "payments_status_created_at_idx" ON "payments"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_transaction_code_key" ON "payments"("provider", "transaction_code");

-- CreateIndex
CREATE UNIQUE INDEX "province_code_key" ON "province"("code");

-- CreateIndex
CREATE INDEX "province_name_idx" ON "province"("name");

-- CreateIndex
CREATE INDEX "saved_job_job_post_id_idx" ON "saved_job"("job_post_id");

-- CreateIndex
CREATE UNIQUE INDEX "ward_code_key" ON "ward"("code");

-- CreateIndex
CREATE INDEX "ward_province_id_idx" ON "ward"("province_id");

-- CreateIndex
CREATE INDEX "ward_full_name_idx" ON "ward"("full_name");

-- CreateIndex
CREATE INDEX "accounts_email_status_idx" ON "accounts"("email", "status");

-- CreateIndex
CREATE INDEX "service_plans_audience_is_active_display_order_idx" ON "service_plans"("audience", "is_active", "display_order");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_post_id_fkey" FOREIGN KEY ("job_post_id") REFERENCES "job_post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "cvs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_account_id_fkey" FOREIGN KEY ("actor_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_current_location_id_fkey" FOREIGN KEY ("current_location_id") REFERENCES "province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_post" ADD CONSTRAINT "job_post_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_post" ADD CONSTRAINT "job_post_job_title_id_fkey" FOREIGN KEY ("job_title_id") REFERENCES "job_title"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_post" ADD CONSTRAINT "job_post_job_category_id_fkey" FOREIGN KEY ("job_category_id") REFERENCES "job_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_post" ADD CONSTRAINT "job_post_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_title" ADD CONSTRAINT "job_title_job_category_id_fkey" FOREIGN KEY ("job_category_id") REFERENCES "job_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_account_id_fkey" FOREIGN KEY ("sender_account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_message_id_fkey" FOREIGN KEY ("reply_to_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_account_id_fkey" FOREIGN KEY ("recipient_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_purchased_by_account_id_fkey" FOREIGN KEY ("purchased_by_account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "service_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_job" ADD CONSTRAINT "saved_job_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_job" ADD CONSTRAINT "saved_job_job_post_id_fkey" FOREIGN KEY ("job_post_id") REFERENCES "job_post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ward" ADD CONSTRAINT "ward_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
