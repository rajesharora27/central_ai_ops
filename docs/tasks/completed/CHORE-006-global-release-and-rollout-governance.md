---
id: CHORE-006
title: "Add Global Release And Rollout Governance"
type: chore
status: done
priority: high
depends_on:
  - CHORE-002
plan: CHORE-002-ai-lifecycle-governance-expansion-phase-1.md
created: 2026-04-13
updated: 2026-04-13
---

# CHORE-006: Add Global Release And Rollout Governance

## Objective

Create the canonical rule for staged rollout, kill switches, rollback, and release hygiene for AI changes.

## Impact

- Governed repos will gain safer deployment patterns for model/prompt/tool updates.
- AI releases will have clearer rollback and blast-radius control.

## Files

- New files:
  - `global/rules/global-release-and-rollout-governance.md`
- Existing files:
  - `global/global-MASTER.md`
  - `README.md`
  - `global/commands/deploy.md`

## Acceptance Criteria

- [ ] Rollout and rollback expectations are clearly defined and provider-agnostic.
- [ ] Shared deploy guidance references the rule.
