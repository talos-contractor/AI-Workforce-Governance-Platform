# AWGP Technical Stack

**Document Version:** 1.0  
**Last Updated:** 2026-02-05  
**Author:** Anastasia  
**Status:** Finalized

---

## Table of Contents

1. [Stack Overview](#stack-overview)
2. [Infrastructure Layer](#infrastructure-layer)
3. [Control Plane](#control-plane)
4. [Host Runtime](#host-runtime)
5. [Integration Points](#integration-points)
6. [Security Architecture](#security-architecture)
7. [Deployment Model](#deployment-model)
8. [Decision Rationale](#decision-rationale)

---

## Stack Overview

AWGP is built on a **security-first, open-source foundation** designed for holding companies managing multiple subsidiaries. The architecture enforces strict tenant isolation, immutable audit trails, and human-in-the-loop approval for all AI actions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ACCESS LAYER                                    │
│  Keycloak (Identity) + Teleport (Infrastructure Access)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                              CONTROL PLANE                                   │
│  React + TypeScript Dashboard  │  Fastify + tRPC API  │  PostgreSQL + Redis │
├─────────────────────────────────────────────────────────────────────────────┤
│                              HOST RUNTIME                                    │
│  Go + gVisor Sandbox (AI Agent Execution)                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Layer

### Container Orchestration

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Container Runtime** | Docker | Application containerization |
| **Reverse Proxy** | Traefik | SSL termination, routing, load balancing |
| **Container Management** | Arcane | Lightweight health monitoring and management |

**Why Docker + Traefik:**
- Already operational in your environment
- Traefik's dynamic configuration integrates with Docker labels
- No additional complexity (Kubernetes) needed for initial deployment

---

### Authentication & Authorization

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Identity Provider** | Keycloak | Human authentication, SSO, RBAC |
| **Infrastructure Access** | Teleport | Certificate-based SSH, session recording |

**Keycloak Configuration:**
```yaml
Realm: awgp-holding
Authentication: OIDC/OAuth2 + SAML (future)
Authorization: Role-based + Attribute-based
Multi-tenancy: Organization groups per subsidiary
```

**Keycloak Role Structure:**
```
holding-admins          # Cross-subsidiary visibility
├── sub-a-admins        # Subsidiary A management
├── sub-a-operators     # Subsidiary A operators
├── sub-b-admins        # Subsidiary B management
└── sub-b-operators     # Subsidiary B operators
```

**Why Keycloak:**
- Open source (Apache 2.0)
- Enterprise-grade features (SAML, LDAP, social login)
- Multi-tenant organization support
- Fine-grained authorization policies
- Already installed in your Docker environment

**Teleport Integration:**
- Replaces static SSH keys with short-lived certificates
- Records all infrastructure sessions for audit
- Integrates with Keycloak for identity
- Enforces access policies at the infrastructure layer

---

### Supporting Services

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Cache & Queue** | Redis | Sessions, rate limiting, pub/sub, job queues |
| **Vector Database** | Qdrant | AI assistant memory, RAG, semantic search |
| **Workflow Engine** | N8N | Human-designed automation workflows |
| **Document Management** | PaperlessNGX | Document storage and OCR |
| **File Storage** | Nextcloud | Secure file sharing and collaboration |

**Why These Services:**
- All already operational in your environment
- Open source with active communities
- Docker-native deployment
- No vendor lock-in

---

## Control Plane

The Control Plane is the **brain** of AWGP—managing assistants, enforcing policies, processing approvals, and maintaining audit trails.

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Framework** | React 18 | UI component library |
| **Build Tool** | Vite | Fast development, optimized production builds |
| **Language** | TypeScript (strict) | Type safety, IDE support, maintainability |
| **Styling** | TailwindCSS | Utility-first CSS, rapid UI development |
| **Components** | shadcn/ui | Accessible, customizable component primitives |

**Why React + Vite (not Next.js):**
- Simpler deployment (static files vs. server runtime)
- No framework lock-in
- Full control over build process
- Easier to audit (smaller attack surface)
- Already familiar to your team

**Why shadcn/ui (not MUI or Ant Design):**
- Built on Radix UI primitives (accessibility first)
- Copy-paste customization (no theming wars)
- Tailwind-native (consistent with styling choice)
- No runtime dependency (tree-shakeable)

---

### Backend API

| Technology | Version | Purpose |
|------------|---------|---------|
| **Runtime** | Node.js LTS | JavaScript/TypeScript execution |
| **Framework** | Fastify | High-performance HTTP server |
| **API Protocol** | tRPC | End-to-end type safety |
| **Validation** | Zod | Runtime type checking |
| **ORM** | Prisma | Database access, migrations |

**Why Fastify (not Express):**
- 2x faster request handling
- Native JSON schema validation
- Lower memory footprint
- Better async/await support
- Built-in plugin architecture

**Why tRPC (not REST or GraphQL):**
- Type safety from database to UI
- No API contract drift
- Automatic client generation
- Built-in request batching
- Perfect for internal APIs

**Why Prisma:**
- Type-safe database queries
- Excellent migration system
- PostgreSQL-specific optimizations
- Row-Level Security support

---

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **Primary** | PostgreSQL 16 | ACID-compliant relational data |
| **Extensions** | TimescaleDB | Time-series audit logs |
| **Migrations** | Prisma Migrate | Schema versioning |

**Schema Design:**
- All tables include `tenant_id` (UUID, NOT NULL)
- Row-Level Security (RLS) enforced on all tables
- Audit logs: append-only, partitioned by time
- JSONB for flexible assistant configurations

**Multi-Tenancy Strategy:**
```sql
-- Tenant isolation at database level
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON assistants
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

**Why PostgreSQL:**
- ACID compliance (required for audit trails)
- Row-Level Security (database-enforced isolation)
- JSONB for semi-structured data
- TimescaleDB extension for audit retention
- Already operational in your environment

---

### Real-Time Communication

| Technology | Purpose |
|------------|---------|
| **Primary** | Socket.io | Bidirectional events, fallback support |
| **Adapter** | Redis | Multi-instance scaling |

**Use Cases:**
- Assistant status updates
- Workflow progress notifications
- Approval request alerts
- Audit log streaming (admin view)

---

## Host Runtime

The Host Runtime is the **muscle**—sandboxed execution environment where AI agents run.

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Language** | Go 1.21+ | Static binary, memory safety, performance |
| **Sandbox** | gVisor | User-space kernel, syscall interception |
| **Orchestration** | Docker | Container lifecycle management |

**Host Runtime Responsibilities:**
1. Receive agent code bundles from Control Plane
2. Execute in gVisor sandbox
3. Enforce allowlist policy (syscalls, network, filesystem)
4. Stream telemetry to Control Plane
5. Report completion or failure

**Why Go (not Python, Node.js, or Rust):**

| Factor | Python/Node | Go | Rust |
|--------|-------------|----|----|
| Memory safety | Runtime errors possible | GC prevents leaks | Compile-time guarantees |
| Sandbox escape risk | High (dynamic execution) | Low (static binary) | Low (static binary) |
| Startup time | 500ms+ | 10-50ms | 10-50ms |
| Binary size | 50-200MB | 10-20MB | 5-15MB |
| Hiring availability | High | High | Medium |
| Learning curve | Low | Medium | High |

**Decision:** Go provides the best balance of safety, performance, and team velocity.

**Why gVisor (not Firecracker or raw containers):**
- User-space kernel (prevents host kernel exploitation)
- Google-maintained (battle-tested in production)
- Docker-compatible (easy integration)
- Simpler than Firecracker (no VM management)

---

## Integration Points

### N8N (Automation)

**Integration Pattern:**
```
AWGP Control Plane (decides) 
    → Calls N8N webhook (executes)
    → Receives result (audits)
```

**Use Cases:**
- Post-approval actions (email notifications, CRM updates)
- Scheduled report generation
- External API integrations (QuickBooks, Slack)

**Why N8N:**
- Visual workflow builder for non-developers
- 400+ community integrations
- Self-hosted (data stays in your environment)
- Already operational

---

### Qdrant (Vector Database)

**Integration Pattern:**
```
Host Runtime (AI Agent)
    → Queries Qdrant (RAG/memory)
    → Receives context
    → Generates response
```

**Use Cases:**
- Assistant long-term memory
- Document semantic search
- Knowledge base retrieval

**Why Qdrant:**
- Open source (Apache 2.0)
- Rust-based (performance)
- Docker-native
- Already operational

---

### Teleport (Infrastructure Access)

**Integration Pattern:**
```
AWGP Control Plane
    → Requests Teleport certificate
    → Teleport issues short-lived cert
    → Agent accesses infrastructure (recorded)
```

**Use Cases:**
- Server command execution
- Database access
- Kubernetes operations

**Why Teleport:**
- Replaces SSH keys (security improvement)
- Session recording (compliance requirement)
- Short-lived certificates (no long-lived secrets)
- Integrates with Keycloak

---

## Security Architecture

### Defense in Depth

```
Layer 1: Network (Teleport certificates, firewall rules)
Layer 2: Identity (Keycloak authentication)
Layer 3: Application (RBAC, rate limiting)
Layer 4: Database (RLS, encrypted at rest)
Layer 5: Audit (immutable logs, tamper detection)
```

### Secret Management

| Phase | Solution | Rationale |
|-------|----------|-----------|
| **Phase 1 (MVP)** | Keycloak client secrets + Docker secrets | Simple, no new infrastructure |
| **Phase 2 (Scale)** | HashiCorp Vault | Dynamic credentials, rotation, advanced audit |

### Audit Trail

**Requirements:**
- Append-only (no UPDATE/DELETE on audit_logs)
- Immutable (hash chain with tamper detection)
- Partitioned by time (TimescaleDB)
- Export to S3 for long-term retention

**Schema:**
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID NOT NULL,
    actor_type TEXT,  -- 'user', 'assistant', 'system'
    actor_id UUID,
    action TEXT,
    resource_type TEXT,
    resource_id UUID,
    before_state JSONB,
    after_state JSONB,
    metadata JSONB,
    integrity_hash TEXT,  -- SHA256 chain
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);
```

---

## Deployment Model

### Docker Compose Structure

```yaml
# Core AWGP services
services:
  awgp-api:
    build: ./apps/api
    environment:
      - DATABASE_URL=postgresql://.../awgp
      - REDIS_URL=redis://redis:6379
      - KEYCLOAK_URL=http://keycloak:8080
      - TELEPORT_PROXY=teleport:3080
    networks:
      - awgp
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.awgp-api.rule=Host(`api.awgp.local`)"

  awgp-web:
    build: ./apps/web
    environment:
      - API_URL=https://api.awgp.local
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.awgp-web.rule=Host(`awgp.local`)"

  host-runtime:
    build: ./host-runtime
    privileged: false
    security_opt:
      - seccomp:./host-runtime/seccomp.json
    networks:
      - awgp
```

### Environment Tiers

| Tier | Use Case | Infrastructure |
|------|----------|----------------|
| **Development** | Local development | Docker Compose on workstation |
| **Staging** | Pre-production testing | Digital Ocean Droplet |
| **Production** | Live holding company | Digital Ocean (or on-premise) |

---

## Decision Rationale

### Why Open Source?

- **Security:** Auditable codebase, no hidden backdoors
- **Compliance:** On-premise deployment for sensitive data
- **Control:** No vendor lock-in, customizable
- **Cost:** Predictable (infrastructure costs only)

### Why Not Cloud-Managed Services?

| Service Type | Concern |
|--------------|---------|
| **SaaS Auth (Clerk)** | Proprietary, not self-hostable |
| **SaaS Database (Supabase Cloud)** | Audit trail not fully controllable |
| **Cloud Secrets (AWS Secrets Manager)** | Vendor lock-in, egress costs |
| **Managed Kubernetes** | Overkill for initial deployment |

### Why Multi-Tenant by Design?

Even for single-company deployments, multi-tenant architecture provides:
- Consistent code path (no conditional logic)
- Future-proofing (easy to add subsidiaries later)
- Clean separation (test/staging/production as "tenants")
- Simplified testing (one framework covers all cases)

### Trade-offs Accepted

| Decision | Trade-off | Mitigation |
|----------|-----------|------------|
| Go (not Rust) | Less memory safety | gVisor sandbox, code review |
| React (not Next.js) | No server components | API routes in Fastify, SSR not needed for admin UI |
| Self-hosted (not SaaS) | Operational burden | Docker Compose, Arcane monitoring, runbooks |
| Keycloak (not simpler auth) | Complexity | Dedicated setup time, documentation |

---

## Future Considerations

### Phase 2 Additions
- HashiCorp Vault (dynamic secrets)
- Apache Kafka (event sourcing at scale)
- Prometheus + Grafana (advanced monitoring)
- Kubernetes (if container count exceeds 50)

### Scalability Thresholds
- **< 100 assistants:** Current architecture (Docker Compose)
- **100-1000 assistants:** Add Kubernetes, horizontal scaling
- **> 1000 assistants:** Microservices extraction, regional deployment

---

## Summary

AWGP uses a **proven, security-first stack** built entirely on open-source software:

- **Frontend:** React 18 + TypeScript + Tailwind + shadcn/ui
- **Backend:** Node.js + Fastify + tRPC + Prisma
- **Database:** PostgreSQL 16 + TimescaleDB + Redis
- **Auth:** Keycloak + Teleport
- **Host Runtime:** Go + gVisor
- **Infrastructure:** Docker + Traefik + Arcane

All components are **already operational** in your environment or **widely adopted** in production systems.

**No external dependencies. No vendor lock-in. Full audit capability.**

---

*End of Document*
