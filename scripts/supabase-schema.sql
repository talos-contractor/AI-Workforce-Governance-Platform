-- Complete Supabase Schema for AWGP
-- Run this SQL in Supabase SQL Editor

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Tenants (Holding companies / Subsidiaries)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('holding', 'subsidiary')),
  parent_tenant_id UUID REFERENCES tenants(id),
  quota_max_assistants INTEGER DEFAULT 10,
  quota_max_users INTEGER DEFAULT 50,
  quota_monthly_cost_limit DECIMAL(12,2) DEFAULT 1000.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'operator', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assistants
CREATE TABLE IF NOT EXISTS assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'executive_cos', 'shared_finance', 'shared_hr', 'shared_it', 'shared_legal',
    'company_operations', 'company_finance', 'company_marketing', 'company_customer',
    'company_product', 'company_compliance', 'custom'
  )),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'suspended', 'error')),
  configuration JSONB DEFAULT '{}',
  risk_tier INTEGER DEFAULT 2 CHECK (risk_tier BETWEEN 0 AND 5),
  max_cost_per_day DECIMAL(10,4) DEFAULT 10.00,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- Work Items (Tasks)
CREATE TABLE IF NOT EXISTS work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  assistant_id UUID NOT NULL REFERENCES assistants(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'awaiting_approval', 'completed', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  risk_level INTEGER CHECK (risk_level BETWEEN 0 AND 5),
  estimated_cost DECIMAL(10,4),
  actual_cost DECIMAL(10,4),
  context JSONB DEFAULT '{}',
  result JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approvals
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  work_item_id UUID NOT NULL REFERENCES work_items(id),
  title TEXT NOT NULL,
  description TEXT,
  risk_level INTEGER NOT NULL CHECK (risk_level BETWEEN 0 AND 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated', 'expired')),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  approver_ids UUID[] DEFAULT '{}',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  escalation_count INTEGER DEFAULT 0,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost Transactions
CREATE TABLE IF NOT EXISTS cost_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  assistant_id UUID NOT NULL REFERENCES assistants(id),
  work_item_id UUID REFERENCES work_items(id),
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'openrouter', 'local')),
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_amount DECIMAL(10,6) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'assistant', 'system')),
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_state JSONB,
  after_state JSONB,
  metadata JSONB
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_assistants_tenant ON assistants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assistants_status ON assistants(status);
CREATE INDEX IF NOT EXISTS idx_work_items_tenant ON work_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_work_items_status ON work_items(status);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_cost_tenant_created ON cost_transactions(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_timestamp ON audit_logs(tenant_id, timestamp DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Set tenant context function
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Tenant isolation policies
CREATE POLICY tenant_isolation_tenants ON tenants
  FOR ALL
  USING (id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY tenant_isolation_profiles ON user_profiles
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID OR id = auth.uid());

CREATE POLICY tenant_isolation_assistants ON assistants
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY tenant_isolation_work_items ON work_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY tenant_isolation_approvals ON approvals
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY tenant_isolation_costs ON cost_transactions
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

-- Audit logs are read-only via policy
CREATE POLICY tenant_isolation_audit ON audit_logs
  FOR SELECT
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID);
