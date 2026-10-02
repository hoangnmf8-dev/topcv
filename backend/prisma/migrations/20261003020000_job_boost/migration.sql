ALTER TABLE job_post ADD COLUMN boosted_until TIMESTAMPTZ;
CREATE INDEX job_post_boosted_until_idx ON job_post(boosted_until);
UPDATE job_post SET is_boosted=false WHERE boosted_until IS NULL;
INSERT INTO entitlements(id,code,name,value_type) VALUES(gen_random_uuid(),'jobBoostLimit','Lượt đẩy tin trong 30 ngày','number') ON CONFLICT(code) DO NOTHING;
INSERT INTO plan_entitlements(plan_id,entitlement_id,value)
SELECT p.id,e.id,CASE WHEN p.code='company_pro' THEN '20'::jsonb ELSE '0'::jsonb END FROM service_plans p CROSS JOIN entitlements e
WHERE p.audience='company' AND e.code='jobBoostLimit' ON CONFLICT(plan_id,entitlement_id) DO NOTHING;
UPDATE orders o SET plan_snapshot=jsonb_set(o.plan_snapshot,'{benefits,jobBoostLimit}','20'::jsonb,true)
FROM service_plans p WHERE o.plan_id=p.id AND p.code='company_pro' AND o.plan_snapshot ? 'benefits';
