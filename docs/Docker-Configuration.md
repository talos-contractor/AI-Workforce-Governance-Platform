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

### Required `.env` file

```bash
# Database
DB_USER=awgp
DB_PASSWORD=your_secure_password_here
DB_NAME=awgp

# Redis
REDIS_PASSWORD=your_redis_password_here

# Keycloak
KEYCLOAK_CLIENT_SECRET=your_keycloak_secret_here

# JWT
JWT_SECRET=your_jwt_signing_key_here_min_32_chars

# API Keys (Provider costs)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional
TELEPORT_PROXY_URL=https://teleport.yourdomain.com:3080
```

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
