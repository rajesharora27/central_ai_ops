---
id: CHORE-018
title: "Add Global User Experience Reliability Governance"
type: chore
status: done
priority: high
depends_on:
  - CHORE-014
plan: CHORE-014-ai-lifecycle-governance-expansion-phase-3.md
created: 2026-04-13
updated: 2026-04-13
---

# CHORE-018: Add Global User Experience Reliability Governance

## Objective

Create the canonical rule for loading/error/degraded states, continuity, and reliability from the user’s perspective.

## Impact

- Governed repos will have stronger expectations for user-visible reliability, not just backend correctness.
- Cross-platform products will inherit a clearer baseline for graceful failure and continuity.

## Files

- New files:
  - `global/rules/global-user-experience-reliability.md`
- Existing files:
  - `global/global-MASTER.md`
  - `README.md`
  - `global/workflows/global-application-blueprint.md`

## Acceptance Criteria

- [ ] UX reliability expectations are clearly documented and repo-applicable.
- [ ] Shared docs reference the rule where user-facing behavior is described.
