# Global MASTER AI Instructions

Use this file as the single global baseline for all AI entrypoints.

## Core Priorities
- Keep changes small, testable, and reversible.
- Prefer primary sources and project-local evidence over assumptions.
- Preserve existing architecture unless a request explicitly authorizes redesign.
- Preserve SRW boundaries: Skills are stateless, Rules are pure policy, Workflows orchestrate.

## Mandatory Global Policy Inputs
- `.ai_ops/global/rules/global-core-governance.md`
- `.ai_ops/global/rules/global-change-safety.md`
- `.ai_ops/global/rules/global-quality-gates.md`
- `.ai_ops/global/rules/global-conflict-resolution.md`
- `.ai_ops/global/rules/global-security.md`
- `.ai_ops/global/workflows/global-implementation-checklist.md`

## Consolidated Load Order
1. Load global policy from `.ai_ops/global/rules/global-*.md`.
2. Load global workflows from `.ai_ops/global/workflows/global-*.md`.
3. Load project-specific business logic from `.ai_ops/overrides/local-context.md`.
4. Load project runtime policy from `.agent/rules/project/*.md`, `.agent/workflows/project/*.md`, `.agent/skills/project/**/SKILL.md`.

## Precedence
Project-local context and project runtime policy override global policy on conflict.

## Agent-Compatible References
@.ai_ops/global/rules/global-core-governance.md
@.ai_ops/global/rules/global-change-safety.md
@.ai_ops/global/rules/global-quality-gates.md
@.ai_ops/global/rules/global-conflict-resolution.md
@.ai_ops/global/rules/global-security.md
@.ai_ops/global/workflows/global-implementation-checklist.md
@.ai_ops/overrides/local-context.md
