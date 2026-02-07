-- Sample seed data for AWGP
-- Run this after creating the schema

-- Create a holding company tenant
INSERT INTO tenants (name, slug, type, quota_max_assistants, quota_max_users, quota_monthly_cost_limit)
VALUES (
  'Massillon Holdings', 
  'massillon-holdings', 
  'holding',
  100,
  50,
  10000.00
)
RETURNING id;

-- Create subsidiary tenants (replace the parent_tenant_id with the actual holding company ID)
-- INSERT INTO tenants (name, slug, type, parent_tenant_id, quota_max_assistants, quota_max_users)
-- VALUES 
--   ('Subsidiary A', 'subsidiary-a', 'subsidiary', 'HOLDING_ID', 20, 10),
--   ('Subsidiary B', 'subsidiary-b', 'subsidiary', 'HOLDING_ID', 20, 10);

-- Create sample assistants (replace tenant_id with actual tenant ID)
-- INSERT INTO assistants (tenant_id, name, slug, description, type, status, risk_tier)
-- VALUES 
--   ('TENANT_ID', 'Finance-A', 'finance-a', 'Company finance assistant', 'company_finance', 'active', 2),
--   ('TENANT_ID', 'Legal-C', 'legal-c', 'Legal compliance assistant', 'company_compliance', 'active', 3),
--   ('TENANT_ID', 'Ops-B', 'ops-b', 'Operations assistant', 'company_operations', 'active', 2);

-- Create sample work items
-- INSERT INTO work_items (tenant_id, assistant_id, title, description, status, priority, risk_level)
-- VALUES 
--   ('TENANT_ID', 'ASSISTANT_ID', 'Invoice Check #234', 'Review pending invoice', 'backlog', 2, 1),
--   ('TENANT_ID', 'ASSISTANT_ID', 'Contract Review', 'Q1 vendor agreement review', 'awaiting_approval', 1, 4);
