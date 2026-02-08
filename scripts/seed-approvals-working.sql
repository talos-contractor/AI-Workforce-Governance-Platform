-- Test approvals for AWGP MVP
-- Creates approvals linked to existing work items only

DO $$
DECLARE
    v_user_id UUID := '106a5ab5-3843-435d-927c-f55dd801a902';
    v_tenant_id UUID;
BEGIN
    -- Get the first tenant
    SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenants found. Please run seed data first.';
    END IF;

    -- Create pending approval for Contract Review
    INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, expires_at, context)
    SELECT 
        v_tenant_id,
        work_items.id,
        'High-Risk Contract Review - Q1 Vendor Agreement',
        'Vendor ABC proposes contract amendment for Q1 services. Terms: $50,000 service level, modified SLA clauses. Risk Level 4 requires human approval.',
        4,
        'pending',
        v_user_id,
        NOW() + INTERVAL '24 hours',
        '{"vendor": "ABC Corp", "amount": 50000, "term": "Q1 2024", "key_changes": ["Modified SLA", "Payment terms extended"]}'
    FROM work_items
    WHERE title = 'Contract Review - Q1 Vendor Agreement'
    ON CONFLICT DO NOTHING;

    -- Create completed approval for Invoice Check
    INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, approved_by, approved_at, expires_at, context)
    SELECT 
        v_tenant_id,
        work_items.id,
        'Invoice Processing - Vendor XYZ',
        'Routine invoice processing for vendor XYZ, amount $12,500.',
        1,
        'approved',
        v_user_id,
        v_user_id,
        NOW() - INTERVAL '2 hours',
        NOW() + INTERVAL '24 hours',
        '{"vendor": "XYZ Corp", "invoice_number": "INV-2024-001", "amount": 12500}'
    FROM work_items
    WHERE title = 'Invoice Check #234'
    ON CONFLICT DO NOTHING;

    -- Create pending approval for Monthly Report
    INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, expires_at, context)
    SELECT 
        v_tenant_id,
        work_items.id,
        'Monthly Report Review Required',
        'Review monthly operational reports for accuracy before distribution.',
        2,
        'pending',
        v_user_id,
        NOW() + INTERVAL '12 hours',
        '{"report_type": "Monthly Operations", "department": "Operations"}'
    FROM work_items
    WHERE title = 'Monthly Report Generation'
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created approvals for user: %, tenant: %', v_user_id, v_tenant_id;
END $$;
