# AWGP API Specifications

**Document Version:** 1.0  
**Last Updated:** 2026-02-05  
**Author:** Anastasia  
**Status:** Finalized for v1.0

---

## Table of Contents

1. [API Architecture](#api-architecture)
2. [Authentication](#authentication)
3. [tRPC Router Structure](#trpc-router-structure)
4. [Procedure Specifications](#procedure-specifications)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## API Architecture

### Protocol Choice: tRPC

AWGP uses **tRPC** for internal API communication between frontend and backend.

**Why tRPC:**
- End-to-end TypeScript type safety
- No API contract drift between frontend and backend
- Automatic client generation
- Built-in request batching and caching
- Excellent developer experience with autocomplete

### External API

For webhooks and external integrations, **REST endpoints** are provided at `/api/v1/webhooks/*`.

---

## Authentication

### JWT Token Flow

```
User Login → Keycloak → JWT Issued → Stored in HTTP-only Cookie
                                   ↓
                              tRPC Context
                                   ↓
                         Validate + Extract Claims
                                   ↓
                             Authorize Request
```

### Context Structure

```typescript
interface Context {
  user: {
    id: string;
    tenantId: string;
    email: string;
    role: 'super_admin' | 'admin' | 'manager' | 'operator' | 'viewer';
  } | null;
  session: {
    id: string;
    expiresAt: Date;
  };
}
```

### Protected Procedures

```typescript
// All procedures require authentication by default
const protectedProcedure = t.procedure.use(isAuthenticated);

// Admin-only procedures
const adminProcedure = protectedProcedure.use(isAdmin);

// Tenant-scoped procedures (automatic RLS)
const tenantProcedure = protectedProcedure.use(setTenantContext);
```

---

## tRPC Router Structure

```
appRouter
├── auth
│   ├── login
│   ├── logout
│   ├── refresh
│   └── me
├── tenants
│   ├── list
│   ├── create
│   ├── update
│   ├── delete
│   └── getById
├── users
│   ├── list
│   ├── create
│   ├── update
│   ├── delete
│   └── getById
├── assistants
│   ├── list
│   ├── create
│   ├── update
│   ├── delete
│   ├── activate
│   ├── deactivate
│   └── getById
├── workItems
│   ├── list
│   ├── create
│   ├── update
│   ├── delete
│   ├── updateStatus
│   └── getById
├── approvals
│   ├── listPending
│   ├── listMyRequests
│   ├── approve
│   ├── reject
│   ├── delegate
│   └── getById
├── audit
│   ├── query
│   ├── export
│   └── getStats
├── costs
│   ├── getCurrentSpend
│   ├── getHistory
│   ├── getPools
│   └── updatePool
└── webhooks
    └── n8n
    └── telegram
```

---

## Procedure Specifications

### Auth Router

#### auth.login
**Input:**
```typescript
{
  email: string;
  password: string;
}
```

**Output:**
```typescript
{
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
}
```

**Errors:**
- `INVALID_CREDENTIALS`: Email or password incorrect
- `ACCOUNT_DISABLED`: User account is inactive

---

#### auth.me
**Input:** None

**Output:** Current user object

---

### Tenants Router

#### tenants.list
**Authorization:** Super admin only

**Input:**
```typescript
{
  cursor?: string;
  limit?: number;
  type?: 'holding' | 'subsidiary';
}
```

**Output:**
```typescript
{
  items: Tenant[];
  nextCursor?: string;
}
```

---

#### tenants.create
**Authorization:** Super admin only

**Input:**
```typescript
{
  name: string;
  slug: string;
  type: 'holding' | 'subsidiary';
  parentTenantId?: string;
  quotaMaxAssistants?: number;
  quotaMaxUsers?: number;
  quotaMonthlyCostLimit?: number;
}
```

**Validation:**
- `slug`: Unique, URL-safe
- `parentTenantId`: Required if type is 'subsidiary'
- `quotaMaxAssistants`: Min 1, max 1000

---

### Assistants Router

#### assistants.list
**Authorization:** Tenant-scoped

**Input:**
```typescript
{
  cursor?: string;
  limit?: number;
  status?: 'active' | 'inactive' | 'suspended' | 'error';
  type?: string;
}
```

**Output:**
```typescript
{
  items: {
    id: string;
    name: string;
    slug: string;
    type: string;
    status: string;
    riskTier: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
  nextCursor?: string;
}
```

---

#### assistants.create
**Authorization:** Admin or manager

**Input:**
```typescript
{
  name: string;
  slug: string;
  description?: string;
  type: string;
  configuration?: Record<string, unknown>;
  capabilities?: string[];
  modelConfig?: {
    provider: 'openai' | 'anthropic' | 'openrouter' | 'local';
    model: string;
  };
  riskTier?: number;
  maxCostPerDay?: number;
}
```

**Validation:**
- `slug`: Unique within tenant
- `riskTier`: 0-5
- `maxCostPerDay`: Positive decimal

**Errors:**
- `DUPLICATE_SLUG`: Assistant slug already exists
- `QUOTA_EXCEEDED`: Tenant assistant limit reached

---

#### assistants.getById
**Input:** `{ id: string }`

**Output:** Full assistant object with configuration

---

#### assistants.update
**Input:**
```typescript
{
  id: string;
  name?: string;
  description?: string;
  configuration?: Record<string, unknown>;
  capabilities?: string[];
  modelConfig?: {
    provider: string;
    model: string;
  };
  riskTier?: number;
  maxCostPerDay?: number;
}
```

**Note:** Creates version history entry

---

#### assistants.activate / assistants.deactivate
**Input:** `{ id: string }`

**Authorization:** Admin or manager

---

### WorkItems Router

#### workItems.list
**Input:**
```typescript
{
  cursor?: string;
  limit?: number;
  status?: string;
  assistantId?: string;
  priority?: number;
}
```

---

#### workItems.create
**Authorization:** System (from Host Runtime) or Admin

**Input:**
```typescript
{
  assistantId: string;
  title: string;
  description?: string;
  riskLevel: number;
  context?: Record<string, unknown>;
  dueAt?: Date;
}
```

**Behavior:**
- L0-L1: Auto-create and queue
- L2-L5: Create approval request first

---

#### workItems.updateStatus
**Authorization:** System (Host Runtime) or assigned user

**Input:**
```typescript
{
  id: string;
  status: 'backlog' | 'in_progress' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled';
  result?: Record<string, unknown>;
  actualCost?: number;
}
```

---

### Approvals Router

#### approvals.listPending
**Input:**
```typescript
{
  cursor?: string;
  limit?: number;
}
```

**Output:** Approvals awaiting current user's action

---

#### approvals.listMyRequests
**Output:** Approvals requested by current user

---

#### approvals.approve
**Input:**
```typescript
{
  id: string;
  notes?: string;
}
```

**Authorization:** Must be in approver_ids list or have delegation

**Behavior:**
- Updates approval status
- Creates audit log entry
- If L2-L3: Queues work item for execution
- If L4-L5: Escalates to next approver

---

#### approvals.reject
**Input:**
```typescript
{
  id: string;
  reason: string;
}
```

**Behavior:**
- Updates approval status to 'rejected'
- Notifies requesting assistant
- Creates audit log entry

---

#### approvals.delegate
**Authorization:** Admin only

**Input:**
```typescript
{
  approvalId: string;
  delegateToUserId: string;
  expiresAt: Date;
  reason: string;
}
```

---

### Audit Router

#### audit.query
**Authorization:** Admin or auditor role

**Input:**
```typescript
{
  startDate: Date;
  endDate: Date;
  actorType?: 'user' | 'assistant' | 'system';
  actorId?: string;
  action?: string;
  entityType?: string;
  limit?: number;
  cursor?: string;
}
```

**Output:**
```typescript
{
  items: {
    id: string;
    timestamp: Date;
    actorType: string;
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    beforeState?: Record<string, unknown>;
    afterState?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }[];
  nextCursor?: string;
}
```

---

#### audit.export
**Input:**
```typescript
{
  startDate: Date;
  endDate: Date;
  format: 'json' | 'csv';
}
```

**Output:** Download URL for exported file

---

### Costs Router

#### costs.getCurrentSpend
**Authorization:** Admin or manager

**Input:**
```typescript
{
  period: 'day' | 'week' | 'month';
  assistantId?: string;
}
```

**Output:**
```typescript
{
  total: number;
  byProvider: Record<string, number>;
  byAssistant: Record<string, number>;
  trend: 'up' | 'down' | 'stable';
  projection: number;  // Month-end projection
}
```

---

#### costs.getPools
**Output:**
```typescript
{
  pools: {
    provider: string;
    monthlyBudget: number;
    currentBalance: number;
    percentUsed: number;
    alertStatus: 'green' | 'yellow' | 'orange' | 'red';
  }[];
}
```

---

#### costs.updatePool
**Authorization:** Super admin only

**Input:**
```typescript
{
  tenantId: string;
  provider: string;
  monthlyBudget: number;
}
```

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `CONFLICT` | 409 | Resource already exists |
| `QUOTA_EXCEEDED` | 429 | Tenant limit reached |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Response Format

```typescript
{
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

---

## Rate Limiting

### Limits by Role

| Role | Requests/Minute | Burst |
|------|-----------------|-------|
| Viewer | 30 | 10 |
| Operator | 60 | 20 |
| Manager | 120 | 40 |
| Admin | 300 | 100 |
| Super Admin | 600 | 200 |

### Implementation

```typescript
// Redis-based rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'awgp_rate_limit',
  points: 60,  // Requests
  duration: 60, // Per minute
});
```

### Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1707158400
```

---

## Webhook Endpoints (REST)

### POST /api/v1/webhooks/n8n
**Purpose:** Receive N8N workflow completions

**Authentication:** HMAC signature

**Input:**
```json
{
  "workflowId": "string",
  "executionId": "string",
  "status": "success" | "error",
  "output": {},
  "timestamp": "2026-02-05T12:00:00Z"
}
```

### POST /api/v1/webhooks/telegram
**Purpose:** Receive Telegram bot messages

**Authentication:** Bot token verification

**Input:** Standard Telegram Update object

---

*End of Document*
