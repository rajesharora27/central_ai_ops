# Global MASTER AI Instructions

Use this file as the single global baseline for all AI entrypoints.

## Build & Deploy (Critical)
- Build and run commands are **project-specific**. Follow the project’s docs (e.g. `docs/CONTRIBUTING.md`, `docs/CONTEXT.md`) or `.ai_ops/overrides/local-context.md` for how to build, run in production, and run in development.
- After code changes that affect backend or frontend, rebuild as needed (e.g. `cd backend && npm run build`, `cd frontend && npm run build`); then run or restart the app per project conventions.
- Do not assume or reference tooling from other projects (e.g. no cross-project scripts or runner names). Each repo defines its own run/dev workflow.

## Core Priorities
- Keep changes small, testable, and reversible.
- Prefer primary sources and project-local evidence over assumptions.
- Preserve existing architecture unless a request explicitly authorizes redesign.
- **NEVER run `supabase db reset`.** This command destroys all user data. Use `supabase migration up --local` to apply new migrations incrementally.
- Preserve SRW boundaries: Skills are stateless, Rules are pure policy, Workflows orchestrate. See `@.ai_ops/global/rules/global-architecture-srw.md`.
- Use the project task hub for every repo-changing request: plan in `docs/plans/`, task set in `docs/tasks/`, completed tasks archived in `docs/tasks/completed/`, and `docs/TODO.md` regenerated from frontmatter.
- Require tests as part of the implementation, not as a follow-up. New features must add unit coverage, integration coverage must be updated when behavior crosses boundaries, and deploys are blocked until required checks pass.
- Verify features from the user's perspective, not only from the implementation layer. A technically passing change that breaks the real user flow is not complete.
- Reuse existing code first. Avoid redundant logic, collapse duplication into shared modules/services where appropriate, and keep code simple, readable, and formatted.
- Keep command playbooks portable: global commands provide shared defaults, project commands provide local overrides.
- On agent startup and context refresh, load `/docs/CONTEXT.md`, `/docs/CONTRIBUTING.md`, `/docs/APPLICATION_BLUEPRINT.md`, and `/docs/<appname>.md` when present. `<appname>` is the repository or app-folder name.
- Before closing a task, sync every impacted project document. This includes `/docs/CONTEXT.md`, `/docs/CONTRIBUTING.md`, `/docs/APPLICATION_BLUEPRINT.md`, `/docs/<appname>.md`, and any other changed source-of-truth docs.

# Global Change Safety (Architecture)

## Pre-flight Architecture Rule (Mandatory)
Before coding, refactoring, or extending backend logic, complete this SRW boundary check:

1. **Workflow Purity Gate**:
   - Verify that NO inline database queries (e.g., `.from()`, `SELECT`, `UPDATE`) are added to Workflow/Handler modules.
   - All I/O MUST be delegated to the Skill layer.
2. **Skill Isolation Gate**:
   - Verify that new Skills remain stateless execution helpers.
3. **Logic Placement Gate**:
   - Ensure business logic/policy is stored in Rules, not hardcoded in Skills.

Failure in any gate blocks the change until the architecture is aligned. See `@.ai_ops/global/rules/global-architecture-srw.md`.

## Mandatory Global Policy Inputs
- `.ai_ops/global/rules/global-*.md`
- `.ai_ops/global/workflows/global-*.md`
- `.ai_ops/global/commands/*.md`
- `.ai_ops/global/skills/global-*.md`

## Consolidated Load Order
1. Load global policy from `.ai_ops/global/rules/global-*.md`.
2. Load global workflows from `.ai_ops/global/workflows/global-*.md`.
3. Load global command playbooks from `.ai_ops/global/commands/*.md`.
4. Load global skill guidelines from `.ai_ops/global/skills/global-*.md`.
5. Load project-specific business logic from `.ai_ops/overrides/local-context.md`.
6. Load project runtime policy from `.agent/rules/project/*.md`, `.agent/workflows/project/*.md`, `.agent/commands/project/*.md`, `.agent/skills/project/**/SKILL.md`.

## Precedence
Project-local context and project runtime policy override global policy on conflict.

## Agent-Compatible References
@.ai_ops/global/rules/global-*.md
@.ai_ops/global/workflows/global-*.md
@.ai_ops/global/commands/*.md
@.ai_ops/global/skills/global-*.md
@.ai_ops/overrides/local-context.md
