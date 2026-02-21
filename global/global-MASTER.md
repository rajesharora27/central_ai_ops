# Global MASTER AI Instructions

Use this file as the single global baseline for all AI entrypoints.

## Core Priorities
- Keep changes small, testable, and reversible.
- Prefer primary sources and project-local evidence over assumptions.
- Preserve existing architecture unless a request explicitly authorizes redesign.
- Preserve SRW boundaries: Skills are stateless, Rules are pure policy, Workflows orchestrate.
- Keep command playbooks portable: global commands provide shared defaults, project commands provide local overrides.

## Mandatory Global Policy Inputs
- `.ai_ops/global/rules/global-*.md`
- `.ai_ops/global/workflows/global-*.md`
- `.ai_ops/global/commands/*.md`

## Consolidated Load Order
1. Load global policy from `.ai_ops/global/rules/global-*.md`.
2. Load global workflows from `.ai_ops/global/workflows/global-*.md`.
3. Load global command playbooks from `.ai_ops/global/commands/*.md`.
4. Load project-specific business logic from `.ai_ops/overrides/local-context.md`.
5. Load project runtime policy from `.agent/rules/project/*.md`, `.agent/workflows/project/*.md`, `.agent/commands/global/*.md`, `.agent/commands/project/*.md`, `.agent/skills/project/**/SKILL.md`.

## Precedence
Project-local context and project runtime policy override global policy on conflict.

## Agent-Compatible References
@.ai_ops/global/rules/global-*.md
@.ai_ops/global/workflows/global-*.md
@.ai_ops/global/commands/*.md
@.ai_ops/overrides/local-context.md
