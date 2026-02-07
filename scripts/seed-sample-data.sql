-- Seed data for AWGP MVP
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
  );

-- Create sample approvals
INSERT INTO approvals (tenant_id, work_item_id, title, description, risk_level, status, requested_by, expires_at, context)
SELECT
  '00000000-0000-0000-0000-000000000001',
  id,
  'Contract Review - Q1 Vendor Agreement',
  'Vendor ABC proposes contract amendment for Q1 services. Terms: $50,000 service level, modified SLA.',
  4,
  'pending',
  NULL,
  NOW() + INTERVAL '24 hours',
  '{"vendor": "ABC Corp", "amount": 50000, "term": "Q1 2024"}'
FROM work_items
WHERE title = 'Contract Review - Q1 Vendor Agreement';

-- Create sample cost transactions
INSERT INTO cost_transactions (tenant_id, assistant_id, work_item_id, provider, model, input_tokens, output_tokens, cost_amount)
SELECT
  '00000000-0000-0000-0000-000000000001',
  assistants.id,
  work_items.id,
  'openai',
  'gpt-4',
  1500,
  850,
  12.45
FROM assistants
CROSS JOIN work_items
WHERE assistants.slug = 'finance-a' AND work_items.title = 'Invoice Check #234';

SELECT 'Seed data created successfully!' as status;
