---
id: CHORE-015
title: "Add Global Incident Response Governance"
type: chore
status: done
priority: high
depends_on:
  - CHORE-014
plan: CHORE-014-ai-lifecycle-governance-expansion-phase-3.md
created: 2026-04-13
updated: 2026-04-13
---

# CHORE-015: Add Global Incident Response Governance

## Objective

Create the canonical rule for AI and app incident response, escalation, and postmortem expectations.

## Impact

- Governed repos will have a stronger baseline for handling outages, bad model behavior, and degraded production states.
- Operational ownership and recovery expectations will become part of the shared governance model.

## Files

- New files:
  - `global/rules/global-incident-response.md`
- Existing files:
  - `global/global-MASTER.md`
  - `README.md`
  - `global/commands/deploy.md`

## Acceptance Criteria

- [ ] Incident-response expectations are explicit and repo-applicable.
- [ ] Shared docs reference the rule where release and operational behavior are described.
