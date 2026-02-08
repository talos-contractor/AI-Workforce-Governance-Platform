-- Test approvals for AWGP MVP
-- RUN THIS AFTER: Look up the user's UUID in Supabase Auth and replace the placeholder

-- First, get the user ID from auth.users table:
-- SELECT id FROM auth.users WHERE email = 'arch3angel@gmail.com';
-- Then replace 'USER_UUID_HERE' below with that ID

-- Create sample approvals linked to the authenticated user
INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, expires_at, context)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  work_items.id,
  'High-Risk Contract Review - Q1 Vendor Agreement',
  'Vendor ABC proposes contract amendment for Q1 services. Terms: $50,000 service level, modified SLA clauses. Risk Level 4 requires human approval.',
  4,
  'pending',
  'USER_UUID_HERE',  -- REPLACE THIS with actual UUID from auth.users
  NOW() + INTERVAL '24 hours',
  '{"vendor": "ABC Corp", "amount": 50000, "term": "Q1 2024", "key_changes": ["Modified SLA", "Payment terms extended"]}'
FROM work_items
WHERE title = 'Contract Review - Q1 Vendor Agreement'
ON CONFLICT DO NOTHING;

-- Create another approval
INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, expires_at, context)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  NULL,  -- No specific work item, just a general approval
  'Marketing Campaign Budget - Q2',
  'Request for $25,000 marketing budget for Q2 social media campaign targeting enterprise clients.',
  3,
  'pending',
  'USER_UUID_HERE',  -- REPLACE THIS with actual UUID from auth.users
  NOW() + INTERVAL '48 hours',
  '{"department": "Marketing", "amount": 25000, "channel": "Social Media", "target": "Enterprise"}'
);

-- Create a completed approval (for history)
INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, approved_by, approved_at, expires_at, context)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM work_items WHERE title = 'Invoice Check #234'),
  'Invoice Processing - Vendor XYZ',
  'Routine invoice processing for vendor XYZ, amount $12,500.',
  1,
  'approved',
  'USER_UUID_HERE',  -- REPLACE THIS with actual UUID from auth.users
  'USER_UUID_HERE',  -- Self-approved for demo
  NOW() - INTERVAL '2 hours',
  NOW() + INTERVAL '24 hours',
  '{"vendor": "XYZ Corp", "invoice_number": "INV-2024-001", "amount": 12500}'
);

-- Create a rejected approval (for history)
INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, rejected_by, rejected_at, context)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'Research Budget Request',
  'Request for $100,000 market research budget.',
  5,
  'rejected',
  'USER_UUID_HERE',  -- REPLACE THIS with actual UUID from auth.users
  'USER_UUID_HERE',  -- Self-rejected for demo
  NOW() - INTERVAL '1 day',
  '{"department": "Research", "amount": 100000, "reason": "Budget exceeds quarterly limit"}'
);

SELECT 'Approvals created! Remember to replace USER_UUID_HERE with actual user UUID.' as status;
