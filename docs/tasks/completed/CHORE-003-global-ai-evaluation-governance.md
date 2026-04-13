---
id: CHORE-003
title: "Add Global AI Evaluation Governance"
type: chore
status: done
priority: high
depends_on:
  - CHORE-002
plan: CHORE-002-ai-lifecycle-governance-expansion-phase-1.md
created: 2026-04-13
updated: 2026-04-13
---

# CHORE-003: Add Global AI Evaluation Governance

## Objective

Create the canonical rule that makes evaluation artifacts and regression checks mandatory for AI features.

## Impact

- Governed repos will need explicit eval sets and thresholds for AI behavior changes.
- Teams will have a shared baseline for shipping prompt/model/tool changes safely.

## Files

- New files:
  - `global/rules/global-ai-evaluation-governance.md`
- Existing files:
  - `global/global-MASTER.md`
  - `README.md`
  - `global/workflows/global-implementation-checklist.md`
  - `global/commands/test.md`

## Acceptance Criteria

- [ ] AI evaluation expectations are clear, repo-applicable, and provider-agnostic.
- [ ] README and checklists reference the rule.
