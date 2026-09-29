ALTER TABLE "job_post" ADD COLUMN "overview" JSONB NOT NULL DEFAULT '{"requirements":[],"specialties":[]}';
