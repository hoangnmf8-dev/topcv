INSERT INTO entitlements (id, code, name, value_type)
VALUES (gen_random_uuid(), 'publicCvViewLimit', 'Lượt xem CV công khai trong kỳ', 'number')
ON CONFLICT (code) DO NOTHING;

INSERT INTO plan_entitlements (plan_id, entitlement_id, value)
SELECT p.id, e.id, to_jsonb(CASE WHEN p.is_free THEN 10 ELSE 100 END)
FROM service_plans p CROSS JOIN entitlements e
WHERE p.audience = 'company' AND e.code = 'publicCvViewLimit'
ON CONFLICT (plan_id, entitlement_id) DO NOTHING;

UPDATE orders o
SET plan_snapshot = jsonb_set(o.plan_snapshot, '{benefits,publicCvViewLimit}', pe.value)
FROM service_plans p, plan_entitlements pe, entitlements e
WHERE o.plan_id = p.id AND p.audience = 'company'
AND pe.plan_id = p.id AND pe.entitlement_id = e.id AND e.code = 'publicCvViewLimit'
AND NOT (o.plan_snapshot->'benefits' ? 'publicCvViewLimit');
