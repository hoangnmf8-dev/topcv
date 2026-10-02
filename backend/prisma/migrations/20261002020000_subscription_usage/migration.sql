ALTER TABLE subscriptions ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE subscriptions ADD COLUMN usage_state JSONB NOT NULL DEFAULT '{}';
UPDATE orders o SET plan_snapshot = jsonb_set(o.plan_snapshot, '{benefits}', s.benefits_snapshot, true)
FROM subscriptions s WHERE s.order_id = o.id AND NOT (o.plan_snapshot ? 'benefits');
UPDATE orders o SET plan_snapshot = jsonb_set(o.plan_snapshot, '{benefits}',
 CASE WHEN p.audience = 'candidate' THEN (o.plan_snapshot->'benefits') - 'activeJobLimit'
 ELSE (o.plan_snapshot->'benefits') - 'cvLimit' - 'aiLimit' END)
FROM service_plans p WHERE p.id = o.plan_id AND o.plan_snapshot ? 'benefits';
UPDATE subscriptions s SET usage_state = jsonb_build_object('aiLimit', jsonb_build_object('used', q.used, 'reserved', q.reserved))
FROM quota_usages q WHERE q.period_key = 'ai:' || s.id::text;
INSERT INTO subscriptions (id, plan_id, account_id, status, started_at, expires_at, benefits_snapshot, usage_state, updated_at)
SELECT gen_random_uuid(), p.id, q.account_id,
 CASE WHEN ((substring(q.period_key from 9) || '-01')::date + interval '1 month') AT TIME ZONE 'Asia/Ho_Chi_Minh' > now() THEN 'active'::"SubscriptionStatus" ELSE 'expired'::"SubscriptionStatus" END,
 ((substring(q.period_key from 9) || '-01')::date)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh',
 ((substring(q.period_key from 9) || '-01')::date + interval '1 month') AT TIME ZONE 'Asia/Ho_Chi_Minh',
 '{}', jsonb_build_object('aiLimit', jsonb_build_object('used', q.used, 'reserved', q.reserved)), now()
FROM quota_usages q JOIN service_plans p ON p.code = 'candidate_free'
WHERE q.period_key ~ '^ai:free:[0-9]{4}-[0-9]{2}$';
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM quota_usages q WHERE NOT EXISTS (
   SELECT 1 FROM subscriptions s WHERE (q.period_key = 'ai:' || s.id::text) OR
   (s.order_id IS NULL AND s.account_id = q.account_id AND q.period_key = 'ai:free:' || to_char(s.started_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM'))
 )) THEN RAISE EXCEPTION 'Unmapped quota usage; refusing to lose data'; END IF;
END $$;
ALTER TABLE subscriptions DROP COLUMN benefits_snapshot;
CREATE UNIQUE INDEX subscriptions_account_id_plan_id_started_at_key ON subscriptions(account_id, plan_id, started_at);
DROP TABLE quota_usages;
DELETE FROM plan_entitlements pe USING service_plans p, entitlements e
WHERE pe.plan_id = p.id AND pe.entitlement_id = e.id AND
 ((p.audience = 'candidate' AND e.code = 'activeJobLimit') OR (p.audience = 'company' AND e.code IN ('cvLimit', 'aiLimit')));
