---
id: CHORE-013
title: "Add Global Privacy Retention And Deletion Governance"
type: chore
status: done
priority: high
depends_on:
  - CHORE-008
plan: CHORE-008-ai-lifecycle-governance-expansion-phase-2.md
created: 2026-04-13
updated: 2026-04-13
---

# CHORE-013: Add Global Privacy Retention And Deletion Governance

## Objective

Create the canonical rule for privacy-aware retention, deletion, export compatibility, and minimizing sensitive data in AI systems.

## Impact

- Governed repos will have clearer global expectations for handling user data across AI flows.
- Privacy, deletion, and retention concerns will be part of the baseline SDLC instead of project-specific afterthoughts.

## Files

- New files:
  - `global/rules/global-privacy-retention-and-deletion.md`
- Existing files:
  - `global/global-MASTER.md`
  - `README.md`
  - `global/workflows/global-application-blueprint.md`
  - `global/commands/deploy.md`

## Acceptance Criteria

- [ ] Privacy/retention/deletion expectations are explicit and repo-applicable.
- [ ] Shared docs reference the rule where AI data handling and release behavior are described.
