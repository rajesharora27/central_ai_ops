---
id: CHORE-012
title: "Add Global Memory And Context Governance"
type: chore
status: done
priority: high
depends_on:
  - CHORE-008
plan: CHORE-008-ai-lifecycle-governance-expansion-phase-2.md
created: 2026-04-13
updated: 2026-04-13
---

# CHORE-012: Add Global Memory And Context Governance

## Objective

Create the canonical rule for memory inputs, context retention, summary reuse, and context-hygiene boundaries.

## Impact

- Governed repos will reduce context drift, privacy leakage, and stale memory behavior.
- Teams will have a shared baseline for what belongs in memory and what must stay separated.

## Files

- New files:
  - `global/rules/global-memory-and-context-governance.md`
- Existing files:
  - `global/global-MASTER.md`
  - `README.md`
  - `global/workflows/global-application-blueprint.md`

## Acceptance Criteria

- [ ] Memory/context rules are explicit and provider-agnostic.
- [ ] Shared docs reference the rule where conversation state and AI architecture are described.
