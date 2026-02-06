# AWGP Architecture Diagrams

**Document Version:** 1.0  
**Last Updated:** 2026-02-05  
**Author:** Anastasia  
**Status:** Finalized for v1.0

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Security Architecture](#security-architecture)
5. [Deployment Architecture](#deployment-architecture)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ACCESS LAYER                                    │
│  Keycloak (Identity) + Teleport (Infrastructure Access)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                              CONTROL PLANE                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   React      │  │   Fastify    │  │  PostgreSQL  │  │    Redis     │    │
│  │   Dashboard  │  │   API        │  │   Database   │  │    Cache     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│       (Web UI)         (REST/tRPC)       (Primary)        (Queue)          │
├─────────────────────────────────────────────────────────────────────────────┤
│                              HOST RUNTIME                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Docker Container → gVisor Sandbox → Go Binary → AI Agent           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Control Plane Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONTROL PLANE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         API LAYER (Fastify)                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  Assistant  │  │  Workflow   │  │   Audit     │  │   Tenant   │ │   │
│  │  │   Router    │  │   Router    │  │   Router    │  │   Router   │ │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │   │
│  │         │                │                │               │        │   │
│  │  ┌──────┴────────────────┴────────────────┴───────────────┴──────┐ │   │
│  │  │                     SERVICE LAYER                             │ │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │ │   │
│  │  │  │Assistant │ │ Workflow │ │  Audit   │ │   Cost/Provider  │ │ │   │
│  │  │  │ Service  │ │ Service  │ │ Service  │ │     Service      │ │ │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      DATA LAYER (Prisma)                            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │   │
│  │  │Assistant │ │  Task/   │ │  Audit   │ │   User/  │              │   │
│  │  │   Model  │ │ WorkItem │ │   Log    │ │  Tenant  │              │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL INTEGRATIONS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   Keycloak   │    │   Teleport   │    │     N8N      │                  │
│  │   (Auth)     │    │   (SSH/Infra)│    │ (Automation) │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                    │                    │                         │
│         │    ┌───────────────┴────────────────────┘                         │
│         │    │                                                               │
│         │    ▼                                                               │
│  ┌──────┴────┴──────────────────────────────────────────────────────────┐   │
│  │                           CONTROL PLANE API                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   Qdrant     │    │   Telegram   │    │   OpenRouter │                  │
│  │  (Vector DB) │    │    (Comms)   │    │  (LLM API)   │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Assistant Task Execution Flow

```
User/Owner                    Control Plane                    Host Runtime
    │                              │                                │
    │  1. Create WorkItem          │                                │
    │─────────────────────────────>│                                │
    │                              │                                │
    │                              │  2. Risk Assessment            │
    │                              │  (Auto: L0-L1, Queue: L2-L5)   │
    │                              │                                │
    │                              │  3. Check Approval Required    │
    │                              │                                │
    │  4. Approval Request         │                                │
    │<─────────────────────────────│                                │
    │                              │                                │
    │  5. Approve                  │                                │
    │─────────────────────────────>│                                │
    │                              │                                │
    │                              │  6. Queue for Execution        │
    │                              │────────────┬───────────────────│
    │                              │            │                   │
    │                              │            │  7. Claim Task    │
    │                              │            │<──────────────────│
    │                              │            │                   │
    │                              │            │  8. Execute in    │
    │                              │            │     gVisor        │
    │                              │            │                   │
    │                              │            │  9. Stream Logs   │
    │                              │<───────────┼───────────────────│
    │  10. Real-time Updates       │                                │
    │<─────────────────────────────│                                │
    │                              │                                │
    │                              │  11. Complete & Audit          │
    │                              │                                │
```

### Approval Workflow Flow

```
Assistant                      System                        Human Approver
    │                            │                                 │
    │  1. Request Action (L3)    │                                 │
    │───────────────────────────>│                                 │
    │                            │                                 │
    │                            │  2. Create Approval Request     │
    │                            │                                 │
    │                            │  3. Notify Approvers            │
    │                            │────────────────────────────────>│
    │                            │                                 │
    │                            │  4. Review Context              │
    │                            │<────────────────────────────────│
    │                            │                                 │
    │                            │  5. Approve/Reject              │
    │                            │<────────────────────────────────│
    │                            │                                 │
    │                            │  6. Log Decision                │
    │                            │                                 │
    │  7. Proceed or Halt        │                                 │
    │<───────────────────────────│                                 │
```

### Cost Tracking Flow

```
Host Runtime                Control Plane               Provider API
    │                            │                            │
    │  1. LLM Request            │                            │
    │───────────────────────────>│                            │
    │                            │                            │
    │                            │  2. Pre-flight Cost Check  │
    │                            │  (Quota, Limit, Pool)      │
    │                            │                            │
    │                            │  3. Forward Request        │
    │                            │───────────────────────────>│
    │                            │                            │
    │                            │  4. Response + Token Usage │
    │                            │<───────────────────────────│
    │                            │                            │
    │                            │  5. Record Cost            │
    │                            │  (Assistant/Tenant/Total)  │
    │                            │                            │
    │  6. Return Result          │                            │
    │<───────────────────────────│                            │
    │                            │                            │
    │                            │  7. Check Thresholds       │
    │                            │  (Alert if needed)         │
```

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Layer 1: NETWORK                                                           │
│  ├─ Firewall (Traefik)                                                      │
│  ├─ DDoS protection                                                         │
│  ├─ IP allowlisting (optional)                                              │
│  └─ TLS 1.3 everywhere                                                      │
│                                                                             │
│  Layer 2: IDENTITY                                                          │
│  ├─ Keycloak (OIDC/SAML)                                                    │
│  ├─ Multi-factor authentication                                             │
│  ├─ Session management                                                      │
│  └─ Teleport (certificate-based infrastructure access)                      │
│                                                                             │
│  Layer 3: APPLICATION                                                       │
│  ├─ RBAC (Role-based access control)                                        │
│  ├─ Rate limiting                                                           │
│  ├─ Input validation                                                        │
│  └─ CORS policies                                                           │
│                                                                             │
│  Layer 4: DATA                                                              │
│  ├─ PostgreSQL RLS (Row-Level Security)                                     │
│  ├─ Encryption at rest                                                      │
│  ├─ Encrypted backups                                                       │
│  └─ Audit logging                                                           │
│                                                                             │
│  Layer 5: EXECUTION                                                         │
│  ├─ gVisor sandbox                                                          │
│  ├─ Seccomp profiles                                                        │
│  ├─ No network egress from sandbox                                          │
│  └─ Resource limits (CPU/memory)                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tenant Isolation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TENANT ISOLATION MODEL                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Holdings Company (Tenant: holding-corp)                                    │
│  ├─ Can view all subsidiary data                                            │
│  ├─ Can manage global policies                                              │
│  └─ Can approve L4-L5 actions                                               │
│                                                                             │
│  ├── Subsidiary A (Tenant: sub-a)                                           │
│  │   ├─ Isolated database via RLS                                           │
│  │   ├─ Isolated Redis namespace                                            │
│  │   ├─ Isolated Host Runtime instances                                     │
│  │   └─ Cannot access Subsidiary B data                                     │
│  │                                                                          │
│  └── Subsidiary B (Tenant: sub-b)                                           │
│      ├─ Isolated database via RLS                                           │
│      ├─ Isolated Redis namespace                                            │
│      ├─ Isolated Host Runtime instances                                     │
│      └─ Cannot access Subsidiary A data                                     │
│                                                                             │
│  RLS Policy: WHERE tenant_id = current_setting('app.current_tenant')        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Docker Compose Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DOCKER NETWORK (awgp)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Traefik (Reverse Proxy)                                            │   │
│  │  ├─ Routes: awgp.local → awgp-web                                   │   │
│  │  ├─ Routes: api.awgp.local → awgp-api                               │   │
│  │  └─ SSL: Auto HTTPS                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│  ┌────────────────────────────────┐ │ ┌────────────────────────────────┐    │
│  │  awgp-web (React/Vite)         │ │ │  awgp-api (Fastify)            │    │
│  │  ├─ Port: 3000                 │ │ │  ├─ Port: 4000                 │    │
│  │  ├─ Static files               │ │ │  ├─ tRPC endpoints             │    │
│  │  └─ Health check               │ │ │  └─ REST webhooks              │    │
│  └────────────────────────────────┘ │ └────────────────────────────────┘    │
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 16                                                      │   │
│  │  ├─ Port: 5432                                                      │   │
│  │  ├─ RLS enabled                                                     │   │
│  │  └─ TimescaleDB extension                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Redis 7                                                            │   │
│  │  ├─ Port: 6379                                                      │   │
│  │  ├─ Cache                                                           │   │
│  │  └─ Pub/Sub                                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Host Runtime Pool (Go + gVisor)                                    │   │
│  │  ├─ Dynamic container creation                                      │   │
│  │  ├─ Seccomp profiles                                                │   │
│  │  └─ No external network                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  External: Keycloak, Teleport, N8N, Qdrant (existing Docker network)      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Scaling Considerations

```
Current (Single Node):
└── Docker Compose on single server
    ├── All services on one host
    └── PostgreSQL single instance

Scale Phase 1 (Multiple Host Runtimes):
└── Docker Swarm or k3s
    ├── Multiple Host Runtime workers
    ├── Load balancer for API
    └── Shared PostgreSQL

Scale Phase 2 (HA Database):
└── PostgreSQL primary-replica
    ├── Read replicas for queries
    ├── Connection pooling (PgBouncer)
    └── Automated failover

Scale Phase 3 (Multi-Region):
└── Kubernetes multi-cluster
    ├── Regional deployments
    ├── Global load balancing
    └── Cross-region replication
```

---

*End of Document*
