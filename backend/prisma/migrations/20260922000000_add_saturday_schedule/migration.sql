CREATE TYPE "saturday_schedule" AS ENUM ('WORK', 'OFF', 'ALTERNATING', 'FLEXIBLE');
ALTER TABLE "job_post" ADD COLUMN "saturday_schedule" "saturday_schedule";
