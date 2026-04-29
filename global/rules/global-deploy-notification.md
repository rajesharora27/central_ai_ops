# Global Deploy Notification

## Purpose

After completing any implementation task, the AI must tell the user exactly which components need to be deployed and in what order. Silence on deployment is a handoff failure — users should never have to guess what to ship.

## Core Requirements

1. After every task that changes code or configuration, produce a deploy summary before closing the task.
2. Identify only the components that were actually changed — do not list unrelated services.
3. State the order when components have a dependency (e.g., run migrations before deploying backend).
4. If no deployment is needed (e.g., docs-only, test-only, config local-only), say so explicitly.

## Component Classification

Use these labels to describe what changed:

| Component | Trigger |
|---|---|
| **Database / Migrations** | New or modified migration files |
| **Backend** | Edge functions, API routes, server-side logic, shared utilities |
| **Frontend** | App screens, components, hooks, navigation, client-side config |
| **Config / Secrets** | Environment variables, feature flags, provider keys |
| **Both (Backend + Frontend)** | Changes span server and client |

## Deploy Summary Format

At the end of the task response, output a `## Deploy` section using this structure:

```
## Deploy

**What changed:** <one-line summary of the change>

**Deploy required:**
- [ ] Database — run pending migrations (`supabase migration up --local` or equivalent)
- [ ] Backend — rebuild and deploy edge functions / server (`cd backend && npm run build && ...`)
- [ ] Frontend — rebuild and reload app (`cd frontend && npm run build` or `expo start --clear`)
- [ ] Config — apply new env vars or secrets to the target environment

_(Remove lines that do not apply.)_
```

Only include lines that are relevant to the change just made.

## Ordering Rule

When multiple components are listed, deploy in this order:
1. Database (migrations first — backend may depend on schema)
2. Backend
3. Frontend
4. Config (apply in parallel with the component that consumes it)

## Guardrails

1. Never omit the deploy summary after a code-changing task, even if the change seems minor.
2. Do not list a component unless code or config in that component was modified.
3. If the deploy path is project-specific (custom scripts, CI triggers), reference the project's `docs/CONTRIBUTING.md` or `.ai_ops/overrides/local-context.md` for exact commands.
4. Do not instruct the user to run `supabase db reset` — migrations only.
5. If the task was exploratory (read-only analysis, planning), skip the deploy summary.
