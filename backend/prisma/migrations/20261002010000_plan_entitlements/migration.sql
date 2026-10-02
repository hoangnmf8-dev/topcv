CREATE TYPE "EntitlementValueType" AS ENUM ('number', 'boolean', 'string');
CREATE TABLE "entitlements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(100) NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "description" TEXT,
  "value_type" "EntitlementValueType" NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "entitlements_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "entitlements_code_key" ON "entitlements"("code");
CREATE TABLE "plan_entitlements" (
  "plan_id" UUID NOT NULL REFERENCES "service_plans"("id") ON DELETE CASCADE,
  "entitlement_id" UUID NOT NULL REFERENCES "entitlements"("id") ON DELETE RESTRICT,
  "value" JSONB NOT NULL,
  CONSTRAINT "plan_entitlements_pkey" PRIMARY KEY ("plan_id", "entitlement_id")
);
CREATE INDEX "plan_entitlements_entitlement_id_idx" ON "plan_entitlements"("entitlement_id");
INSERT INTO "entitlements" ("code", "name", "value_type") VALUES
 ('cvLimit', 'Số CV tối đa', 'number'),
 ('aiLimit', 'Lượt AI trong kỳ', 'number'),
 ('activeJobLimit', 'Số tin tuyển dụng hoạt động', 'number');
INSERT INTO "plan_entitlements" ("plan_id", "entitlement_id", "value")
SELECT p.id, e.id, p.metadata->'benefits'->e.code
FROM "service_plans" p CROSS JOIN "entitlements" e
WHERE p.metadata->'benefits' ? e.code;
