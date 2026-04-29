# AI Governance Management Application

The governance management application provides a web UI, REST API, and CLI for managing governance artifacts, enforcing compliance across downstream projects, and authoring new governance rules with AI assistance.

## Architecture

```
┌──────────────────────┐
│   Frontend UI        │  React 19 + MUI + Apollo Client
│   port 5174          │  Artifacts, Projects, Compliance Dashboard
└──────────┬───────────┘
           │ GraphQL
┌──────────▼───────────┐
│   Backend API        │  Express 5 + Apollo Server + Prisma 7
│   port 4100          │  /graphql  (GraphQL)
│                      │  /api/governance/*  (REST for CI/CLI)
└──┬───────────┬───────┘
   │           │
┌──▼──┐  ┌────▼──────┐
│ PG  │  │  global/   │
│5433 │  │  (files)   │
└─────┘  └───────────┘
```

The database stores metadata, project registrations, artifact assignments, and compliance history. The markdown files in `global/` remain the canonical source of artifact content. Content hashes (SHA-256) track drift between central and project copies.

## Quick Start

```bash
# First time only: install dependencies
./aiops.sh install

# Start everything (database + backend + frontend)
./aiops.sh start

# Or for development with hot reload
./aiops.sh dev
```

The UI is at http://localhost:5174 and the GraphQL playground at http://localhost:4100/graphql.

## Script Reference: `./aiops.sh`

| Command | Description |
|---------|-------------|
| `start` | Build and start all services (database, backend, frontend) |
| `stop` | Stop all services |
| `restart` | Rebuild and restart backend + frontend (keeps database running) |
| `dev` | Start in development mode (hot reload backend + HMR frontend) |
| `status` | Show status of all services and registry counts |
| `install` | Install all npm dependencies |
| `build` | Build all packages (backend, frontend, CLI) |
| `migrate` | Run Prisma database migrations |
| `sync` | Sync governance artifacts from `global/` into the database |
| `logs` | Tail backend and frontend logs |

### Port Configuration

| Service | Default | Override |
|---------|---------|----------|
| Backend API | 4100 | `BACKEND_PORT=N` |
| Frontend UI | 5174 | `FRONTEND_PORT=N` |
| PostgreSQL | 5433 | `DB_PORT=N` |

### Log Files

| Service | Path |
|---------|------|
| Backend | `tmp/backend.log` |
| Frontend | `tmp/frontend.log` |

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React, Vite, MUI, Apollo Client | 19, 7, 7, 3 |
| Backend | Express, Apollo Server, Prisma | 5, 5, 7 |
| Database | PostgreSQL (Docker) | 16 |
| Auth | JWT + bcryptjs | |
| AI Authoring | Anthropic SDK (Claude API) | |
| CLI | Commander.js | |

## Backend API

### GraphQL (`/graphql`)

**Artifacts** — CRUD for governance rules, skills, workflows, commands:
- `artifacts(filter)` / `artifact(id)` — query with filtering by type, environment, active status
- `createArtifact(input)` / `updateArtifact(id, input)` / `deleteArtifact(id)` — full CRUD
- `syncArtifactsFromDisk` — scan `global/` directory and upsert DB records

**Projects** — register and manage downstream projects:
- `projects` / `project(id)` / `projectBySlug(slug)` — query
- `createProject(input)` / `updateProject(id, input)` / `deleteProject(id)` — CRUD
- `assignArtifactToProject(input)` / `bulkAssignArtifacts(...)` — manage assignments
- `applyGovernanceToProject(projectId)` — runs `bootstrap_link.sh` and assigns all artifacts
- `verifyProjectCompliance(projectId)` — checks symlinks, content hashes, returns pass/fail
- `regenerateApiKey(projectId)` — create new API key for CI

**Compliance** — dashboard and verification:
- `complianceDashboard` — aggregate stats across all projects
- `verifyProjectCompliance(projectId)` — per-artifact compliance breakdown

**AI Authoring** — generate governance artifacts with Claude:
- `generateArtifactContent(input)` — natural language to markdown
- `refineArtifactContent(input)` — iterate on existing content

**Audit** — read-only log of all governance actions:
- `auditLogs(first, action)` — query recent actions

### REST API (`/api/governance/*`)

These endpoints are the enforcement surface — called by CI pipelines and the CLI tool.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/governance/verify` | Verify project compliance (CI gate) |
| `GET` | `/api/governance/config/:slug` | Get full governance config for agent startup |
| `POST` | `/api/governance/sync` | Trigger artifact sync from filesystem |
| `GET` | `/api/governance/health` | Health check |

#### Verify Endpoint

```bash
curl -X POST http://localhost:4100/api/governance/verify \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: gov_xxxxx' \
  -d '{"projectSlug": "dap"}'
