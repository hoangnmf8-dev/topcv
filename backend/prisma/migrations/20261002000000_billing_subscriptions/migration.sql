-- CreateEnum
CREATE TYPE "PlanAvailability" AS ENUM ('available', 'coming_soon', 'disabled');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('scheduled', 'active', 'expired', 'revoked');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paid_at" TIMESTAMPTZ,
ADD COLUMN     "payment_deadline_at" TIMESTAMPTZ,
ADD COLUMN     "plan_snapshot" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "request_key" VARCHAR(100);
UPDATE "orders" SET "request_key" = 'legacy:' || "id"::text;
ALTER TABLE "orders" ALTER COLUMN "request_key" SET NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "checkout_url" TEXT,
ADD COLUMN     "expires_at" TIMESTAMPTZ,
ADD COLUMN     "provider_order_code" BIGSERIAL NOT NULL;

-- AlterTable
ALTER TABLE "service_plans" ADD COLUMN     "availability" "PlanAvailability" NOT NULL DEFAULT 'available';

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "account_id" UUID,
    "company_id" UUID,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMPTZ NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "benefits_snapshot" JSONB NOT NULL,
    "revoked_at" TIMESTAMPTZ,
    "revoked_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_events" (
    "id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "reference" VARCHAR(150) NOT NULL,
    "payment_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quota_usages" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "period_key" VARCHAR(100) NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quota_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_order_id_key" ON "subscriptions"("order_id");

-- CreateIndex
CREATE INDEX "subscriptions_account_id_started_at_expires_at_idx" ON "subscriptions"("account_id", "started_at", "expires_at");

-- CreateIndex
CREATE INDEX "subscriptions_company_id_started_at_expires_at_idx" ON "subscriptions"("company_id", "started_at", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_events_provider_reference_key" ON "payment_events"("provider", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "quota_usages_account_id_period_key_key" ON "quota_usages"("account_id", "period_key");

-- CreateIndex
CREATE UNIQUE INDEX "orders_request_key_key" ON "orders"("request_key");

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_order_code_key" ON "payments"("provider_order_code");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "service_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quota_usages" ADD CONSTRAINT "quota_usages_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscription_one_beneficiary"
CHECK (("account_id" IS NOT NULL)::int + ("company_id" IS NOT NULL)::int = 1);
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscription_valid_period" CHECK ("expires_at" > "started_at");
ALTER TABLE "quota_usages" ADD CONSTRAINT "quota_nonnegative" CHECK ("used" >= 0 AND "reserved" >= 0);
