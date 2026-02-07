-- Test data for AWGP MVP
-- Run this in Supabase SQL Editor to populate sample data

-- Create a sample holding company tenant  
INSERT INTO tenants (id, name, slug, type, quota_max_assistants, quota_max_users, quota_monthly_cost_limit)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Massillon Holdings', 
  'massillon-holdings', 
  'holding',
  100,
  50,
  10000.00
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Create sample assistants
INSERT INTO assistants (tenant_id, name, slug, description, type, status, risk_tier, max_cost_per_day, configuration)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'Finance-A',
    'finance-a',
    'Company finance assistant for invoice processing and reporting',
    'company_finance',
    'active',
    2,
    50.00,
    '{"capabilities": ["invoice_processing", "report_generation"]}'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Legal-C',
    'legal-c', 
    'Legal compliance assistant for contract review',
    'company_compliance',
    'active',
    3,
    100.00,
    '{"capabilities": ["contract_review", "compliance_check"]}'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Marketing-D',
    'marketing-d',
    'Marketing assistant for campaigns and content',
    'company_marketing',
    'active',
    1,
    30.00,
    '{"capabilities": ["content_creation", "campaign_management"]}'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Ops-B',
    'ops-b',
    'Operations assistant for process automation',
    'company_operations',
    'active',
    2,
    40.00,
    '{"capabilities": ["process_automation", "data_entry"]}'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Research-F',
    'research-f',
    'R&D assistant for market research',
    'company_operations',
    'error',
    2,
    75.00,
    '{"capabilities": ["market_research"]}'
  )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Create sample work items
INSERT INTO work_items (tenant_id, assistant_id, title, description, status, priority, risk_level, estimated_cost, actual_cost)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM assistants WHERE slug = 'finance-a'),
    'Invoice Check #234',
    'Review pending invoice from vendor ABC',
    'completed',
    2,
    1,
    5.00,
    4.50
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM assistants WHERE slug = 'legal-c'),
    'Contract Review - Q1 Vendor Agreement',
    'Review contract amendment for Q1 services',
    'awaiting_approval',
    1,
    4,
    15.00,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM assistants WHERE slug = 'ops-b'),
    'Monthly Report Generation',
    'Generate monthly operational reports',
    'in_progress',
    3,
    1,
    8.00,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM assistants WHERE slug = 'marketing-d'),
    'Q2 Marketing Campaign Plan',
    'Develop marketing strategy for Q2',
    'pending',
    2,
    2,
    25.00,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM assistants WHERE slug = 'research-f'),
    'Market Research Analysis',
    'Analyze competitor landscape',
    'in_progress',
    1,
    3,
    50.00,
    NULL
  );

-- Create sample cost transactions with context
INSERT INTO cost_transactions (tenant_id, assistant_id, work_item_id, provider, model, input_tokens, output_tokens, cost_amount, metadata)
SELECT
  '00000000-0000-0000-0000-000000000001',
  a.id,
  w.id,
  'openai',
  'gpt-4-turbo',
  2500,
  1200,
  15.45,
  '{"project": "Invoice Processing", "task": "Data Extraction", "description": "Extracted invoice data for vendor ABC"}'
FROM assistants a
CROSS JOIN work_items w
WHERE a.slug = 'finance-a' AND w.title = 'Invoice Check #234'
LIMIT 1;

INSERT INTO cost_transactions (tenant_id, assistant_id, work_item_id, provider, model, input_tokens, output_tokens, cost_amount, metadata)
SELECT
  '00000000-0000-0000-0000-000000000001',
  a.id,
  w.id,
  'openai',
  'gpt-4',
  4500,
  2800,
  42.50,
  '{"project": "Contract Review", "task": "Legal Analysis", "description": "Analyzed contract terms and flagged 3 potential risks"}'
FROM assistants a
CROSS JOIN work_items w
WHERE a.slug = 'legal-c' AND w.title = 'Contract Review - Q1 Vendor Agreement'
LIMIT 1;

INSERT INTO cost_transactions (tenant_id, assistant_id, work_item_id, provider, model, input_tokens, output_tokens, cost_amount, metadata)
SELECT
  '00000000-0000-0000-0000-000000000001',
  a.id,
  w.id,
  'anthropic',
  'claude-3-opus',
  1500,
  950,
  18.20,
  '{"project": "Content Creation", "task": "Marketing Copy", "description": "Generated ad copy for social media campaign"}'
FROM assistants a
CROSS JOIN work_items w
WHERE a.slug = 'marketing-d' AND w.title = 'Q2 Marketing Campaign Plan'
LIMIT 1;

