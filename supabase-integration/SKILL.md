---
name: supabase-integration
description: Full-stack Supabase integration for PostgreSQL database, authentication, real-time subscriptions, and storage. Use when building applications that need: (1) PostgreSQL database with REST/GraphQL APIs, (2) Authentication (email/password, OAuth, magic links), (3) Real-time subscriptions via WebSockets, (4) Row Level Security (RLS) policies, (5) File storage, (6) Edge Functions. For AWGP specifically, this skill covers Supabase implementation of multi-tenant database schema, approval workflows, audit logging, and cost tracking.
---

# Supabase Integration

## Overview

Supabase provides a managed PostgreSQL backend with auto-generated APIs, authentication, and real-time features. For AWGP, it replaces self-hosted Postgres + Keycloak with a unified platform.

## Quick Start

### 1. Environment Setup

```bash
# Required environment variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Client Initialization

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)
```

### 3. Server-side (with service role for admin operations)

```typescript
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
```

## Database Schema for AWGP

Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS extensions (already enabled in Supabase)

-- Create tenants table (holding companies / subsidiaries)
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

-- Create users table (extends Supabase Auth)
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

-- Create assistants table
CREATE TABLE assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'executive_cos', 'shared_finance', 'shared_hr', 'shared_it', 'shared_legal',
    'company_operations', 'company_finance', 'company_marketing', 'company_customer',
    'custom'
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

-- Create work_items table
CREATE TABLE work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  assistant_id UUID NOT NULL REFERENCES assistants(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'awaiting_approval', 'completed', 'failed', 'cancelled')),
  risk_level INTEGER CHECK (risk_level BETWEEN 0 AND 5),
  actual_cost DECIMAL(10,4),
  result JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create approvals table
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  work_item_id UUID NOT NULL REFERENCES work_items(id),
  title TEXT NOT NULL,
  risk_level INTEGER NOT NULL CHECK (risk_level BETWEEN 0 AND 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
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

-- Enable Row Level Security on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies
CREATE POLICY "tenants_isolation"
  ON tenants
  FOR ALL
  USING (id = current_setting('app.current_tenant')::UUID);

CREATE POLICY "user_profiles_isolation"
  ON user_profiles
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY "assistants_isolation"
  ON assistants
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY "work_items_isolation"
  ON work_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY "approvals_isolation"
  ON approvals
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Create function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_id::text, false);
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security (RLS) Patterns

### Basic Isolation Policy

```sql
CREATE POLICY tenant_isolation ON table_name
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

### User-Specific Policy

```sql
CREATE POLICY user_only ON user_profiles
  FOR SELECT
  USING (id = auth.uid());
```

### Role-Based Policy

```sql
CREATE POLICY admin_all_access ON assistants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

## TypeScript Usage Patterns

### Multi-Tenant Queries

```typescript
async function getAssistants(tenantId: string) {
  // Set tenant context for RLS
  await supabase.rpc('set_tenant_context', { tenant_id: tenantId })
  
  const { data, error } = await supabase
    .from('assistants')
    .select('*')
    .eq('status', 'active')
  
  return { data, error }
}
```

### Create with Tenant

```typescript
async function createAssistant(assistantData: AssistantInput, tenantId: string) {
  // Service role bypasses RLS for initial creation
  const { data, error } = await supabaseAdmin
    .from('assistants')
    .insert({
      ...assistantData,
      tenant_id: tenantId,
      created_by: userId
    })
    .select()
    .single()
  
  return { data, error }
}
```

### Real Subscriptions

```typescript
// Subscribe to approval changes
const subscription = supabase
  .channel('approvals')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'approvals',
      filter: `tenant_id=eq.${tenantId}`
    },
    (payload) => {
      console.log('Approval updated:', payload)
    }
  )
  .subscribe()
```

## Authentication Flow

### 1. Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      tenant_id: 'tenant-uuid-here',
      role: 'operator'
    }
  }
})
```

### 2. Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
})

// Token stored automatically
const session = data.session
```

### 3. Get Current User with Profile

```typescript
async function getCurrentUserWithProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return { ...user, profile }
}
```

## Edge Functions (Optional)

For server-side logic that can't be done in the database:

```typescript
// supabase/functions/approval-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { approval_id, status } = await req.json()
  
  // Custom logic here
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## Important Notes for AWGP

1. **Tenant Isolation**: All queries must set `app.current_tenant` context before selecting data

2. **Audit Logging**: Use database triggers or application-level logging to `audit_logs` table

3. **Cost Tracking**: Store cost data per tenant; use database views for aggregations

4. **Approval Workflows**: High-risk operations should create approval records before executing

5. **Session Management**: Supabase handles JWT tokens; store tenant ID in JWT custom claims if needed

See [supabase-schema.sql](./references/supabase-schema.sql) for complete database schema.
See [supabase-auth-flow.md](./references/supabase-auth-flow.md) for detailed authentication patterns.
See [rls-policies.md](./references/rls-policies.md) for complex security policies.
