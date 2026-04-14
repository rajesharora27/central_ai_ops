# Global AI Agent Compliance — Mandatory

## First Principle

Every AI agent — regardless of vendor, IDE, or runtime — MUST follow centralized AI governance as defined in `.ai_ops/global/global-MASTER.md` and the full load order below. No agent-specific defaults, tool-specific storage paths, or convenience shortcuts override this governance.

## Load Order (Mandatory, Every Session)

1. `.ai_ops/global/global-MASTER.md` — global baseline
2. `.ai_ops/global/rules/global-*.md` — all global rules
3. `.ai_ops/global/workflows/global-*.md` — all global workflows
4. `.ai_ops/global/commands/*.md` — all global commands
5. `.ai_ops/global/skills/global-*` — all global skills
6. `.ai_ops/overrides/local-context.md` — project business context
7. `.agent/rules/project/*.md` — project runtime rules
8. `.agent/workflows/project/*.md` — project runtime workflows
9. `.agent/commands/project/*.md` — project commands
10. `.agent/skills/project/**/SKILL.md` — project skills

## Storage Rules (Non-Negotiable)

- Plans go in `docs/plans/`. NEVER in `.claude/plans/`, `.cursor/`, or any tool-specific path.
- Tasks go in `docs/tasks/`. NEVER in tool-specific task trackers.
- Documentation lives in `docs/`. NEVER only in chat context or agent memory.
- If the AI tool's default plan/task storage path conflicts with this rule, the agent MUST override the default and use the governed path.

## Before Any Implementation

1. Check `docs/plans/` for an existing plan covering the request.
2. Check `docs/tasks/` for existing tasks.
3. Create or update plan and tasks in the governed locations.
4. Run `npm run tasks:sync`.
5. Only then begin implementation.

## Violations

An AI agent that stores plans in tool-specific directories, skips task creation, or ignores the load order is in governance violation. The agent must self-correct immediately when it detects it has violated these rules.
