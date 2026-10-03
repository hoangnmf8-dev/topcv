INSERT INTO plan_entitlements (plan_id, entitlement_id, value)
SELECT p.id, e.id, to_jsonb(CASE WHEN p.is_free THEN 5 ELSE 100 END)
FROM service_plans p CROSS JOIN entitlements e
WHERE p.audience = 'company' AND e.code = 'aiLimit'
ON CONFLICT (plan_id, entitlement_id) DO NOTHING;

-- Extend existing purchased company plans without replacing their other benefits.
UPDATE orders o SET plan_snapshot = jsonb_set(o.plan_snapshot, '{benefits,aiLimit}', pe.value)
FROM service_plans p JOIN plan_entitlements pe ON pe.plan_id = p.id
JOIN entitlements e ON e.id = pe.entitlement_id AND e.code = 'aiLimit'
WHERE o.plan_id = p.id AND p.audience = 'company'
AND o.plan_snapshot ? 'benefits'
AND NOT (o.plan_snapshot->'benefits' ? 'aiLimit');
