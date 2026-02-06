# AWGP Docker Configuration

**Document Version:** 1.0  
**Last Updated:** 2026-02-06  
**Author:** Anastasia  
**Status:** Ready for deployment

---

## Table of Contents

1. [Overview](#overview)
2. [Network Architecture](#network-architecture)
3. [Services](#services)
4. [Environment Variables](#environment-variables)
5. [Volume Management](#volume-management)
6. [Health Checks](#health-checks)
7. [Deployment](#deployment)

---

## Overview

This Docker Compose configuration orchestrates the entire AWGP stack:
- **Existing services** (already running): PostgreSQL, Redis, Keycloak, Traefik, Qdrant, etc.
- **New AWGP services**: API, Web, Host Runtime

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL NETWORK (Internet)                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    traefik-public (Reverse Proxy)                    │
│  Routes: awgp.local → web                                          │
│          api.awgp.local → api                                      │
│          auth.awgp.local → keycloak                                │
└─────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────────────┐
│   awgp-web    │   │   awgp-api    │   │   awgp-host-runtime   │
│   (React)     │   │   (Fastify)   │   │   (Go + gVisor)       │
└───────┬───────┘   └───────┬───────┘   └───────────┬───────────┘
        │                     │                       │
        └─────────────────────┼───────────────────────┘
                              │
┌─────────────────────────────┴─────────────────────────────────────┐
│                    awgp-internal (Isolated)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │ Postgres │  │  Redis   │  │ Keycloak │  │     Qdrant      │  │
│  │ (shared) │  │ (shared) │  │ (shared) │  │    (shared)     │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Services

### docker-compose.yml

```yaml
version: '3.8'

# ========================================================================
# NETWORKS
# ========================================================================
networks:
  # Public-facing network (Traefik routes here)
  traefik-public:
    external: true
    name: traefik-public
  
  # Internal AWGP network (isolated services)
  awgp-internal:
    driver: bridge
    name: awgp-internal

# ========================================================================
# VOLUMES
# ========================================================================
volumes:
  # AWGP API data
  awgp-api-data:
    driver: local
  
  # AWGP Web build cache
  awgp-web-cache:
    driver: local
  
  # Host runtime (ephemeral - no persistence)
  # Note: Host Runtime is stateless by design

# ========================================================================
# SERVICES
# ========================================================================
services:

  # =====================================================================
  # AWGP API (Fastify + tRPC)
  # =====================================================================
  awgp-api:
    container_name: awgp-api
    build:
      context: ./apps/api
      dockerfile: Dockerfile
      target: production  # Multi-stage build
      args:
        - NODE_ENV=production
    restart: unless-stopped
    
    networks:
      - traefik-public
      - awgp-internal
    
    environment:
      # Node.js
      - NODE_ENV=production
      - PORT=4000
      
      # Database
      - DATABASE_URL=postgresql://${DB_USER:-awgp}:${DB_PASSWORD:-changeme}@postgres:5432/awgp
      
      # Redis
      - REDIS_URL=redis://redis:6379
      
      # Keycloak
      - KEYCLOAK_URL=http://keycloak:8080
      - KEYCLOAK_REALM=awgp
      - KEYCLOAK_CLIENT_ID=awgp-api
      - KEYCLOAK_CLIENT_SECRET=${KEYCLOAK_CLIENT_SECRET}
      
      # JWT
      - JWT_SECRET=${JWT_SECRET}
      
      # Teleport (when available)
      - TELEPORT_PROXY_URL=${TELEPORT_PROXY_URL:-}
      
      # Cost Tracking
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY:-}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
    
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
    # Labels for Traefik routing
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-public"
      - "traefik.http.routers.awgp-api.rule=Host(`api.awgp.local`)"
      - "traefik.http.routers.awgp-api.tls=true"
      - "traefik.http.routers.awgp-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.awgp-api.loadbalancer.server.port=4000"
      - "traefik.http.middlewares.awgp-api-ratelimit.ratelimit.average=100"
      - "traefik.http.middlewares.awgp-api-ratelimit.ratelimit.burst=50"
      - "traefik.http.routers.awgp-api.middlewares=awgp-api-ratelimit"
    
    # Secrets (use Docker secrets in production)
    # secrets:
    #   - db_password
    #   - jwt_secret
    #   - keycloak_client_secret

  # =====================================================================
  # AWGP Web (React + Vite)
  # =====================================================================
  awgp-web:
    container_name: awgp-web
    build:
      context: ./apps/web
      dockerfile: Dockerfile
      target: production
      args:
        - NODE_ENV=production
        - VITE_API_URL=https://api.awgp.local
    restart: unless-stopped
    
    networks:
      - traefik-public
    
    environment:
      - NODE_ENV=production
      - VITE_API_URL=https://api.awgp.local
      - VITE_KEYCLOAK_URL=https://auth.awgp.local
    
    depends_on:
      - awgp-api
    
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-public"
      - "traefik.http.routers.awgp-web.rule=Host(`awgp.local`)"
      - "traefik.http.routers.awgp-web.tls=true"
      - "traefik.http.routers.awgp-web.tls.certresolver=letsencrypt"
      - "traefik.http.services.awgp-web.loadbalancer.server.port=80"

  # =====================================================================
  # AWGP Host Runtime (Go + gVisor)
  # =====================================================================
  awgp-host-runtime:
    container_name: awgp-host-runtime
    build:
      context: ./host-runtime
      dockerfile: Dockerfile
      target: production
    restart: unless-stopped
    
    # Privileged required for gVisor sandbox
    privileged: true
    
    networks:
      # NOTE: NO external network access
      # Only internal communication with API
      - awgp-internal
    
    # NO external ports exposed
    # All communication via internal network
    
    environment:
      # API endpoint (internal only)
      - API_URL=http://awgp-api:4000
      
      # Sandbox configuration
      - SANDBOX_TYPE=gvisor
      - MAX_MEMORY_MB=512
      - MAX_CPU_PERCENT=50
      - MAX_EXECUTION_TIME=300  # 5 minutes
      
      # Logging
      - LOG_LEVEL=info
      - LOG_FORMAT=json
    
    # Security: Read-only root filesystem
    read_only: true
    
    # Security: No new privileges
    security_opt:
      - no-new-privileges:true
    
    # Security: Resource limits
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
    
    # Health check
    healthcheck:
      test: ["CMD", "/app/healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # =====================================================================
  # SHARED SERVICES (Already Running)
  # =====================================================================
  
  # NOTE: The following services are assumed to be running
  # in your existing Docker setup. They connect to awgp-internal network.
  
  # postgres:
  #   external: true
  #   networks:
  #     - awgp-internal
  
  # redis:
  #   external: true
  #   networks:
  #     - awgp-internal
  
  # keycloak:
  #   external: true
  #   networks:
  #     - traefik-public
  #     - awgp-internal

# =====================================================================
# SECRETS (Production only)
# =====================================================================
# secrets:
#   db_password:
#     external: true
#   jwt_secret:
#     external: true
#   keycloak_client_secret:
#     external: true
```

---

## Environment Variables

### Complete `.env.example` File

Create this file as `.env` in your project root:

```bash
# =============================================================================
# AWGP ENVIRONMENT CONFIGURATION
# =============================================================================
# Copy this file to .env and fill in your actual values
# DO NOT commit .env to git (it's in .gitignore)

# =============================================================================
# INFRASTRUCTURE (Existing Services)
# =============================================================================

# PostgreSQL Database (Required)
# Your existing PostgreSQL server
DB_HOST=postgres
DB_PORT=5432
DB_USER=awgp
DB_PASSWORD=changeme_secure_password_here
DB_NAME=awgp
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# Redis Cache (Required)
# Your existing Redis server
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=changeme_secure_redis_password
REDIS_URL=redis://${REDIS_HOST}:${REDIS_PORT}

# Keycloak Identity (Required)
# Your existing Keycloak server
KEYCLOAK_HOST=keycloak
KEYCLOAK_PORT=8080
KEYCLOAK_URL=http://${KEYCLOAK_HOST}:${KEYCLOAK_PORT}
KEYCLOAK_REALM=awgp
KEYCLOAK_CLIENT_ID=awgp-api
KEYCLOAK_CLIENT_SECRET=your_keycloak_client_secret_here

# Teleport (Optional - for infrastructure access)
TELEPORT_PROXY_URL=https://teleport.yourdomain.com:3080
TELEPORT_APP_TOKEN=your_teleport_app_token_here

# Qdrant Vector DB (Optional - for assistant memory)
QDRANT_HOST=qdrant
QDRANT_PORT=6333
QDRANT_URL=http://${QDRANT_HOST}:${QDRANT_PORT}

# =============================================================================
# AWGP APPLICATION
# =============================================================================

# Node Environment (Required)
NODE_ENV=production

# API Server (Required)
API_PORT=4000
API_HOST=0.0.0.0
API_URL=http://localhost:${API_PORT}

# Web Frontend (Required)
WEB_PORT=3000
VITE_API_URL=https://api.awgp.local
VITE_KEYCLOAK_URL=https://auth.awgp.local

# JWT Configuration (Required)
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# =============================================================================
# API PROVIDERS (At least one required)
# =============================================================================

# OpenRouter (Recommended - multi-provider)
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key-here

# OpenAI Direct (Optional)
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_ORG_ID=org-your-org-id

# Anthropic (Optional)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Local Model (Optional)
LOCAL_MODEL_URL=http://localhost:1234/v1
LOCAL_MODEL_KEY=your-local-model-key

# =============================================================================
# COST MANAGEMENT
# =============================================================================

# Monthly budgets per provider (default in USD)
OPENROUTER_MONTHLY_BUDGET=5000
OPENAI_MONTHLY_BUDGET=3000
ANTHROPIC_MONTHLY_BUDGET=2000
LOCAL_MONTHLY_BUDGET=500

# Alert thresholds
COST_ALERT_THRESHOLD_50=true
COST_ALERT_THRESHOLD_75=true
COST_ALERT_THRESHOLD_90=true
COST_ALERT_THRESHOLD_95=true

# =============================================================================
# SECURITY
# =============================================================================

# Rate limiting (requests per minute)
RATE_LIMIT_GENERAL=100
RATE_LIMIT_COSTLY=20
RATE_LIMIT_AUTH=5

# CORS (comma-separated origins)
CORS_ORIGINS=https://awgp.local,https://api.awgp.local

# Encryption
ENCRYPTION_KEY=your_32_byte_encryption_key_here

# =============================================================================
# HOST RUNTIME (Sandbox)
# =============================================================================

# Sandbox configuration
SANDBOX_TYPE=gvisor
SANDBOX_TIMEOUT=300
MAX_MEMORY_MB=512
MAX_CPU_PERCENT=50

# =============================================================================
# LOGGING
# =============================================================================

LOG_LEVEL=info
LOG_FORMAT=json
LOG_RETENTION_DAYS=30

# =============================================================================
# FEATURE FLAGS (Optional)
# =============================================================================

ENABLE_TELEPORT_INTEGRATION=false
ENABLE_N8N_INTEGRATION=true
ENABLE_SLACK_NOTIFICATIONS=false
ENABLE_EMAIL_NOTIFICATIONS=true

# =============================================================================
# DEVELOPMENT (Override in .env.local for dev)
# =============================================================================

# DEBUG=true
# LOG_LEVEL=debug
# NODE_ENV=development

---

## Volume Management

### Data Persistence

| Service | Volume | Persistence |
|---------|--------|-------------|
| awgp-api | `awgp-api-data` | Logs, temp files |
| awgp-web | `awgp-web-cache` | Build cache only |
| awgp-host-runtime | None | Stateless, ephemeral |

### Backup Strategy

```bash
# Backup API data
docker run --rm -v awgp-api-data:/data -v $(pwd):/backup alpine tar czf /backup/awgp-api-backup.tar.gz -C /data .

# Restore
docker run --rm -v awgp-api-data:/data -v $(pwd):/backup alpine tar xzf /backup/awgp-api-backup.tar.gz -C /data
```

---

## Health Checks

### Service Dependencies

```
awgp-web
  ↓ (depends on)
awgp-api
  ↓ (depends on)
postgres, redis, keycloak
```

### Monitoring Endpoints

| Service | Health Endpoint | Expected Response |
|---------|-----------------|-------------------|
| awgp-web | `/health` | `HTTP 200 OK` |
| awgp-api | `/health` | `HTTP 200 OK` |
| awgp-host-runtime | `/healthcheck` | Exit code 0 |

---

## Deployment

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/talos-contractor/AI-Workforce-Governance-Platform.git
cd AI-Workforce-Governance-Platform

# 2. Create environment file
cp .env.example .env
# Edit .env with your values

# 3. Build and start
mkdir -p apps/api apps/web host-runtime
docker-compose up -d --build

# 4. Run database migrations
docker-compose exec awgp-api npx prisma migrate deploy

# 5. Seed initial data (optional)
docker-compose exec awgp-api npx prisma db seed

# 6. Verify all services
./scripts/health-check.sh
```

### Update Deployment

```bash
# Pull latest
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f awgp-api
```

### Stop Services

```bash
# Graceful stop
docker-compose stop

# Remove containers (keeps volumes)
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs awgp-api

# Check health
docker inspect --format='{{.State.Health}}' awgp-api

# Restart with debug
docker-compose stop awgp-api
docker-compose run --rm awgp-api sh
```

### Can't connect to database

```bash
# Verify network
docker network inspect awgp-internal

# Test connection
docker run --rm --network awgp-internal postgres psql -h postgres -U awgp -c "SELECT 1"
```

### Host Runtime security

```bash
# Verify no external network access
docker exec awgp-host-runtime wget -qO- https://google.com
# Should FAIL (no route to host)

# Verify API communication works
docker exec awgp-host-runtime wget -qO- http://awgp-api:4000/health
# Should SUCCEED
```

---

## Security Notes

1. **Host Runtime**: No external network access, privileged for gVisor only
2. **API**: Rate limited, CORS configured, JWT required
3. **Secrets**: Use Docker secrets or external vault (not env vars in production)
4. **Volumes**: Encrypted volumes for sensitive data
5. **Updates**: Pin image versions, scan containers

---

## Roadmap

**Phase 1 (MVP):**
- Single node deployment
- Manual scaling
- Volumes on host filesystem

**Phase 2 (Scale):**
- Docker Swarm or k3s
- External NFS/Ceph storage
- Auto-scaling host runtimes

**Phase 3 (Cloud):**
- Kubernetes manifests
- Helm charts
- Multi-region deployment

---

*End of Document*
