-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('active', 'blocked');

-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "full_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),
    "avatar_url" VARCHAR(500),
    "headline" VARCHAR(255),
    "career_goal" TEXT,
    "experience_years" DECIMAL(4,1) DEFAULT 0,
    "current_location_id" UUID,
    "profile_completion" SMALLINT DEFAULT 0,
    "is_searchable" BOOLEAN DEFAULT true,
    "status" "account_status" NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_key" ON "candidates"("email");
