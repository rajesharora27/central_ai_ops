---
id: CHORE-019
title: "Add Global Schema And Migration Governance"
type: chore
status: done
priority: high
depends_on:
  - CHORE-014
plan: CHORE-014-ai-lifecycle-governance-expansion-phase-3.md
created: 2026-04-13
updated: 2026-04-13
---

# CHORE-019: Add Global Schema And Migration Governance

## Objective

Create the canonical rule for schema evolution, migration safety, compatibility windows, and rollback-aware data changes.

## Impact

- Governed repos will have stronger baseline controls for database and persisted-state change safety.
- AI and non-AI product changes will share clearer expectations around rollout-safe data evolution.

## Files

- New files:
  - `global/rules/global-schema-and-migration-governance.md`
- Existing files:
  - `global/global-MASTER.md`
  - `README.md`
  - `global/workflows/global-application-blueprint.md`
  - `global/commands/deploy.md`

## Acceptance Criteria

- [ ] Schema/migration expectations are explicit and repo-applicable.
- [ ] Shared docs reference the rule where release and architecture behavior are described.