```

Response:
```json
{
  "status": "COMPLIANT",
  "score": 100,
  "summary": "24/24 artifacts compliant",
  "artifacts": [
    { "artifactName": "global-core-governance", "status": "COMPLIANT", "reason": null }
  ],
  "timestamp": "2026-04-21T10:00:00Z"
}
```

Status values: `COMPLIANT`, `DRIFTED`, `NON_COMPLIANT`, `UNKNOWN`.

## Frontend UI

### Pages

**Dashboard** — compliance overview with summary cards (total projects, compliant/drifted/non-compliant counts), project compliance table with status badges, and recent compliance check history.

**Artifacts** — filterable list of all governance artifacts. Supports:
- Filter by type (Rule, Skill, Workflow, Command, Environment Wrapper)
- Split-pane markdown editor with live preview
- Environment selector chips (Claude, Codex, Cursor, OpenCode, Agents, All)
- AI-assisted authoring panel: describe what you want, Claude generates the markdown
- Sync from Disk button to re-scan `global/` directory

**Projects** — project cards with compliance scores and status indicators. Each project shows:
- Compliance percentage bar and status icon
- Assigned artifact count and last verification date
- Quick action buttons: Verify, Apply Governance, Assign All, Edit, Delete
- Detail view showing assigned artifacts with environment targeting and API key

**Audit Log** — real-time table of all governance actions (CREATE, UPDATE, DELETE, VERIFY, SYNC, APPLY) with timestamps and affected artifacts/projects.

## CLI Tool

Located in `cli/`. Install and use:

```bash
cd cli && npm install && npm run build

# Verify a project's compliance (exits 1 on failure — use in CI)
node dist/index.js verify --project dap --strict

# Sync artifacts from disk into the registry
node dist/index.js sync

# Show governance config for a project
node dist/index.js status --project dap

# Initialize governance config in a project directory
node dist/index.js init --name my-project --path /path/to/project
```

### CI Integration

Add to `.github/workflows/governance-check.yml`:

```yaml
name: Governance Compliance Check
on: [pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - name: Verify Governance
        run: |
          npx ts-node cli/src/index.ts verify \
            --project ${{ github.event.repository.name }} \
            --api-url ${{ secrets.GOVERNANCE_API_URL }} \
            --api-key ${{ secrets.GOVERNANCE_API_KEY }} \
            --strict
```

## Enforcement Strategy

Compliance is enforced through multiple layers — no single point of bypass:

1. **Central Registry (PostgreSQL)** — source of truth for which artifacts apply to which projects and for which AI environments.

2. **REST API Gate** — `POST /api/governance/verify` returns pass/fail with per-artifact breakdown. CI pipelines call this before allowing merges.

3. **CLI Tool** — `governance verify --strict` exits with code 1 on any non-compliant or drifted artifact. Usable in pre-commit hooks and CI.

4. **Agent Startup** — `GET /api/governance/config/:slug` returns the full governance config. AI agents can fetch their governance rules from the central API instead of relying on local symlinks.

5. **Content Hash Drift Detection** — every artifact's content is hashed (SHA-256). When a project's local copy diverges from the central version, the status changes to DRIFTED.

6. **Compliance Dashboard** — real-time visibility into which projects are compliant, which are drifting, and which are non-compliant.

## Data Model

| Model | Purpose |
|-------|---------|
| `GovernanceArtifact` | Rules, skills, workflows, commands. Stores `filePath`, `contentHash`, `type`, `environments[]` |
| `Project` | Downstream projects. Stores `slug`, `repoPath`, `complianceStatus`, `complianceScore`, `apiKey` |
| `ProjectArtifactAssignment` | Which artifacts apply to which projects, with per-project environment targeting |
| `ComplianceCheck` | Historical verification results with per-artifact breakdown |
| `GovernanceAuditLog` | All CRUD and enforcement actions logged |
| `User` / `Session` | Simple JWT authentication for the UI |

### AI Environments

Each artifact and assignment can target specific AI environments:

| Value | Description |
|-------|-------------|
| `ALL` | Applies to all environments |
| `CLAUDE` | Claude / Claude Code |
| `CODEX` | VSCode Codex / Gemini |
| `CURSOR` | Cursor IDE |
| `OPENCODE` | OpenCode |
| `AGENTS` | Generic multi-agent |

## Configuration

Backend configuration via `app/backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/governance` | PostgreSQL connection string |
| `PORT` | `4100` | Backend API port |
| `HOST` | `0.0.0.0` | Bind address |
| `JWT_SECRET` | `change-me-in-production` | JWT signing secret |
| `AUTH_BYPASS` | `true` | Skip authentication in development |
| `ANTHROPIC_API_KEY` | (empty) | Required for AI-assisted authoring |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-20250514` | Claude model for authoring |
| `GOVERNANCE_ROOT` | `../../global` | Path to governance artifacts directory |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

## Directory Structure

```
central_ai_ops/
├── aiops.sh                  # Application manager (start/stop/restart/status)
├── global/                   # Governance artifacts (rules, skills, workflows, commands)
├── scripts/                  # Bootstrap and sync shell scripts
├── app/
│   ├── docker-compose.yml    # PostgreSQL database
│   ├── backend/
│   │   ├── prisma/           # Database schema and migrations
│   │   ├── src/
│   │   │   ├── server.ts     # Express + Apollo Server entry point
│   │   │   ├── modules/      # GraphQL modules (artifact, project, compliance, auth, ai-authoring, audit)
│   │   │   ├── shared/       # Shared utilities (governance scanner, compliance checker, auth, pagination)
│   │   │   └── routes/       # REST API routes
│   │   └── .env              # Environment configuration
│   └── frontend/
│       └── src/
│           ├── pages/        # App shell, Dashboard, Artifacts, Projects, Audit
│           ├── features/     # Feature modules with components, hooks, GraphQL queries
│           ├── providers/    # Apollo Client
│           └── theme/        # MUI theme
├── cli/                      # Governance CLI (verify, sync, status, init)
└── docs/                     # Documentation and task hub
```
