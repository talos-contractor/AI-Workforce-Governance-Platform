# AWGP Database Schema

**Document Version:** 1.0  
**Last Updated:** 2026-02-05  
**Author:** Anastasia  
**Status:** Finalized for v1.0

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Core Tables](#core-tables)
3. [Audit Tables](#audit-tables)
4. [Indexes and Constraints](#indexes-and-constraints)
5. [Row-Level Security](#row-level-security)
6. [Migration Strategy](#migration-strategy)

---

## Schema Overview

### Multi-Tenant Design

All tables include `tenant_id` for strict isolation between subsidiaries.

### Naming Conventions

- Tables: snake_case, plural (e.g., `audit_logs`)
- Columns: snake_case (e.g., `created_at`)
- Primary keys: `id` (UUID)
- Foreign keys: `{table}_id` (UUID)
- Timestamps: `created_at`, `updated_at` (TIMESTAMPTZ)

---

## Core Tables

### tenants

**Purpose:** Top-level organization isolation.

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,  -- URL-friendly identifier
    type TEXT NOT NULL CHECK (type IN ('holding', 'subsidiary')),
    parent_tenant_id UUID REFERENCES tenants(id),
    settings JSONB DEFAULT '{}',
    quota_max_assistants INTEGER DEFAULT 10,
    quota_max_users INTEGER DEFAULT 50,
    quota_monthly_cost_limit DECIMAL(12,2) DEFAULT 1000.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### users

**Purpose:** Human users of the system.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    keycloak_id TEXT UNIQUE,  -- External auth reference
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'operator', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);
```

### assistants

**Purpose:** AI assistant definitions and configurations.

```sql
CREATE TABLE assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN (
        'executive_cos',
        'shared_finance',
        'shared_hr',
        'shared_it',
        'shared_legal',
        'company_operations',
        'company_finance',
        'company_marketing',
        'company_customer',
        'company_product',
        'company_compliance',
        'custom'
    )),
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'suspended', 'error')),
    configuration JSONB DEFAULT '{}',
    capabilities TEXT[],  -- Array of allowed actions
    model_config JSONB DEFAULT '{"provider": "openai", "model": "gpt-4"}',
    risk_tier INTEGER DEFAULT 2 CHECK (risk_tier BETWEEN 0 AND 5),
    max_cost_per_day DECIMAL(10,4) DEFAULT 10.00,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);
```

### assistant_templates

**Purpose:** Reusable assistant configurations.

```sql
CREATE TABLE assistant_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    configuration JSONB DEFAULT '{}',
    capabilities TEXT[],
    model_config JSONB DEFAULT '{}',
    is_system BOOLEAN DEFAULT false,  -- Built-in templates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### work_items

**Purpose:** Tasks assigned to assistants.

```sql
CREATE TABLE work_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    assistant_id UUID NOT NULL REFERENCES assistants(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'awaiting_approval', 'completed', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),  -- 1=highest
    risk_level INTEGER CHECK (risk_level BETWEEN 0 AND 5),
    estimated_cost DECIMAL(10,4),
    actual_cost DECIMAL(10,4),
    context JSONB DEFAULT '{}',  -- Task-specific data
    result JSONB,  -- Output data
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### approvals

**Purpose:** Human approval requests.

```sql
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    work_item_id UUID NOT NULL REFERENCES work_items(id),
    title TEXT NOT NULL,
    description TEXT,
    risk_level INTEGER NOT NULL CHECK (risk_level BETWEEN 0 AND 5),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated', 'expired')),
    requested_by UUID NOT NULL REFERENCES users(id),
    approver_ids UUID[],  -- Array of allowed approvers
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    escalation_count INTEGER DEFAULT 0,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### approval_delegations

**Purpose:** Temporary approval authority delegation.

```sql
CREATE TABLE approval_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    delegator_id UUID NOT NULL REFERENCES users(id),
    delegate_id UUID NOT NULL REFERENCES users(id),
    risk_levels INTEGER[],  -- Which risk levels can be delegated
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_delegation CHECK (delegator_id != delegate_id)
);
```

### communication_policies

**Purpose:** Rules for assistant-to-assistant communication.

```sql
CREATE TABLE communication_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    from_assistant_types TEXT[],
    to_assistant_types TEXT[],
    allowed_channels TEXT[],  -- telegram, slack, email, internal
    content_rules JSONB DEFAULT '{}',
    rate_limit_per_hour INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### provider_credit_pools

**Purpose:** Per-provider cost allocation tracking.

```sql
CREATE TABLE provider_credit_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'openrouter', 'local')),
    monthly_budget DECIMAL(12,2) NOT NULL,
    current_balance DECIMAL(12,2) NOT NULL,
    alert_threshold_50 BOOLEAN DEFAULT false,
    alert_threshold_75 BOOLEAN DEFAULT false,
    alert_threshold_90 BOOLEAN DEFAULT false,
    reset_day_of_month INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, provider)
);
```

### cost_transactions

**Purpose:** Individual cost records.

```sql
CREATE TABLE cost_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    assistant_id UUID NOT NULL REFERENCES assistants(id),
    work_item_id UUID REFERENCES work_items(id),
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    cost_amount DECIMAL(10,6) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Audit Tables

