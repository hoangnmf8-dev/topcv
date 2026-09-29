BEGIN;
CREATE TYPE "saturday_schedule_new" AS ENUM ('WORK', 'OFF', 'UNSPECIFIED');
ALTER TABLE "job_post" ALTER COLUMN "saturday_schedule" TYPE "saturday_schedule_new"
USING (CASE WHEN saturday_schedule::text IN ('WORK', 'OFF') THEN saturday_schedule::text ELSE 'UNSPECIFIED' END)::saturday_schedule_new;
DROP TYPE "saturday_schedule";
ALTER TYPE "saturday_schedule_new" RENAME TO "saturday_schedule";
COMMIT;
