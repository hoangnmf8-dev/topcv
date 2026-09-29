BEGIN;
ALTER TABLE "job_post" RENAME COLUMN "location_id" TO "province_id";
ALTER TABLE "job_post" RENAME CONSTRAINT "job_post_location_id_fkey" TO "job_post_province_id_fkey";
ALTER INDEX "job_post_location_id_status_idx" RENAME TO "job_post_province_id_status_idx";
ALTER TABLE "job_post" ADD COLUMN "ward_id" UUID, ADD COLUMN "address" TEXT;
WITH choices AS (
 SELECT j.id, w.id AS ward_id, row_number() OVER (PARTITION BY j.id ORDER BY md5(j.id::text || w.id::text)) AS rank
 FROM job_post j JOIN ward w ON w.province_id = j.province_id
)
UPDATE job_post j SET ward_id = c.ward_id, address = concat(
 'Số ', 1 + (('x' || substr(md5(j.id::text), 1, 6))::bit(24)::int % 200),
 ', đường số ', 1 + (('x' || substr(md5(j.id::text), 7, 4))::bit(16)::int % 20))
FROM choices c WHERE c.id = j.id AND c.rank = 1;
ALTER TABLE "job_post" ALTER COLUMN "ward_id" SET NOT NULL, ALTER COLUMN "address" SET NOT NULL;
CREATE UNIQUE INDEX "ward_id_province_id_key" ON "ward"("id", "province_id");
CREATE INDEX "job_post_ward_id_province_id_idx" ON "job_post"("ward_id", "province_id");
ALTER TABLE "job_post" ADD CONSTRAINT "job_post_ward_id_province_id_fkey" FOREIGN KEY ("ward_id", "province_id") REFERENCES "ward"("id", "province_id") ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;