### audit_logs

**Purpose:** Immutable record of all system actions.

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tenant_id UUID NOT NULL,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'assistant', 'system')),
    actor_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    before_state JSONB,
    after_state JSONB,
    metadata JSONB,
    integrity_hash TEXT NOT NULL,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

### audit_log_integrity

**Purpose:** Hash chain for tamper detection.

```sql
CREATE TABLE audit_log_integrity (
    id SERIAL PRIMARY KEY,
    partition_name TEXT UNIQUE NOT NULL,
    last_sequence_number BIGINT NOT NULL,
    cumulative_hash TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);
```

### conversation_logs

**Purpose:** Archived assistant conversations.

```sql
CREATE TABLE conversation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    assistant_id UUID NOT NULL,
    work_item_id UUID,
    channel TEXT NOT NULL,
    external_id TEXT,  -- Telegram chat ID, etc.
    messages JSONB NOT NULL,  -- Array of message objects
    cost_amount DECIMAL(10,4),
    token_count INTEGER,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### hallucination_flags

**Purpose:** Detected potential hallucinations.

```sql
CREATE TABLE hallucination_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    assistant_id UUID NOT NULL,
    work_item_id UUID,
    conversation_log_id UUID,
    detection_method TEXT NOT NULL,  -- confidence, fact_check, pattern
    confidence_score DECIMAL(3,2),  -- 0.00 to 1.00
    flagged_content TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'false_positive', 'confirmed')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes and Constraints

### Performance Indexes

```sql
-- Tenant lookup optimization
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_assistants_tenant ON assistants(tenant_id);
CREATE INDEX idx_work_items_tenant ON work_items(tenant_id);

-- Work item status queries
CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_work_items_assistant ON work_items(assistant_id);

-- Approval queries
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_requested_by ON approvals(requested_by);
CREATE INDEX idx_approvals_expires ON approvals(expires_at);

-- Audit log queries
CREATE INDEX idx_audit_logs_tenant_timestamp ON audit_logs(tenant_id, timestamp DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_type, actor_id);

-- Cost queries
CREATE INDEX idx_cost_transactions_tenant ON cost_transactions(tenant_id, created_at DESC);
CREATE INDEX idx_cost_transactions_assistant ON cost_transactions(assistant_id, created_at DESC);
```

### Foreign Key Constraints

All foreign keys are defined with `ON DELETE RESTRICT` to prevent accidental data loss.

---

## Row-Level Security

### Enable RLS on All Tables

```sql
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
```

### Tenant Isolation Policies

```sql
-- Users can only see their tenant's data
CREATE POLICY tenant_isolation_users ON users
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_assistants ON assistants
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_work_items ON work_items
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_approvals ON approvals
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Audit logs are append-only
CREATE POLICY tenant_isolation_audit ON audit_logs
    FOR SELECT
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Holding company can see all subsidiaries
CREATE POLICY holding_company_access ON assistants
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant')::UUID
        OR EXISTS (
            SELECT 1 FROM tenants t
            WHERE t.id = current_setting('app.current_tenant')::UUID
            AND t.type = 'holding'
            AND assistants.tenant_id IN (
                SELECT id FROM tenants WHERE parent_tenant_id = t.id
            )
        )
    );
```

### Application Context Setup

```typescript
// Set tenant context before queries
await prisma.$executeRaw`SET app.current_tenant = ${tenantId}`;
```

---

## Migration Strategy

### Initial Migration (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id                    String   @id @default(uuid())
  name                  String
  slug                  String   @unique
  type                  String   // holding, subsidiary
  parentTenantId        String?  @map("parent_tenant_id")
  settings              Json     @default("{}")
  quotaMaxAssistants    Int      @default(10) @map("quota_max_assistants")
  quotaMaxUsers         Int      @default(50) @map("quota_max_users")
  quotaMonthlyCostLimit Decimal  @default(1000.00) @map("quota_monthly_cost_limit")
  isActive              Boolean  @default(true) @map("is_active")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@map("tenants")
}

// ... additional models
```

### Running Migrations

```bash
# Development
npx prisma migrate dev --name init

# Production
npx prisma migrate deploy

# Generate client
npx prisma generate
```

---

*End of Document*
