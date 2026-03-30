# Global MASTER AI Instructions

Use this file as the single global baseline for all AI entrypoints.

## Core Priorities
- Keep changes small, testable, and reversible.
- Prefer primary sources and project-local evidence over assumptions.
- Preserve existing architecture unless a request explicitly authorizes redesign.
- Preserve SRW boundaries: Skills are stateless, Rules are pure policy, Workflows orchestrate. See `@.ai_ops/global/rules/global-architecture-srw.md`.
- Keep command playbooks portable: global commands provide shared defaults, project commands provide local overrides.
- On agent startup and context refresh, load `/docs/CONTEXT.md`, `/docs/CONTRIBUTING.md`, and `/docs/APPLICATION_BLUEPRINT.md` when present.

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