INSERT INTO cost_transactions (tenant_id, assistant_id, work_item_id, provider, model, input_tokens, output_tokens, cost_amount, metadata)
SELECT
  '00000000-0000-0000-0000-000000000001',
  a.id,
  w.id,
  'openai',
  'gpt-3.5-turbo',
  800,
  400,
  3.25,
  '{"project": "Report Generation", "task": "Data Formatting", "description": "Formatted monthly report data"}'
FROM assistants a
CROSS JOIN work_items w
WHERE a.slug = 'ops-b' AND w.title = 'Monthly Report Generation'
LIMIT 1;

INSERT INTO cost_transactions (tenant_id, assistant_id, work_item_id, provider, model, input_tokens, output_tokens, cost_amount, metadata)
SELECT
  '00000000-0000-0000-0000-000000000001',
  a.id,
  NULL,
  'openai',
  'gpt-4',
  3200,
  2100,
  35.80,
  '{"project": "Research", "task": "Competitor Analysis", "description": "Analyzed 5 competitors and generated comparison report"}'
FROM assistants a
WHERE a.slug = 'research-f'
LIMIT 1;

-- Create sample audit logs
INSERT INTO audit_logs (tenant_id, actor_type, actor_id, action, entity_type, entity_id, context)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'user', '00000000-0000-0000-0000-000000000001', 'LOGIN', 'system', NULL, '{"ip": "192.168.1.100", "user_agent": "Mozilla/5.0"}'),
  ('00000000-0000-0000-0000-000000000001', 'user', '00000000-0000-0000-0000-000000000001', 'ASSISTANT_CREATE', 'assistant', (SELECT id FROM assistants WHERE slug = 'finance-a'), '{"name": "Finance-A"}'),
  ('00000000-0000-0000-0000-000000000001', 'user', '00000000-0000-0000-0000-000000000001', 'ASSISTANT_CREATE', 'assistant', (SELECT id FROM assistants WHERE slug = 'legal-c'), '{"name": "Legal-C"}'),
  ('00000000-0000-0000-0000-000000000001', 'assistant', (SELECT id FROM assistants WHERE slug = 'finance-a'), 'WORK_COMPLETE', 'work_item', (SELECT id FROM work_items WHERE title = 'Invoice Check #234'), '{"cost": 4.50}'),
  ('00000000-0000-0000-0000-000000000001', 'assistant', (SELECT id FROM assistants WHERE slug = 'legal-c'), 'APPROVAL_REQ', 'work_item', (SELECT id FROM work_items WHERE title = 'Contract Review - Q1 Vendor Agreement'), '{"risk_level": 4}'),
  ('00000000-0000-0000-0000-000000000001', 'system', NULL, 'COST_ALERT', 'cost_transaction', NULL, '{"threshold": 100, "current": 115.20}'),
  ('00000000-0000-0000-0000-000000000001', 'user', '00000000-0000-0000-0000-000000000001', 'WORK_ITEM_CREATE', 'work_item', (SELECT id FROM work_items WHERE title = 'Q2 Marketing Campaign Plan'), '{"title": "Q2 Marketing Campaign Plan"}'),
  ('00000000-0000-0000-0000-000000000001', 'assistant', (SELECT id FROM assistants WHERE slug = 'ops-b'), 'WORK_START', 'work_item', (SELECT id FROM work_items WHERE title = 'Monthly Report Generation'), '{"estimated_cost": 8.00}'),
  ('00000000-0000-0000-0000-000000000001', 'assistant', (SELECT id FROM assistants WHERE slug = 'research-f'), 'WORK_ERROR', 'work_item', (SELECT id FROM work_items WHERE title = 'Market Research Analysis'), '{"error": "Rate limit exceeded"}'),
  ('00000000-0000-0000-0000-000000000001', 'user', '00000000-0000-0000-0000-000000000001', 'SETTINGS_UPDATE', 'tenant', '00000000-0000-0000-0000-000000000001', '{"field": "quota_monthly_cost_limit", "old": 5000, "new": 10000}');

-- Note: Approvals require a user in auth.users() table
-- To test approvals, you need to:
-- 1. Create a user via the app signup
-- 2. Get their UUID from Supabase Auth
-- 3. Run: UPDATE user_profiles SET id = '<auth-uuid>' WHERE ...
-- 4. Then create approvals with that user ID

SELECT 'Seed data created successfully!' as status;
SELECT 'Note: Approvals require an authenticated user. Sign up in the app first.' as note;
