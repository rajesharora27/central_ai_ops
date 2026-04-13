---
id: CHORE-001
title: "Governance Hardening For Task Hub And Quality Gates"
type: chore
status: in_progress
priority: high
depends_on: []
plan: CHORE-001-governance-hardening-task-hub-and-quality-gates.md
created: 2026-04-13
updated: 2026-04-13
---

# CHORE-001: Governance Hardening For Task Hub And Quality Gates

## Objective

Ensure `central_ai_ops` explicitly enforces the requested global governance expectations across planning, testing, deployment, reuse, readability, and SRW architecture.

## Impact

- All governed repositories inherit clearer preflight and completion rules.
- Task-hub generation aligns on `docs/TODO.md`.
- Deployment guidance blocks shipping when tests fail.
- Quality rules explicitly require unit tests, integration updates as needed, user-functional verification, reuse-first implementation, and formatting/readability.

## Files

- Existing files:
  - `global/global-MASTER.md`
  - `global/rules/global-task-governance.md`
  - `global/rules/global-quality-gates.md`
  - `global/rules/global-core-governance.md`
  - `global/rules/global-architecture-srw.md`
  - `global/workflows/global-implementation-checklist.md`
  - `global/workflows/global-application-blueprint.md`
  - `global/commands/deploy.md`
  - `global/commands/test.md`
  - `scripts/init-task-framework.sh`
  - `scripts/generate-todo.sh`
  - `README.md`
  - `ONBOARDING.md`
  - `CHANGELOG.md`
- New files:
  - `global/rules/global-artifact-governance.md`
  - `docs/plans/CHORE-001-governance-hardening-task-hub-and-quality-gates.md`
  - `docs/tasks/CHORE-001-governance-hardening-task-hub-and-quality-gates.md`

## Acceptance Criteria

- [ ] Global rules explicitly require plan + task set + TODO sync before repo changes.
- [ ] Task completion explicitly requires moving task files into `docs/tasks/completed/`.
- [ ] Canonical task-hub tooling writes `docs/TODO.md`.
- [ ] Feature work explicitly requires unit tests and integration updates as needed.
- [ ] Deploy guidance explicitly blocks deployment when validation fails.
- [ ] Reuse-first, low-redundancy, readable/formatted code expectations are stated globally.
- [ ] SRW compliance is clearly framed as mandatory for applications in this ecosystem.

## Validation

- [ ] `bash scripts/generate-todo.sh`
- [ ] `bash scripts/verify_governance_integrity.sh`
- [ ] `git diff --check`
