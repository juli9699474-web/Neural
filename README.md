# Neural Monorepo

## PHASE 1 — PRODUCT + ARCHITECTURE

### 1) One-page product spec
Neural is a mobile-first AI Agent OS + App Builder for non-coders. Users authenticate, subscribe, then use five core tabs (Chat, Projects, Tasks, Builder, Settings). The Builder executes a deterministic step pipeline (0-10) and generates verifiable artifacts (code, commands, and verification checks) for web/mobile apps. Neural uses a multi-agent orchestration model (Planner → Builder → Verifier) and a model router that can target OpenAI, Anthropic, or Google models. Security is mandatory: strict sandboxed execution interface, rate limits, audit logs, webhook signature verification, and server-only secrets. MVP includes auth/billing, projects/tasks CRUD, streamed chat, builder pipeline, CLI, and admin usage controls.

### 2) System architecture diagram (text)
- **Web App (Next.js)** and **Mobile App (Expo)** call **API (Fastify)** over HTTPS.
- **CLI** uses `@neural/sdk` to call the same API.
- API layers:
  - Auth middleware (Bearer token placeholder for Clerk integration)
  - Rate limiter and safety guard
  - Model Router (provider adapters)
  - Agent Orchestrator (planner/builder/verifier run-step endpoint)
  - Executor interface (allowlisted command runner mock)
  - Billing webhook (Stripe signed webhook)
- Persistence:
  - **Postgres + Prisma**: users, subscriptions, projects, tasks, usage events, memories, audit logs
  - **Redis/Upstash**: intended for queues/rate policy scaling
- Observability:
  - Audit log for action/result hash
  - Usage metering endpoints for cost/token tracking
- Deployment:
  - Web -> Vercel
  - API -> Railway/Render/Fly
  - DB -> Supabase/Neon
  - Redis -> Upstash

### 3) Threat model summary + mitigations
- **Prompt abuse / malicious requests**: content policy guard blocks malware/credential theft terms.
- **Tool abuse**: executor allowlists commands and enforces mock sandbox contract.
- **Credential leakage**: secrets are server env-only; no secret in client packages.
- **Webhook forgery**: Stripe webhook requires signature verification.
- **Flooding / brute force**: global per-IP/API rate limiting.
- **Data integrity**: every sensitive action writes audit log with result hash.

### 4) Monorepo structure tree
```txt
apps/
  api/        # Fastify API + Prisma
  web/        # Next.js dashboard
  mobile/     # Expo mobile app
packages/
  sdk/        # Shared API client
  shared/     # Shared constants and types
  ui/         # Shared React primitives
  cli/        # neural CLI
infra/
  docker/     # local postgres/redis
  deploy/     # deployment notes
docs/
  quickstart.md
```

## PHASE 2 — REPO BOOTSTRAP (CODE)
### 5) Packages created
- `apps/web`
- `apps/mobile`
- `apps/api`
- `packages/ui`
- `packages/sdk`
- `packages/cli`
- `packages/shared`
- `infra`

### 6) Exact scaffold/install/run commands
```bash
pnpm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
docker compose -f infra/docker/docker-compose.yml up -d
pnpm db:generate
pnpm --filter @neural/api dev
pnpm --filter @neural/web dev
pnpm --filter @neural/mobile dev
pnpm --filter @neural/cli dev -- projects list
```

### 7) Env templates
- Root: `.env.example`
- API: `apps/api/.env.example`
- Web: `apps/web/.env.example`
- Mobile: `apps/mobile/.env.example`
- CLI: `packages/cli/.env.example`

## PHASE 3-7 STATUS
Implemented in codebase:
- API auth/rate limiting/projects/tasks/usage/stream/orchestrator/executor/stripe webhook
- Prisma schema with full entities + migrations-ready config
- Web dashboard tabs and builder steps
- Mobile mirrored tabs and builder list
- CLI commands using shared SDK
- Unit tests for router/orchestrator
- Deployment quickstart and app-store checklists in docs

## Definition of Done (Milestone)
- [x] Monorepo scaffolded with required apps/packages
- [x] API endpoints mapped to UI/CLI flows
- [x] Security controls implemented for MVP critical path
- [x] Tests for model router/orchestrator pass
- [x] Quickstart + deploy documentation included
