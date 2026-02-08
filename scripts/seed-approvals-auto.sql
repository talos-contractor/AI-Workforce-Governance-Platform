-- Test approvals for AWGP MVP
-- This version automatically looks up the user by email

-- Create sample approvals linked to arch3angel@gmail.com
-- The subquery (SELECT id FROM auth.users...) finds the UUID automatically

DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'arch3angel@gmail.com';
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User arch3angel@gmail.com not found in auth.users. Please sign up first.';
    END IF;

    -- Create pending approval 1
    INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, expires_at, context)
    SELECT 
        '00000000-0000-0000-0000-000000000001',
        work_items.id,
        'High-Risk Contract Review - Q1 Vendor Agreement',
        'Vendor ABC proposes contract amendment for Q1 services. Terms: $50,000 service level, modified SLA clauses. Risk Level 4 requires human approval.',
        4,
        'pending',
        user_id,
        NOW() + INTERVAL '24 hours',
        '{"vendor": "ABC Corp", "amount": 50000, "term": "Q1 2024", "key_changes": ["Modified SLA", "Payment terms extended"]}'
    FROM work_items
    WHERE title = 'Contract Review - Q1 Vendor Agreement'
    ON CONFLICT DO NOTHING;

    -- Create pending approval 2
    INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, expires_at, context)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        NULL,
        'Marketing Campaign Budget - Q2',
        'Request for $25,000 marketing budget for Q2 social media campaign targeting enterprise clients.',
        3,
        'pending',
        user_id,
        NOW() + INTERVAL '48 hours',
        '{"department": "Marketing", "amount": 25000, "channel": "Social Media", "target": "Enterprise"}'
    );

    -- Create completed approval
    INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, approved_by, approved_at, expires_at, context)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        (SELECT id FROM work_items WHERE title = 'Invoice Check #234'),
        'Invoice Processing - Vendor XYZ',
        'Routine invoice processing for vendor XYZ, amount $12,500.',
        1,
        'approved',
        user_id,
        user_id,
        NOW() - INTERVAL '2 hours',
        NOW() + INTERVAL '24 hours',
        '{"vendor": "XYZ Corp", "invoice_number": "INV-2024-001", "amount": 12500}'
    );

    -- Create rejected approval
    INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, rejected_by, rejected_at, context)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        NULL,
        'Research Budget Request',
        'Request for $100,000 market research budget.',
        5,
        'rejected',
        user_id,
        user_id,
        NOW() - INTERVAL '1 day',
        '{"department": "Research", "amount": 100000, "reason": "Budget exceeds quarterly limit"}'
    );

    RAISE NOTICE 'Created 4 approvals for user: %', user_id;
END $$;
