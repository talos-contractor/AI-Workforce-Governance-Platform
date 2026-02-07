-- Complete Supabase Schema for AWGP
-- Run this SQL in Supabase SQL Editor

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Tenants (Holding companies / Subsidiaries)
CREATE TABLE tenants (
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
CREATE TABLE user_profiles (
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
CREATE TABLE assistants (
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
CREATE TABLE work_items (
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
CREATE TABLE approvals (
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

-- Approval Delegations
CREATE TABLE approval_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  delegator_id UUID NOT NULL REFERENCES auth.users(id),
  delegate_id UUID NOT NULL REFERENCES auth.users(id),
  risk_levels INTEGER[] DEFAULT '{}',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_delegation CHECK (delegator_id != delegate_id)
);

-- Cost Transactions
CREATE TABLE cost_transactions (
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

-- Provider Credit Pools
CREATE TABLE provider_credit_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'openrouter', 'local')),
  monthly_budget DECIMAL(12,2) NOT NULL,
  current_balance DECIMAL(12,2) NOT NULL,
  alert_50_sent BOOLEAN DEFAULT false,
  alert_75_sent BOOLEAN DEFAULT false,
  alert_90_sent BOOLEAN DEFAULT false,
  reset_day_of_month INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, provider)
);

-- Audit Logs
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
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

CREATE INDEX idx_users_tenant ON user_profiles(tenant_id);
CREATE INDEX idx_users_role ON user_profiles(role);
CREATE INDEX idx_assistants_tenant ON assistants(tenant_id);
CREATE INDEX idx_assistants_status ON assistants(status);
CREATE INDEX idx_work_items_tenant ON work_items(tenant_id);
CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_work_items_assistant ON work_items(assistant_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_requested_by ON approvals(requested_by);
CREATE INDEX idx_approvals_expires ON approvals(expires_at);
CREATE INDEX idx_cost_tenant_created ON cost_transactions(tenant_id, created_at DESC);
CREATE INDEX idx_cost_assistant_created ON cost_transactions(assistant_id, created_at DESC);
CREATE INDEX idx_audit_tenant_timestamp ON audit_logs(tenant_id, timestamp DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_type, actor_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_credit_pools ENABLE ROW LEVEL SECURITY;
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
  USING (id = current_setting('app.current_tenant', true)::UUID OR 
         EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY tenant_isolation_profiles ON user_profiles
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID OR 
         id = auth.uid());

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

CREATE POLICY tenant_isolation_pools ON provider_credit_pools
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

-- Audit logs are read-only via policy
CREATE POLICY tenant_isolation_audit ON audit_logs
  FOR SELECT
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assistants_updated_at BEFORE UPDATE ON assistants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_items_updated_at BEFORE UPDATE ON work_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data = to_jsonb(OLD);
    new_data = NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_data = NULL;
    new_data = to_jsonb(NEW);
  ELSE
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
  END IF;
  
  INSERT INTO audit_logs (
    tenant_id, actor_type, actor_id, action, entity_type, entity_id, before_state, after_state
  ) VALUES (
    current_setting('app.current_tenant', true)::UUID,
    'user',
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_data,
    new_data
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Attach audit trigger to key tables
CREATE TRIGGER assistants_audit AFTER INSERT OR UPDATE OR DELETE ON assistants
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER work_items_audit AFTER INSERT OR UPDATE OR DELETE ON work_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER approvals_audit AFTER INSERT OR UPDATE OR DELETE ON approvals
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
